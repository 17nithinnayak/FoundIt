from bson import ObjectId
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi import Path, Query, Depends
from fastapi.security import OAuth2PasswordBearer
from backend.database import db
from backend.models.item_model import Item
import os
from fastapi.responses import JSONResponse
from backend.database import item_collection
import shutil
from typing import List, Optional
from datetime import datetime


router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

UPLOAD_DIR = "uploads/"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/items/upload")
async def upload_item(
    title: str = Form(...),
    description: str = Form(None),
    location: str = Form(...),
    status: str = Form(...),
    image: UploadFile = File(...)
):
    try:
        # Save image
        file_location = f"{UPLOAD_DIR}{image.filename}"
        with open(file_location, "wb") as f:
            shutil.copyfileobj(image.file, f)

        # Insert item data into DB
        item = {
            "title": title,
            "description": description,
            "location": location,
            "status": status,
            "image_path": file_location,
            "date_reported": datetime.now()
        }
        result = await item_collection.insert_one(item)

        return {"message": "Item uploaded", "id": str(result.inserted_id)}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{item_id}", response_model=Item)
async def get_item(item_id: str = Path(...)):
    item = await db["items"].find_one({"_id": ObjectId(item_id)})
    if item:
        item["id"] = str(item["_id"])
        return Item(**item)
    raise HTTPException(status_code=404, detail="Item not found")

@router.delete("/{item_id}")
async def delete_item(item_id: str):
    result = await db["items"].delete_one({"_id": ObjectId(item_id)})
    if result.deleted_count==1:
        return{"message": "Item deleted successfully"}
    raise HTTPException(status_code=404, detail="Item not found")

@router.put("/{item_id}", response_model=Item)
async def update_item(item_id: str, updated_data: Item):
    result = await db["items"].update_one(
        {"_id": ObjectId(item_id)},
        {"$set": updated_data.dict()}
    )
    if result.modified_count == 1:
        updated = await db["items"].find_one({"_id": ObjectId(item_id)})
        updated["id"] = str(updated["_id"])
        return Item(**updated)
    raise HTTPException(status_code=404, detail="Item not found or no changes made")

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


async def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_access_token(token)
    if payload is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

@router.post("/claim/{item_id}")
async def claim_item(item_id: str, current_user=Depends(get_current_user)):
    item = await item_collection.find_one({"_id": ObjectId(item_id)})

    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    if item.get("is_claimed"):
        raise HTTPException(status_code=400, detail="Item already claimed")

    await item_collection.update_one(
        {"_id": ObjectId(item_id)},
        {
            "$set": {
                "is_claimed": True,
                "claimed_by": current_user["user_id"],
                "claimed_at": datetime.utcnow()
            }
        }
    )

    return {"msg": "Item claimed successfully"}