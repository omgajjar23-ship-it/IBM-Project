from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.api import deps
from backend.schemas.prediction import AnalyticsResponse
from backend.services.gov_engine import gov_engine
from backend.models.user import User

router = APIRouter()

@router.get("/", response_model=AnalyticsResponse)
def get_analytics_summary(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_gov_user),
):
    """
    Get aggregated analytics for government dashboard.
    Accessible by gov role and admin.
    """
    return gov_engine.get_analytics(db)
