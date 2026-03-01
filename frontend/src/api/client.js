const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('token');
}

async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Error ${res.status}`);
  }
  return data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),

  auth: {
    register: (name, cedula, password) =>
      api.post('/auth/register', { name, cedula, password }),
    login: (cedula, password) => api.post('/auth/login', { cedula, password }),
  },

  questions: () => api.get('/questions'),

  surveys: {
    submit: (answers) => api.post('/surveys', { answers }),
  },

  admin: {
    surveys: () => api.get('/admin/surveys'),
    survey: (id) => api.get(`/admin/surveys/${id}`),
    summary: () => api.get('/admin/summary'),
    questions: () => api.get('/admin/questions'),
    importStats: () => api.get('/admin/import-stats'),
    exportQuestions: async (format) => {
      const url = `${API_BASE}/admin/questions/export?format=${format}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error('Error al exportar');
      return format === 'csv' ? res.text() : res.json();
    },
    exportResults: async (format) => {
      const url = `${API_BASE}/admin/results/export?format=${format}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${getToken()}` } });
      if (!res.ok) throw new Error('Error al exportar');
      return format === 'csv' ? res.text() : res.json();
    },
    importQuestions: (file) => {
      const form = new FormData();
      form.append('file', file);
      return fetch(`${API_BASE}/admin/questions/import`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` },
        body: form,
      }).then((r) => {
        if (!r.ok) return r.json().then((d) => Promise.reject(new Error(d.message || 'Error')));
        return r.json();
      });
    },
    createQuestion: (data) => api.post('/admin/questions', data),
    deleteQuestion: (id) => request(`/admin/questions/${id}`, { method: 'DELETE' }),
    updateQuestion: (id, data) => request(`/admin/questions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  },
  
};
