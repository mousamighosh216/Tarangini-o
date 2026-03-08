# PostCreate
# PostResponse
# CommentCreate
# CommentResponse

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime


# ----------------------------
# COMMENT SCHEMAS
# ----------------------------

class CommentCreate(BaseModel):
    content: str
    post_id: int


class CommentResponse(BaseModel):
    id: int
    content: str
    votes: int
    created_at: datetime
    username: str = ""  # ✅ Only in response

    model_config = {"from_attributes": True}


# ----------------------------
# POST SCHEMAS
# ----------------------------

class PostCreate(BaseModel):
    title: str
    content: str
    tag: Optional[str] = None

class PostResponse(BaseModel):
    id: int
    title: str
    content: str
    tag: Optional[str]
    votes: int
    created_at: datetime
    username: str = ""  # ✅ Only in response
    comments: List[CommentResponse] = []

    model_config = {"from_attributes": True}