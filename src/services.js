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

    const requestOptions = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, requestOptions);

      // Handle token expiry: 401 Unauthorized → auto logout
      if (response.status === 401) {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        // Redirect to login page
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        throw new Error("Session expired. Please log in again.");
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`,
        );
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
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
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

  // Generic PATCH request
  async patch(endpoint, data, token = null) {
    const headers = token ? this.getAuthHeaders(token) : {};
    return this.makeRequest(endpoint, {
      method: "PATCH",
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
        authService.getToken(),
      );

      // Return only real database employees with enriched data
      if (response.success && response.data) {
        // Filter out admin users (admin=true should not show on UI)
        const employees = response.data.filter((emp) => !emp.admin);

        // Fetch departments and designations to map IDs to names
        let departments = [];
        let designations = [];

        try {
          departments = await departmentService.getAllDepartments();
          designations = await designationService.getAllDesignations();
        } catch (error) {
          console.error("Error fetching departments/designations:", error);
        }

        // Enrich each employee with department and designation names
        const enrichedEmployees = employees.map((emp) => {
          const department = departments.find((d) => d.id === emp.departmentId);
          const designation = designations.find(
            (d) => d.id === emp.designationId,
          );

          return {
            ...emp,
            department: department?.name || "Unknown",
            designation: designation?.title || "Unknown",
            // Map joinedDate to joiningDate for consistency
            joiningDate: emp.joinedDate || emp.joiningDate,
            // Map active status to readable status
            status: emp.active ? "Active" : "Inactive",
            // Use employeeId or empId
            employeeId: emp.employeeId || emp.empId || `EMP${emp.id}`,
          };
        });

        return enrichedEmployees;
      }
      return [];
    } catch (error) {
      console.error("Error fetching employees from API:", error);
      // Return empty array instead of localStorage fallback
      return [];
    }
  },

  getEmployee: async (id) => {
    try {
      const response = await apiService.get(
        `/employee/${id}`,
        authService.getToken(),
      );

      // Enrich employee data with department and designation names
      if (response.success && response.data) {
        const emp = response.data;

        // Fetch departments and designations
        let departments = [];
        let designations = [];

        try {
          departments = await departmentService.getAllDepartments();
          designations = await designationService.getAllDesignations();
        } catch (error) {
          console.error("Error fetching departments/designations:", error);
        }

        const department = departments.find((d) => d.id === emp.departmentId);
        const designation = designations.find(
          (d) => d.id === emp.designationId,
        );

        const enrichedEmployee = {
          ...emp,
          department: department?.name || "Unknown",
          designation: designation?.title || "Unknown",
          joiningDate: emp.joinedDate || emp.joiningDate,
          status: emp.active ? "Active" : "Inactive",
          employeeId: emp.employeeId || emp.empId || `EMP${emp.id}`,
        };

        return { success: true, employee: enrichedEmployee };
      }

      return response;
    } catch (error) {
      console.error("Error fetching employee from API:", error);
      throw error;
    }
  },

  createEmployee: async (data) => {
    try {
      // Build payload with only required fields and non-empty optional fields
      const payload = {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      };

      // Add optional fields only if they have values
      if (data.phoneNumber) payload.phoneNumber = data.phoneNumber;
      if (data.address) payload.address = data.address;
      if (data.departmentId) payload.departmentId = data.departmentId;
      if (data.designationId) payload.designationId = data.designationId;
      if (data.joinedDate) payload.joinedDate = data.joinedDate;
      if (data.skills) payload.skills = data.skills;
      if (data.empType) payload.empType = data.empType;

      // Add boolean fields
      payload.admin = data.admin || false;
      payload.active = data.active !== undefined ? data.active : true;

      console.log(
        "Creating employee with payload:",
        JSON.stringify(payload, null, 2),
      );

      const response = await apiService.post(
        "/employee",
        payload,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error creating employee via API:", error);
      throw error;
    }
  },

  updateEmployee: async (id, data) => {
    try {
      return await apiService.put(
        `/employee/${id}`,
        data,
        authService.getToken(),
      );
    } catch (error) {
      console.error("Error updating employee via API:", error);
      throw error;
    }
  },

  deleteEmployee: async (id) => {
    try {
      return await apiService.delete(`/employee/${id}`, authService.getToken());
    } catch (error) {
      console.error("Error deleting employee via API:", error);
      throw error;
    }
  },
};

// Department service
export const departmentService = {
  getAllDepartments: async () => {
    try {
      const response = await apiService.get(
        "/departments",
        authService.getToken(),
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
        authService.getToken(),
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

// Attendance service
export const attendanceService = {
  // Get all attendance records
  getAllAttendance: async (date = null) => {
    try {
      const endpoint = date ? `/attendances/?date=${date}` : "/attendances/";
      const response = await apiService.get(endpoint, authService.getToken());
      // Handle nested response structure
      return response.success && response.data ? response.data : response || [];
    } catch (error) {
      console.error("Error fetching attendance:", error);
      // Fallback to localStorage
      const cached = localStorage.getItem("attendance");
      return cached ? JSON.parse(cached) : [];
    }
  },

  // Get attendance by ID
  getAttendanceById: async (id) => {
    try {
      const response = await apiService.get(
        `/attendances/${id}`,
        authService.getToken(),
      );
      return response.success && response.data ? response.data : response;
    } catch (error) {
      console.error("Error fetching attendance by ID:", error);
      // Fallback to localStorage
      const attendance = JSON.parse(localStorage.getItem("attendance") || "[]");
      return attendance.find((att) => att.id === id || att._id === id);
    }
  },

  // Get attendance by user ID
  getAttendanceByUserId: async (userId) => {
    try {
      const response = await apiService.get(
        `/attendances/user/${userId}`,
        authService.getToken(),
      );
      return response.success && response.data ? response.data : response || [];
    } catch (error) {
      console.error("Error fetching attendance by user ID:", error);
      // Fallback to localStorage
      const attendance = JSON.parse(localStorage.getItem("attendance") || "[]");
      return attendance.filter((att) => att.userId === userId);
    }
  },

  // Create new attendance record
  createAttendance: async (data) => {
    try {
      const response = await apiService.post(
        "/attendances/",
        data,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error creating attendance via API:", error);
      console.log("Saving attendance to localStorage instead");

      // Fallback: Save to localStorage
      const attendance = JSON.parse(localStorage.getItem("attendance") || "[]");
      const newAttendance = {
        ...data,
        id: Date.now(),
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      attendance.push(newAttendance);
      localStorage.setItem("attendance", JSON.stringify(attendance));

      return { success: true, data: newAttendance };
    }
  },

  // Update attendance by ID
  updateAttendanceById: async (id, data) => {
    try {
      const response = await apiService.patch(
        `/attendances/${id}`,
        data,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error updating attendance via API:", error);
      console.log("Updating attendance in localStorage instead");

      // Fallback: Update in localStorage
      const attendance = JSON.parse(localStorage.getItem("attendance") || "[]");
      const index = attendance.findIndex(
        (att) => att.id === id || att._id === id,
      );
      if (index !== -1) {
        attendance[index] = {
          ...attendance[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("attendance", JSON.stringify(attendance));
        return { success: true, data: attendance[index] };
      }
      throw new Error("Attendance record not found");
    }
  },

  // Delete attendance by ID
  deleteAttendanceById: async (id) => {
    try {
      const response = await apiService.delete(
        `/attendances/${id}`,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error deleting attendance via API:", error);
      console.log("Deleting attendance from localStorage instead");

      // Fallback: Delete from localStorage
      const attendance = JSON.parse(localStorage.getItem("attendance") || "[]");
      const filtered = attendance.filter(
        (att) => att.id !== id && att._id !== id,
      );
      localStorage.setItem("attendance", JSON.stringify(filtered));
      return { success: true };
    }
  },
};

// Client Expense Service (Company Sales)
export const clientExpenseService = {
  // Get all client expenses
  getAllClientExpenses: async () => {
    try {
      const response = await apiService.get(
        "/expenses/client",
        authService.getToken(),
      );
      return response.success && response.data ? response.data : response || [];
    } catch (error) {
      console.error("Error fetching client expenses:", error);
      // Fallback to localStorage
      const cached = localStorage.getItem("clientExpenses");
      return cached ? JSON.parse(cached) : [];
    }
  },

  // Get client expense by ID
  getClientExpenseById: async (id) => {
    try {
      const response = await apiService.get(
        `/expenses/client/${id}`,
        authService.getToken(),
      );
      return response.success && response.data ? response.data : response;
    } catch (error) {
      console.error("Error fetching client expense by ID:", error);
      // Fallback to localStorage
      const expenses = JSON.parse(
        localStorage.getItem("clientExpenses") || "[]",
      );
      return expenses.find((exp) => exp.id === id || exp._id === id);
    }
  },

  // Create new client expense
  createClientExpense: async (data) => {
    try {
      const response = await apiService.post(
        "/expenses/client",
        data,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error creating client expense via API:", error);
      console.log("Saving client expense to localStorage instead");

      // Fallback: Save to localStorage
      const expenses = JSON.parse(
        localStorage.getItem("clientExpenses") || "[]",
      );
      const newExpense = {
        ...data,
        id: Date.now(),
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      expenses.push(newExpense);
      localStorage.setItem("clientExpenses", JSON.stringify(expenses));

      return { success: true, data: newExpense };
    }
  },

  // Update client expense by ID
  updateClientExpenseById: async (id, data) => {
    try {
      const response = await apiService.patch(
        `/expenses/client/${id}`,
        data,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error updating client expense via API:", error);
      console.log("Updating client expense in localStorage instead");

      // Fallback: Update in localStorage
      const expenses = JSON.parse(
        localStorage.getItem("clientExpenses") || "[]",
      );
      const index = expenses.findIndex(
        (exp) => exp.id === id || exp._id === id,
      );
      if (index !== -1) {
        expenses[index] = {
          ...expenses[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("clientExpenses", JSON.stringify(expenses));
        return { success: true, data: expenses[index] };
      }
      throw new Error("Client expense not found");
    }
  },

  // Delete client expense by ID
  deleteClientExpenseById: async (id) => {
    try {
      const response = await apiService.delete(
        `/expenses/client/${id}`,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error deleting client expense via API:", error);
      console.log("Deleting client expense from localStorage instead");

      // Fallback: Delete from localStorage
      const expenses = JSON.parse(
        localStorage.getItem("clientExpenses") || "[]",
      );
      const filtered = expenses.filter(
        (exp) => exp.id !== id && exp._id !== id,
      );
      localStorage.setItem("clientExpenses", JSON.stringify(filtered));
      return { success: true };
    }
  },
};

// Personal Expense Service (Company Expenses)
export const personalExpenseService = {
  // Get all personal expenses
  getAllPersonalExpenses: async () => {
    try {
      const response = await apiService.get(
        "/expenses/personal",
        authService.getToken(),
      );
      return response.success && response.data ? response.data : response || [];
    } catch (error) {
      console.error("Error fetching personal expenses:", error);
      // Fallback to localStorage
      const cached = localStorage.getItem("personalExpenses");
      return cached ? JSON.parse(cached) : [];
    }
  },

  // Get personal expense by ID
  getPersonalExpenseById: async (id) => {
    try {
      const response = await apiService.get(
        `/expenses/personal/${id}`,
        authService.getToken(),
      );
      return response.success && response.data ? response.data : response;
    } catch (error) {
      console.error("Error fetching personal expense by ID:", error);
      // Fallback to localStorage
      const expenses = JSON.parse(
        localStorage.getItem("personalExpenses") || "[]",
      );
      return expenses.find((exp) => exp.id === id || exp._id === id);
    }
  },

  // Create new personal expense
  createPersonalExpense: async (data) => {
    try {
      const response = await apiService.post(
        "/expenses/personal",
        data,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error creating personal expense via API:", error);
      console.log("Saving personal expense to localStorage instead");

      // Fallback: Save to localStorage
      const expenses = JSON.parse(
        localStorage.getItem("personalExpenses") || "[]",
      );
      const newExpense = {
        ...data,
        id: Date.now(),
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      expenses.push(newExpense);
      localStorage.setItem("personalExpenses", JSON.stringify(expenses));

      return { success: true, data: newExpense };
    }
  },

  // Update personal expense by ID
  updatePersonalExpenseById: async (id, data) => {
    try {
      const response = await apiService.patch(
        `/expenses/personal/${id}`,
        data,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error updating personal expense via API:", error);
      console.log("Updating personal expense in localStorage instead");

      // Fallback: Update in localStorage
      const expenses = JSON.parse(
        localStorage.getItem("personalExpenses") || "[]",
      );
      const index = expenses.findIndex(
        (exp) => exp.id === id || exp._id === id,
      );
      if (index !== -1) {
        expenses[index] = {
          ...expenses[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("personalExpenses", JSON.stringify(expenses));
        return { success: true, data: expenses[index] };
      }
      throw new Error("Personal expense not found");
    }
  },

  // Delete personal expense by ID
  deletePersonalExpenseById: async (id) => {
    try {
      const response = await apiService.delete(
        `/expenses/personal/${id}`,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error deleting personal expense via API:", error);
      console.log("Deleting personal expense from localStorage instead");

      // Fallback: Delete from localStorage
      const expenses = JSON.parse(
        localStorage.getItem("personalExpenses") || "[]",
      );
      const filtered = expenses.filter(
        (exp) => exp.id !== id && exp._id !== id,
      );
      localStorage.setItem("personalExpenses", JSON.stringify(filtered));
      return { success: true };
    }
  },
};

// Employee Expense Service (Employee Salary)
export const employeeExpenseService = {
  // Get all employee expenses
  getAllEmployeeExpenses: async () => {
    try {
      const response = await apiService.get(
        "/expenses/employee",
        authService.getToken(),
      );
      return response.success && response.data ? response.data : response || [];
    } catch (error) {
      console.error("Error fetching employee expenses:", error);
      // Fallback to localStorage
      const cached = localStorage.getItem("employeeExpenses");
      return cached ? JSON.parse(cached) : [];
    }
  },

  // Get employee expense by ID
  getEmployeeExpenseById: async (id) => {
    try {
      const response = await apiService.get(
        `/expenses/employee/${id}`,
        authService.getToken(),
      );
      return response.success && response.data ? response.data : response;
    } catch (error) {
      console.error("Error fetching employee expense by ID:", error);
      // Fallback to localStorage
      const expenses = JSON.parse(
        localStorage.getItem("employeeExpenses") || "[]",
      );
      return expenses.find((exp) => exp.id === id || exp._id === id);
    }
  },

  // Create new employee expense
  createEmployeeExpense: async (data) => {
    try {
      const response = await apiService.post(
        "/expenses/employee",
        data,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error creating employee expense via API:", error);
      console.log("Saving employee expense to localStorage instead");

      // Fallback: Save to localStorage
      const expenses = JSON.parse(
        localStorage.getItem("employeeExpenses") || "[]",
      );
      const newExpense = {
        ...data,
        id: Date.now(),
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      expenses.push(newExpense);
      localStorage.setItem("employeeExpenses", JSON.stringify(expenses));

      return { success: true, data: newExpense };
    }
  },

  // Update employee expense by ID
  updateEmployeeExpenseById: async (id, data) => {
    try {
      const response = await apiService.patch(
        `/expenses/employee/${id}`,
        data,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error updating employee expense via API:", error);
      console.log("Updating employee expense in localStorage instead");

      // Fallback: Update in localStorage
      const expenses = JSON.parse(
        localStorage.getItem("employeeExpenses") || "[]",
      );
      const index = expenses.findIndex(
        (exp) => exp.id === id || exp._id === id,
      );
      if (index !== -1) {
        expenses[index] = {
          ...expenses[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("employeeExpenses", JSON.stringify(expenses));
        return { success: true, data: expenses[index] };
      }
      throw new Error("Employee expense not found");
    }
  },

  // Delete employee expense by ID
  deleteEmployeeExpenseById: async (id) => {
    try {
      const response = await apiService.delete(
        `/expenses/employee/${id}`,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error deleting employee expense via API:", error);
      console.log("Deleting employee expense from localStorage instead");

      // Fallback: Delete from localStorage
      const expenses = JSON.parse(
        localStorage.getItem("employeeExpenses") || "[]",
      );
      const filtered = expenses.filter(
        (exp) => exp.id !== id && exp._id !== id,
      );
      localStorage.setItem("employeeExpenses", JSON.stringify(filtered));
      return { success: true };
    }
  },
};

// Project Service
export const projectService = {
  // Get all projects
  getAllProjects: async () => {
    try {
      const response = await apiService.get(
        "/projects",
        authService.getToken(),
      );
      return response.success && response.data ? response.data : response || [];
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Fallback to localStorage
      const cached = localStorage.getItem("projects");
      return cached ? JSON.parse(cached) : [];
    }
  },

  // Get project by ID
  getProjectById: async (id) => {
    try {
      const response = await apiService.get(
        `/projects/${id}`,
        authService.getToken(),
      );
      return response.success && response.data ? response.data : response;
    } catch (error) {
      console.error("Error fetching project by ID:", error);
      // Fallback to localStorage
      const projects = JSON.parse(localStorage.getItem("projects") || "[]");
      return projects.find((proj) => proj.id === id || proj._id === id);
    }
  },

  // Create new project
  createProject: async (data) => {
    try {
      const response = await apiService.post(
        "/projects",
        data,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error creating project via API:", error);
      console.log("Saving project to localStorage instead");

      // Fallback: Save to localStorage
      const projects = JSON.parse(localStorage.getItem("projects") || "[]");
      const newProject = {
        ...data,
        id: Date.now(),
        _id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };

      projects.push(newProject);
      localStorage.setItem("projects", JSON.stringify(projects));

      return { success: true, data: newProject };
    }
  },

  // Update project by ID
  updateProjectById: async (id, data) => {
    try {
      const response = await apiService.patch(
        `/projects/${id}`,
        data,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error updating project via API:", error);
      console.log("Updating project in localStorage instead");

      // Fallback: Update in localStorage
      const projects = JSON.parse(localStorage.getItem("projects") || "[]");
      const index = projects.findIndex(
        (proj) => proj.id === id || proj._id === id,
      );
      if (index !== -1) {
        projects[index] = {
          ...projects[index],
          ...data,
          updatedAt: new Date().toISOString(),
        };
        localStorage.setItem("projects", JSON.stringify(projects));
        return { success: true, data: projects[index] };
      }
      throw new Error("Project not found");
    }
  },

  // Delete project by ID
  deleteProjectById: async (id) => {
    try {
      const response = await apiService.delete(
        `/projects/${id}`,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("Error deleting project via API:", error);
      console.log("Deleting project from localStorage instead");

      // Fallback: Delete from localStorage
      const projects = JSON.parse(localStorage.getItem("projects") || "[]");
      const filtered = projects.filter(
        (proj) => proj.id !== id && proj._id !== id,
      );
      localStorage.setItem("projects", JSON.stringify(filtered));
      return { success: true };
    }
  },
};
