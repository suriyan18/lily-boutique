/// <reference types="vite/client" />
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://lily-boutiquelily-boutique-backend.onrender.com';

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};
