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
# 1. Load Environment Variables
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-1.5-flash')
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
    
    # Simple Weightage Logic
    score = sum([s.weight for s in symptoms if s.answer])
    
    # 5. Gemini Integration (The "Likelihood" Logic)
    symptom_text = ", ".join([f"{s.q}: {'Yes' if s.answer else 'No'}" for s in symptoms])
    prompt = f"""
    Act as Meera, a warm PCOS triage assistant. Analyze: {symptom_text}.
    Provide a likelihood percentage (0-100) and brief sisterly advice.
    Return ONLY JSON: {{"likelihood": 85, "risk_level": "High", "advice": "..."}}
    """
    
    # For a hackathon, we combine the score logic with Gemini's nuanced analysis
    response = model.generate_content(prompt)
    
    # We return the Gemini response directly (assuming it returns clean JSON)
    # In a real app, you'd parse this to ensure safety.
    import json
    try:
        ai_data = json.loads(response.text.strip().replace("```json", "").replace("```", ""))
        return {
            "score": score,
            **ai_data,
            "message": "Analysis complete via Tarangini Hybrid ML Model."
        }
    except:
        # Fallback if AI output is messy
        return {"score": score, "risk_level": "TBD", "advice": "Talking to Meera..."}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or your frontend origin like "http://localhost:5173"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if __name__ == "__main__":
    
    uvicorn.run(app, host="0.0.0.0", port=5000)

