from fastapi import APIRouter, HTTPException, Request
from app.database import url_collection
from app.models import URLRequest
from app.utils import generate_short_code
import os
from dotenv import load_dotenv

from fastapi.responses import RedirectResponse
from datetime import datetime, timedelta

from app.auth.dependencies import get_current_user
from fastapi import Depends

load_dotenv()

router = APIRouter()

BASE_URL = os.getenv("BASE_URL")


@router.post("/shorten")
def shorten_url(request: URLRequest, user=Depends(get_current_user)):
    short_code = request.custom_code if request.custom_code else generate_short_code()

    if url_collection.find_one({"short_code": short_code}):
        raise HTTPException(status_code=400, detail="Short code already exists")

    # expiry (7 days)
    expiry_time = datetime.utcnow() + timedelta(days =7)

    url_collection.insert_one({
        "original_url": request.original_url,
        "short_code": short_code,
        "clicks": [],
        "expiry": expiry_time,
        "user_email": user 
})

    return {
        "short_url": f"{BASE_URL}/{short_code}",
        "expires_at": expiry_time
    }

@router.get("/analytics/{short_code}")
def get_analytics(short_code: str):
    data = url_collection.find_one({"short_code": short_code})

    if not data:
        raise HTTPException(status_code=404, detail="URL not found")

    # 1- extracting devices
    devices = [click["device"] for  click in data["clicks"]]
    # 2- returning analytics
    return {
        "original_url": data["original_url"],
        "short_code": data["short_code"],
        "total_clicks": len(data["clicks"]),
        "device_stats": {
            "mobile": devices.count("mobile"),
            "desktop": devices.count("desktop")
        },
        "click_details": data["clicks"]
    }

@router.get("/{short_code}")
def redirect_url(short_code: str, request: Request):
    data = url_collection.find_one({"short_code": short_code})

    if not data:
        raise HTTPException(status_code=404, detail="URL not found")

    # check expiry
    if "expiry" in data and data["expiry"] < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Link expired")

     # 1-IP
    ip = request.client.host

    # 2-DEVICE DETECTION
    user_agent = request.headers.get("user-agent", "")

    if "Mobile" in user_agent:
        device = "mobile"
    else:
        device = "desktop"

    # 3- store clicks
    url_collection.update_one(
        {"short_code": short_code},
        {
            "$push": {
                "clicks": {
                    "time": datetime.utcnow(),
                    "ip":ip,   #ip tracking
                    "device": device
                }
            }
        }
    )
    return RedirectResponse(data["original_url"])

# for frontend 
@router.get("/my-urls")
def get_my_urls(user=Depends(get_current_user)):
    urls = list(url_collection.find({"user_email": user}, {"_id": 0}))
    return urls