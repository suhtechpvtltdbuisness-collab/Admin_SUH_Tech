// API Configuration for Admin Panel
// Replace this with your deployed backend URL
const API_BASE_URL = 'http://localhost:3000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('authToken');
};

// Generic API fetch function with CORS support
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  console.log(token, "token")

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Handle expired/invalid token: clear and redirect to login
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// API methods
export const api = {
  // Auth
  login: (email, password) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  getMe: () => apiRequest('/auth/me'),

  // Dashboard
  getStats: () => apiRequest('/dashboard/stats'),

  // Expenses
  getExpenses: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/expenses${queryString ? `?${queryString}` : ''}`);
  },
  getExpense: (id) => apiRequest(`/expenses/${id}`),
  createExpense: (data) => apiRequest('/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateExpense: (id, data) => apiRequest(`/expenses/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteExpense: (id) => apiRequest(`/expenses/${id}`, {
    method: 'DELETE',
  }),

  // Invoices
  getInvoices: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/invoices${queryString ? `?${queryString}` : ''}`);
  },
  getInvoice: (id) => apiRequest(`/invoices/${id}`),
  createInvoice: (data) => apiRequest('/invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateInvoice: (id, data) => apiRequest(`/invoices/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteInvoice: (id) => apiRequest(`/invoices/${id}`, {
    method: 'DELETE',
  }),

  // Sales
  getSales: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/sales${queryString ? `?${queryString}` : ''}`);
  },
  getSale: (id) => apiRequest(`/sales/${id}`),
  createSale: (data) => apiRequest('/sales', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateSale: (id, data) => apiRequest(`/sales/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteSale: (id) => apiRequest(`/sales/${id}`, {
    method: 'DELETE',
  }),

  // Employee Salary
  getEmployeeSalaries: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/employee-salary${queryString ? `?${queryString}` : ''}`);
  },
  getEmployeeSalary: (id) => apiRequest(`/employee-salary/${id}`),
  createEmployeeSalary: (data) => apiRequest('/employee-salary', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateEmployeeSalary: (id, data) => apiRequest(`/employee-salary/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteEmployeeSalary: (id) => apiRequest(`/employee-salary/${id}`, {
    method: 'DELETE',
  }),

  // Blogs
  getBlogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/blogs${queryString ? `?${queryString}` : ''}`);
  },
  getBlog: (id) => apiRequest(`/blogs/${id}`),
  createBlog: (data) => apiRequest('/blogs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateBlog: (id, data) => apiRequest(`/blogs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteBlog: (id) => apiRequest(`/blogs/${id}`, {
    method: 'DELETE',
  }),

  // Portfolio
  getPortfolios: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/portfolio${queryString ? `?${queryString}` : ''}`);
  },
  getPortfolio: (id) => apiRequest(`/portfolio/${id}`),
  createPortfolio: (data) => apiRequest('/portfolio', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updatePortfolio: (id, data) => apiRequest(`/portfolio/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deletePortfolio: (id) => apiRequest(`/portfolio/${id}`, {
    method: 'DELETE',
  }),

  // Projects
  getProjects: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/projects${queryString ? `?${queryString}` : ''}`);
  },
  getProject: (id) => apiRequest(`/projects/${id}`),
  createProject: (data) => apiRequest('/projects', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateProject: (id, data) => apiRequest(`/projects/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteProject: (id) => apiRequest(`/projects/${id}`, {
    method: 'DELETE',
  }),

  // Employees
  getEmployees: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/employees${queryString ? `?${queryString}` : ''}`);
  },
  getEmployee: (id) => apiRequest(`/employees/${id}`),
  createEmployee: (data) => apiRequest('/employees', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateEmployee: (id, data) => apiRequest(`/employees/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteEmployee: (id) => apiRequest(`/employees/${id}`, {
    method: 'DELETE',
  }),

  // Orders
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders${queryString ? `?${queryString}` : ''}`);
  },
  getOrder: (id) => apiRequest(`/orders/${id}`),
  updateOrder: (id, data) => apiRequest(`/orders/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),

  // Contacts
  getContacts: () => apiRequest('/contact'),
  createContact: (data) => apiRequest('/contact', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Testimonials
  getTestimonials: () => apiRequest('/testimonials'),
  createTestimonial: (data) => apiRequest('/testimonials', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Newsletter user info (FAQ form submissions / project interest)
  getUserInfos: () => apiRequest('/newsletter/submit-user-info'),

  // Newsletter Subscribers
  getNewsletterSubscribers: () => apiRequest('/newsletter'),

  // Coupons
  getCoupons: () => apiRequest('/coupons'),
  createCoupon: (data) => apiRequest('/coupons', {
    method: 'POST',
    body: JSON.stringify(data),
  }),

  // Jobs (Careers)
  getJobs: () => apiRequest('/jobs'),
  getJob: (id) => apiRequest(`/jobs/${id}`),
  createJob: (data) => apiRequest('/jobs', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  updateJob: (id, data) => apiRequest(`/jobs/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  deleteJob: (id) => apiRequest(`/jobs/${id}`, {
    method: 'DELETE',
  }),
};

export default api;

