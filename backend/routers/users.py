from fastapi import APIRouter
from pydantic import BaseModel, EmailStr
from backend.database import db
from backend.auth.auth_bcrypt import hash_password, verify_password

router = APIRouter()

class User(BaseModel):
    name: str
    email: EmailStr
    phone: str

@router.post("/")
async def create_user(user: User):
    hashed_pw = hash_password(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_pw
    users_collection = db["users"]

    if users_collection.find_one({"email": user.email}):
        return {"error": "User with this email already exists."}

    users_collection.insert_one(user.dict())
    return {"message": f"User {user.name} added", "user": user}
