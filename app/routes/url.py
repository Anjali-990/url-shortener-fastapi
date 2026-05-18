from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import RedirectResponse

from app.database import url_collection
from app.models import URLRequest
from app.utils import generate_short_code
from app.auth.dependencies import get_current_user

from datetime import datetime, timedelta

import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

BASE_URL = os.getenv("BASE_URL", "http://127.0.0.1:8002")


# ================= SHORTEN URL =================
@router.post("/shorten")
def shorten_url(request: URLRequest, user=Depends(get_current_user)):

    short_code = (
        request.custom_code
        if request.custom_code
        else generate_short_code()
    )

    # CHECK DUPLICATE
    existing = url_collection.find_one({"short_code": short_code})

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Short code already exists"
        )

    # EXPIRY -> 7 DAYS
    expiry_time = datetime.utcnow() + timedelta(days=7)

    # SAVE IN DB
    url_collection.insert_one({
        "original_url": request.original_url,
        "short_code": short_code,
        "clicks": [],
        "expiry": expiry_time,
        "user_email": user,
        "created_at": datetime.utcnow(),
        "is_active": True
    })

    return {
        "short_url": f"{BASE_URL}/{short_code}",
        "expires_at": expiry_time
    }


# ================= GET MY URLS =================
@router.get("/my-urls")
def get_my_urls(user=Depends(get_current_user)):

    urls = list(
        url_collection.find(
            {"user_email": user},
            {"_id": 0}
        )
    )

    return {
        "urls": urls
    }


# ================= DELETE URL =================
@router.delete("/delete/{short_code}")
def delete_url(short_code: str, user=Depends(get_current_user)):

    deleted = url_collection.delete_one({
        "short_code": short_code,
        "user_email": user
    })

    if deleted.deleted_count == 0:
        raise HTTPException(
            status_code=404,
            detail="URL not found"
        )

    return {
        "message": "Deleted successfully"
    }


# ================= ANALYTICS =================
@router.get("/analytics/{short_code}")
def get_analytics(short_code: str, user=Depends(get_current_user)):

    data = url_collection.find_one({
        "short_code": short_code,
        "user_email": user
    })

    if not data:
        raise HTTPException(
            status_code=404,
            detail="URL not found"
        )

    clicks = data.get("clicks", [])

    devices = [
        click.get("device", "desktop")
        for click in clicks
    ]

    countries = [
        click.get("country", "Unknown")
        for click in clicks
    ]

    country_stats = {}

    for country in countries:
        country_stats[country] = (
            country_stats.get(country, 0) + 1
        )

    return {
        "original_url": data["original_url"],
        "short_code": data["short_code"],
        "total_clicks": len(clicks),

        "device_stats": {
            "mobile": devices.count("mobile"),
            "desktop": devices.count("desktop")
        },

        "country_stats": country_stats,

        "clicks": clicks
    }


# ================= REDIRECT =================
@router.get("/{short_code}")
def redirect_url(short_code: str, request: Request):

    data = url_collection.find_one({
        "short_code": short_code,
        "is_active": True
    })

    if not data:
        raise HTTPException(
            status_code=404,
            detail="URL not found"
        )

    # CHECK EXPIRY
    if (
        "expiry" in data
        and data["expiry"] < datetime.utcnow()
    ):
        raise HTTPException(
            status_code=410,
            detail="Link expired"
        )

    # IP
    ip = request.client.host

    # DEVICE
    user_agent = request.headers.get("user-agent", "")

    if "Mobile" in user_agent:
        device = "mobile"
    else:
        device = "desktop"

    # SAVE CLICK
    url_collection.update_one(
        {"short_code": short_code},
        {
            "$push": {
                "clicks": {
                    "time": datetime.utcnow(),
                    "ip": ip,
                    "device": device,
                    "country": "India"
                }
            }
        }
    )

    return RedirectResponse(data["original_url"])