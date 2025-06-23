from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class Item(BaseModel):
    title: str
    description: Optional[str] = None
    location: str
    date: datetime = Field(default_factory=datetime.utcnow)
    status: str  
    user_id: str  
    image_url: Optional[str] = None