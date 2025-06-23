from bson import ObjectId
from fastapi import APIRouter
from fastapi import Path
from backend.database import db
from backend.models.item_model import Item

router = APIRouter()

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
