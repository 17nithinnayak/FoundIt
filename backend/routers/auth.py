from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from backend.models.user_model import UserInDB, UserCreate
from backend.auth.auth_bcrypt import hash_password, verify_password
from backend.auth.auth_handler import create_access_token
from backend.database import user_collection
from bson.objectid import ObjectId

router = APIRouter()

@router.post("/register")
async def register_user(user: UserCreate):
    existing_user = await user_collection.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_dict = user.dict()
    user_dict["hashed_password"] = hash_password(user.password)
    del user_dict["password"]
    if "role" not in user_dict:
        user_dict["role"] = "student"

    result = await user_collection.insert_one(user_dict)
    return {"msg": "User registered successfully", "id": str(result.inserted_id)}

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await user_collection.find_one({"email": form_data.username})
    if not user:
        raise HTTPException(status_code=400, detail="Invalid credentials")
    
    if not verify_password(form_data.password, user["hashed_password"]):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token_data = {"sub": user["email"], "user_id": str(user["_id"])}
    token = create_access_token(data=token_data)
    return {"access_token": token, "token_type": "bearer"}
