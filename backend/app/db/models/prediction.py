# Defines:
# cycle entries
# start_date
# end_date
# symptoms (JSON)
# user_id
# predicted flag

from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Integer, Boolean, Float, ForeignKey, DateTime
from app.db.base import Base
from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from .user import User # Assuming your User model is in user.py

class PredictionLog(Base):
    __tablename__ = "prediction_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    
    # --- The Foreign Key Connection ---
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    
    # --- Core 8 Features (Stored for record-keeping) ---
    age: Mapped[int] = mapped_column(Integer)
    bmi: Mapped[float] = mapped_column(Float)
    is_irregular: Mapped[bool] = mapped_column(Boolean)
    cycle_length: Mapped[int] = mapped_column(Integer)
    weight_gain: Mapped[bool] = mapped_column(Boolean)
    hair_growth: Mapped[bool] = mapped_column(Boolean)
    skin_darkening: Mapped[bool] = mapped_column(Boolean)
    pimples: Mapped[bool] = mapped_column(Boolean)

    # --- Extra Features (The ones we use for the Summary) ---
    pain_level: Mapped[int] = mapped_column(Integer)
    is_heavy_flow: Mapped[bool] = mapped_column(Boolean)
    sugar_cravings: Mapped[bool] = mapped_column(Boolean)
    high_fatigue: Mapped[bool] = mapped_column(Boolean)

    # --- AI Output Data ---
    risk_score: Mapped[float] = mapped_column(Float) # The % from the model
    risk_status: Mapped[str] = mapped_column(String) # "High", "Moderate", "Low"
    summary_text: Mapped[str] = mapped_column(String) # The generated health advice
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    # --- Relationships ---
    user: Mapped["User"] = relationship("User", back_populates="predictions")