import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Attach token to every request automatically
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getTasks = () => API.get('/tasks');
export const createTask = (data) => API.post('/tasks', data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Comments API
export const getComments = (taskId) => API.get(`/tasks/${taskId}/comments`);
export const createComment = (taskId, content) => API.post(`/tasks/${taskId}/comments`, { content });
export const deleteComment = (commentId) => API.delete(`/tasks/comments/${commentId}`);

// Tags API
export const getTags = () => API.get('/tasks/tags');
export const createTag = (data) => API.post('/tasks/tags', data);
export const getTaskTags = (taskId) => API.get(`/tasks/${taskId}/tags`);
export const addTagToTask = (taskId, tagId) => API.post(`/tasks/${taskId}/tags`, { tagId });
export const removeTagFromTask = (taskId, tagId) => API.delete(`/tasks/${taskId}/tags/${tagId}`);

// Search API
export const searchTasks = (keyword, tags) => {
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (tags && tags.length > 0) params.append('tags', tags.join(','));
    return API.get(`/tasks/search?${params.toString()}`);
};