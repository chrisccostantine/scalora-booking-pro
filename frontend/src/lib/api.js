const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('scalora_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  getServices: () => request('/services'),
  createBooking: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload) }),
  getTestimonials: () => request('/testimonials'),
  sendContact: (payload) => request('/contact', { method: 'POST', body: JSON.stringify(payload) }),
  getBusinessInfo: () => request('/business-info'),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getAdminServices: () => request('/admin/services'),
  getBookings: (params = {}) => request(`/admin/bookings?${new URLSearchParams(params)}`),
  updateBookingStatus: (id, status) =>
    request(`/admin/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createService: (payload) => request('/admin/services', { method: 'POST', body: JSON.stringify(payload) }),
  updateService: (id, payload) => request(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteService: (id) => request(`/admin/services/${id}`, { method: 'DELETE' }),
  getStaff: () => request('/admin/staff'),
  createStaff: (payload) => request('/admin/staff', { method: 'POST', body: JSON.stringify(payload) }),
  updateStaff: (id, payload) => request(`/admin/staff/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteStaff: (id) => request(`/admin/staff/${id}`, { method: 'DELETE' }),
  createTestimonial: (payload) => request('/admin/testimonials', { method: 'POST', body: JSON.stringify(payload) }),
  updateTestimonial: (id, payload) =>
    request(`/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTestimonial: (id) => request(`/admin/testimonials/${id}`, { method: 'DELETE' }),
  updateBusinessInfo: (payload) => request('/admin/business-info', { method: 'PUT', body: JSON.stringify(payload) }),
};
