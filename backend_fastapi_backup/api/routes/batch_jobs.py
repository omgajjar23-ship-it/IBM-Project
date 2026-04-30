import uuid
import time
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.user import User
from backend.models.prediction import Prediction
from backend.models.log import Log
from backend.schemas.prediction import PredictionCreate
from backend.services.ml_service import ml_service
from backend.services.bank_engine import bank_engine

router = APIRouter()

# In-memory job store: job_id → { status, progress, total, results, error }
_jobs: Dict[str, Any] = {}


def _run_batch(job_id: str, predictions_in: List[dict], db_factory) -> None:
    """Background task: process each prediction and update job state."""
    db = db_factory()
    try:
        _jobs[job_id]["status"] = "processing"
        results = []
        total = len(predictions_in)

        for i, pred_data in enumerate(predictions_in):
            ml_result   = ml_service.predict(pred_data)
            bank_result = bank_engine.process_prediction(ml_result, pred_data)

            db_pred = Prediction(
                age           = pred_data["age"],
                workclass     = pred_data["workclass"],
                education     = pred_data["education"],
                occupation    = pred_data["occupation"],
                hours_per_week= pred_data["hours_per_week"],
                prediction    = ml_result["prediction"],
                confidence    = ml_result["confidence"],
                risk_level    = bank_result["risk_level"],
                loan_status   = bank_result["loan_status"],
                loan_amount   = bank_result["loan_amount"],
            )
            db.add(db_pred)
            db.commit()
            db.refresh(db_pred)

            results.append({
                "id":            db_pred.id,
                "age":           db_pred.age,
                "workclass":     db_pred.workclass,
                "education":     db_pred.education,
                "occupation":    db_pred.occupation,
                "hours_per_week":db_pred.hours_per_week,
                "prediction":    db_pred.prediction,
                "confidence":    db_pred.confidence,
                "risk_level":    db_pred.risk_level,
                "loan_status":   db_pred.loan_status,
                "loan_amount":   db_pred.loan_amount,
                "timestamp":     db_pred.timestamp.isoformat() if db_pred.timestamp else None,
            })

            _jobs[job_id]["progress"] = i + 1

        # Log the batch call
        db_log = Log(api_call="/batch/submit", status="success", response_time=0.0)
        db.add(db_log)
        db.commit()

        _jobs[job_id]["status"]  = "done"
        _jobs[job_id]["results"] = results

    except Exception as exc:
        _jobs[job_id]["status"] = "failed"
        _jobs[job_id]["error"]  = str(exc)
    finally:
        db.close()


@router.post("/submit")
def submit_batch(
    predictions_in: List[PredictionCreate],
    background_tasks: BackgroundTasks,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_bank_user),
):
    """
    Submit a batch of predictions for async processing.
    Returns a job_id for polling.
    """
    if len(predictions_in) > 500:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Batch limit is 500 records per job.")

    job_id = str(uuid.uuid4())
    _jobs[job_id] = {
        "status":   "queued",
        "progress": 0,
        "total":    len(predictions_in),
        "results":  None,
        "error":    None,
    }

    # Serialize payload so it can be passed to the background thread safely
    payload = [p.dict() for p in predictions_in]

    # Pass db session factory (not the session itself) to background task
    from backend.db.session import SessionLocal
    background_tasks.add_task(_run_batch, job_id, payload, SessionLocal)

    return {"job_id": job_id, "total": len(predictions_in), "status": "queued"}


@router.get("/status/{job_id}")
def get_batch_status(
    job_id: str,
    current_user: User = Depends(deps.get_current_active_bank_user),
):
    """Poll the status of an async batch job."""
    if job_id not in _jobs:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Job not found.")
    job = _jobs[job_id]
    return {
        "job_id":   job_id,
        "status":   job["status"],
        "progress": job["progress"],
        "total":    job["total"],
        "error":    job["error"],
    }


@router.get("/results/{job_id}")
def get_batch_results(
    job_id: str,
    current_user: User = Depends(deps.get_current_active_bank_user),
):
    """Retrieve results of a completed batch job."""
    if job_id not in _jobs:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Job not found.")
    job = _jobs[job_id]
    if job["status"] != "done":
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail=f"Job is not complete yet. Status: {job['status']}")
    return {"job_id": job_id, "total": job["total"], "results": job["results"]}
