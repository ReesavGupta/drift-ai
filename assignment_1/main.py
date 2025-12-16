import pickle
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Literal

MODEL_PATH = './models/log_reg_smote_model.pkl'
PREPROCESSOR_PATH = './models/preprocessor.pkl'
ACTION_THRESHOLD = 0.35

try:
    with open(PREPROCESSOR_PATH, 'rb') as f:
        preprocessor = pickle.load(f)
    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)
    print("Model and Preprocessor loaded successfully.")
except Exception as e:
    print(f"ERROR: Could not load model artifacts. Ensure files exist: {e}")

class EmployeeData(BaseModel):
    age: int = Field(..., ge=18, description="Employee Age (e.g., 30)")
    gender: Literal['Male', 'Female', 'Other']
    education: Literal['Graduate', 'Post-Graduate', 'PhD']
    department: Literal['IT', 'Sales', 'HR', 'Finance']
    job_role: str = Field(..., description="Specific role title (e.g., Lead, Executive, Manager)")
    monthly_income: float = Field(..., ge=0, description="Monthly gross income (e.g., 45000)")
    years_at_company: int = Field(..., ge=0, description="Years at DriftAI")
    promotions: int = Field(..., ge=0, description="Count of promotions received")
    overtime: Literal['Yes', 'No']
    performance_rating: int = Field(..., ge=1, le=4, description="Performance score (1-4)")

    class Config:
        schema_extra = {
            "example": {
                "age": 30,
                "gender": "Female",
                "education": "Graduate",
                "department": "HR",
                "job_role": "Executive",
                "monthly_income": 45000,
                "years_at_company": 2,
                "promotions": 0,
                "overtime": "Yes", 
                "performance_rating": 2 
            }
        }

app = FastAPI(
    title="Employee Attrition Prediction API",
    description="Predicts the probability of an employee leaving the company."
)

@app.post("/predict")
def predict_attrition(data: EmployeeData):
    try:
        input_data = data.model_dump()
        input_df = pd.DataFrame([input_data])
        
        input_processed = preprocessor.transform(input_df)
        
        proba_attrition = model.predict_proba(input_processed)[0][1]
        
        risk_level = "HIGH_RISK" if proba_attrition >= ACTION_THRESHOLD else "LOW_RISK"

        binary_prediction = 1 if proba_attrition >= 0.5 else 0

        return {
            "input_data": input_data,
            "probability_of_attrition": round(proba_attrition, 4),
            "recommended_action_level": risk_level,
            "logreg_prediction_binary": binary_prediction
        }

    except Exception as e:
        return {"error": f"An error occurred during prediction: {e}"}

@app.get("/")
def home():
    return {"message": "Attrition Prediction API is running!"}