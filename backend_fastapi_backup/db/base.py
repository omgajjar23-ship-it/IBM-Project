# Import all the models, so that Base has them before being
# imported by Alembic or used for creating tables
from backend.db.base_class import Base
from backend.models.user import User
from backend.models.prediction import Prediction
from backend.models.log import Log
