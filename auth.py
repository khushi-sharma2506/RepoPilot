from jose import jwt
from datetime import datetime, timedelta

SECRET_KEY = "route_mobile_secret_key"
ALGORITHM = "HS256"

def create_access_token(username: str):
    payload = {
        "sub": username,
        "exp": datetime.utcnow() + timedelta(hours=1)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)