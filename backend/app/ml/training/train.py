# Load dataset
# Split train/test
# Train model
# Save model.pkl

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from imblearn.over_sampling import SMOTE
import joblib
import os

def train_pcos_model():
    # 1. Get the directory where THIS script (train.py) is located
    base_dir = os.path.dirname(os.path.abspath(__file__))
    
    # 2. Build the path to the data folder (Assuming it's in backend/app/ml/data/)
    # Adjust '..' if your data folder is at a different level
    data_path = os.path.join(base_dir, "..", "data", "PCOS_data_without_infertility.xlsx")
    
    # 3. Define where the model should be saved (same folder as the script)
    model_save_path = os.path.join(base_dir, "..", "artifacts", "model.pkl")

    print(f"🚀 Looking for data at: {data_path}")
    
    if not os.path.exists(data_path):
        print(f"❌ Error: File not found at {data_path}")
        print("💡 Tip: Make sure your Excel file is inside the 'backend/app/ml/data' folder.")
        return

    # Load the specific sheet 'Full_new'
    print("⏳ Loading Excel file...")
    df = pd.read_excel(data_path, sheet_name='Full_new')

    # 2. Preprocessing & Feature Selection
    # Cleaning column names (removes extra spaces)
    df.columns = [col.strip() for col in df.columns]

    # Map the "Core 8" features from the Excel columns
    # Note: 'Cycle(R/I)' usually uses 2 for Regular and 4 for Irregular
    feature_columns = [
        'Age (yrs)', 'BMI', 'Cycle(R/I)', 'Cycle length(days)', 
        'Weight gain(Y/N)', 'hair growth(Y/N)', 'Skin darkening (Y/N)', 'Pimples(Y/N)'
    ]
    
    X = df[feature_columns]
    y = df['PCOS (Y/N)']

    # 3. Handle Missing Values (Median Imputation)
    X = X.fillna(X.median())

    # 4. Handle Imbalance with SMOTE
    # This ensures the model learns to identify PCOS cases accurately
    smote = SMOTE(random_state=42)
    resampled = smote.fit_resample(X, y)
    X_res, y_res = resampled[0], resampled[1]

    # 5. Build the Pipeline
    # We include a StandardScaler so BMI and Age are treated fairly
    print("🌲 Training Random Forest Forest...")
    pipeline = Pipeline([
        ('scaler', StandardScaler()),
        ('rf', RandomForestClassifier(
            n_estimators=150, 
            max_depth=10, 
            random_state=42,
            class_weight='balanced'
        ))
    ])

    # 6. Train the Model
    print("⏳ Training Tarangini AI model...")
    pipeline.fit(X_res, y_res)

    # 7. Save the "Brain"
    joblib.dump(pipeline, model_save_path)
    print("✅ Model trained and saved as 'model.pkl'!")

def check():
    base_dir = os.path.dirname(os.path.abspath(__file__)) 
    data_path = os.path.join(base_dir, "..", "artifacts", "model.pkl")
    # Load the model you just created
    model = joblib.load(data_path)
    # Get the Random Forest step from the pipeline
    rf = model.named_steps['rf']

    # Get the importance scores
    features = ['Age', 'BMI', 'Cycle(R/I)', 'CycleLength', 'WeightGain', 'HairGrowth', 'SkinDark', 'Pimples']
    importances = rf.feature_importances_

    # Print them out nicely
    feat_imp = pd.Series(importances, index=features).sort_values(ascending=False)
    print("\n🏆 Top Predictors for Tarangini:")
    print(feat_imp)

if __name__ == "__main__":
    train_pcos_model()
    check()