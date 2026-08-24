import axios from 'axios';

const isInWebContainer = () => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
};

const getBaseUrl = () => {
  if (isInWebContainer()) {
    return window.location.origin;
  }

  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;