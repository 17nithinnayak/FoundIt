from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from backend.database import db

router = APIRouter()

class User(BaseModel):
    name: str
    email: EmailStr
    phone: str

@router.post("/")
async def create_user(user: User):
    users_collection = db["users"]

    if users_collection.find_one({"email": user.email}):
        return {"error": "User with this email already exists."}

    users_collection.insert_one(user.dict())
    return {"message": f"User {user.name} added", "user": user}
