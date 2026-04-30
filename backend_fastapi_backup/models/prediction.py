from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from backend.db.base_class import Base

class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, index=True)
    ref_id = Column(String, unique=True, index=True, nullable=True) # APP-XXXX
    applicant_name = Column(String, nullable=True)
    
    # Inputs
    age = Column(Integer, nullable=False)
    workclass = Column(String, nullable=False)
    education = Column(String, nullable=False)
    occupation = Column(String, nullable=False)
    hours_per_week = Column(Integer, nullable=False)
    
    # ML Outputs
    prediction = Column(String, nullable=False) # <=50K or >50K
    confidence = Column(Float, nullable=False)
    
    # Business Logic Outputs
    risk_level = Column(String, nullable=False) # Low, Medium, High
    loan_status = Column(String, nullable=False) # Approved, Review Required, Rejected
    loan_amount = Column(Float, nullable=False)
    
    # Meta
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")
