### Employee Attrition & Productivity – How to Run Everything

This repo has **three FastAPI backends** (one per assignment) and **one React + Vite frontend** that talks to them.
Below are the steps to run the APIs **with** and **without** the frontend.

---

### 1. Setup (common for all assignments)

1. **Create / activate virtual env (optional but recommended)**  
   ```bash
   python -m venv .venv
   source .venv/Scripts/activate  # on Windows (Git Bash / PowerShell adapt as needed)
   ```

2. **Install Python dependencies** (from the project root – this folder):  
   ```bash
   pip install -r requirements.txt
   ```

Python version used: **3.11** (any 3.10+ should work as long as the packages install).

---

### 2. Run the backends (APIs only, no frontend)

Each assignment has its own FastAPI app and model artifacts already saved in `models/`.

#### Assignment 1 – Logistic Regression + SMOTE (port 8000)

From the project root:
```bash
uvicorn assignment_1.main:app --reload --port 8000
```

- **Health check:**  
  `GET http://localhost:8000/`  
- **Prediction endpoint:**  
  `POST http://localhost:8000/predict`  

Example JSON body:
```json
{
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
```

You can test via `curl` or the built-in docs: open `http://localhost:8000/docs` in your browser.

---

#### Assignment 2 – Leakage‑Free Random Forest Pipeline (port 8001)

From the project root:
```bash
uvicorn assignment_2.main:app --reload --port 8001
```

- **Health check:**  
  `GET http://localhost:8001/`
- **Prediction endpoint:**  
  `POST http://localhost:8001/predict`

Example JSON body (note: department options: `HR`, `Sales`, `IT`, `R&D`):
```json
{
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
```

Docs UI: `http://localhost:8001/docs`

---

#### Assignment 3 – Productivity Regression Model (port 8002)

From the project root:
```bash
uvicorn assignment_3.main:app --reload --port 8002
```

On startup, the API trains a pipeline from `assignment_3/csv/data.csv`.

- **Health check:**  
  `GET http://localhost:8002/`
- **Prediction endpoint:**  
  `POST http://localhost:8002/predict`

Example JSON body:
```json
{
  "login_time": 9,
  "logout_time": 17,
  "total_tasks_completed": 80,
  "weekly_absences": 1
}
```

Docs UI: `http://localhost:8002/docs`

You can run any subset of the assignments independently by starting only the corresponding `uvicorn` command(s).

---

### 3. Run the frontend dashboard (with all APIs)

The React + Vite frontend is in the `frontend/` folder. It expects the APIs to be running on:

- Assignment 1: `http://localhost:8000`
- Assignment 2: `http://localhost:8001`
- Assignment 3: `http://localhost:8002`

#### Steps

1. **Install frontend dependencies** (first time only):
   ```bash
   cd frontend
   npm install
   ```

2. **Start the frontend dev server**:
   ```bash
   npm run dev
   ```

3. Open the URL shown in the terminal (usually `http://localhost:5173`) in your browser.

The dashboard lets you:

- Fill in employee details and get **Assignment 1** and **Assignment 2** attrition predictions side‑by‑side.  
- Enter work‑pattern data (login/logout, tasks, absences) and get an **Assignment 3** productivity score and engineered feature values.

If one of the APIs is not running, the UI will show its status as “Offline”, and calls to that API will fail until you start its `uvicorn` process.

---

### 4. Quick combinations (for convenience)

- **Only want to test the APIs (no frontend)?**  
  Just run the desired `uvicorn` commands from section 2 and hit `/docs` or use `curl` / Postman.

- **Want the full experience (dashboard + all models)?**  
  1. In three terminals, run:
     - `uvicorn assignment_1.main:app --reload --port 8000`
     - `uvicorn assignment_2.main:app --reload --port 8001`
     - `uvicorn assignment_3.main:app --reload --port 8002`  
  2. In a fourth terminal:
     - `cd frontend && npm install` (first time)  
     - `npm run dev`  
  3. Open the Vite URL in your browser and use the forms to call all APIs.


