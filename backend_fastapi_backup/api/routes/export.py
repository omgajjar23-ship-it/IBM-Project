import io
import csv
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.prediction import Prediction
from backend.models.user import User

router = APIRouter()

@router.get("/")
def export_predictions_csv(
    api_key: str = Query(None, description="Static API key for BI tools"),
    db: Session = Depends(deps.get_db)
):
    """
    Export all predictions as CSV for Power BI.
    """
    if api_key != "powerbi-secret-key-123":
        raise HTTPException(status_code=401, detail="Invalid API Key for Power BI Export")
        
    predictions = db.query(Prediction).all()
    
    stream = io.StringIO()
    writer = csv.writer(stream)
    # Header
    writer.writerow(["id", "age", "education", "occupation", "hours_per_week", "income_prediction", "confidence", "risk_level", "loan_status", "loan_amount", "timestamp"])
    
    # Data
    for p in predictions:
        writer.writerow([
            p.id, p.age, p.education, p.occupation, p.hours_per_week, 
            p.prediction, p.confidence, p.risk_level, p.loan_status, p.loan_amount, p.timestamp
        ])
    
    response = StreamingResponse(iter([stream.getvalue()]), media_type="text/csv")
    response.headers["Content-Disposition"] = "attachment; filename=predictions_export.csv"
    return response
