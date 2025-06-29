from fastapi import FastAPI
from backend.database import db
from backend.routers import users
from backend.routers import items, auth, admin
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(items.router, prefix="/items", tags=["Items"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or restrict to ["http://127.0.0.1:5500"] if needed
    allow_credentials=True,
    allow_methods=["*"],  # This allows OPTIONS, POST, GET, etc.
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"msg": "FastAPI is working!"}