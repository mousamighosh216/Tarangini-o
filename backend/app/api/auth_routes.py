# POST /login/google
# GET /me
# PATCH /username

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user_schema import UserOut, Token, UserCreate, UserLogin
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.core.security import create_access_token

router = APIRouter(prefix="/auth", tags=["auth"])

# Auto-create admin user from .env at startup
def create_admin_user(db: Session):
    AuthService.register(db, settings.ADMIN_EMAIL, settings.ADMIN_PASSWORD, is_admin=True)

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    new_user = AuthService.register(db, user.email, user.password)
    if not new_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already exists"
        )
    return {"email": new_user.email, "is_admin": new_user.is_admin}

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):
    user_obj = AuthService.authenticate(db, user.email, user.password)
    if not user_obj:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user_obj.email})
    return {"access_token": token, "token_type": "bearer"}

# Protected route example
@router.get("/me", response_model=UserOut)
def read_me(current_user = Depends(get_current_user)):
    return current_user