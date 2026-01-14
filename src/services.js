// API Service for handling server calls
class ApiService {
  constructor() {
    this.baseURL =
      import.meta.env.VITE_BACKEND_BASE_URL ||
      "https://suh-tech-main-backend.vercel.app";
  }

  // Generic method for making API requests
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    const defaultOptions = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const requestOptions = {
      ...defaultOptions,
      ...options,
    };

    try {
      const response = await fetch(url, requestOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);
      throw error;
    }
  }

  // Authentication Methods
  async login(credentials) {
    return this.makeRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  // Add authorization header for authenticated requests
  getAuthHeaders(token) {
    return {
      Authorization: `Bearer ${token}`,
    };
  }

  // Generic GET request
  async get(endpoint, token = null) {
    const headers = token ? this.getAuthHeaders(token) : {};
    return this.makeRequest(endpoint, {
      method: "GET",
      headers,
    });
  }

  // Generic POST request
  async post(endpoint, data, token = null) {
    const headers = token ? this.getAuthHeaders(token) : {};
    return this.makeRequest(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
  }

  // Generic PUT request
  async put(endpoint, data, token = null) {
    const headers = token ? this.getAuthHeaders(token) : {};
    return this.makeRequest(endpoint, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
  }

  // Generic DELETE request
  async delete(endpoint, token = null) {
    const headers = token ? this.getAuthHeaders(token) : {};
    return this.makeRequest(endpoint, {
      method: "DELETE",
      headers,
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();

// Auth service functions
export const authService = {
  // Login function
  login: async (email, password) => {
    try {
      const credentials = { email, password };
      const response = await apiService.login(credentials);

      // Store token in localStorage if login is successful
      // Handle nested response structure: response.data.token and response.data.user
      if (response.success && response.data?.token) {
        localStorage.setItem("authToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      return response;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  },

  // Logout function
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },

  // Get stored token
  getToken: () => {
    return localStorage.getItem("authToken");
  },

  // Get stored user data
  getUser: () => {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },
};

// Export the API service instance
export default apiService;

// Example usage for other services:
export const userService = {
  getProfile: () => apiService.get("/user/profile", authService.getToken()),
  updateProfile: (data) =>
    apiService.put("/user/profile", data, authService.getToken()),
};

export const employeeService = {
  getAllEmployees: async () => {
    try {
      const response = await apiService.get(
        "/employee",
        authService.getToken()
      );
      // Filter out admin users and return only the data array
      if (response.success && response.data) {
        return response.data.filter((employee) => !employee.admin);
      }
      return [];
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw error;
    }
  },
  getEmployee: (id) =>
    apiService.get(`/employee/${id}`, authService.getToken()),
  createEmployee: (data) =>
    apiService.post("/employee", data, authService.getToken()),
  updateEmployee: (id, data) =>
    apiService.put(`/employee/${id}`, data, authService.getToken()),
  deleteEmployee: (id) =>
    apiService.delete(`/employee/${id}`, authService.getToken()),
};

// Department service
export const departmentService = {
  getAllDepartments: async () => {
    try {
      const response = await apiService.get(
        "/departments",
        authService.getToken()
      );
      // Handle nested response structure
      return response.success && response.data ? response.data : response || [];
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw error;
    }
  },
  getDepartment: (id) =>
    apiService.get(`/departments/${id}`, authService.getToken()),
  createDepartment: (data) =>
    apiService.post("/departments", data, authService.getToken()),
  updateDepartment: (id, data) =>
    apiService.put(`/departments/${id}`, data, authService.getToken()),
  deleteDepartment: (id) =>
    apiService.delete(`/departments/${id}`, authService.getToken()),
};

// Designation service
export const designationService = {
  getAllDesignations: async () => {
    try {
      const response = await apiService.get(
        "/designations",
        authService.getToken()
      );
      // Handle nested response structure
      return response.success && response.data ? response.data : response || [];
    } catch (error) {
      console.error("Error fetching designations:", error);
      throw error;
    }
  },
  getDesignation: (id) =>
    apiService.get(`/designations/${id}`, authService.getToken()),
  createDesignation: (data) =>
    apiService.post("/designations", data, authService.getToken()),
  updateDesignation: (id, data) =>
    apiService.put(`/designations/${id}`, data, authService.getToken()),
  deleteDesignation: (id) =>
    apiService.delete(`/designations/${id}`, authService.getToken()),
};
