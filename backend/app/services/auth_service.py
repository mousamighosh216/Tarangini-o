# Google OAuth flow
# Create JWT
# Register new user
# Handle username change constraint

from sqlalchemy.orm import Session
from app.repositories.user_repo import UserRepository
from app.db.models.user import User
from app.core.security import hash_password, verify_password, create_access_token
from passlib.context import CryptContext
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:

    @staticmethod
    def register(db: Session, email: str, password: str, is_admin=False):
        existing = UserRepository.get_by_email(db, email)
        if existing:
            return None
        hashed = hash_password(password)
        return UserRepository.create(db, email, hashed, is_admin)

    @staticmethod
    def authenticate(db: Session, email: str, password: str) -> Optional[User]:
        user = UserRepository.get_by_email(db, email)
        if not user or not verify_password(password, user.password):
            return None
        return  user