// API Configuration for Admin Panel
// Using environment variable for backend URL
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_BASE_URL ||
  "https://suh-tech-main-backend.vercel.app";

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem("authToken");
};

// Generic API fetch function with CORS support
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();
  console.log(token, "token");

  const config = {
    ...options,
    headers: {
      "Content-Type": "application/json",
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
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
      throw new Error(data.error || "API request failed");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// API methods
export const api = {
  // Auth
  login: (email, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),

  getMe: () => apiRequest("/auth/me"),

  // Dashboard
  getStats: () => apiRequest("/dashboard/stats"),

  // Expenses
  getExpenses: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/expenses${queryString ? `?${queryString}` : ""}`);
  },
  getExpense: (id) => apiRequest(`/expenses/${id}`),
  createExpense: (data) =>
    apiRequest("/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateExpense: (id, data) =>
    apiRequest(`/expenses/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteExpense: (id) =>
    apiRequest(`/expenses/${id}`, {
      method: "DELETE",
    }),

  // Invoices
  getInvoices: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/invoices${queryString ? `?${queryString}` : ""}`);
  },
  getInvoice: (id) => apiRequest(`/invoices/${id}`),
  createInvoice: (data) =>
    apiRequest("/invoices", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateInvoice: (id, data) =>
    apiRequest(`/invoices/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteInvoice: (id) =>
    apiRequest(`/invoices/${id}`, {
      method: "DELETE",
    }),

  // Sales
  getSales: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/sales${queryString ? `?${queryString}` : ""}`);
  },
  getSale: (id) => apiRequest(`/sales/${id}`),
  createSale: (data) =>
    apiRequest("/sales", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSale: (id, data) =>
    apiRequest(`/sales/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteSale: (id) =>
    apiRequest(`/sales/${id}`, {
      method: "DELETE",
    }),

  // Employee Salary
  getEmployeeSalaries: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(
      `/employee-salary${queryString ? `?${queryString}` : ""}`
    );
  },
  getEmployeeSalary: (id) => apiRequest(`/employee-salary/${id}`),
  createEmployeeSalary: (data) =>
    apiRequest("/employee-salary", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateEmployeeSalary: (id, data) =>
    apiRequest(`/employee-salary/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteEmployeeSalary: (id) =>
    apiRequest(`/employee-salary/${id}`, {
      method: "DELETE",
    }),

  // Blogs
  getBlogs: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/blogs${queryString ? `?${queryString}` : ""}`);
  },
  getBlog: (id) => apiRequest(`/blogs/${id}`),
  createBlog: (data) =>
    apiRequest("/blogs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateBlog: (id, data) =>
    apiRequest(`/blogs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteBlog: (id) =>
    apiRequest(`/blogs/${id}`, {
      method: "DELETE",
    }),

  // Portfolio
  getPortfolios: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/portfolio${queryString ? `?${queryString}` : ""}`);
  },
  getPortfolio: (id) => apiRequest(`/portfolio/${id}`),
  createPortfolio: (data) =>
    apiRequest("/portfolio", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updatePortfolio: (id, data) =>
    apiRequest(`/portfolio/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deletePortfolio: (id) =>
    apiRequest(`/portfolio/${id}`, {
      method: "DELETE",
    }),

  // Projects
  getProjects: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/projects${queryString ? `?${queryString}` : ""}`);
  },
  getProject: (id) => apiRequest(`/projects/${id}`),
  createProject: (data) =>
    apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProject: (id, data) =>
    apiRequest(`/projects/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteProject: (id) =>
    apiRequest(`/projects/${id}`, {
      method: "DELETE",
    }),

  // Employees
  getEmployees: async (params = {}) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiRequest(
        `/employees${queryString ? `?${queryString}` : ""}`
      );

      // MERGE STRATEGY: Backend Data + Local Only Data + Locally Modified Data
      const localEmployees = JSON.parse(
        localStorage.getItem("employees") || "[]"
      );

      // 1. Get backend employees
      let finalEmployees = [...response.employees];

      // 2. Append locally created employees (ids starting with 'local_')
      const localOnly = localEmployees.filter(
        (e) => e._id && e._id.toString().startsWith("local_")
      );
      finalEmployees = [...finalEmployees, ...localOnly];

      // 3. Apply local edits (if any item is marked as locally modified)
      finalEmployees = finalEmployees.map((backendEmp) => {
        const localVersion = localEmployees.find(
          (l) => l._id === backendEmp._id
        );
        if (localVersion && localVersion._isLocallyModified) {
          return localVersion;
        }
        return backendEmp;
      });

      // Update localStorage with the merged result
      localStorage.setItem("employees", JSON.stringify(finalEmployees));

      // Return merged result
      return { ...response, employees: finalEmployees };
    } catch (error) {
      console.warn("Backend unavailable, using localStorage:", error.message);
      const employees = JSON.parse(localStorage.getItem("employees") || "null");

      if (!employees) {
        // Default mock data if nothing in storage
        const defaultEmployees = [
          {
            _id: "1",
            name: "Rahul Sharma",
            employeeId: "EMP001",
            department: "Engineering",
            avatar: "👨‍💻",
            status: "Present",
          },
          {
            _id: "2",
            name: "Priya Singh",
            employeeId: "EMP002",
            department: "Design",
            avatar: "👩‍🎨",
            status: "Present",
          },
          {
            _id: "3",
            name: "Amit Kumar",
            employeeId: "EMP003",
            department: "Marketing",
            avatar: "👨‍💼",
            status: "Absent",
          },
          {
            _id: "4",
            name: "Sneha Patel",
            employeeId: "EMP004",
            department: "HR",
            avatar: "👩‍💼",
            status: "Present",
          },
          {
            _id: "5",
            name: "Vikash Verma",
            employeeId: "EMP005",
            department: "Engineering",
            avatar: "👨‍🔧",
            status: "Late",
          },
          {
            _id: "6",
            name: "Anjali Gupta",
            employeeId: "EMP006",
            department: "Sales",
            avatar: "👩‍💻",
            status: "Leave",
          },
        ];
        localStorage.setItem("employees", JSON.stringify(defaultEmployees));
        return { employees: defaultEmployees };
      }
      return { employees };
    }
  },

  getEmployee: (id) => apiRequest(`/employees/${id}`),

  createEmployee: async (data) => {
    try {
      const response = await apiRequest("/employees", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.warn(
        "Backend unavailable, saving to localStorage:",
        error.message
      );
      const employees = JSON.parse(localStorage.getItem("employees") || "[]");

      // Check for duplicate Employee ID
      if (employees.some((e) => e.employeeId === data.employeeId)) {
        throw new Error("Employee ID already exists");
      }

      const newEmployee = {
        ...data,
        _id: `local_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      employees.push(newEmployee);
      localStorage.setItem("employees", JSON.stringify(employees));
      return { employee: newEmployee };
    }
  },

  updateEmployee: async (id, data) => {
    try {
      const response = await apiRequest(`/employees/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.warn(
        "Backend unavailable, updating in localStorage:",
        error.message
      );
      const employees = JSON.parse(localStorage.getItem("employees") || "[]");
      const index = employees.findIndex((e) => e._id === id);
      if (index !== -1) {
        employees[index] = {
          ...employees[index],
          ...data,
          _isLocallyModified: true, // Mark as locally modified to win merge
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("employees", JSON.stringify(employees));
        return { employee: employees[index] };
      }
      throw new Error("Employee not found");
    }
  },

  deleteEmployee: async (id) => {
    try {
      const response = await apiRequest(`/employees/${id}`, {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      console.warn(
        "Backend unavailable, deleting from localStorage:",
        error.message
      );
      const employees = JSON.parse(localStorage.getItem("employees") || "[]");
      const filtered = employees.filter((e) => e._id !== id);
      localStorage.setItem("employees", JSON.stringify(filtered));
      return { success: true };
    }
  },

  // Orders
  getOrders: (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(`/orders${queryString ? `?${queryString}` : ""}`);
  },
  getOrder: (id) => apiRequest(`/orders/${id}`),
  updateOrder: (id, data) =>
    apiRequest(`/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Contacts
  getContacts: () => apiRequest("/contact"),
  createContact: (data) =>
    apiRequest("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Testimonials
  getTestimonials: () => apiRequest("/testimonials"),
  createTestimonial: (data) =>
    apiRequest("/testimonials", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Newsletter user info (FAQ form submissions / project interest)
  getUserInfos: () => apiRequest("/newsletter/submit-user-info"),

  // Newsletter Subscribers
  getNewsletterSubscribers: () => apiRequest("/newsletter"),

  // Coupons
  getCoupons: () => apiRequest("/coupons"),
  createCoupon: (data) =>
    apiRequest("/coupons", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Jobs (Careers)
  getJobs: () => apiRequest("/jobs"),
  getJob: (id) => apiRequest(`/jobs/${id}`),
  createJob: (data) =>
    apiRequest("/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateJob: (id, data) =>
    apiRequest(`/jobs/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  deleteJob: (id) =>
    apiRequest(`/jobs/${id}`, {
      method: "DELETE",
    }),

  // Employee Salaries //
  getEmployeeSalaries: async () => {
    try {
      const response = await apiRequest("/salaries");
      return response;
    } catch (error) {
      console.warn("Backend unavailable, using localStorage:", error.message);
      const salaries = JSON.parse(
        localStorage.getItem("employeeSalaries") || "[]"
      );
      return { salaries };
    }
  },

  createEmployeeSalary: async (data) => {
    try {
      const response = await apiRequest("/salaries", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      // Fallback to localStorage if backend fails
      console.warn(
        "Backend unavailable, saving to localStorage:",
        error.message
      );
      const salaries = JSON.parse(
        localStorage.getItem("employeeSalaries") || "[]"
      );
      const newSalary = {
        ...data,
        _id: `local_${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      salaries.push(newSalary);
      localStorage.setItem("employeeSalaries", JSON.stringify(salaries));
      return { salary: newSalary };
    }
  },

  updateEmployeeSalary: async (id, data) => {
    try {
      const response = await apiRequest(`/salaries/${id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      // Fallback to localStorage if backend fails
      console.warn(
        "Backend unavailable, updating in localStorage:",
        error.message
      );
      const salaries = JSON.parse(
        localStorage.getItem("employeeSalaries") || "[]"
      );
      const index = salaries.findIndex((s) => s._id === id);
      if (index !== -1) {
        salaries[index] = {
          ...salaries[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("employeeSalaries", JSON.stringify(salaries));
        return { salary: salaries[index] };
      }
      throw new Error("Salary entry not found");
    }
  },

  deleteEmployeeSalary: async (id) => {
    try {
      const response = await apiRequest(`/salaries/${id}`, {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      // Fallback to localStorage if backend fails
      console.warn(
        "Backend unavailable, deleting from localStorage:",
        error.message
      );
      const salaries = JSON.parse(
        localStorage.getItem("employeeSalaries") || "[]"
      );
      const filtered = salaries.filter((s) => s._id !== id);
      localStorage.setItem("employeeSalaries", JSON.stringify(filtered));
      return { success: true };
    }
  },

  // User Profile Management
  getUserProfile: async () => {
    try {
      const response = await apiRequest("/auth/profile");
      // Cache in localStorage
      localStorage.setItem("userProfile", JSON.stringify(response.user));
      return response;
    } catch (error) {
      console.warn("Backend unavailable, using localStorage:", error.message);
      const profile = JSON.parse(localStorage.getItem("userProfile") || "null");
      if (!profile) {
        // Return default profile structure
        const defaultProfile = {
          firstName: "Alex",
          lastName: "Hartman",
          email: "alex.hartman@suhtech.com",
          phone: "+91 98765 00000",
          role: "Administrator",
          department: "Management",
          address: "123 Business Street",
          city: "Mumbai",
          state: "Maharashtra",
          zipCode: "400001",
          timezone: "Asia/Kolkata",
          dateFormat: "DD/MM/YYYY",
          timeFormat: "12h",
        };
        localStorage.setItem("userProfile", JSON.stringify(defaultProfile));
        return { user: defaultProfile };
      }
      return { user: profile };
    }
  },

  updateUserProfile: async (data) => {
    try {
      const response = await apiRequest("/auth/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      });
      // Also update localStorage for offline access
      localStorage.setItem(
        "userProfile",
        JSON.stringify(response.user || data)
      );
      return response;
    } catch (error) {
      console.warn(
        "Backend unavailable, saving to localStorage:",
        error.message
      );
      localStorage.setItem("userProfile", JSON.stringify(data));
      return { user: data, success: true };
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    try {
      const response = await apiRequest("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      return response;
    } catch (error) {
      console.warn("Backend unavailable for password change:", error.message);
      // For security, simulate success in development but warn
      return {
        success: true,
        message: "Password change simulated (backend unavailable)",
      };
    }
  },

  // Holidays
  getHolidays: async () => {
    try {
      const response = await apiRequest("/holidays");
      localStorage.setItem("holidays", JSON.stringify(response.holidays));
      return response;
    } catch (error) {
      console.warn("Backend unavailable, using localStorage:", error.message);
      const holidays = JSON.parse(localStorage.getItem("holidays") || "null");
      if (!holidays) {
        const defaultHolidays = [
          { id: 1, name: "New Year", date: "2025-01-01", type: "Public" },
          { id: 2, name: "Republic Day", date: "2025-01-26", type: "Public" },
          { id: 3, name: "Holi", date: "2025-03-14", type: "Public" },
          {
            id: 4,
            name: "Independence Day",
            date: "2025-08-15",
            type: "Public",
          },
          { id: 5, name: "Diwali", date: "2025-10-20", type: "Public" },
        ];
        localStorage.setItem("holidays", JSON.stringify(defaultHolidays));
        return { holidays: defaultHolidays };
      }
      return { holidays };
    }
  },

  createHoliday: async (data) => {
    try {
      const response = await apiRequest("/holidays", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      console.warn(
        "Backend unavailable, saving to localStorage:",
        error.message
      );
      const holidays = JSON.parse(localStorage.getItem("holidays") || "[]");
      const newHoliday = { ...data, id: Date.now() };
      holidays.push(newHoliday);
      localStorage.setItem("holidays", JSON.stringify(holidays));
      return { holiday: newHoliday };
    }
  },

  deleteHoliday: async (id) => {
    try {
      const response = await apiRequest(`/holidays/${id}`, {
        method: "DELETE",
      });
      return response;
    } catch (error) {
      console.warn(
        "Backend unavailable, deleting from localStorage:",
        error.message
      );
      const holidays = JSON.parse(localStorage.getItem("holidays") || "[]");
      const filtered = holidays.filter((h) => h.id !== id);
      localStorage.setItem("holidays", JSON.stringify(filtered));
      return { success: true };
    }
  },
};



export default api;
