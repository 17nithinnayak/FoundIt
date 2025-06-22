from fastapi import FastAPI
from backend.database import db

app = FastAPI()

@app.get("/")
def home():
    return {"message": "FastAPI and MongoDB are working!"}