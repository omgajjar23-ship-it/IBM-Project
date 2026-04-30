from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional, Any


class PredictionCreate(BaseModel):
    applicant_name: Optional[str] = "Anonymous"
    age: int
    workclass: str
    education: str
    occupation: str
    hours_per_week: int


class PredictionResponse(BaseModel):
    id: int
    ref_id: Optional[str] = None
    applicant_name: Optional[str] = None
    age: int
    workclass: str
    education: str
    occupation: str
    hours_per_week: int
    prediction: str
    confidence: float
    risk_level: str
    loan_status: str
    loan_amount: float
    timestamp: datetime
    user_id: Optional[int] = None
    creator_name: Optional[str] = None
    explainability: Optional[dict] = None

    class Config:
        from_attributes = True


# ── Analytics schemas ────────────────────────────────────────────────────────

class EducationBreakdown(BaseModel):
    education: str
    above_50k: int
    below_50k: int

class OccupationBreakdown(BaseModel):
    occupation: str
    approved: int
    total: int
    approval_rate: float

class DailyTrend(BaseModel):
    date: str
    predictions: int

class AnalyticsResponse(BaseModel):
    total_applications: int
    approved_loans_value: float
    rejection_rate: float
    high_risk_count: int
    medium_risk_count: int
    low_risk_count: int
    education_breakdown: List[EducationBreakdown] = []
    occupation_breakdown: List[OccupationBreakdown] = []
    daily_trend: List[DailyTrend] = []
