# POST /predict

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.prediction_schema import PredictionRequest
from app.services.prediction_service import PredictionService
from app.core.dependencies import get_current_user
from app.db.models.user import User

router = APIRouter(prefix="/predict", tags=["prediction"])

@router.post("/")
def get_prediction(
    data: PredictionRequest, 
    request: Request,
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # 1. Get the pre-loaded model from app state
    model = getattr(request.app.state, "model", None)
    if not model:
        raise HTTPException(status_code=500, detail="ML Model not loaded on server")

    # 2. Process via Service
    result = PredictionService.create_prediction(
        db=db, 
        data=data, 
        model=model, 
        user_id=current_user.id
    )

    return {
        "risk_score": result.risk_score,
        "status": result.risk_status,
        "summary": result.summary_text,
        "bmi": result.bmi
    }

@router.get("/history")
def get_prediction_history(
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    # Returns all past screenings for the logged-in user
    return current_user.predictions