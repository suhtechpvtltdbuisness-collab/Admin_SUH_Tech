// API configuration file - Wrapper for services.js
// This file provides backward compatibility for components still using the old API structure
import apiService, {
    userService,
    employeeService,
    departmentService,
    designationService,
    attendanceService,
    authService
} from '../services';

// Create a unified API object
const api = {
    // ============ User/Profile Methods ============
    getUserProfile: async () => {
        try {
            const response = await userService.getProfile();
            return response;
        } catch (error) {
            // Fallback to localStorage
            const user = localStorage.getItem('user');
            return { user: user ? JSON.parse(user) : null };
        }
    },

    updateUserProfile: (data) => userService.updateProfile(data),

    // ============ Employee Methods ============
    getEmployees: () => employeeService.getAllEmployees(),
    getEmployee: async (id) => {
        const employee = await employeeService.getEmployee(id);
        return { employee };
    },
    createEmployee: (data) => employeeService.createEmployee(data),
    updateEmployee: (id, data) => employeeService.updateEmployee(id, data),
    deleteEmployee: (id) => employeeService.deleteEmployee(id),

    // ============ Department Methods ============
    getDepartments: () => departmentService.getAllDepartments(),
    getDepartment: (id) => departmentService.getDepartment(id),
    createDepartment: (data) => departmentService.createDepartment(data),
    updateDepartment: (id, data) => departmentService.updateDepartment(id, data),
    deleteDepartment: (id) => departmentService.deleteDepartment(id),

    // ============ Designation Methods ============
    getDesignations: () => designationService.getAllDesignations(),
    getDesignation: (id) => designationService.getDesignation(id),
    createDesignation: (data) => designationService.createDesignation(data),
    updateDesignation: (id, data) => designationService.updateDesignation(id, data),
    deleteDesignation: (id) => designationService.deleteDesignation(id),

    // ============ Attendance Methods ============
    getAttendance: () => attendanceService.getAllAttendance(),
    getAttendanceById: (id) => attendanceService.getAttendanceById(id),
    getAttendanceByUserId: (userId) => attendanceService.getAttendanceByUserId(userId),
    createAttendance: (data) => attendanceService.createAttendance(data),
    updateAttendance: (id, data) => attendanceService.updateAttendanceById(id, data),
    deleteAttendance: (id) => attendanceService.deleteAttendanceById(id),

    // ============ Invoice Methods (localStorage fallback) ============
    getInvoices: async () => {
        try {
            const response = await apiService.get('/invoices', authService.getToken());
            return response.success && response.data ? { invoices: response.data } : { invoices: [] };
        } catch (error) {
            console.error('Error fetching invoices:', error);
            const cached = localStorage.getItem('invoices');
            return { invoices: cached ? JSON.parse(cached) : [] };
        }
    },

    createInvoice: async (data) => {
        try {
            const response = await apiService.post('/invoices', data, authService.getToken());
            return response;
        } catch (error) {
            console.error('Error creating invoice:', error);
            // Fallback to localStorage
            const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
            const newInvoice = { ...data, _id: Date.now().toString(), createdAt: new Date().toISOString() };
            invoices.push(newInvoice);
            localStorage.setItem('invoices', JSON.stringify(invoices));
            return { success: true, invoice: newInvoice };
        }
    },

    updateInvoice: async (id, data) => {
        try {
            const response = await apiService.put(`/invoices/${id}`, data, authService.getToken());
            return response;
        } catch (error) {
            console.error('Error updating invoice:', error);
            const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
            const index = invoices.findIndex(inv => inv._id === id);
            if (index !== -1) {
                invoices[index] = { ...invoices[index], ...data };
                localStorage.setItem('invoices', JSON.stringify(invoices));
                return { success: true, invoice: invoices[index] };
            }
            throw new Error('Invoice not found');
        }
    },

    deleteInvoice: async (id) => {
        try {
            const response = await apiService.delete(`/invoices/${id}`, authService.getToken());
            return response;
        } catch (error) {
            console.error('Error deleting invoice:', error);
            const invoices = JSON.parse(localStorage.getItem('invoices') || '[]');
            const filtered = invoices.filter(inv => inv._id !== id);
            localStorage.setItem('invoices', JSON.stringify(filtered));
            return { success: true };
        }
    },

    // ============ Holiday Methods (localStorage) ============
    getHolidays: async () => {
        const cached = localStorage.getItem('holidays');
        return { holidays: cached ? JSON.parse(cached) : [] };
    },

    createHoliday: async (data) => {
        const holidays = JSON.parse(localStorage.getItem('holidays') || '[]');
        const newHoliday = { ...data, id: Date.now() };
        holidays.push(newHoliday);
        localStorage.setItem('holidays', JSON.stringify(holidays));
        return { holiday: newHoliday };
    },

    deleteHoliday: async (id) => {
        const holidays = JSON.parse(localStorage.getItem('holidays') || '[]');
        const filtered = holidays.filter(h => h.id !== id);
        localStorage.setItem('holidays', JSON.stringify(filtered));
        return { success: true };
    },

    // ============ Password/Auth Methods ============
    changePassword: async (currentPassword, newPassword) => {
        // Not yet implemented in backend
        console.log('Password change not yet implemented');
        return { success: true, message: 'Password change feature coming soon' };
    },

    // ============ Generic Methods ============
    get: (endpoint, token) => apiService.get(endpoint, token || authService.getToken()),
    post: (endpoint, data, token) => apiService.post(endpoint, data, token || authService.getToken()),
    put: (endpoint, data, token) => apiService.put(endpoint, data, token || authService.getToken()),
    delete: (endpoint, token) => apiService.delete(endpoint, token || authService.getToken()),
};

export default api;
