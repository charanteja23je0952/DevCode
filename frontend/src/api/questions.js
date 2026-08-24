import api from './axios';

export const getQuestions = (params) => api.get('/api/questions', { params });
export const getQuestionById = (id) => api.get(`/api/questions/${id}`);
export const getQuestionSnapshot = (id) => api.get(`/api/questions/${id}/snapshot`);
export const submitSolution = (data) => api.post('/api/submissions', data);
export const getSubmissions = (questionId) => api.get(`/api/submissions/question/${questionId}`);
export const getSubmissionById = (submissionId) => api.get(`/api/submissions/${submissionId}`);
export const getSubmissionSnapshot = (submissionId) => api.get(`/api/submissions/${submissionId}/snapshot`);
