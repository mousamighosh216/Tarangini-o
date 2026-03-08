# db/init_db.py
from app.db.base import Base
from app.db.session import engine
from .user import User
from .forum import Post, Comment

def init_db():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

if __name__ == "__main__":
    init_db()