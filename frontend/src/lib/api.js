const API_BASE_URL =
  window.__SCALORA_CONFIG__?.API_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8080/api';

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
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || 'Request failed');
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

function visibleBusinesses(items) {
  return (items || []).filter((business) => business.active !== false && business.status !== 'INACTIVE');
}

export const api = {
  getBusinesses: async () => {
    try {
      const publicBusinesses = visibleBusinesses(await request('/public/businesses', { auth: false }));
      if (publicBusinesses.length > 0 || !localStorage.getItem('scalora_token')) return publicBusinesses;
    } catch {
      try {
        const legacyBusinesses = visibleBusinesses(await request('/businesses', { auth: false }));
        if (legacyBusinesses.length > 0 || !localStorage.getItem('scalora_token')) return legacyBusinesses;
      } catch {
        if (!localStorage.getItem('scalora_token')) throw new Error('Unable to load public businesses.');
      }
    }
    return visibleBusinesses(await request('/admin/businesses'));
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
    const business = (await request('/admin/businesses')).find((item) => item.slug === slug);
    if (!business || business.active === false || business.status === 'INACTIVE') throw new Error('Business unavailable.');
    return business;
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
  deleteSuperBusiness: (id) => request(`/super-admin/businesses/${id}`, { method: 'DELETE' }),
  getAdminBusinesses: () => request('/admin/businesses'),
  createBusiness: (payload) => request('/admin/businesses', { method: 'POST', body: JSON.stringify(payload) }),
  updateBusiness: (id, payload) => request(`/admin/businesses/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteBusiness: (id) => request(`/admin/businesses/${id}`, { method: 'DELETE' }),
  getBusinessAdmins: (businessId) => request(`/admin/business-admins?${new URLSearchParams({ businessId })}`),
  createBusinessAdmin: (payload) => request('/admin/business-admins', { method: 'POST', body: JSON.stringify(payload) }),
  getAvailability: (businessId) => request(`/admin/availability?${new URLSearchParams({ businessId })}`),
  createAvailability: (payload, businessId) =>
    request(`/admin/availability?${new URLSearchParams({ businessId })}`, { method: 'POST', body: JSON.stringify(payload) }),
  updateAvailability: (id, payload) => request(`/admin/availability/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteAvailability: (id) => request(`/admin/availability/${id}`, { method: 'DELETE' }),
  getAdminServices: (businessId) => request(`/admin/services?${new URLSearchParams({ businessId })}`),
  getBookings: (params = {}) => request(`/admin/bookings?${new URLSearchParams(params)}`),
  updateBookingStatus: (id, status) =>
    request(`/admin/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  createService: (payload, businessId) =>
    request(`/admin/services?${new URLSearchParams({ businessId })}`, { method: 'POST', body: JSON.stringify(payload) }),
  updateService: (id, payload) => request(`/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteService: (id) => request(`/admin/services/${id}`, { method: 'DELETE' }),
  getStaff: (businessId) => request(`/admin/staff?${new URLSearchParams({ businessId })}`),
  createStaff: (payload, businessId) =>
    request(`/admin/staff?${new URLSearchParams({ businessId })}`, { method: 'POST', body: JSON.stringify(payload) }),
  updateStaff: (id, payload) => request(`/admin/staff/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteStaff: (id) => request(`/admin/staff/${id}`, { method: 'DELETE' }),
  getAdminTestimonials: (businessId) => request(`/admin/testimonials?${new URLSearchParams({ businessId })}`),
  createTestimonial: (payload, businessId) =>
    request(`/admin/testimonials?${new URLSearchParams({ businessId })}`, { method: 'POST', body: JSON.stringify(payload) }),
  updateTestimonial: (id, payload) =>
    request(`/admin/testimonials/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteTestimonial: (id) => request(`/admin/testimonials/${id}`, { method: 'DELETE' }),
  getAdminBusinessInfo: (businessId) => request(`/admin/business-info?${new URLSearchParams({ businessId })}`),
  updateBusinessInfo: (payload, businessId) =>
    request(`/admin/business-info?${new URLSearchParams({ businessId })}`, { method: 'PUT', body: JSON.stringify(payload) }),
};
