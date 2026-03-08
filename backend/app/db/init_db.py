# Create tables (for dev)
# Seed initial consultants (30–40 hardcoded doctors)
# Optional: seed roles

from app.db.base import Base
from app.db.session import engine
from app.db.models import user, forum, prediction

def init_db():
    Base.metadata.create_all(bind=engine)