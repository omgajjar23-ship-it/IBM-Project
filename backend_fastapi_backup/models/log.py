from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from backend.db.base_class import Base

class Log(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    api_call = Column(String, index=True)
    status = Column(String)
    response_time = Column(Float) # in milliseconds
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
