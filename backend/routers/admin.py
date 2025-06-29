from fastapi import APIRouter, HTTPException, Depends, Query
from bson.objectid import ObjectId
from backend.auth.auth_handler import get_current_user
from backend.database import claim_collection, user_collection, item_collection

router = APIRouter()

@router.get("/claims")
async def get_all_claims(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    claims = []
    async for claim in claim_collection.find():
        user = await user_collection.find_one({"_id": ObjectId(claim["user_id"])})
        item = await item_collection.find_one({"_id": ObjectId(claim["item_id"])})

        claims.append({
            "claim_id": str(claim["_id"]),
            "status": claim.get("status", "Pending"),
            "timestamp": claim.get("timestamp"),
            "user": {
                "id": claim["user_id"],
                "name": user["name"],
                "email": user["email"]
            },
            "item": {
                "id": claim["item_id"],
                "name": item["name"],
                "image_url": item.get("image_url")
            }
        })

    return {"claims": claims}

@router.put("/claims/{claim_id}")
async def update_claim_status(
    claim_id: str,
    status: str = Query(..., enum=["approved", "rejected"]),
    current_user: dict = Depends(get_current_user)
):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    claim = await claim_collection.find_one({"_id": ObjectId(claim_id)})
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    
    await claim_collection.update_one(
        {"_id": ObjectId(claim_id)},
        {"$set": {"status": status}}
    )
    
    return {"msg": f"Claim {status} successfully"}
