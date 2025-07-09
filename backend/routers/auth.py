from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from backend.models.user_model import UserInDB, UserCreate
from backend.auth.auth_bcrypt import hash_password, verify_password
from backend.auth.auth_handler import create_access_token
from backend.database import user_collection, db
from bson.objectid import ObjectId


router = APIRouter()


@router.post("/register")
async def register(user: UserCreate):
    existing_user = await db["users"].find_one({"email": user.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    user_data = {
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "password": hash_password(user.password), 
        "role": user.role
    }

    await db["users"].insert_one(user_data)
    return {"message": "User registered successfully"}


@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await db["users"].find_one({"email": form_data.username})

    if not user or "password" not in user:
        raise HTTPException(status_code=400, detail="Invalid user credentials")

    if not verify_password(form_data.password, user["password"]):
        raise HTTPException(status_code=400, detail="Incorrect password")

    access_token = create_access_token(data={"sub": str(user["_id"])})
    return {"access_token": access_token, "token_type": "bearer", "role": user["role"]
}

    
