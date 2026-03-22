from pymongo import MongoClient
import os
from dotenv import load_dotenv

from pymongo import MongoClient

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("DB_NAME")]

url_collection = db["urls"]

client = MongoClient("mongodb://localhost:27017")
db = client["url_shortener"]

users_collection = db["users"]
