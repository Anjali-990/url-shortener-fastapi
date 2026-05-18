from fastapi import APIRouter, HTTPException
from app.models import UserAuth
from app.database import users_collection
from app.auth.jwt_handler import create_access_token
from app.utils import hash_password, verify_password
from pydantic import BaseModel

router = APIRouter()


# ================= REGISTER =================
@router.post("/register")
def register(user: UserAuth):

    existing = users_collection.find_one({"email": user.email})

    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    users_collection.insert_one({
        "email": user.email,
        "password": hash_password(user.password)
    })

    return {"message": "User created"}


# ================= LOGIN =================
class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(data: LoginRequest):

    user = users_collection.find_one({"email": data.email})

    if not user or not verify_password(data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user["email"]})

    return {"access_token": token}