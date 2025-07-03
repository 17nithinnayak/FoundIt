from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: str = "student"

class UserInDB(UserCreate):
    id: Optional[str]