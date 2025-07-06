from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    password: str
    role: str 

class UserInDB(UserCreate):
    id: Optional[str]