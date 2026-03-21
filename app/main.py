from fastapi import FastAPI
from app.routes import url

app = FastAPI()

app.include_router(url.router)

@app.get("/")
def home():
    return {"message": "URL Shortener Running...."}