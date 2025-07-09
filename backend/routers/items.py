from bson import ObjectId
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Path, Query, Depends
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import JSONResponse
from backend.database import db, item_collection, claim_collection
from backend.models.item_model import Item
from backend.auth.utils import decode_access_token
from backend.auth.auth_handler import get_current_user
import os
import shutil
from typing import List, Optional
from datetime import datetime

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ✅ Upload new item (Admin or general user)
@router.post("/upload")
async def upload_item(
    title: str = Form(...),
    description: str = Form(None),
    location: str = Form(...),
    status: str = Form(...),
    image: UploadFile = File(...)
):
    try:
        file_location = f"{UPLOAD_DIR}{image.filename}"
        with open(file_location, "wb") as f:
            shutil.copyfileobj(image.file, f)

        item = {
            "title": title,
            "description": description,
            "location": location,
            "status": status,
            "image_path": file_location,
            "date_reported": datetime.utcnow()
        }
        result = await item_collection.insert_one(item)
        return {"message": "Item uploaded", "id": str(result.inserted_id)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✅ Get items (with optional filters)
@router.get("/items")
async def get_items(
    status: Optional[str] = Query(None, description="Filter by item status"),
    keyword: Optional[str] = Query(None, description="Search by keyword in title/description")
):
    query = {}

    if status:
        query["status"] = status.lower()

    if keyword:
        query["$or"] = [
            {"title": {"$regex": keyword, "$options": "i"}},
            {"description": {"$regex": keyword, "$options": "i"}}
        ]

    items = []
    async for item in item_collection.find(query):
        item["id"] = str(item["_id"])
        del item["_id"]
        items.append(item)

    return {"results": items}


# ✅ Get item by ID
@router.get("/{item_id}", response_model=Item)
async def get_item(item_id: str = Path(...)):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID")

    item = await db["items"].find_one({"_id": ObjectId(item_id)})
    if item:
        item["id"] = str(item["_id"])
        return Item(**item)

    raise HTTPException(status_code=404, detail="Item not found")


# ✅ Delete item
@router.delete("/{item_id}")
async def delete_item(item_id: str):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID")

    result = await db["items"].delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count == 1:
        return {"message": "Item deleted successfully"}

    raise HTTPException(status_code=404, detail="Item not found")


# ✅ Update item
@router.put("/{item_id}", response_model=Item)
async def update_item(item_id: str, updated_data: Item):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID")

    result = await db["items"].update_one(
        {"_id": ObjectId(item_id)},
        {"$set": updated_data.dict()}
    )
    if result.modified_count == 1:
        updated = await db["items"].find_one({"_id": ObjectId(item_id)})
        updated["id"] = str(updated["_id"])
        return Item(**updated)

    raise HTTPException(status_code=404, detail="Item not found or no changes made")


# ✅ Extract current user from token
async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    # MongoDB stores `_id` as ObjectId, so we ensure it's in the right format
    user_id = payload.get("id")
    if not user_id or not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=401, detail="Invalid user ID in token")

    return payload


# ✅ Claim an item (user -> pending approval)
@router.post("/claim/{item_id}")
async def claim_item(item_id: str, current_user=Depends(get_current_user)):
    if not ObjectId.is_valid(item_id):
        raise HTTPException(status_code=400, detail="Invalid item ID")

    item = await item_collection.find_one({"_id": ObjectId(item_id)})
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    user_id = current_user.get("id")
    if not user_id or not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID")

    # Check for existing pending claim
    existing_claim = await claim_collection.find_one({
        "user_id": user_id,
        "item_id": item_id,
        "status": "pending"
    })
    if existing_claim:
        raise HTTPException(status_code=400, detail="You’ve already requested to claim this item.")

    # Save the claim request (is_claimed remains untouched for now)
    await claim_collection.insert_one({
        "user_id": user_id,
        "item_id": item_id,
        "status": "pending",
        "timestamp": datetime.utcnow()
    })

    return {"msg": "Claim request submitted for admin approval."}

@router.get("/user/claims")
async def get_user_claims(current_user=Depends(get_current_user)):
    user_id = current_user["id"]
    claims = []

    async for claim in claim_collection.find({"user_id": user_id}):
        claims.append({
            "item_id": claim["item_id"],
            "status": claim["status"],
            "timestamp": claim["timestamp"],
            "image_path": claim.get("image_path", None)
        })

    return {"claims": claims}
