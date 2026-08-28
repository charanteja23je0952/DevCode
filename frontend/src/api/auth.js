import api from './axios';

export const login = (credentials) => api.post('/auth/login', credentials);
export const signup = (userData) => api.post('/auth/signup', userData);
export const logout = () => api.post('/auth/logout');
export const refresh = () => api.post('/auth/refresh');
export const guest = () => api.post('/auth/guest');
