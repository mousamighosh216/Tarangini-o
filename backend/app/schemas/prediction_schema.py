# PredictionInput
# PredictionOutput

from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    # Core 8 Features (Required for the Model)
    age: int = Field(..., ge=15, le=50, description="Age of the user")
    weight: float = Field(..., gt=30, description="Weight in kg")
    height: float = Field(..., gt=100, description="Height in cm")
    is_irregular: bool = Field(..., description="True if cycles are irregular")
    cycle_length: int = Field(..., ge=20, le=60, description="Average cycle length in days")
    weight_gain: bool = Field(..., description="Noticeable sudden weight gain")
    hair_growth: bool = Field(..., description="Excessive body/facial hair")
    skin_darkening: bool = Field(..., description="Darkening of skin folds (neck/armpits)")
    pimples: bool = Field(..., description="Persistent acne/pimples")

    # Extra Data (Used for the Summarization Logic, not the ML model)
    pain_level: int = Field(..., ge=1, le=10)
    is_heavy_flow: bool
    sugar_cravings: bool
    high_fatigue: bool

    @property
    def bmi(self) -> float:
        """Calculates BMI on the fly for the model"""
        height_m = self.height / 100
        return round(self.weight / (height_m ** 2), 2)