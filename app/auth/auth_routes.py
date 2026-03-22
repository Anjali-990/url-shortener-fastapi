from fastapi import APIRouter, HTTPException, Depends
from app.models import UserAuth
from app.database import users_collection, url_collection
from app.auth.jwt_handler import create_access_token
from app.utils import hash_password, verify_password
from app.auth.dependencies import get_current_user

router = APIRouter()

# REGISTER
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


# LOGIN
@router.post("/login")
def login(user: UserAuth):
    db_user = users_collection.find_one({"email": user.email})

    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": user.email})

    return {"access_token": token}


# PROTECTED ROUTE
@router.get("/my-urls")
def get_my_urls(user=Depends(get_current_user)):
    
    user_urls = list(url_collection.find({"user_email": user}, {"_id": 0}))
    
    return {
        "user": user,
        "urls": user_urls
    }