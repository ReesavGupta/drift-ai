import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import Ridge
from sklearn.base import BaseEstimator, TransformerMixin

DATA_PATH = "./csv/data.csv"


class ProductivityInput(BaseModel):
    login_time: int = Field(..., ge=0, le=24, description="Hour of day the employee logged in (0-24).")
    logout_time: int = Field(..., ge=0, le=24, description="Hour of day the employee logged out (0-24).")
    total_tasks_completed: int = Field(..., ge=0, description="Number of tasks completed in the shift.")
    weekly_absences: int = Field(..., ge=0, description="Number of absences in the week.")

    class Config:
        json_schema_extra = {
            "example": {
                "login_time": 9,
                "logout_time": 17,
                "total_tasks_completed": 20,
                "weekly_absences": 1,
            }
        }


class FeatureCreator(BaseEstimator, TransformerMixin):
    """Feature engineering similar to the provided notebook."""

    def fit(self, X, y=None):
        return self

    def transform(self, X):
        X_transformed = X.copy()
        X_transformed["daily_work_hours"] = X_transformed["logout_time"] - X_transformed["login_time"]
        X_transformed["daily_work_hours"] = np.maximum(X_transformed["daily_work_hours"], 1)
        X_transformed["tasks_per_hour"] = X_transformed["total_tasks_completed"] / X_transformed["daily_work_hours"]
        X_transformed["absenteeism_rate"] = X_transformed["weekly_absences"] / 5.0
        return X_transformed[
            [
                "daily_work_hours",
                "tasks_per_hour",
                "absenteeism_rate",
                "total_tasks_completed",
                "weekly_absences",
            ]
        ]


# Initialize FastAPI
app = FastAPI(
    title="Assignment 3: Productivity Prediction API",
    description="Predicts productivity scores using engineered features.",
)

# CORS to allow the Vite frontend
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_model():
    try:
        df = pd.read_csv(DATA_PATH)
        df = df.drop(columns=["employee_id"], errors="ignore")

        X = df.drop(columns=["productivity_score"])
        y = df["productivity_score"]

        pipeline = Pipeline(
            steps=[
                ("features", FeatureCreator()),
                ("scaler", StandardScaler()),
                ("regressor", Ridge(alpha=0.1)),
            ]
        )
        pipeline.fit(X, y)
        print("Assignment 3 model trained successfully.")
        return pipeline
    except Exception as exc:
        print(f"ERROR: Could not initialize Assignment 3 model: {exc}")
        return None


pipeline = load_model()


@app.post("/predict")
def predict_productivity(data: ProductivityInput):
    if pipeline is None:
        return {"error": "Model not initialized."}

    input_df = pd.DataFrame([data.model_dump()])
    prediction = pipeline.predict(input_df)[0]

    # Expose engineered features for transparency
    features = FeatureCreator().transform(input_df).iloc[0].to_dict()

    return {
        "predicted_productivity_score": round(float(prediction), 2),
        "engineered_features": features,
    }


@app.get("/")
def health_check():
    return {"status": "OK", "model_loaded": pipeline is not None}

