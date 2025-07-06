from fastapi import APIRouter, HTTPException, Depends, Query, Security
from bson.objectid import ObjectId
from backend.auth.auth_handler import get_current_user
from backend.database import claim_collection, user_collection, item_collection

router = APIRouter()

def admin_only(current_user=Depends(get_current_user)):
    role = current_user.get("role")
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin access only")
    return current_user


@router.get("/claims", dependencies=[Depends(admin_only)])
async def get_all_claims(current_user: dict = Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Access denied")
    
    claim = []
    async for claim in claim_collection.find():
        user = await user_collection.find_one({"_id": ObjectId(claim["user_id"])})
        item = await item_collection.find_one({"_id": ObjectId(claim["item_id"])})

        claim.append({
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

    return {"claims": claim}

@router.put("/claims/{claim_id}", dependencies=[Depends(admin_only)])
async def update_claim_status(
    claim_id: str,
    status: str = Query(..., enum=["approved", "rejected", "pending"]),
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

@router.get("/items", dependencies=[Depends(admin_only)])
async def view_all_items(current_user=Depends(get_current_user)):
    if current_user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Admins only")

    items = []
    async for item in item_collection.find():
        item_id_str = str(item["_id"])

        # Fetch claim if exists
        claim = await claim_collection.find_one({"item_id": item_id_str})
        
        item["id"] = item_id_str
        item["claimed"] = bool(claim)
        item["claim_status"] = claim.get("status") if claim else None
        item["claim_id"] = str(claim["_id"]) if claim else None
        del item["_id"]
        items.append(item)

    return {"results": items}

