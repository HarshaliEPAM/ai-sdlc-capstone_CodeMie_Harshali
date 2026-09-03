import axios from 'axios';

const API_URL = '/api/tasks';

const taskService = {
  getAll: () => axios.get(API_URL),
  getById: (id) => axios.get(`${API_URL}/${id}`),
  create: (data) => axios.post(API_URL, data),
  delete: (id) => axios.delete(`${API_URL}/${id}`),
};

export default taskService;