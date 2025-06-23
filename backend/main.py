from fastapi import FastAPI
from backend.database import db
from backend.routers import users
from backend.routers import items

app = FastAPI()

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(items.router, prefix="/items", tags=["Items"])

@app.get("/")
def root():
    return {"msg": "FastAPI is working!"}