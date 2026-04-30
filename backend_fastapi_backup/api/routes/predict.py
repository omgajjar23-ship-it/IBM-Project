import time
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.user import User
from backend.models.prediction import Prediction
from backend.models.log import Log
from backend.schemas.prediction import PredictionCreate, PredictionResponse
from backend.services.ml_service import ml_service
from backend.services.bank_engine import bank_engine

router = APIRouter()


@router.post("/", response_model=PredictionResponse)
def predict_income(
    *,
    db: Session = Depends(deps.get_db),
    prediction_in: PredictionCreate,
    current_user: User = Depends(deps.get_current_active_bank_user),
):
    """
    Predict income status and evaluate bank logic. Includes Applicant tracking and 'Butterfly Effect' analysis.
    """
    start_time = time.time()
    data_dict = prediction_in.dict()

    # 1. Run Random Forest model
    ml_result = ml_service.predict(data_dict)

    # 2. Run Bank Engine Logic
    bank_result = bank_engine.process_prediction(ml_result, data_dict)

    # 3. 'Butterfly Effect' Sensitivity Analysis (NEW)
    # Re-run prediction with slight variations to find the most sensitive variable
    sensitivity = {}
    base_conf = ml_result['confidence']
    
    # Check Age sensitivity
    alt_data = data_dict.copy()
    alt_data['age'] += 5
    alt_res  = ml_service.predict(alt_data)
    sensitivity['Age'] = abs(alt_res['confidence'] - base_conf)

    # Check Hours sensitivity
    alt_data = data_dict.copy()
    alt_data['hours_per_week'] += 5
    alt_res  = ml_service.predict(alt_data)
    sensitivity['Hours'] = abs(alt_res['confidence'] - base_conf)

    # Identify most sensitive
    butterfly_var = max(sensitivity, key=sensitivity.get) if sensitivity else "Baseline"
    butterfly_impact = sensitivity.get(butterfly_var, 0)

    # 4. Generate Unique Ref ID
    import uuid
    ref_id = f"APP-{uuid.uuid4().hex[:4].upper()}"

    # 5. Save to database
    db_prediction = Prediction(
        ref_id        = ref_id,
        applicant_name= prediction_in.applicant_name or "Anonymous",
        age           = prediction_in.age,
        workclass     = prediction_in.workclass,
        education     = prediction_in.education,
        occupation    = prediction_in.occupation,
        hours_per_week= prediction_in.hours_per_week,
        prediction    = ml_result['prediction'],
        confidence    = ml_result['confidence'],
        risk_level    = bank_result['risk_level'],
        loan_status   = bank_result['loan_status'],
        loan_amount   = bank_result['loan_amount'],
        user_id       = current_user.id
    )
    db.add(db_prediction)
    db.commit()
    db.refresh(db_prediction)

    # Log the API call
    process_time = (time.time() - start_time) * 1000
    db_log = Log(api_call="/predict", status="success", response_time=process_time)
    db.add(db_log)
    db.commit()

    # Attach AI modules dynamically for serialisation
    db_prediction.explainability = {
        **ml_result.get('explainability', {}),
        "_butterfly": {"var": butterfly_var, "impact": round(butterfly_impact, 1)}
    }
    db_prediction.creator_name = current_user.name

    return db_prediction


@router.get("/history", response_model=List[PredictionResponse])
def get_prediction_history(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_active_bank_user),
):
    """
    Fetch paginated history of predictions.
    """
    predictions = (
        db.query(Prediction)
          .order_by(Prediction.timestamp.desc())
          .offset(skip)
          .limit(limit)
          .all()
    )
    return predictions
