from jose import jwt, JWTError
from dotenv import load_dotenv
import os

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

def decode_access_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {
    "id": payload.get("sub"),   # ✅ Add this line
    "name": payload.get("name"),
    "email": payload.get("email"),
    "role": payload.get("role")
}  # usually has user_id, email etc.
    except JWTError:
        return None
