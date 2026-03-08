import joblib
import numpy as np
import os


def calculate_pcos_risk(age, weight, height, irregular_cycles, cycle_length, weight_gain, hair_growth, skin_darkening, pimples):
    # 1. Load the Model
    # Adjust path if your pkl is in a different subfolder
    model_path = os.path.join(os.path.dirname(__file__), "artifacts", "model.pkl")
    model = joblib.load(model_path)

    # 2. Calculate BMI (Feature Engineering)
    # Formula: weight (kg) / [height (m)]^2
    height_m = height / 100
    bmi = round(weight / (height_m ** 2), 2)

    # 3. Map inputs to the "Core 8" format the model expects
    # Note: Kaggle dataset used 2 for Regular, 4 for Irregular
    cycle_status = 4 if irregular_cycles else 2
    
    # The order MUST match your training: 
    # [Age, BMI, Cycle(R/I), CycleLength, WeightGain, HairGrowth, SkinDark, Pimples]
    input_data = np.array([[
        age, bmi, cycle_status, cycle_length,
        1 if weight_gain else 0,
        1 if hair_growth else 0,
        1 if skin_darkening else 0,
        1 if pimples else 0
    ]])

    # 4. Calculate Probability (%)
    # predict_proba returns [[prob_0, prob_1]] -> we want prob_1 (PCOS)
    probability = model.predict_proba(input_data)[0][1]
    risk_percentage = round(probability * 100, 2)

    return risk_percentage, bmi

# --- RUN THE TEST CASES ---
print("🔬 Testing Tarangini AI Inference...")

# Test Case A: High Risk Profile
risk_a, bmi_a = calculate_pcos_risk(
    age=24, weight=85, height=160, 
    irregular_cycles=True, cycle_length=45, 
    weight_gain=True, hair_growth=True, skin_darkening=True, pimples=True
)
print(f"\n👤 Case A (Symptomatic): BMI: {bmi_a} | Risk: {risk_a}%")

# Test Case B: Low Risk Profile
risk_b, bmi_b = calculate_pcos_risk(
    age=24, weight=55, height=165, 
    irregular_cycles=False, cycle_length=28, 
    weight_gain=False, hair_growth=False, skin_darkening=False, pimples=False
)
print(f"👤 Case B (Healthy): BMI: {bmi_b} | Risk: {risk_b}%")