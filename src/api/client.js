const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('soopi_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Lỗi hệ thống (${response.status})`;
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (payload) => request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  getProfile: () => request('/auth/me'),
  updateProfile: (payload) => request('/auth/profile', { method: 'PUT', body: JSON.stringify(payload) }),

  // Categories & Banners
  getCategories: () => request('/categories'),
  getBanners: () => request('/banners'),

  // Products
  getProducts: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== '' && v !== null)
    );
    const searchParams = new URLSearchParams(cleanParams);
    return request(`/products?${searchParams.toString()}`);
  },
  getProductByIdOrSlug: (idOrSlug) => request(`/products/${idOrSlug}`),

  // Orders
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getMyOrders: () => request('/orders/my-orders'),
  getOrderById: (id) => request(`/orders/${id}`),
  trackOrder: (code) => request(`/orders/track/${encodeURIComponent(code)}`),

  // Admin APIs
  admin: {
    getStats: () => request('/admin/stats'),
    getProducts: () => request('/admin/products'),
    createProduct: (payload) => request('/admin/products', { method: 'POST', body: JSON.stringify(payload) }),
    updateProduct: (id, payload) => request(`/admin/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
    deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE' }),
    getOrders: (params = {}) => {
      const searchParams = new URLSearchParams(params);
      return request(`/admin/orders?${searchParams.toString()}`);
    },
    updateOrderStatus: (id, payload) => request(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
    getCustomers: () => request('/admin/customers'),
    getCustomerOrders: (customerId) => request(`/admin/customers/${customerId}/orders`),
    toggleCustomerStatus: (customerId) => request(`/admin/customers/${customerId}/toggle-status`, { method: 'PATCH' }),
  }
};

