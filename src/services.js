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
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
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
  getProfile: async () => {
    const user = authService.getUser();
    const id = user?.id || user?._id;
    if (!id) throw new Error("User ID not found");
    const response = await apiService.get(`/employee/${id}`, authService.getToken());
    // Map response.data to response.user for compatibility with SettingsPage
    if (response.success && response.data) {
      if (response.data.phoneNumber) {
        response.data.phone = response.data.phoneNumber;
      }
      return { ...response, user: response.data };
    }
    return response;
  },
  updateProfile: async (data) => {
    const user = authService.getUser();
    const id = user?.id || user?._id;
    if (!id) throw new Error("User ID not found");

    // Map phone to phoneNumber for API
    const payload = { ...data };
    if (payload.phone) {
      payload.phoneNumber = payload.phone;
    }

    const response = await apiService.put(
      `/employee/${id}`,
      payload,
      authService.getToken()
    );
    // Map response.data to response.user for compatibility
    if (response.success && response.data) {
      if (response.data.phoneNumber) {
        response.data.phone = response.data.phoneNumber;
      }
      return { ...response, user: response.data };
    }
    return response;
  },
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

// ─────────────────────────────────────────────────────────────────────────────
// Employee Salary / Expense Service
// API base: /expenses/employee
//
// Endpoints:
//   POST   /expenses/employee          → create salary entry
//   PATCH  /expenses/employee/:id      → update salary entry
//   DELETE /expenses/employee/:id      → delete salary entry
//   GET    /expenses/employee          → get all salary entries
//   GET    /expenses/employee/:id      → get single salary entry by record ID
// ─────────────────────────────────────────────────────────────────────────────
export const expenseService = {

  /**
   * Build the canonical payload that matches both POST and PATCH bodies exactly.
   * All fields are typed correctly:
   *   userId     → number
   *   amount     → number
   *   department → number (department ID)
   *   phone      → string
   *   ... rest   → string / number as per API spec
   */
  _buildPayload({
    userId,
    amount,
    phone,
    status,
    role,
    department,
    paymentMode,
    basicSalary,
    hra,
    conveyance,
    specialAllowance,
    pfDeductions,
    taxDeductions,
    date,
  }) {
    return {
      userId: Number(userId),
      amount: Number(amount),
      phone: String(phone || "").trim(),
      status: String(status || "pending").trim().toLowerCase(),   // backend: pending|paid|processing
      role: String(role || "").trim(),
      department: Number(department),   // must be numeric dept ID
      paymentMode: String(paymentMode || "cash").trim().toLowerCase(),   // backend: cash|bank transfer|cheque
      basicSalary: Number(basicSalary) || 0,
      hra: Number(hra) || 0,
      conveyance: Number(conveyance) || 0,
      specialAllowance: Number(specialAllowance) || 0,
      pfDeductions: Number(pfDeductions) || 0,
      taxDeductions: Number(taxDeductions) || 0,
      date: String(date || ""),
    };
  },

  // ── GET all salary entries ─────────────────────────────────────────────────
  getEmployeeSalaries: async () => {
    try {
      const response = await apiService.get(
        "/expenses/employee",
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("expenseService.getEmployeeSalaries:", error);
      throw error;
    }
  },

  // ── GET single salary entry by record ID ──────────────────────────────────
  getEmployeeSalaryById: async (id) => {
    try {
      const response = await apiService.get(
        `/expenses/employee/${id}`,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("expenseService.getEmployeeSalaryById:", error);
      throw error;
    }
  },

  // ── POST – create new salary entry ────────────────────────────────────────
  addEmployeeSalary: async (data) => {
    try {
      const payload = expenseService._buildPayload(data);
      console.log("[expenseService] POST /expenses/employee →", payload);
      const response = await apiService.post(
        "/expenses/employee",
        payload,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("expenseService.addEmployeeSalary:", error);
      throw error;
    }
  },

  // ── PATCH – update existing salary entry ──────────────────────────────────
  updateEmployeeSalary: async (id, data) => {
    try {
      const payload = expenseService._buildPayload(data);
      console.log(`[expenseService] PATCH /expenses/employee/${id} →`, payload);
      const response = await apiService.patch(
        `/expenses/employee/${id}`,
        payload,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("expenseService.updateEmployeeSalary:", error);
      throw error;
    }
  },

  // ── DELETE – remove salary entry ──────────────────────────────────────────
  deleteEmployeeSalary: async (id) => {
    try {
      console.log(`[expenseService] DELETE /expenses/employee/${id}`);
      const response = await apiService.delete(
        `/expenses/employee/${id}`,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("expenseService.deleteEmployeeSalary:", error);
      throw error;
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Client Sale Service
// API base: /expenses/client
//
// Endpoints:
//   POST   /expenses/client          → create client sale
//   PATCH  /expenses/client/:id      → update client sale
//   DELETE /expenses/client/:id      → delete client sale
//   GET    /expenses/client          → get all client sales
//   GET    /expenses/client/:id      → get single client sale by ID
// ─────────────────────────────────────────────────────────────────────────────
export const clientSaleService = {

  /**
   * Build canonical payload matching POST and PATCH body exactly.
   * POST fields: clientName, contactPerson, email, phone, projectTitle,
   *              amount, date, status, link, paymentMethod
   * PATCH fields: clientName, projectName, amount, email, phone,
   *               status, paymentMode, date
   * We send a superset so both POST and PATCH receive what they need.
   */
  _buildPayload({
    clientName,
    contactPerson,
    email,
    phone,
    projectTitle,
    projectName,
    amount,
    date,
    status,
    link,
    paymentMethod,
    paymentMode,
  }) {
    return {
      clientName: String(clientName || "").trim(),
      contactPerson: String(contactPerson || "").trim(),
      email: String(email || "").trim(),
      phone: String(phone || "").trim(),
      projectTitle: String(projectTitle || projectName || "").trim(),
      projectName: String(projectName || projectTitle || "").trim(),
      amount: Number(amount) || 0,
      date: String(date || ""),
      status: String(status || "pending").trim().toLowerCase(),  // backend: pending|paid|processing
      link: String(link || "").trim(),
      paymentMethod: String(paymentMethod || paymentMode || "Bank Transfer").trim(),
      paymentMode: String(paymentMode || paymentMethod || "Bank Transfer").trim().toLowerCase(),
    };
  },

  // ── GET all client sales ───────────────────────────────────────────────────
  getAll: async () => {
    try {
      const response = await apiService.get(
        "/expenses/client",
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("clientSaleService.getAll:", error);
      throw error;
    }
  },

  // ── GET single client sale by ID ──────────────────────────────────────────
  getById: async (id) => {
    try {
      const response = await apiService.get(
        `/expenses/client/${id}`,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("clientSaleService.getById:", error);
      throw error;
    }
  },

  // ── POST – create new client sale ─────────────────────────────────────────
  create: async (data) => {
    try {
      const payload = clientSaleService._buildPayload(data);
      console.log("[clientSaleService] POST /expenses/client →", payload);
      const response = await apiService.post(
        "/expenses/client",
        payload,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("clientSaleService.create:", error);
      throw error;
    }
  },

  // ── PATCH – update existing client sale ───────────────────────────────────
  update: async (id, data) => {
    try {
      const payload = clientSaleService._buildPayload(data);
      console.log(`[clientSaleService] PATCH /expenses/client/${id} →`, payload);
      const response = await apiService.patch(
        `/expenses/client/${id}`,
        payload,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("clientSaleService.update:", error);
      throw error;
    }
  },

  // ── DELETE – remove client sale ───────────────────────────────────────────
  delete: async (id) => {
    try {
      console.log(`[clientSaleService] DELETE /expenses/client/${id}`);
      const response = await apiService.delete(
        `/expenses/client/${id}`,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("clientSaleService.delete:", error);
      throw error;
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Personal Expense Service
// API base: /expenses/personal
//
// Endpoints:
//   POST   /expenses/personal          → create personal expense
//   PATCH  /expenses/personal/:id      → update personal expense
//   DELETE /expenses/personal/:id      → delete personal expense
//   GET    /expenses/personal          → get all personal expenses
//   GET    /expenses/personal/:id      → get single personal expense by ID
//
// Payload fields:
//   expenseName, amount, status, category, paymentMode, date
// ─────────────────────────────────────────────────────────────────────────────
export const personalExpenseService = {

  /**
   * Build canonical payload for both POST and PATCH.
   * Maps UI field names → API field names.
   * Backend enum: status → pending | paid | processing
   *               paymentMode → cash | bank transfer | cheque
   */
  _buildPayload({ expenseName, title, amount, status, category, paymentMode, paymentMethod, date }) {
    return {
      expenseName: String(expenseName || title || "").trim(),
      amount: Number(amount) || 0,
      status: String(status || "pending").trim().toLowerCase(),  // backend: pending|paid|processing
      category: String(category || "").trim(),
      paymentMode: String(paymentMode || paymentMethod || "cash").trim().toLowerCase(), // backend: cash|bank transfer|cheque
      date: String(date || ""),
    };
  },

  // ── GET all personal expenses ─────────────────────────────────────────────
  getAll: async () => {
    try {
      const response = await apiService.get(
        "/expenses/personal",
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("personalExpenseService.getAll:", error);
      throw error;
    }
  },

  // ── GET single personal expense by ID ────────────────────────────────────
  getById: async (id) => {
    try {
      const response = await apiService.get(
        `/expenses/personal/${id}`,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("personalExpenseService.getById:", error);
      throw error;
    }
  },

  // ── POST – create new personal expense ───────────────────────────────────
  create: async (data) => {
    try {
      const payload = personalExpenseService._buildPayload(data);
      console.log("[personalExpenseService] POST /expenses/personal →", payload);
      const response = await apiService.post(
        "/expenses/personal",
        payload,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("personalExpenseService.create:", error);
      throw error;
    }
  },

  // ── PATCH – update existing personal expense ──────────────────────────────
  update: async (id, data) => {
    try {
      const payload = personalExpenseService._buildPayload(data);
      console.log(`[personalExpenseService] PATCH /expenses/personal/${id} →`, payload);
      const response = await apiService.patch(
        `/expenses/personal/${id}`,
        payload,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("personalExpenseService.update:", error);
      throw error;
    }
  },

  // ── DELETE – remove personal expense ─────────────────────────────────────
  delete: async (id) => {
    try {
      console.log(`[personalExpenseService] DELETE /expenses/personal/${id}`);
      const response = await apiService.delete(
        `/expenses/personal/${id}`,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("personalExpenseService.delete:", error);
      throw error;
    }
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Project Service
// API base: /projects
//
// Endpoints:
//   POST   /projects        → create project
//   PATCH  /projects/:id    → update project
//   DELETE /projects/:id    → delete project
//   GET    /projects        → get all projects
//   GET    /projects/:id    → get single project by ID
//
// Payload fields:
//   projectName, clientName, startDate, endDate, status,
//   description, phone, email, budget, technologyStack (array),
//   servicesType → "web development" | "mobile app development" |
//                  "Devops" | "custom software" | "maintenance" |
//                  "consulting" | "other"
// ─────────────────────────────────────────────────────────────────────────────
export const projectService = {

  /**
   * Build canonical payload for POST and PATCH.
   * Handles field name differences between the UI form and the API.
   */
  _buildPayload({
    projectName,
    clientName,
    email, clientEmail,
    phone, clientPhone,
    description,
    servicesType, serviceType,
    startDate,
    endDate,
    status,
    budget,
    technologyStack, technologies,
  }) {
    // Resolve technologyStack — accept array or comma-separated string
    let techArray = [];
    if (Array.isArray(technologyStack)) {
      techArray = technologyStack;
    } else if (Array.isArray(technologies)) {
      techArray = technologies;
    } else if (typeof technologies === "string" && technologies.trim()) {
      techArray = technologies.split(",").map((t) => t.trim()).filter(Boolean);
    } else if (typeof technologyStack === "string" && technologyStack.trim()) {
      techArray = technologyStack.split(",").map((t) => t.trim()).filter(Boolean);
    }

    return {
      projectName: String(projectName || "").trim(),
      clientName: String(clientName || "").trim(),
      email: String(email || clientEmail || "").trim(),
      phone: String(phone || clientPhone || "").trim(),
      description: String(description || "").trim(),
      servicesType: String(servicesType || serviceType || "web development").trim(),
      startDate: String(startDate || ""),
      endDate: String(endDate || ""),
      status: String(status || "in progress").trim(),
      budget: Number(budget) || 0,
      technologyStack: techArray,
    };
  },

  // ── GET all projects ──────────────────────────────────────────────────────
  getAll: async () => {
    try {
      const response = await apiService.get(
        "/projects",
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("projectService.getAll:", error);
      throw error;
    }
  },

  // ── GET single project by ID ──────────────────────────────────────────────
  getById: async (id) => {
    try {
      const response = await apiService.get(
        `/projects/${id}`,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("projectService.getById:", error);
      throw error;
    }
  },

  // ── POST – create new project ─────────────────────────────────────────────
  create: async (data) => {
    try {
      const payload = projectService._buildPayload(data);
      console.log("[projectService] POST /projects →", payload);
      const response = await apiService.post(
        "/projects",
        payload,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("projectService.create:", error);
      throw error;
    }
  },

  // ── PUT – update existing project ────────────────────────────────────────
  update: async (id, data) => {
    try {
      const payload = projectService._buildPayload(data);
      console.log(`[projectService] PUT /projects/${id} →`, payload);
      const response = await apiService.put(
        `/projects/${id}`,
        payload,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("projectService.update:", error);
      throw error;
    }
  },

  // ── DELETE – remove project ───────────────────────────────────────────────
  delete: async (id) => {
    try {
      console.log(`[projectService] DELETE /projects/${id}`);
      const response = await apiService.delete(
        `/projects/${id}`,
        authService.getToken(),
      );
      return response;
    } catch (error) {
      console.error("projectService.delete:", error);
      throw error;
    }
  },
};

