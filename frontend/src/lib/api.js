const configuredApiBase =
  window.__SCALORA_CONFIG__?.API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080/api';

const API_BASE_URL = normalizeApiBaseUrl(configuredApiBase);
let runtimeToken = cleanToken(localStorage.getItem('scalora_token') || sessionStorage.getItem('scalora_token') || '');
let runtimeSession = localStorage.getItem('scalora_session') || sessionStorage.getItem('scalora_session') || '';

export function setAuthToken(token) {
  runtimeToken = cleanToken(token);
}

export function setSessionToken(sessionToken) {
  runtimeSession = cleanSessionToken(sessionToken);
}

function normalizeApiBaseUrl(value) {
  const trimmed = String(value || '').replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

async function request(path, options = {}) {
  const savedAdmin = readSavedAdmin();
  const token = cleanToken(
    localStorage.getItem('scalora_token') ||
    sessionStorage.getItem('scalora_token') ||
    savedAdmin.token ||
    savedAdmin.accessToken ||
    runtimeToken ||
    ''
  );
  const sessionToken = cleanSessionToken(
    localStorage.getItem('scalora_session') ||
    sessionStorage.getItem('scalora_session') ||
    savedAdmin.sessionToken ||
    runtimeSession ||
    ''
  );
  runtimeToken = token;
  runtimeSession = sessionToken;
  const requestPath = options.auth !== false ? appendAuthParams(path, token, sessionToken) : path;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token && options.auth !== false ? { Authorization: `Bearer ${token}`, 'X-Auth-Token': token } : {}),
    ...(sessionToken && options.auth !== false ? { 'X-Session-Token': sessionToken } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${requestPath}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const contentType = response.headers.get('content-type') || '';
    let message = `Request failed (${response.status})`;
    if (contentType.includes('application/json')) {
      const error = await response.json().catch(() => null);
      if (error?.message) message = error.message;
      if (error?.fields) {
        const fieldMessages = Object.entries(error.fields).map(([field, detail]) => `${field}: ${detail}`);
        if (fieldMessages.length) message = `${message}: ${fieldMessages.join(', ')}`;
      }
    } else {
      const text = await response.text().catch(() => '');
      if (text.trim()) message = `${message}: ${text.trim().slice(0, 220)}`;
    }
    if (response.status === 401 && options.auth !== false && options.logoutOnUnauthorized !== false) {
      clearStoredAuth();
      window.dispatchEvent(new Event('scalora-auth-expired'));
    }
    throw new Error(`${path}: ${message}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function readSavedAdmin() {
  try {
    return JSON.parse(localStorage.getItem('scalora_admin') || '{}') || {};
  } catch {
    return {};
  }
}

function clearStoredAuth() {
  runtimeToken = '';
  runtimeSession = '';
  localStorage.removeItem('scalora_token');
  sessionStorage.removeItem('scalora_token');
  localStorage.removeItem('scalora_session');
  sessionStorage.removeItem('scalora_session');
  localStorage.removeItem('scalora_admin');
}

function cleanToken(token) {
  const value = String(token || '').trim();
  if (!value || value === 'undefined' || value === 'null') return '';
  return value.split('.').length === 3 ? value : '';
}

function cleanSessionToken(sessionToken) {
  const value = String(sessionToken || '').trim();
  return !value || value === 'undefined' || value === 'null' ? '' : value;
}

function appendAuthParams(path, token, sessionToken) {
  const params = new URLSearchParams();
  if (token) {
    params.set('access_token', token);
    params.set('token', token);
  }
  if (sessionToken) {
    params.set('session', sessionToken);
    params.set('sessionToken', sessionToken);
  }
  if (!params.toString()) return path;
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}${params}`;
}

function scopedPath(path, businessId) {
  if (!businessId) return path;
  return `${path}?${new URLSearchParams({ businessId })}`;
}

export const api = {
  getBusinesses: async () => {
    try {
      const publicBusinesses = await request('/public/businesses', { auth: false });
      if (publicBusinesses.length > 0) return publicBusinesses;
    } catch {
      try {
        const legacyBusinesses = await request('/businesses', { auth: false });
        if (legacyBusinesses.length > 0) return legacyBusinesses;
      } catch {
        throw new Error('Unable to load public businesses.');
      }
    }
    return [];
  },
  getBusiness: (slug) => request(`/businesses/${slug}`, { auth: false }),
  getPublicBusiness: async (slug) => {
    try {
      return await request(`/public/businesses/${slug}`, { auth: false });
    } catch {
      try {
        return await request(`/businesses/${slug}`, { auth: false });
      } catch {
        if (!localStorage.getItem('scalora_token')) throw new Error('Business unavailable.');
      }
    }
    throw new Error('Business unavailable.');
  },
  getServices: () => request('/services', { auth: false }),
  getBusinessServices: (slug) => request(`/businesses/${slug}/services`, { auth: false }),
  getAvailabilitySlots: (slug, serviceId, date) =>
    request(`/businesses/${slug}/availability-slots?${new URLSearchParams({ serviceId, date })}`, { auth: false }),
  createBooking: (payload) => request('/bookings', { method: 'POST', body: JSON.stringify(payload), auth: false }),
  createPublicBusinessBooking: (slug, payload) =>
    request(`/public/businesses/${slug}/bookings`, { method: 'POST', body: JSON.stringify(payload), auth: false }),
  getTestimonials: () => request('/testimonials', { auth: false }),
  getBusinessTestimonials: (slug) => request(`/businesses/${slug}/testimonials`, { auth: false }),
  getBusinessStaff: (slug) => request(`/businesses/${slug}/staff`, { auth: false }),
  sendContact: (payload, slug) =>
    request(slug ? `/businesses/${slug}/contact` : '/contact', { method: 'POST', body: JSON.stringify(payload), auth: false }),
  getBusinessInfo: () => request('/business-info', { auth: false }),
  getBusinessProfileInfo: (slug) => request(`/businesses/${slug}/business-info`, { auth: false }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload), auth: false }),
  me: () => request('/auth/me'),
  getSuperBusinesses: () => request('/super-admin/businesses'),
  getSuperAnalytics: () => request('/super-admin/analytics'),
  createSuperBusiness: (payload) => request('/super-admin/businesses', { method: 'POST', body: JSON.stringify(payload) }),
  updateSuperBusiness: (id, payload) => request(`/super-admin/businesses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  patchSuperBusinessStatus: (id, active) =>
    request(`/super-admin/businesses/${id}/status`, { method: 'PATCH', body: JSON.stringify({ active }) }),
  resetBusinessOwnerPassword: (id, password) =>
    request(`/super-admin/businesses/${id}/owner-password`, { method: 'PATCH', body: JSON.stringify({ password }) }),
  deleteSuperBusiness: (id) => request(`/super-admin/businesses/${id}`, { method: 'DELETE' }),
  getAdminBusinesses: () => request('/admin/businesses'),
  createBusiness: (payload) => request('/admin/businesses', { method: 'POST', body: JSON.stringify(payload) }),
  updateBusiness: (id, payload) => request(`/admin/businesses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBusiness: (id) => request(`/admin/businesses/${id}`, { method: 'DELETE' }),
  getBusinessAdmins: (businessId) => request(`/admin/business-admins?${new URLSearchParams({ businessId })}`),
  createBusinessAdmin: (payload) => request('/admin/business-admins', { method: 'POST', body: JSON.stringify(payload) }),
  getAvailability: (businessId) => request(scopedPath('/admin/availability', businessId)),
  createAvailability: (payload, businessId) =>
    request(scopedPath('/admin/availability', businessId), { method: 'POST', body: JSON.stringify(payload) }),
  updateAvailability: (id, payload) => request(`/admin/availability/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteAvailability: (id) => request(`/admin/availability/${id}`, { method: 'DELETE' }),
  getAdminServices: (businessId) => request(scopedPath('/admin/services', businessId), { logoutOnUnauthorized: false }),
  getBookings: (params = {}) => request(`/admin/bookings?${new URLSearchParams(params)}`, { logoutOnUnauthorized: false }),
  updateBookingStatus: (id, status) =>
    request(`/admin/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createService: (payload, businessId) =>
    request(scopedPath('/admin/services', businessId), { method: 'POST', body: JSON.stringify(payload), logoutOnUnauthorized: false }),
  updateService: (id, payload) => request(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(payload), logoutOnUnauthorized: false }),
  deleteService: (id) => request(`/admin/services/${id}`, { method: 'DELETE', logoutOnUnauthorized: false }),
  getStaff: (businessId) => request(scopedPath('/admin/staff', businessId), { logoutOnUnauthorized: false }),
  createStaff: (payload, businessId) =>
    request(scopedPath('/admin/staff', businessId), { method: 'POST', body: JSON.stringify(payload), logoutOnUnauthorized: false }),
  updateStaff: (id, payload) => request(`/admin/staff/${id}`, { method: 'PUT', body: JSON.stringify(payload), logoutOnUnauthorized: false }),
  deleteStaff: (id) => request(`/admin/staff/${id}`, { method: 'DELETE', logoutOnUnauthorized: false }),
  getAdminTestimonials: (businessId) => request(scopedPath('/admin/testimonials', businessId), { logoutOnUnauthorized: false }),
  createTestimonial: (payload, businessId) =>
    request(scopedPath('/admin/testimonials', businessId), { method: 'POST', body: JSON.stringify(payload) }),
  updateTestimonial: (id, payload) =>
    request(`/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTestimonial: (id) => request(`/admin/testimonials/${id}`, { method: 'DELETE' }),
  getAdminBusinessInfo: (businessId) => request(scopedPath('/admin/business-info', businessId), { logoutOnUnauthorized: false }),
  updateBusinessInfo: (payload, businessId) =>
    request(scopedPath('/admin/business-info', businessId), { method: 'PUT', body: JSON.stringify(payload) }),
  getBusinessAdminServices: () => request('/business-admin/services'),
  createBusinessAdminService: (payload) => request('/business-admin/services', { method: 'POST', body: JSON.stringify(payload) }),
  updateBusinessAdminService: (id, payload) => request(`/business-admin/services/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBusinessAdminService: (id) => request(`/business-admin/services/${id}`, { method: 'DELETE' }),
  getBusinessAdminStaff: () => request('/business-admin/staff'),
  createBusinessAdminStaff: (payload) => request('/business-admin/staff', { method: 'POST', body: JSON.stringify(payload) }),
  updateBusinessAdminStaff: (id, payload) => request(`/business-admin/staff/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBusinessAdminStaff: (id) => request(`/business-admin/staff/${id}`, { method: 'DELETE' }),
  getBusinessAdminBookings: (params = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.set('status', params.status);
    if (params.date) query.set('date', params.date);
    if (params.serviceId) query.set('serviceId', params.serviceId);
    return request(`/business-admin/bookings${query.toString() ? `?${query}` : ''}`, { logoutOnUnauthorized: false });
  },
  updateBusinessAdminBookingStatus: (id, status) =>
    request(`/business-admin/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getBusinessAdminTestimonials: () => request('/business-admin/testimonials', { logoutOnUnauthorized: false }),
  createBusinessAdminTestimonial: (payload) => request('/business-admin/testimonials', { method: 'POST', body: JSON.stringify(payload) }),
  updateBusinessAdminTestimonial: (id, payload) => request(`/business-admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBusinessAdminTestimonial: (id) => request(`/business-admin/testimonials/${id}`, { method: 'DELETE' }),
  getBusinessAdminAvailability: () => request('/business-admin/availability', { logoutOnUnauthorized: false }),
  createBusinessAdminAvailability: (payload) => request('/business-admin/availability', { method: 'POST', body: JSON.stringify(payload) }),
  updateBusinessAdminAvailability: (id, payload) => request(`/business-admin/availability/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBusinessAdminAvailability: (id) => request(`/business-admin/availability/${id}`, { method: 'DELETE' }),
  getBusinessAdminInfo: () => request('/business-admin/dashboard', { logoutOnUnauthorized: false }),
  updateBusinessAdminInfo: (payload) => request('/business-admin/business-settings', { method: 'PUT', body: JSON.stringify(payload) }),
  changeBusinessAdminPassword: (payload) => request('/business-admin/password', { method: 'PUT', body: JSON.stringify(payload) }),
};
