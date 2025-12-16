import type {
  EmployeeData,
  Assignment1Response,
  Assignment2Response,
  ProductivityData,
  Assignment3Response,
} from './types';

const ASSIGNMENT1_API_URL = 'http://localhost:8000';
const ASSIGNMENT2_API_URL = 'http://localhost:8001';
const ASSIGNMENT3_API_URL = 'http://localhost:8002';

export async function predictAssignment1(data: EmployeeData): Promise<Assignment1Response> {
  const response = await fetch(`${ASSIGNMENT1_API_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function predictAssignment2(data: EmployeeData): Promise<Assignment2Response> {
  // Assignment 2 uses different department options: 'HR', 'Sales', 'IT', 'R&D' (no Finance)
  // Map Finance to R&D, and ensure gender is Male or Female only
  const departmentMap: Record<string, 'HR' | 'Sales' | 'IT' | 'R&D'> = {
    'HR': 'HR',
    'Sales': 'Sales',
    'IT': 'IT',
    'Finance': 'R&D',
    'R&D': 'R&D',
  };
  
  const assignment2Data = {
    ...data,
    department: departmentMap[data.department] || 'IT',
    gender: data.gender === 'Other' ? 'Male' : data.gender as 'Male' | 'Female',
  };

  const response = await fetch(`${ASSIGNMENT2_API_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assignment2Data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function predictAssignment3(data: ProductivityData): Promise<Assignment3Response> {
  const response = await fetch(`${ASSIGNMENT3_API_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
}

export async function checkAssignment1Health(): Promise<boolean> {
  try {
    const response = await fetch(`${ASSIGNMENT1_API_URL}/`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function checkAssignment2Health(): Promise<boolean> {
  try {
    const response = await fetch(`${ASSIGNMENT2_API_URL}/`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function checkAssignment3Health(): Promise<boolean> {
  try {
    const response = await fetch(`${ASSIGNMENT3_API_URL}/`);
    return response.ok;
  } catch {
    return false;
  }
}

