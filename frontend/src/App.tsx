import type React from 'react';
import { useState, useEffect } from 'react';
import {
  predictAssignment1,
  predictAssignment2,
  predictAssignment3,
  checkAssignment1Health,
  checkAssignment2Health,
  checkAssignment3Health,
} from './api';
import type {
  EmployeeData,
  Assignment1Response,
  Assignment2Response,
  ProductivityData,
  Assignment3Response,
} from './types';
import './App.css';

const initialFormData: EmployeeData = {
  age: 30,
  gender: 'Male',
  education: 'Graduate',
  department: 'IT',
  job_role: '',
  monthly_income: 45000,
  years_at_company: 2,
  promotions: 0,
  overtime: 'No',
  performance_rating: 3,
};

const initialProductivityForm: ProductivityData = {
  login_time: 9,
  logout_time: 17,
  total_tasks_completed: 20,
  weekly_absences: 1,
};

function App() {
  const [formData, setFormData] = useState<EmployeeData>(initialFormData);
  const [prodFormData, setProdFormData] = useState<ProductivityData>(initialProductivityForm);
  const [assignment1Result, setAssignment1Result] = useState<Assignment1Response | null>(null);
  const [assignment2Result, setAssignment2Result] = useState<Assignment2Response | null>(null);
  const [assignment3Result, setAssignment3Result] = useState<Assignment3Response | null>(null);
  const [loading, setLoading] = useState(false);
  const [prodLoading, setProdLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [prodError, setProdError] = useState<string | null>(null);
  const [api1Status, setApi1Status] = useState<boolean | null>(null);
  const [api2Status, setApi2Status] = useState<boolean | null>(null);
  const [api3Status, setApi3Status] = useState<boolean | null>(null);

  useEffect(() => {
    // Check API health on mount
    checkAssignment1Health().then(setApi1Status);
    checkAssignment2Health().then(setApi2Status);
    checkAssignment3Health().then(setApi3Status);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'age' || name === 'monthly_income' || name === 'years_at_company' || name === 'promotions' || name === 'performance_rating'
        ? Number(value)
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAssignment1Result(null);
    setAssignment2Result(null);
    setAssignment3Result(null);

    try {
      // Validate required fields
      if (!formData.job_role.trim()) {
        throw new Error('Job role is required');
      }

      // Call both APIs in parallel
      const [result1, result2] = await Promise.all([
        predictAssignment1(formData),
        predictAssignment2(formData),
      ]);

      setAssignment1Result(result1);
      setAssignment2Result(result2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while predicting');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    if (riskLevel.includes('HIGH_RISK') || riskLevel.includes('ACTION_REQUIRED')) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 0.5) return 'text-red-600';
    if (probability >= 0.35) return 'text-orange-600';
    return 'text-green-600';
  };

  const handleProdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProdFormData((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleProdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProdLoading(true);
    setProdError(null);
    setAssignment3Result(null);

    try {
      if (prodFormData.logout_time <= prodFormData.login_time) {
        throw new Error('Logout time must be greater than login time');
      }

      const result3 = await predictAssignment3(prodFormData);
      setAssignment3Result(result3);
    } catch (err) {
      setProdError(err instanceof Error ? err.message : 'An error occurred while predicting productivity');
    } finally {
      setProdLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Employee Prediction Dashboard
          </h1>
          <p className="text-gray-600">
            Predict attrition risk and productivity using multiple ML models
          </p>
        </header>

        {/* API Status Indicators */}
        <div className="flex gap-4 flex-wrap justify-center mb-6">
          <div className={`px-4 py-2 rounded-lg ${api1Status ? 'bg-green-100 text-green-800' : api1Status === false ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
            Assignment 1 API: {api1Status ? '✓ Online' : api1Status === false ? '✗ Offline' : 'Checking...'}
          </div>
          <div className={`px-4 py-2 rounded-lg ${api2Status ? 'bg-green-100 text-green-800' : api2Status === false ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
            Assignment 2 API: {api2Status ? '✓ Online' : api2Status === false ? '✗ Offline' : 'Checking...'}
          </div>
          <div className={`px-4 py-2 rounded-lg ${api3Status ? 'bg-green-100 text-green-800' : api3Status === false ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>
            Assignment 3 API: {api3Status ? '✓ Online' : api3Status === false ? '✗ Offline' : 'Checking...'}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Employee Information</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    min="18"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Education *
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Graduate">Graduate</option>
                    <option value="Post-Graduate">Post-Graduate</option>
                    <option value="PhD">PhD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="IT">IT</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                    <option value="Finance">Finance</option>
                    <option value="R&D">R&D</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Role *
                  </label>
                  <input
                    type="text"
                    name="job_role"
                    value={formData.job_role}
                    onChange={handleInputChange}
                    placeholder="e.g., Executive, Manager, Lead"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Income *
                  </label>
                  <input
                    type="number"
                    name="monthly_income"
                    value={formData.monthly_income}
                    onChange={handleInputChange}
                    min="0"
                    step="1000"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years at Company *
                  </label>
                  <input
                    type="number"
                    name="years_at_company"
                    value={formData.years_at_company}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Promotions *
                  </label>
                  <input
                    type="number"
                    name="promotions"
                    value={formData.promotions}
                    onChange={handleInputChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Overtime *
                  </label>
                  <select
                    name="overtime"
                    value={formData.overtime}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Performance Rating (1-4) *
                  </label>
                  <input
                    type="number"
                    name="performance_rating"
                    value={formData.performance_rating}
                    onChange={handleInputChange}
                    min="1"
                    max="4"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Predicting...' : 'Predict Attrition Risk'}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Assignment 1 Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Assignment 1: Logistic Regression Model
              </h2>
              {assignment1Result ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 ${getRiskColor(assignment1Result.recommended_action_level)}`}>
                    <div className="font-semibold text-lg mb-2">Risk Level</div>
                    <div className="text-xl">{assignment1Result.recommended_action_level}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Attrition Probability</div>
                      <div className={`text-2xl font-bold ${getProbabilityColor(assignment1Result.probability_of_attrition)}`}>
                        {(assignment1Result.probability_of_attrition * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Binary Prediction</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {assignment1Result.logreg_prediction_binary === 1 ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  Submit the form to see predictions
                </div>
              )}
            </div>

            {/* Assignment 2 Results */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Assignment 2: Random Forest Model
              </h2>
              {assignment2Result ? (
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 ${getRiskColor(assignment2Result.recommended_risk_level)}`}>
                    <div className="font-semibold text-lg mb-2">Risk Level</div>
                    <div className="text-xl">{assignment2Result.recommended_risk_level}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Attrition Probability</div>
                      <div className={`text-2xl font-bold ${getProbabilityColor(assignment2Result.probability_of_attrition)}`}>
                        {(assignment2Result.probability_of_attrition * 100).toFixed(2)}%
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Binary Prediction</div>
                      <div className="text-2xl font-bold text-gray-800">
                        {assignment2Result.binary_prediction === 1 ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-center py-8">
                  Submit the form to see predictions
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Assignment 3 Section */}
        <div className="mt-10 grid lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Assignment 3: Productivity Prediction</h2>
            <form onSubmit={handleProdSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Login Time (0-24) *</label>
                  <input
                    type="number"
                    name="login_time"
                    value={prodFormData.login_time}
                    onChange={handleProdChange}
                    min="0"
                    max="24"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Logout Time (0-24) *</label>
                  <input
                    type="number"
                    name="logout_time"
                    value={prodFormData.logout_time}
                    onChange={handleProdChange}
                    min="0"
                    max="24"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Tasks Completed *</label>
                  <input
                    type="number"
                    name="total_tasks_completed"
                    value={prodFormData.total_tasks_completed}
                    onChange={handleProdChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Absences *</label>
                  <input
                    type="number"
                    name="weekly_absences"
                    value={prodFormData.weekly_absences}
                    onChange={handleProdChange}
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {prodError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                  {prodError}
                </div>
              )}

              <button
                type="submit"
                disabled={prodLoading}
                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {prodLoading ? 'Predicting productivity...' : 'Predict Productivity'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Productivity Prediction Result</h2>
            {assignment3Result ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-1">Predicted Productivity Score</div>
                  <div className="text-3xl font-bold text-blue-700">{assignment3Result.predicted_productivity_score}</div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600 mb-2">Engineered Features</div>
                  <dl className="grid grid-cols-2 gap-2 text-sm text-gray-700">
                    {Object.entries(assignment3Result.engineered_features).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <dt className="font-medium capitalize">{key.replace(/_/g, ' ')}</dt>
                        <dd>{value.toFixed(2)}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>
            ) : (
              <div className="text-gray-400 text-center py-8">Submit the form to see productivity prediction</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
