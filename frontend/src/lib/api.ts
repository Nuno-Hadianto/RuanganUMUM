const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const apiUrl = (path: string) => `${API_BASE_URL}${path}`;

export const getAuthToken = () => localStorage.getItem('token');

export const authHeaders = () => {
  const token = getAuthToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const authFetch = (path: string, init: RequestInit = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...authHeaders(),
    ...(init.headers || {})
  };

  return fetch(apiUrl(path), { ...init, headers });
};
