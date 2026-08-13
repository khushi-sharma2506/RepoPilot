import os
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from typing import Optional

from sqlalchemy.orm import Session
from models.database import get_db
from models.schema import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# This must match the NEXTAUTH_SECRET in your frontend .env
SECRET_KEY = os.getenv("NEXTAUTH_SECRET", "super-secret-key")
ALGORITHM = "HS256"

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """
    Verifies the JWT token sent by the NextAuth frontend.
    Returns the User database model.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the standard JWT sent by NextAuth
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub") # 'sub' is standard for user ID
        
        if user_id is None:
            raise credentials_exception
            
        email = payload.get("email", "")
        allowed_emails_env = os.getenv("ALLOWED_EMAILS", "")
        if allowed_emails_env:
            allowed_list = [e.strip().lower() for e in allowed_emails_env.split(",") if e.strip()]
            if allowed_list and email.lower() not in allowed_list:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Your account is not on the whitelist to use this application."
                )
            
        user = db.query(User).filter(User.id == str(user_id)).first()
        if not user:
            user = User(id=str(user_id), email=payload.get("email"), name=payload.get("name"))
            db.add(user)
            db.commit()
            db.refresh(user)
            
        return user
    except JWTError:
        raise credentials_exception
