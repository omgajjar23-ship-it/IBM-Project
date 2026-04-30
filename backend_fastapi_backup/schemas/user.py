from typing import Optional
from pydantic import BaseModel, EmailStr
from typing import Literal


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: Literal["bank", "gov"] = "bank"   # Admin must be seeded — not self-assignable


class UserCreate(UserBase):
    password: str


class UserResponse(BaseModel):
    id: int
    email: EmailStr
    name: Optional[str] = None
    role: str          # str here so admin responses still serialise
    is_active: bool

    class Config:
        from_attributes = True
