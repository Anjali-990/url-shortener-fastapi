import shortuuid
from passlib.context import CryptContext
def generate_short_code():
    return shortuuid.ShortUUID().random(length=6)


# Password Hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str):
    return pwd_context.hash(password)

def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)