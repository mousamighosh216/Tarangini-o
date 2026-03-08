# Load trained model
# Run inference
# Validate input
# Return structured output

from sqlalchemy.orm import Session
from app.db.models.prediction import PredictionLog
from app.schemas.prediction_schema import PredictionRequest
import pandas as pd

class PredictionService:
    @staticmethod
    def _generate_summary(data: PredictionRequest, risk_score: float) -> str:
        insights = []

        # 1. AI Risk Interpretation
        if risk_score > 70:
            insights.append("Your profile shows a high correlation with clinical PCOS indicators.")
        elif risk_score > 35:
            insights.append("Your results suggest a moderate risk; lifestyle monitoring is recommended.")
        else:
            insights.append("Your risk level is currently low.")

        # 2. Symptom-Specific Insights (The "Extra" Features)
        if data.pain_level >= 7:
            insights.append("The high level of period pain you reported is significant; it may indicate underlying dysmenorrhea.")
        
        if data.is_heavy_flow:
            insights.append("Heavy menstrual flow is common in PCOS; consider checking your ferritin levels for iron deficiency.")

        if data.sugar_cravings:
            insights.append("Since you mentioned high sugar cravings, focusing on a Low-GI diet could help stabilize your insulin levels.")

        if data.high_fatigue:
            insights.append("PCOS-related exhaustion is real. Prioritizing consistent sleep hygiene can help manage these energy crashes.")

        # 3. Medical Disclaimer (Crucial for any Health AI)
        insights.append("Please share this summary with a healthcare professional for a formal clinical evaluation.")

        return " ".join(insights)
    
    @staticmethod
    def create_prediction(db: Session, data: PredictionRequest, model, user_id: int):
        print("--- DEBUG START ---")
        
        # 1. Check Feature Names (Match your train.py EXACTLY)
        feature_names = [
            'Age (yrs)', 'BMI', 'Cycle(R/I)', 'Cycle length(days)', 
            'Weight gain(Y/N)', 'hair growth(Y/N)', 'Skin darkening (Y/N)', 'Pimples(Y/N)'
        ]
        
        try:
            # 2. Prepare Data
            input_df = pd.DataFrame([[
                data.age,
                data.bmi, # Ensure this property exists in your schema!
                4 if data.is_irregular else 2,
                data.cycle_length,
                1 if data.weight_gain else 0,
                1 if data.hair_growth else 0,
                1 if data.skin_darkening else 0,
                1 if data.pimples else 0
            ]], columns=feature_names)
            
            print("Model Input Data Created.")

            # 3. Model Inference
            prob = model.predict_proba(input_df)[0][1]
            percentage = round(prob * 100, 2)
            print(f"Prediction Success: {percentage}%")

            # 4. Save to DB
            status = "High" if percentage > 70 else "Moderate" if percentage > 35 else "Low"
            
            summary = PredictionService._generate_summary(data, percentage)

            # BUILD THE OBJECT
            db_log = PredictionLog(
                user_id=user_id,
                age=data.age,
                bmi=data.bmi,
                is_irregular=data.is_irregular,
                cycle_length=data.cycle_length,
                weight_gain=data.weight_gain,
                hair_growth=data.hair_growth,
                skin_darkening=data.skin_darkening,
                pimples=data.pimples,
                pain_level=data.pain_level,
                is_heavy_flow=data.is_heavy_flow,
                sugar_cravings=data.sugar_cravings,
                high_fatigue=data.high_fatigue,
                risk_score=percentage,
                risk_status=status,
                summary_text= summary # Keep it simple for now
            )

            db.add(db_log)
            db.commit()
            db.refresh(db_log)
            print("Database Save Success.")
            
            return db_log

        except Exception as e:
            print(f"❌ ERROR OCCURRED: {str(e)}")
            # This line is key: it tells you exactly what went wrong
            import traceback
            traceback.print_exc() 
            raise e