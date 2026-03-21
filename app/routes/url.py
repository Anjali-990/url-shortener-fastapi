from fastapi import APIRouter, HTTPException
from app.database import url_collection
from app.models import URLRequest
from app.utils import generate_short_code
import os
from dotenv import load_dotenv

from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta
load_dotenv()

router = APIRouter()

BASE_URL = os.getenv("BASE_URL")


@router.post("/shorten")
def shorten_url(request: URLRequest):
    short_code = request.custom_code if request.custom_code else generate_short_code()

    if url_collection.find_one({"short_code": short_code}):
        raise HTTPException(status_code=400, detail="Short code already exists")

    # expiry (7 days)
    expiry_time = datetime.utcnow() + timedelta(days =7)

    url_collection.insert_one({
        "original_url": request.original_url,
        "short_code": short_code,
        "clicks": 0,
        "expiry": expiry_time
    })

    return {
        "short_url": f"{BASE_URL}/{short_code}",
        "expires_at": expiry_time
    }

@router.get("/{short_code}")
def redirect_url(short_code: str):
    data = url_collection.find_one({"short_code": short_code})

    if not data:
        raise HTTPException(status_code=404, detail="URL not found")

    # check expiry
    if "expiry" in data and data["expiry"] < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Link expired")

    # increment clicks
    url_collection.update_one(
        {"short_code": short_code},
        {"$inc": {"clicks": 1}}
    )

    return RedirectResponse(data["original_url"])

@router.get("/analytics/{short_code}")
def get_analytics(short_code: str):
    data = url_collection.find_one({"short_code": short_code})

    if not data:
        raise HTTPException(status_code=404, detail="URL not found")

    return {
        "original_url": data["original_url"],
        "short_code": data["short_code"],
        "clicks": data["clicks"]
    }