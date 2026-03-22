from pydantic import BaseModel
from pydantic import BaseModel, EmailStr

class URLRequest(BaseModel):
    original_url: str
    custom_code: str | None = None

class UserAuth(BaseModel):
    email: EmailStr
    password: str