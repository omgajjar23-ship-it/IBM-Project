from fastapi import APIRouter
from backend.api.routes import auth, predict, analytics, export, admin, batch_jobs

api_router = APIRouter()
api_router.include_router(auth.router,        prefix="/auth",       tags=["auth"])
api_router.include_router(predict.router,     prefix="/predict",    tags=["prediction"])
api_router.include_router(batch_jobs.router,  prefix="/batch",      tags=["batch"])
api_router.include_router(analytics.router,   prefix="/analytics",  tags=["analytics"])
api_router.include_router(export.router,      prefix="/export",     tags=["export"])
api_router.include_router(admin.router,       prefix="/admin",      tags=["admin"])
