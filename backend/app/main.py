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

import os
import json
import uvicorn
import joblib
import google.generativeai as genai
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from dotenv import load_dotenv

# --- FIX 1: Missing Imports ---
from contextlib import asynccontextmanager
from sqlalchemy.orm import Session
# Replace '.database' and '.routes' with your actual file names
from . import init_db, get_db 
from .routes import auth as auth_routes, forum as forum_routes, prediction as prediction_routes

# 1. Load Environment Variables
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')

# --- FIX 2: Unified Lifespan (Startup + Shutdown) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1️⃣ Database & Admin Setup (Moved from @app.on_event)
    init_db()
    db_gen = get_db()
    db: Session = next(db_gen)
    try:
        auth_routes.create_admin_user(db)
    finally:
        db.close()

    # 2️⃣ ML Model Loading
    base_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(base_dir, "ml", "artifacts", "model.pkl")
    
    print(f"🔍 DEBUG: Attempting to load model from: {model_path}")
    if os.path.exists(model_path):
        app.state.model = joblib.load(model_path)
        print("✅ SUCCESS: ML Model loaded into app state.")
    else:
        print(f"❌ ERROR: Model file not found at {model_path}")
        app.state.model = None

    yield
    # Clean up on shutdown
    print("🛑 Shutting down...")

# --- FIX 3: Single App Instance ---
app = FastAPI(lifespan=lifespan)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router)
app.include_router(forum_routes.router)
app.include_router(prediction_routes.router)

# Data Models
class Symptom(BaseModel):
    q: str
    answer: bool
    weight: int

class PredictionRequest(BaseModel):
    symptoms: List[Symptom]

# 4. The Prediction Endpoint
@app.post("/api/predict")
async def predict_pcos(request: PredictionRequest):
    symptoms = request.symptoms
    score = sum([s.weight for s in symptoms if s.answer])
    
    symptom_text = ", ".join([f"{s.q}: {'Yes' if s.answer else 'No'}" for s in symptoms])
    prompt = f"""
    Act as Meera, a warm PCOS triage assistant. Analyze: {symptom_text}.
    Provide a likelihood percentage (0-100) and brief sisterly advice.
    Return ONLY JSON: {{"likelihood": 85, "risk_level": "High", "advice": "..."}}
    """
    
    response = model.generate_content(prompt)
    
    try:
        # Improved JSON cleaning
        clean_json = response.text.strip().removeprefix("```json").removesuffix("```").strip()
        ai_data = json.loads(clean_json)
        return {
            "score": score,
            **ai_data,
            "message": "Analysis complete via Tarangini Hybrid ML Model."
        }
    except Exception as e:
        print(f"JSON Parsing Error: {e}")
        return {"score": score, "risk_level": "TBD", "advice": "Talking to Meera..."}

if __name__ == "__main__": 
    uvicorn.run(app, host="0.0.0.0", port=5000)