from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.api import deps
from backend.models.user import User
from backend.models.log import Log
from backend.models.prediction import Prediction
from backend.schemas.user import UserCreate
from backend.core.security import get_password_hash

router = APIRouter()


@router.post("/users")
def create_user_by_admin(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user: User = Depends(deps.get_current_admin_user),
):
    """
    Manually create a new user by Admin.
    """
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(status_code=400, detail="A user with this email already exists.")
    
    db_user = User(
        email=user_in.email,
        name=user_in.name,
        role=user_in.role,
        hashed_password=get_password_hash(user_in.password),
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


@router.get("/users")
def get_all_users(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    users = db.query(User).all()
    return [
        {"id": u.id, "email": u.email, "name": u.name, "role": u.role, "is_active": u.is_active}
        for u in users
    ]


@router.post("/users/{user_id}/toggle")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"status": "success", "is_active": user.is_active}


@router.get("/logs")
def get_api_logs(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_admin_user),
):
    logs = db.query(Log).order_by(Log.timestamp.desc()).offset(skip).limit(limit).all()
    return logs


@router.get("/db/predictions")
def get_all_raw_predictions(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(deps.get_current_admin_user),
):
    return (
        db.query(Prediction)
          .order_by(Prediction.timestamp.desc())
          .offset(skip)
          .limit(limit)
          .all()
    )


@router.delete("/db/{table_name}/{row_id}")
def delete_database_row(
    table_name: str,
    row_id: int,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    table_map = {
        "users":       User,
        "logs":        Log,
        "predictions": Prediction,
    }
    if table_name not in table_map:
        raise HTTPException(status_code=400, detail="Invalid table name")

    model = table_map[table_name]
    record = db.query(model).filter(model.id == row_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Row not found")

    db.delete(record)
    db.commit()
    return {"status": "deleted", "id": row_id}


@router.post("/db/nuke")
def nuke_database_testing_data(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_admin_user),
):
    """Danger zone — wipe all predictions and logs."""
    db.query(Prediction).delete()
    db.query(Log).delete()
    db.commit()
    return {"status": "nuked", "message": "All predictions and logs have been permanently dropped."}
