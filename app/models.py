from pydantic import BaseModel

class URLRequest(BaseModel):
    original_url: str
    custom_code: str | None = None