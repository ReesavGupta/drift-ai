export interface EmployeeData {
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  education: 'Graduate' | 'Post-Graduate' | 'PhD';
  department: 'IT' | 'Sales' | 'HR' | 'Finance' | 'R&D';
  job_role: string;
  monthly_income: number;
  years_at_company: number;
  promotions: number;
  overtime: 'Yes' | 'No';
  performance_rating: number;
}

export interface Assignment1Response {
  input_data: EmployeeData;
  probability_of_attrition: number;
  recommended_action_level: 'HIGH_RISK' | 'LOW_RISK';
  logreg_prediction_binary: number;
  error?: string;
}

export interface Assignment2Response {
  probability_of_attrition: number;
  recommended_risk_level: 'HIGH_RISK_ACTION_REQUIRED' | 'LOW_RISK_MONITOR';
  binary_prediction: number;
  error?: string;
}

export interface ProductivityData {
  login_time: number;
  logout_time: number;
  total_tasks_completed: number;
  weekly_absences: number;
}

export interface Assignment3Response {
  predicted_productivity_score: number;
  engineered_features: Record<string, number>;
  error?: string;
}

export interface ApiError {
  error: string;
}

