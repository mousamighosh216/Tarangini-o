# Role: Application entry point
# Must:
# Initialize FastAPI app
# Load config
# Include routers (auth, forum, cycle, consultant, booking, prediction)
# Setup CORS
# Setup middleware (logging, error handling)
# Mount docs endpoint
# Startup event → initialize DB
# Health check endpoint
# Must NOT:
# Contain business logic
# Contain DB queries

from fastapi import FastAPI
from app.api import auth_routes, forum_routes, prediction_routes
from app.db.session import get_db
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from app.db.init_db import init_db   # ✅ ADD THIS
from contextlib import asynccontextmanager
import joblib
import os

app = FastAPI()

@app.on_event("startup")
def on_startup():
    # 1️⃣ Create tables first
    init_db()

    # 2️⃣ Then create admin user
    db: Session = next(get_db())
    try:
        auth_routes.create_admin_user(db)
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Determine the path to the model
    # This looks for the model relative to where main.py is
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "ml", "artifacts", "model.pkl")
    
    print(f"🔍 DEBUG: Attempting to load model from: {model_path}")

    if os.path.exists(model_path):
        app.state.model = joblib.load(model_path)
        print("✅ SUCCESS: ML Model loaded into app state.")
    else:
        print(f"❌ ERROR: Model file not found at {model_path}")
        # We don't crash the server, but the /predict route will fail
        app.state.model = None

    yield
    # Clean up on shutdown
    print("🛑 Shutting down...")

app = FastAPI(lifespan=lifespan)

# Include router
app.include_router(auth_routes.router)
app.include_router(forum_routes.router)
app.include_router(prediction_routes.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or your frontend origin like "http://localhost:5173"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)