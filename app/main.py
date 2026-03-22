from fastapi import FastAPI
from app.routes import url
from app.auth.auth_routes import router as auth_router

app = FastAPI()

app.include_router(url.router)

app.include_router(auth_router, prefix="/auth")

@app.get("/")
def home():
    return {"message": "URL Shortener Running...."}