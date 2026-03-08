# Defines:
# id
# email
# username
# username_changed
# created_at
# role
# health profile relationship
# forum relationship
# bookings relationship
# No business logic.

from sqlalchemy.orm import Mapped, mapped_column, relationship 
from sqlalchemy import String, Integer, Boolean 
from app.db.base import Base
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.db.models.forum import Post, Comment
    from backend.app.db.models.prediction import PredictionLog

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String, unique=True, index=True)
    password: Mapped[str] = mapped_column(String)
    is_active: Mapped[bool] = mapped_column(default=True)
    is_admin: Mapped[bool] = mapped_column(default=False)
    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)

    # Relationships 
    posts: Mapped[list["Post"]] = relationship("Post", back_populates="user") 
    comments: Mapped[list["Comment"]] = relationship("Comment", back_populates="user")
    predictions: Mapped[list["PredictionLog"]] = relationship("PredictionLog", back_populates="user")