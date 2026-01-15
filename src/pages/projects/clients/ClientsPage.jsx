import { Edit2, MoreVertical, Plus, Trash2, ExternalLink, Mail, Ban, CheckCircle2, Clock, Search, X, ShieldCheck, Layout, User, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Toast from "../../../components/Toast";
import api from "../../../config/api";

export default function ClientsPage() {
    const navigate = useNavigate();
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [toast, setToast] = useState(null);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, client: null });
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        organizationName: "",
        adminEmail: "",
        purchasedPlan: "Basic",
        enabledModules: [],
        onboardingStatus: "Pending",
        adminLoginStatus: "Active"
    });

    const availableModules = ["HRMS", "CRM", "Finance", "Projects", "Inventory", "Payroll"];

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        loadClients();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMenuId !== null) {
                const target = event.target;
                const isMenuButton = target.closest('button[data-menu-button]');
                const isMenuContent = target.closest('[data-menu-content]');

                if (!isMenuButton && !isMenuContent) {
                    setActiveMenuId(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenuId]);

    const loadClients = async () => {
        try {
            setLoading(true);
            // Mock data for now as we don't have the API endpoint yet
            const mockClients = [
                {
                    _id: "1",
                    organizationName: "SUH Tech Solutions",
                    adminEmail: "admin@suhtech.com",
                    purchasedPlan: "Enterprise",
                    enabledModules: "HRMS, CRM, Finance",
                    onboardingStatus: "Completed",
                    adminLoginStatus: "Active",
                    createdDate: "2024-01-10T10:00:00Z"
                },
                {
                    _id: "2",
                    organizationName: "Global Innovators Inc",
                    adminEmail: "contact@globalinno.com",
                    purchasedPlan: "Premium",
                    enabledModules: "HRMS, CRM",
                    onboardingStatus: "In Progress",
                    adminLoginStatus: "Inactive",
                    createdDate: "2024-01-12T14:30:00Z"
                }
            ];
            setClients(mockClients);
        } catch (error) {
            console.error("Error loading clients:", error);
            showToast("Failed to load clients: " + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return "";
        return new Date(date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const handleAction = (action, client) => {
        setActiveMenuId(null);
        if (action === "view") {
            navigate(`/client/${client._id}`);
        } else if (action === "resendEmail") {
            showToast(`Resending email to ${client.adminEmail}`);
        } else if (action === "disable") {
            setConfirmModal({ isOpen: true, client });
        }
    };

    const handleAddClient = (e) => {
        e.preventDefault();
        const newClientEntry = {
            ...formData,
            _id: (clients.length + 1).toString(),
            createdDate: new Date().toISOString(),
            enabledModules: formData.enabledModules.join(", ")
        };

        setClients([newClientEntry, ...clients]);
        setShowAddModal(false);
        setFormData({
            organizationName: "",
            adminEmail: "",
            purchasedPlan: "Basic",
            enabledModules: [],
            onboardingStatus: "Pending",
            adminLoginStatus: "Active"
        });
        showToast("Client added successfully!");
    };

    const toggleModule = (module) => {
        setFormData(prev => ({
            ...prev,
            enabledModules: prev.enabledModules.includes(module)
                ? prev.enabledModules.filter(m => m !== module)
                : [...prev.enabledModules, module]
        }));
    };

    const confirmDelete = async () => {
        const client = confirmModal.client;
        setConfirmModal({ isOpen: false, client: null });
        try {
            // In a real app, you'd call an API here
            // await api.disableOrganization(client._id);
            showToast(`Disabled ${client.organizationName}`, 'warning');
            loadClients(); // Refresh the list
        } catch (error) {
            console.error('Error disabling organization:', error);
            showToast('Failed to disable organization: ' + error.message, 'error');
        }
    };

    const filteredClients = clients.filter(c =>
        c.organizationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.adminEmail.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Responsive Header */}
                <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Organizations</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage your clients and their subscriptions</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200 order-2 sm:order-1">
                            {filteredClients.length} {searchTerm ? 'Found' : 'Total'}
                        </span>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="w-full sm:w-auto inline-flex items-center justify-center px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 cursor-pointer order-1 sm:order-2"
                        >
                            <Plus size={18} className="mr-2" /> Add New Client
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <div className="p-4 md:p-6 border-b border-gray-100 bg-white sticky left-0 z-10">
                        <div className="relative max-w-md w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Search size={18} className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by organization or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 sm:text-sm transition-all duration-200 shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-auto">
                        {loading ? (
                            <div className="h-full flex flex-col items-center justify-center p-8">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                                <p className="text-gray-500 text-sm">Loading clients...</p>
                            </div>
                        ) : filteredClients.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                    <Search size={32} className="text-gray-400" />
                                </div>
                                <p className="text-gray-900 font-semibold mb-1">No results found</p>
                                <p className="text-gray-500 text-sm">
                                    We couldn't find any clients matching "{searchTerm}"
                                </p>
                                <button
                                    onClick={() => setSearchTerm("")}
                                    className="mt-4 text-sm text-blue-600 font-medium hover:underline"
                                >
                                    Clear search
                                </button>
                            </div>
                        ) : (
                            <div className="min-w-full inline-block align-middle">
                                <table className="w-full text-left border-collapse min-w-[1200px]">
                                    <thead className="sticky top-0 z-20 bg-white">
                                        <tr className="bg-gradient-to-r from-gray-50 to-transparent border-b border-gray-200 text-xs text-gray-600 uppercase tracking-wider font-semibold">
                                            <th className="p-4">Organization Name</th>
                                            <th className="p-4">Admin Email</th>
                                            <th className="p-4">Purchased Plan</th>
                                            <th className="p-4">Enabled Modules</th>
                                            <th className="p-4">Onboarding Status</th>
                                            <th className="p-4">Admin Login</th>
                                            <th className="p-4">Created Date</th>
                                            <th className="p-4 text-right pr-6">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredClients.map((c) => (
                                            <tr key={c._id} className="hover:bg-blue-50/30 transition-colors duration-150">
                                                <td className="p-4">
                                                    <span className="font-medium text-sm text-gray-900">
                                                        {c.organizationName}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-blue-600">
                                                    {c.adminEmail}
                                                </td>
                                                <td className="p-4">
                                                    <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-lg border border-purple-100">
                                                        {c.purchasedPlan}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {c.enabledModules}
                                                </td>
                                                <td className="p-4">
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold ${c.onboardingStatus === "Completed"
                                                            ? "bg-green-50 text-green-700 border border-green-200"
                                                            : "bg-amber-50 text-amber-700 border border-amber-200"
                                                            }`}
                                                    >
                                                        {c.onboardingStatus === "Completed" ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                                        {c.onboardingStatus}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <span className={`flex items-center gap-1.5 text-sm ${c.adminLoginStatus === 'Active' ? 'text-green-600' : 'text-gray-400'}`}>
                                                        <div className={`w-1.5 h-1.5 rounded-full ${c.adminLoginStatus === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                                                        {c.adminLoginStatus}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-sm text-gray-600">
                                                    {formatDate(c.createdDate)}
                                                </td>
                                                <td className="p-4 text-right pr-6">
                                                    <div className="relative inline-block text-left">
                                                        <button
                                                            data-menu-button
                                                            onClick={() =>
                                                                setActiveMenuId(
                                                                    activeMenuId === c._id ? null : c._id
                                                                )
                                                            }
                                                            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 cursor-pointer"
                                                        >
                                                            <MoreVertical size={16} />
                                                        </button>
                                                        {activeMenuId === c._id && (
                                                            <div data-menu-content className="origin-top-right absolute right-0 mt-1 w-52 rounded-xl shadow-xl bg-white z-30 border border-gray-100 py-2">
                                                                <button
                                                                    onClick={() => handleAction("view", c)}
                                                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                                                                >
                                                                    <ExternalLink size={16} className="text-blue-500" /> View Client
                                                                </button>
                                                                <button
                                                                    onClick={() => handleAction("resendEmail", c)}
                                                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                                                                >
                                                                    <Mail size={16} className="text-purple-500" /> Resend Email
                                                                </button>
                                                                <div className="my-1 border-t border-gray-50"></div>
                                                                <button
                                                                    onClick={() => handleAction("disable", c)}
                                                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                                                                >
                                                                    <Ban size={16} /> Disable Organization
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/50 flex-shrink-0">
                        <span className="text-sm text-gray-500">
                            Showing <span className="font-semibold text-gray-900">{filteredClients.length > 0 ? 1 : 0}</span> to <span className="font-semibold text-gray-900">{filteredClients.length}</span> of <span className="font-semibold text-gray-900">{filteredClients.length}</span> {searchTerm ? 'results' : 'clients'}
                        </span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
                                Previous
                            </button>
                            <button className="px-3 py-1.5 text-sm font-medium text-gray-400 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
                                Next
                            </button>
                        </div>
                    </div>
                </div>

                {/* Confirmation Modal */}
                {/* Add Client Modal */}
                {showAddModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                        <div className="w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-hidden bg-white">
                            <div className="max-h-[90vh] overflow-y-auto">
                                {/* Header */}
                                <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-white">
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        Add New Client
                                    </h2>
                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="text-gray-500 hover:text-gray-700 cursor-pointer p-1"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <form onSubmit={handleAddClient} className="p-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Organization Name */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Organization Name
                                            </label>
                                            <input
                                                required
                                                type="text"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                                                placeholder="e.g. Acme Corp"
                                                value={formData.organizationName}
                                                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                                            />
                                        </div>

                                        {/* Admin Email */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Admin Email
                                            </label>
                                            <input
                                                required
                                                type="email"
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400"
                                                placeholder="admin@example.com"
                                                value={formData.adminEmail}
                                                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                            />
                                        </div>

                                        {/* Purchased Plan */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Purchased Plan
                                            </label>
                                            <select
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                                                value={formData.purchasedPlan}
                                                onChange={(e) => setFormData({ ...formData, purchasedPlan: e.target.value })}
                                            >
                                                <option value="Basic">Basic Plan</option>
                                                <option value="Premium">Premium Plan</option>
                                                <option value="Enterprise">Enterprise Plan</option>
                                            </select>
                                        </div>

                                        {/* Onboarding Status */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Onboarding Status
                                            </label>
                                            <select
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer focus:ring-1 focus:ring-blue-500 outline-none bg-white"
                                                value={formData.onboardingStatus}
                                                onChange={(e) => setFormData({ ...formData, onboardingStatus: e.target.value })}
                                            >
                                                <option value="Pending">Pending</option>
                                                <option value="In Progress">In Progress</option>
                                                <option value="Completed">Completed</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Modules Checklist */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Enable Modules
                                        </label>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {availableModules.map((module) => (
                                                <button
                                                    key={module}
                                                    type="button"
                                                    onClick={() => toggleModule(module)}
                                                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer ${formData.enabledModules.includes(module)
                                                        ? "bg-blue-600 border-blue-600 text-white shadow-md ring-2 ring-blue-100 scale-[1.02]"
                                                        : "bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:bg-blue-50/30"
                                                        }`}
                                                >
                                                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${formData.enabledModules.includes(module) ? "bg-white border-white scale-110" : "bg-white border-gray-300"
                                                        }`}>
                                                        {formData.enabledModules.includes(module) && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-in zoom-in-0 duration-200"></div>}
                                                    </div>
                                                    {module}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Login Status */}
                                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                        <span className="text-sm font-semibold text-gray-900 block mb-3">Admin Initial Login Status</span>
                                        <div className="flex gap-6">
                                            {["Active", "Inactive"].map((status) => (
                                                <button
                                                    key={status}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, adminLoginStatus: status })}
                                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg border-2 transition-all cursor-pointer group ${formData.adminLoginStatus === status
                                                        ? "bg-white border-blue-600 text-blue-700 shadow-sm"
                                                        : "bg-gray-50 border-transparent text-gray-500 hover:bg-white hover:border-gray-300"
                                                        }`}
                                                >
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.adminLoginStatus === status ? "border-blue-600 bg-blue-600" : "border-gray-400 bg-white group-hover:border-gray-500"
                                                        }`}>
                                                        {formData.adminLoginStatus === status && <div className="w-2 h-2 bg-white rounded-full animate-in zoom-in-0 duration-200"></div>}
                                                    </div>
                                                    <span className="text-sm font-bold">{status}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <button
                                            type="button"
                                            onClick={() => setShowAddModal(false)}
                                            className="px-5 py-2.5 text-sm border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-all active:scale-95"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-6 py-2.5 text-sm bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer transition-all font-bold shadow-lg shadow-blue-200 active:scale-95 flex items-center gap-2"
                                        >
                                            <Plus size={18} /> Create
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                )}

                {/* Confirmation Modal */}
                {confirmModal.isOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6 transform transition-all">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Ban size={28} className="text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Disable Organization</h3>
                                    <p className="text-sm text-gray-500 mt-1">This action will restrict access</p>
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <p className="text-gray-700 text-sm leading-relaxed">
                                    Are you sure you want to disable <span className="font-bold text-gray-900">{confirmModal.client?.organizationName}</span>?
                                    This will prevent all users from this organization from logging into the platform.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setConfirmModal({ isOpen: false, client: null })}
                                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-200 transition-all duration-200 cursor-pointer"
                                >
                                    Disable Now
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Toast Notifications */}
                {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            </div>
        </div>
    );
}
