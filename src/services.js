// API Service for handling server calls
class ApiService {
  constructor() {
    // Use proxy in development, direct URL in production
    this.baseURL = import.meta.env.DEV
      ? "/api"  // Proxy path for development (avoids CORS)
      : (import.meta.env.VITE_BACKEND_BASE_URL || "https://suh-tech-main-backend.vercel.app");
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
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
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
        const apiEmployees = response.data.filter((employee) => !employee.admin);

        // Get localStorage employees (those created offline)
        const localEmployees = JSON.parse(localStorage.getItem('employees') || '[]');

        // Merge: Keep localStorage employees that don't exist in API
        const localOnlyEmployees = localEmployees.filter(localEmp =>
          !apiEmployees.some(apiEmp => apiEmp.email === localEmp.email)
        );

        const mergedEmployees = [...apiEmployees, ...localOnlyEmployees];

        // Cache merged result
        localStorage.setItem('employees', JSON.stringify(mergedEmployees));
        return mergedEmployees;
      }
      return [];
    } catch (error) {
      // Fallback to localStorage
      const cached = localStorage.getItem('employees');
      return cached ? JSON.parse(cached) : [];
    }
  },

  getEmployee: async (id) => {
    try {
      return await apiService.get(`/employee/${id}`, authService.getToken());
    } catch (error) {
      // Fallback to localStorage
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      return employees.find(emp => emp.id === id || emp._id === id);
    }
  },

  createEmployee: async (data) => {
    try {
      const response = await apiService.post("/employee", data, authService.getToken());
      return response;
    } catch (error) {
      // Fallback: Save to localStorage
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');

      // Get department and designation names from their services
      let departmentName = "Unknown";
      let designationTitle = "Unknown";

      try {
        const departments = await departmentService.getAllDepartments();
        const department = departments.find(d => d.id === data.departmentId);
        if (department) departmentName = department.name;
      } catch (e) {
        // Could not fetch department name
      }

      try {
        const designations = await designationService.getAllDesignations();
        const designation = designations.find(d => d.id === data.designationId);
        if (designation) designationTitle = designation.title;
      } catch (e) {
        // Could not fetch designation title
      }

      // Generate employee ID
      const employeeId = `EMP${Date.now().toString().slice(-6)}`;

      const newEmployee = {
        ...data,
        id: Date.now(),
        _id: Date.now().toString(),
        employeeId: employeeId,
        department: departmentName,
        designation: designationTitle,
        joiningDate: data.joinedDate, // Map joinedDate to joiningDate
        status: data.active ? "Active" : "Inactive",
        createdAt: new Date().toISOString(),
      };

      employees.push(newEmployee);
      localStorage.setItem('employees', JSON.stringify(employees));

      return { success: true, data: newEmployee };
    }
  },

  updateEmployee: async (id, data) => {
    try {
      return await apiService.put(`/employee/${id}`, data, authService.getToken());
    } catch (error) {
      console.error("Error updating employee via API:", error);
      console.log("Updating employee in localStorage instead");

      // Fallback: Update in localStorage
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const index = employees.findIndex(emp => emp.id === id || emp._id === id);
      if (index !== -1) {
        employees[index] = { ...employees[index], ...data };
        localStorage.setItem('employees', JSON.stringify(employees));
        return { success: true, data: employees[index] };
      }
      throw new Error('Employee not found');
    }
  },

  deleteEmployee: async (id) => {
    try {
      return await apiService.delete(`/employee/${id}`, authService.getToken());
    } catch (error) {
      console.error("Error deleting employee via API:", error);
      console.log("Deleting employee from localStorage instead");

      // Fallback: Delete from localStorage
      const employees = JSON.parse(localStorage.getItem('employees') || '[]');
      const filtered = employees.filter(emp => emp.id !== id && emp._id !== id);
      localStorage.setItem('employees', JSON.stringify(filtered));
      return { success: true };
    }
  },
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
