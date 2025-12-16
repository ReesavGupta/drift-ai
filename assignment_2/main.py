import pickle
import pandas as pd
from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import Literal

MODEL_PATH = './models/attrition_pipeline.pkl'
ACTION_THRESHOLD = 0.35 # lower threshold for better fp rate

try:
    with open(MODEL_PATH, 'rb') as f:
        pipeline = pickle.load(f)
    print("Clean Pipeline (Preprocessor + Model) loaded successfully.")
except Exception as e:
    print(f"ERROR: Could not load pipeline file: {e}")
    pipeline = None

class EmployeeData(BaseModel):
    age: int = Field(..., ge=18)
    gender: Literal['Female', 'Male']
    education: Literal['Graduate', 'Post-Graduate', 'PhD']
    department: Literal['HR', 'Sales', 'IT', 'R&D']
    job_role: str = Field(..., description="Specific role title, e.g., 'Executive', 'Manager'")
    monthly_income: float = Field(..., ge=0)
    years_at_company: int = Field(..., ge=0)
    promotions: int = Field(..., ge=0)
    overtime: Literal['Yes', 'No']
    performance_rating: int = Field(..., ge=1, le=4)

    class Config:
        json_schema_extra = {
            "example": {
                "age": 30,
                "gender": "Female",
                "education": "Graduate",
                "department": "Sales",
                "job_role": "Executive",
                "monthly_income": 45000,
                "years_at_company": 2,
                "promotions": 0,
                "overtime": "Yes", 
                "performance_rating": 2 
            }
        }

app = FastAPI(
    title="Assignment 2: Leakage-Free ML Pipeline API",
    description="Deploys the corrected Random Forest model for Attrition Prediction."
)

@app.post("/predict")
def predict_attrition(data: EmployeeData):
    if pipeline is None:
        return {"error": "Pipeline not initialized."}, 500

    try:
        input_data = data.model_dump()
        input_df = pd.DataFrame([input_data])

        proba_attrition = pipeline.predict_proba(input_df)[0][1]
        
        risk_level = "HIGH_RISK_ACTION_REQUIRED" if proba_attrition >= ACTION_THRESHOLD else "LOW_RISK_MONITOR"

        return {
            "probability_of_attrition": round(proba_attrition, 4),
            "recommended_risk_level": risk_level,
            "binary_prediction": int(pipeline.predict(input_df)[0]) # Binary 0 or 1
        }

    except Exception as e:
        return {"error": f"An error occurred during prediction: {e}"}

@app.get("/")
def health_check():
    return {"status": "OK", "model_loaded": pipeline is not None}