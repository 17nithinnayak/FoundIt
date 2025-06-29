from pymongo import MongoClient
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os

load_dotenv()

client = AsyncIOMotorClient(os.getenv("MONGODB_URI"))
db = client["foundit"]


user_collection = db["users"]
item_collection = db["items"]
claim_collection = db["claims"]