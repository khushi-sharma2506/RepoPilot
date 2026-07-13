
from fastapi import FastAPI, Depends, HTTPException
from database import get_db
from auth import create_access_token
from rate_limiter import check_rate_limit
from audit import save_audit
# Run FastAPI
# python -m uvicorn main:app --reload

# Swagger UI
# http://127.0.0.1:8000/docs

app = FastAPI(title="Secure FastAPI API")

@app.get("/")
def home():
    return {"message": "Secure FastAPI API Running"}

@app.post("/login")
def login(username: str):

    token = create_access_token(username)

    return {
        "username": username,
        "access_token": token
    }

@app.get("/secure")
def secure_api(
    username: str,
    db=Depends(get_db)
):

    if not check_rate_limit(username):
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Maximum 10 requests per minute."
        )

    save_audit(
        db=db,
        endpoint="/secure",
        method="GET",
        username=username
    )

    return {
        "message": "Secure API Access Granted",
        "username": username
    }