from fastapi import FastAPI
from app.routes import url
from app.auth.auth_routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev (later restrict)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(url.router)

app.include_router(auth_router, prefix="/auth")

@app.get("/")
def home():
    return {"message": "URL Shortener Running...."}