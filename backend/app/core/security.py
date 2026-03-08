# All authentication + security utilities
# JWT create & verify
# Password hashing (if needed)
# OAuth token validation
# Role-based access helper
# Token expiration logic
# No DB queries here.

# security.py
from datetime import datetime, timedelta
from typing import Optional
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

# -----------------------
# Password hashing
# -----------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a plaintext password"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)

# -----------------------
# JWT Token creation
# -----------------------
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT token with expiration"""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return  jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

# -----------------------
# JWT Token verification
# -----------------------
def decode_access_token(token: str) -> Optional[str]:
    """Decode JWT token, return payload if valid, None if invalid"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

# -----------------------
# Role-based access helper
# -----------------------
def check_admin(user_payload: dict) -> bool:
    """Return True if the user has admin privileges"""
    return user_payload.get("is_admin", False)