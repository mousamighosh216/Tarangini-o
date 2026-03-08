# create_user
# get_user_by_email
# get_user_by_id
# update_username

from sqlalchemy.orm import Session
from app.db.models.user import User
from typing import Optional
from sqlalchemy.exc import IntegrityError
import uuid

def generate_username():
    return f"user_{uuid.uuid4().hex[:8]}"

class UserRepository:

    @staticmethod
    def create(db: Session, email: str, password: str, is_admin=False):
        while True:
            try:
                user = User(
                    email=email,
                    password=password,
                    is_admin=is_admin,
                    username=generate_username()
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                return user
            except IntegrityError:
                db.rollback()
                # collision happened, generate again

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()