const BASE_URL = 'http://localhost:5000/api';

async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!data.success) {
    throw new Error(data.error || 'API request failed');
  }

  return data;
}

export const auth = {
  register: (data) => apiCall('/auth/register', 'POST', data),
  login: (data) => apiCall('/auth/login', 'POST', data),
  getMe: (token) => apiCall('/auth/me', 'GET', null, token)
};

export const children = {
  getAll: (token) => apiCall('/children', 'GET', null, token),
  getOne: (id, token) => apiCall(`/children/${id}`, 'GET', null, token),
  create: (data, token) => apiCall('/children', 'POST', data, token),
  update: (id, data, token) => apiCall(`/children/${id}`, 'PUT', data, token),
  remove: (id, token) => apiCall(`/children/${id}`, 'DELETE', null, token),
  getScreenings: (id, token) => apiCall(`/children/${id}/screenings`, 'GET', null, token)
};

export const screenings = {
  create: (data, token) => apiCall('/screenings', 'POST', data, token),
  getAll: (token) => apiCall('/screenings', 'GET', null, token),
  getOne: (id, token) => apiCall(`/screenings/${id}`, 'GET', null, token)
};

export const trajectory = {
  getByChild: (childId, token) => apiCall(`/trajectory/${childId}`, 'GET', null, token)
};

export const reports = {
  getAll: (token) => apiCall('/reports', 'GET', null, token),
  getOne: (screeningId, token) => apiCall(`/reports/${screeningId}`, 'GET', null, token),
  share: (id, data, token) => apiCall(`/reports/${id}/share`, 'PUT', data, token),
  updateAnalysis: (id, data, token) => apiCall(`/reports/${id}/analysis`, 'PUT', data, token)
};

export const doctor = {
  getPatients: (token) => apiCall('/doctor/patients', 'GET', null, token),
  getScreenings: (childId, token) => apiCall(`/doctor/patients/${childId}/screenings`, 'GET', null, token),
  addRemarks: (id, data, token) => apiCall(`/doctor/screenings/${id}/remarks`, 'PUT', data, token),
  getStats: (token) => apiCall('/doctor/stats', 'GET', null, token)
};

export const admin = {
  getUsers: (token) => apiCall('/admin/users', 'GET', null, token),
  toggleUser: (id, token) => apiCall(`/admin/users/${id}/toggle`, 'PUT', null, token),
  deleteUser: (id, token) => apiCall(`/admin/users/${id}`, 'DELETE', null, token),
  getAllScreenings: (token) => apiCall('/admin/screenings', 'GET', null, token),
  getStats: (token) => apiCall('/admin/stats', 'GET', null, token),
  getMonthly: (token) => apiCall('/admin/monthly', 'GET', null, token),
  getActivityLog: (token) => apiCall('/admin/activity', 'GET', null, token)
};
