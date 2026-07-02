const configuredApiBase =
  window.__SCALORA_CONFIG__?.API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080/api';

const API_BASE_URL = normalizeApiBaseUrl(configuredApiBase);

function normalizeApiBaseUrl(value) {
  const trimmed = String(value || '').replace(/\/+$/, '');
  return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
}

async function request(path, options = {}) {
  const token = localStorage.getItem('scalora_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token && options.auth !== false ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
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
    throw new Error(`${path}: ${message}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
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
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
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
  getAdminServices: (businessId) => request(scopedPath('/admin/services', businessId)),
  getBookings: (params = {}) => request(`/admin/bookings?${new URLSearchParams(params)}`),
  updateBookingStatus: (id, status) =>
    request(`/admin/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createService: (payload, businessId) =>
    request(scopedPath('/admin/services', businessId), { method: 'POST', body: JSON.stringify(payload) }),
  updateService: (id, payload) => request(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteService: (id) => request(`/admin/services/${id}`, { method: 'DELETE' }),
  getStaff: (businessId) => request(scopedPath('/admin/staff', businessId)),
  createStaff: (payload, businessId) =>
    request(scopedPath('/admin/staff', businessId), { method: 'POST', body: JSON.stringify(payload) }),
  updateStaff: (id, payload) => request(`/admin/staff/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteStaff: (id) => request(`/admin/staff/${id}`, { method: 'DELETE' }),
  getAdminTestimonials: (businessId) => request(scopedPath('/admin/testimonials', businessId)),
  createTestimonial: (payload, businessId) =>
    request(scopedPath('/admin/testimonials', businessId), { method: 'POST', body: JSON.stringify(payload) }),
  updateTestimonial: (id, payload) =>
    request(`/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTestimonial: (id) => request(`/admin/testimonials/${id}`, { method: 'DELETE' }),
  getAdminBusinessInfo: (businessId) => request(scopedPath('/admin/business-info', businessId)),
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
    return request(`/business-admin/bookings${query.toString() ? `?${query}` : ''}`);
  },
  updateBusinessAdminBookingStatus: (id, status) =>
    request(`/business-admin/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  getBusinessAdminTestimonials: () => request('/business-admin/testimonials'),
  createBusinessAdminTestimonial: (payload) => request('/business-admin/testimonials', { method: 'POST', body: JSON.stringify(payload) }),
  updateBusinessAdminTestimonial: (id, payload) => request(`/business-admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBusinessAdminTestimonial: (id) => request(`/business-admin/testimonials/${id}`, { method: 'DELETE' }),
  getBusinessAdminAvailability: () => request('/business-admin/availability'),
  createBusinessAdminAvailability: (payload) => request('/business-admin/availability', { method: 'POST', body: JSON.stringify(payload) }),
  updateBusinessAdminAvailability: (id, payload) => request(`/business-admin/availability/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBusinessAdminAvailability: (id) => request(`/business-admin/availability/${id}`, { method: 'DELETE' }),
  getBusinessAdminInfo: () => request('/business-admin/dashboard'),
  updateBusinessAdminInfo: (payload) => request('/business-admin/business-settings', { method: 'PUT', body: JSON.stringify(payload) }),
};
