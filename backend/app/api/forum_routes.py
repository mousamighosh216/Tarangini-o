# GET /posts
# POST /posts
# POST /comments
# GET /posts/{id}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.db.models.forum import Post, Comment
from app.schemas.forum_schema import PostCreate, PostResponse, CommentCreate, CommentResponse
from app.repositories import forum_repo
from app.services import forum_service
from app.core.dependencies import get_current_user
from app.db.models.user import User

router = APIRouter(prefix="/forum", tags=["Forum"])

@router.get("/posts", response_model=list[PostResponse])
def get_posts(sort: str = "newest", db: Session = Depends(get_db)):
    posts = forum_repo.get_all_posts(db)
    if sort == "top":
        posts = sorted(posts, key=lambda p: p.votes, reverse=True)
    else:  # newest
        posts = sorted(posts, key=lambda p: p.created_at, reverse=True)
    return posts


@router.post("/posts", response_model=PostResponse)
def create_post(
    post: PostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_post = Post(
        title=post.title,
        content=post.content,
        tag=post.tag,
        user_id=current_user.id
    )

    return forum_repo.create_post(db, new_post)

@router.get("/posts/{id}", response_model=PostResponse)
def get_post(id: int, db: Session = Depends(get_db)):
    post = forum_repo.get_post_with_comments(db, id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    post.comments = forum_service.build_comment_tree(post.comments)
    return post

@router.post("/comments", response_model=CommentResponse)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_comment = Comment(
        content=comment.content,
        post_id=comment.post_id,
        user_id=current_user.id   # ✅ FIX
    )

    return forum_repo.create_comment(db, new_comment)

@router.post("/posts/{id}/vote") 
def vote_post(id: int, up: bool = True, db: Session = Depends(get_db)): 
    post = forum_repo.get_post_with_comments(db, id) 
    if not post: 
        raise HTTPException(status_code=404, detail="Post not found") 
    forum_service.increment_vote(post, up) 
    db.commit() 
    db.refresh(post) 
    return {"id": post.id, "votes": post.votes} 

@router.post("/comments/{id}/vote") 
def vote_comment(id: int, up: bool = True, db: Session = Depends(get_db)):
    comment = db.query(Comment).filter(Comment.id == id).first() 
    if not comment: 
        raise HTTPException(status_code=404, detail="Comment not found") 
    forum_service.increment_vote(comment, up) 
    db.commit() 
    db.refresh(comment) 
    return {"id": comment.id, "votes": comment.votes}
