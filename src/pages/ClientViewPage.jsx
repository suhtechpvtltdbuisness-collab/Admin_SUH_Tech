import { ArrowLeft, Building2, Calendar, CheckCircle2, ClipboardList, Clock, ExternalLink, Globe, Layout, Mail, MessageSquare, Phone, ShieldCheck, User, Ban, Key, Send, History, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Toast from "../components/Toast";
import api from "../config/api";

export default function ClientViewPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState(null);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState(null);
    const [showLogsModal, setShowLogsModal] = useState(false);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        loadClient();
    }, [id]);

    const loadClient = async () => {
        try {
            setLoading(true);

            // Mock database to simulate different clients
            const MOCK_CLIENTS = {
                "1": {
                    _id: "1",
                    organizationName: "SUH Tech Solutions",
                    orgId: "ORG-2024-001",
                    logo: "https://ui-avatars.com/api/?name=SUH+Tech&background=0D8ABC&color=fff",
                    website: "www.suhtech.com",
                    contactPhone: "+91 98765 43210",
                    address: "A-123, Tech Park, Sector 62, Noida, UP",
                    createdDate: "2024-01-10T10:00:00Z",
                    subscription: {
                        plan: "Enterprise",
                        billingCycle: "Yearly",
                        startDate: "2024-01-10",
                        expiryDate: "2025-01-09",
                        status: "Active",
                        modules: ["HRMS", "CRM", "Finance", "Projects", "Inventory"]
                    },
                    superAdmin: {
                        name: "Rahul Sharma",
                        email: "admin@suhtech.com",
                        status: "Active",
                        lastLogin: "2024-01-14T09:30:00Z"
                    },
                    onboarding: {
                        status: "Completed",
                        progress: 100,
                        steps: [
                            { name: "Account Creation", status: "completed", date: "2024-01-10" },
                            { name: "Email Verification", status: "completed", date: "2024-01-10" },
                            { name: "Module Configuration", status: "completed", date: "2024-01-11" },
                            { name: "User Import", status: "completed", date: "2024-01-12" },
                            { name: "Training Session", status: "completed", date: "2024-01-13" }
                        ]
                    }
                },
                "2": {
                    _id: "2",
                    organizationName: "Global Innovators Inc",
                    orgId: "ORG-2024-002",
                    logo: "https://ui-avatars.com/api/?name=Global+Inno&background=D946EF&color=fff",
                    website: "www.globalinno.com",
                    contactPhone: "+1 555-0123",
                    address: "456 Innovation Drive, Silicon Valley, CA",
                    createdDate: "2024-01-12T14:30:00Z",
                    subscription: {
                        plan: "Premium",
                        billingCycle: "Monthly",
                        startDate: "2024-01-12",
                        expiryDate: "2024-02-11",
                        status: "Active",
                        modules: ["HRMS", "CRM", "Projects"]
                    },
                    superAdmin: {
                        name: "Sarah Johnson",
                        email: "contact@globalinno.com",
                        status: "Inactive",
                        lastLogin: "2024-01-13T16:45:00Z"
                    },
                    onboarding: {
                        status: "In Progress",
                        progress: 60,
                        steps: [
                            { name: "Account Creation", status: "completed", date: "2024-01-12" },
                            { name: "Email Verification", status: "completed", date: "2024-01-12" },
                            { name: "Module Configuration", status: "completed", date: "2024-01-13" },
                            { name: "User Import", status: "current", date: null },
                            { name: "Training Session", status: "pending", date: null }
                        ]
                    }
                }
            };

            // Simulating API delay
            setTimeout(() => {
                const foundClient = MOCK_CLIENTS[id] || MOCK_CLIENTS["1"];
                setClient(foundClient);
                setLoading(false);
            }, 500);

        } catch (error) {
            console.error("Error loading client:", error);
            showToast("Failed to load client: " + error.message, 'error');
            setLoading(false);
        }
    };

    const handleAction = (action) => {
        if (action === 'resendEmail') {
            showToast("Welcome email resent to " + client.superAdmin.email);
        } else if (action === 'resetPassword') {
            showToast("Password reset link sent to admin email");
        } else if (action === 'toggleStatus') {
            const newStatus = client.subscription.status === 'Active' ? 'Disabled' : 'Active';
            setClient({
                ...client,
                subscription: { ...client.subscription, status: newStatus }
            });
            showToast(`Organization ${newStatus === 'Active' ? 'Enabled' : 'Disabled'} successfully`, newStatus === 'Active' ? 'success' : 'warning');
        }
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 font-medium">Loading client details...</p>
            </div>
        </div>
    );

    if (!client) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-gray-600 mb-4">Client not found</p>
                <Link to="/clients" className="text-blue-600 hover:underline">Back to Clients</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <Link to="/clients" className="inline-flex items-center text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4 font-medium group">
                            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Clients List
                        </Link>
                        <div className="flex items-center gap-4">
                            <h1 className="text-3xl font-bold text-gray-900">{client.organizationName}</h1>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${client.subscription.status === 'Active'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                {client.subscription.status}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Organization Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex flex-col items-center text-center mb-6">
                                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center mb-4 border border-gray-100 overflow-hidden">
                                    <img src={client.logo} alt={client.organizationName} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900">Organization Info</h3>
                                <p className="text-sm text-gray-500 font-medium">ID: {client.orgId}</p>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                                    <Globe size={18} className="text-blue-500" />
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Website</p>
                                        <a href={`https://${client.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-700 hover:text-blue-600 break-all flex items-center gap-1">
                                            {client.website} <ExternalLink size={12} />
                                        </a>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                                    <Phone size={18} className="text-purple-500" />
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Contact Phone</p>
                                        <p className="text-sm font-medium text-gray-700">{client.contactPhone}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50/50">
                                    <Building2 size={18} className="text-emerald-500 mt-0.5" />
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Address</p>
                                        <p className="text-sm font-medium text-gray-700 leading-relaxed">{client.address}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                                    <Calendar size={18} className="text-amber-500" />
                                    <div>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Client Since</p>
                                        <p className="text-sm font-medium text-gray-700">
                                            {new Date(client.createdDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Actions Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <ShieldCheck size={20} className="text-blue-600" />
                                Admin Actions
                            </h3>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    onClick={() => handleAction('resendEmail')}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Send size={18} />
                                        <span className="text-sm font-bold">Resend Welcome Email</span>
                                    </div>
                                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                                <button
                                    onClick={() => handleAction('resetPassword')}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Key size={18} />
                                        <span className="text-sm font-bold">Reset Admin Password</span>
                                    </div>
                                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                                <button
                                    onClick={() => handleAction('toggleStatus')}
                                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors group ${client.subscription.status === 'Active'
                                        ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                        : 'bg-green-50 text-green-700 hover:bg-green-100'
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Ban size={18} />
                                        <span className="text-sm font-bold">{client.subscription.status === 'Active' ? 'Disable Organization' : 'Enable Organization'}</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setShowLogsModal(true)}
                                    className="flex items-center justify-between px-4 py-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <History size={18} />
                                        <span className="text-sm font-bold">View Audit Logs</span>
                                    </div>
                                    <ExternalLink size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Columns */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Subscription & Super Admin Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Subscription Plan & Modules */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Layout size={20} className="text-blue-600" />
                                        Subscription Plan
                                    </h3>
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-100">
                                        {client.subscription.plan}
                                    </span>
                                </div>
                                <div className="space-y-4 flex-1">
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50 text-sm">
                                        <span className="text-gray-500">Billing Cycle</span>
                                        <span className="font-bold text-gray-900">{client.subscription.billingCycle}</span>
                                    </div>
                                    <div className="flex justify-between items-center py-2 border-b border-gray-50 text-sm">
                                        <span className="text-gray-500">Next Expiry</span>
                                        <span className="font-bold text-red-600">{new Date(client.subscription.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div className="pt-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                            Enabled Modules ({client.subscription.modules.length})
                                        </h4>
                                        <div className="flex flex-wrap gap-2">
                                            {client.subscription.modules.map((mod, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-gray-50 text-gray-700 text-xs font-bold rounded-lg border border-gray-100 flex items-center gap-1.5 transition-all hover:bg-white hover:border-blue-200">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                                    {mod}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Super Admin Info */}
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <User size={20} className="text-purple-600" />
                                    Super Admin Info
                                </h3>
                                <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-gradient-to-br from-purple-50/50 to-blue-50/50 border border-purple-50">
                                    <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center text-purple-600 font-bold text-xl border-2 border-purple-100 shadow-sm">
                                        {client.superAdmin.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{client.superAdmin.name}</h4>
                                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-0.5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                            {client.superAdmin.status} Admin
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                                        <Mail size={18} className="text-gray-400" />
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Super Admin Email</p>
                                            <p className="text-sm font-medium text-gray-700 truncate">{client.superAdmin.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50">
                                        <Clock size={18} className="text-gray-400" />
                                        <div>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Last Activity</p>
                                            <p className="text-sm font-medium text-gray-700">
                                                {new Date(client.superAdmin.lastLogin).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <button className="mt-6 w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 shadow-sm">
                                    <MessageSquare size={16} /> Contact Admin
                                </button>
                            </div>
                        </div>

                        {/* Onboarding Tracker */}
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-md transition-shadow relative overflow-hidden group">
                            {/* Decorative background element */}
                            <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-50 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                            <div className="p-2 bg-emerald-50 rounded-lg">
                                                <ClipboardList size={22} className="text-emerald-600" />
                                            </div>
                                            Onboarding Tracker
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">Status: <span className="text-emerald-600 font-bold">{client.onboarding.status}</span></p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-2 rounded-2xl border border-gray-100 shadow-sm">
                                        <div className="text-right">
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Progress</p>
                                            <div className="flex items-center gap-2">
                                                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-1000 ease-out"
                                                        style={{ width: `${client.onboarding.progress}%` }}
                                                    ></div>
                                                </div>
                                                <span className="text-lg font-black text-emerald-700">{client.onboarding.progress}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10">
                                    {client.onboarding.steps.map((step, idx) => (
                                        <div key={idx} className="relative">
                                            {/* Connector line for horizontal view on desktop */}
                                            {idx < client.onboarding.steps.length - 1 && (
                                                <div className="hidden md:block absolute top-4 left-[50%] right-[-50%] h-0.5 bg-gray-100 z-0">
                                                    <div
                                                        className={`h-full bg-emerald-500 transition-all duration-500 ${step.status === 'completed' ? 'w-full' : 'w-0'}`}
                                                    ></div>
                                                </div>
                                            )}

                                            <div className="flex flex-col items-center relative z-10">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${step.status === 'completed'
                                                        ? 'bg-emerald-500 border-emerald-500 shadow-lg shadow-emerald-100'
                                                        : step.status === 'current'
                                                            ? 'bg-white border-blue-500 shadow-lg shadow-blue-100 animate-pulse'
                                                            : 'bg-white border-gray-200'
                                                    }`}>
                                                    {step.status === 'completed' ? (
                                                        <CheckCircle2 size={18} className="text-white" />
                                                    ) : step.status === 'current' ? (
                                                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                                    ) : (
                                                        <span className="text-xs font-bold text-gray-400">{idx + 1}</span>
                                                    )}
                                                </div>
                                                <div className="mt-3 text-center">
                                                    <p className={`text-xs font-bold transition-colors ${step.status === 'completed' ? 'text-emerald-600' :
                                                            step.status === 'current' ? 'text-blue-600' : 'text-gray-400'
                                                        }`}>
                                                        {step.name}
                                                    </p>
                                                    {step.date && (
                                                        <p className="text-[10px] text-gray-400 mt-0.5 font-medium">{step.date}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6">
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        Checklist View
                                    </h4>
                                    <div className="space-y-4">
                                        {client.onboarding.steps.map((step, idx) => (
                                            <div
                                                key={idx}
                                                className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${step.status === 'current'
                                                        ? 'bg-blue-50/50 border-blue-100 shadow-sm scale-[1.02] ring-1 ring-blue-200 ring-offset-2'
                                                        : 'bg-white border-gray-50'
                                                    }`}
                                            >
                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-colors ${step.status === 'completed'
                                                        ? 'bg-emerald-500 border-emerald-500'
                                                        : step.status === 'current'
                                                            ? 'border-blue-500'
                                                            : 'border-gray-200'
                                                    }`}>
                                                    {step.status === 'completed' && <CheckCircle2 size={14} className="text-white" />}
                                                    {step.status === 'current' && <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></div>}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex justify-between items-center">
                                                        <span className={`text-sm font-bold ${step.status === 'completed' ? 'text-gray-500 line-through' :
                                                                step.status === 'current' ? 'text-blue-700' : 'text-gray-900'
                                                            }`}>
                                                            {step.name}
                                                        </span>
                                                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${step.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                step.status === 'current' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                                    'bg-gray-50 text-gray-400 border-gray-100'
                                                            }`}>
                                                            {step.status === 'completed' ? 'Done' : step.status === 'current' ? 'Action Required' : 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Read-only Logs Modal */}
            {showLogsModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden transform scale-100 transition-all">
                        <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Organization Audit Logs</h3>
                                <p className="text-sm text-gray-500">Read-only view of recent administrative actions</p>
                            </div>
                            <button onClick={() => setShowLogsModal(false)} className="p-2.5 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-all">
                                <X size={20} />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {[
                                { action: "Subscription Updated", user: "Admin (System)", time: "2 hours ago", details: "Plan changed from Basic to Enterprise" },
                                { action: "Module Enabled", user: " rahul@suhtech.com", time: "5 hours ago", details: "Inventory module activated for the organization" },
                                { action: "Password Reset", user: "Admin (System)", time: "1 day ago", details: "Admin password reset link requested" },
                                { action: "Organization Login", user: "rahul@suhtech.com", time: "2 days ago", details: "Successful login from IP: 192.168.1.45" },
                                { action: "Welcome Email Sent", user: "Admin (System)", time: "4 days ago", details: "Initial onboarding email delivered successfully" }
                            ].map((log, i) => (
                                <div key={i} className="flex gap-4 pb-6 border-b border-gray-50 last:border-0 last:pb-0">
                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0 border border-blue-100">
                                        <History size={18} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-gray-900">{log.action}</span>
                                            <span className="text-[10px] text-gray-400 font-bold px-2 py-0.5 bg-gray-100 rounded-full">{log.time}</span>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1.5 leading-relaxed">{log.details}</p>
                                        <div className="text-[10px] text-gray-400">Performed by: <span className="font-bold text-gray-700">{log.user}</span></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button onClick={() => setShowLogsModal(false)} className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-sm cursor-pointer">
                                Close View
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
