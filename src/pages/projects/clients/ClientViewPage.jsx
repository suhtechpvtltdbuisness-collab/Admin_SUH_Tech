import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Globe,
  Layout,
  Mail,
  MoreVertical,
  Package,
  Settings,
  ShieldCheck,
  User,
  Users,
  Search,
  X,
  Edit,
  Trash2,
  Key,
  RefreshCw,
  AlertCircle,
  Ban,
  History,
  Shield,
  Zap,
  FileText,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Toast from "../../../components/Toast";
import { authService, employeeService } from "../../../services";

const CLIENTS_DB = {
  1: {
    organizationName: "SUH Tech Solutions",
    adminEmail: "admin@suhtech.com",
    purchasedPlan: "Enterprise",
    enabledModules: ["HRMS", "CRM", "Finance", "Projects"],
    onboardingStatus: "Completed",
    adminLoginStatus: "Active",
    createdDate: "2024-01-10T10:00:00Z",
    stats: {
      totalUsers: 156,
      activeProjects: 12,
      storageUsed: "45GB",
      lastActivity: "2 mins ago",
    },
  },
  2: {
    organizationName: "Global Innovators Inc",
    adminEmail: "contact@globalinno.com",
    purchasedPlan: "Premium",
    enabledModules: ["HRMS", "CRM"],
    onboardingStatus: "In Progress",
    adminLoginStatus: "Inactive",
    createdDate: "2024-01-12T14:30:00Z",
    stats: {
      totalUsers: 42,
      activeProjects: 4,
      storageUsed: "12GB",
      lastActivity: "1 day ago",
    },
  },
};

export default function ClientViewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    // Simulate API fetch based on ID
    setLoading(true);
    setTimeout(() => {
      const data = CLIENTS_DB[id];
      if (data) {
        setClient(data);
      } else {
        // Handle case where client is not found
        console.error("Client not found");
      }
      setLoading(false);
    }, 500);
  }, [id]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium animate-pulse">
            Loading organization data...
          </p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Organization Not Found
          </h2>
          <p className="text-gray-500 mb-6">
            The organization you are looking for does not exist or has been
            removed.
          </p>
          <button
            onClick={() => navigate("/clients")}
            className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Organizations
          </button>
        </div>
      </div>
    );
  }

  const onboardingSteps = [
    {
      id: 1,
      title: "Company Profile",
      status: "Completed",
      date: "Jan 10, 2024",
      icon: <Building2 size={16} />,
    },
    {
      id: 2,
      title: "Admin Configuration",
      status: "Completed",
      date: "Jan 11, 2024",
      icon: <Shield size={16} />,
    },
    {
      id: 3,
      title: "Module Setup",
      status:
        client.onboardingStatus === "Completed" ? "Completed" : "In Progress",
      date: "Jan 12, 2024",
      icon: <Package size={16} />,
    },
    {
      id: 4,
      title: "Data Import",
      status: client.onboardingStatus === "Completed" ? "Completed" : "Pending",
      date: "-",
      icon: <FileText size={16} />,
    },
    {
      id: 5,
      title: "Final Review",
      status: client.onboardingStatus === "Completed" ? "Completed" : "Pending",
      date: "-",
      icon: <Zap size={16} />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-30">
        <div className="max-w-[1600px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => navigate("/clients")}
              className="p-2 hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="h-6 w-px bg-gray-100 hidden sm:block"></div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-bold text-gray-900 truncate">
                  {client.organizationName}
                </h1>
                <span
                  className={`hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                    client.adminLoginStatus === "Active"
                      ? "bg-green-50 text-green-700 border border-green-100"
                      : "bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  {client.adminLoginStatus}
                </span>
              </div>
              <p className="text-[11px] md:text-xs text-gray-500 truncate">
                {client.adminEmail}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <button className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-50 rounded-xl transition-all border border-transparent hover:border-gray-200 cursor-pointer">
              <Edit size={16} /> Edit
            </button>
            <button className="flex items-center gap-2 px-3 sm:px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 cursor-pointer">
              <RefreshCw size={16} className="hidden sm:block" /> Actions
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-10">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
          {/* Main Content Area */}
          <div className="flex-1 space-y-6 lg:space-y-10 min-w-0">
            {/* Header Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  label: "Total Users",
                  value: client.stats.totalUsers,
                  icon: <Users className="text-blue-600" />,
                  trend: "+12%",
                },
                {
                  label: "Active Projects",
                  value: client.stats.activeProjects,
                  icon: <Layout className="text-purple-600" />,
                  trend: "Stable",
                },
                {
                  label: "Storage Used",
                  value: client.stats.storageUsed,
                  icon: <Globe className="text-emerald-600" />,
                  trend: "60%",
                },
                {
                  label: "Last Activity",
                  value: client.stats.lastActivity,
                  icon: <Clock className="text-amber-600" />,
                  trend: "Real-time",
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-gray-50 rounded-2xl group-hover:scale-110 transition-transform">
                      {stat.icon}
                    </div>
                    <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                      {stat.trend}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm font-medium">
                    {stat.label}
                  </p>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </h3>
                </div>
              ))}
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-50 flex items-center justify-between bg-gradient-to-r from-gray-50/50 to-transparent">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck size={20} className="text-blue-600" />
                  Administrative Controls
                </h2>
              </div>
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all text-left group cursor-pointer">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">
                        Resend Welcome Email
                      </p>
                      <p className="text-xs text-gray-500">
                        Send login credentials to admin
                      </p>
                    </div>
                  </button>

                  <button className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all text-left group cursor-pointer">
                    <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Key size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">
                        Reset Admin Password
                      </p>
                      <p className="text-xs text-gray-500">
                        Generate a recovery link
                      </p>
                    </div>
                  </button>

                  <button className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-red-200 hover:bg-red-50/30 transition-all text-left group cursor-pointer">
                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Ban size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">
                        Enable/Disable Organization
                      </p>
                      <p className="text-xs text-gray-500">
                        Restrict or grant platform access
                      </p>
                    </div>
                  </button>

                  <button className="flex items-center gap-4 p-4 rounded-2xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/30 transition-all text-left group cursor-pointer">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <History size={18} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-gray-900">
                        Audit Logs
                      </p>
                      <p className="text-xs text-gray-500">
                        View detailed activity history
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Modules Grid */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 md:p-6 border-b border-gray-50 flex items-center justify-between">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <Package size={20} className="text-blue-600" />
                  Enabled Modules
                </h2>
                <button className="text-sm text-blue-600 font-bold hover:underline cursor-pointer">
                  Manage Modules
                </button>
              </div>
              <div className="p-4 md:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {client.enabledModules.map((module) => (
                    <div
                      key={module}
                      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 group hover:bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center text-blue-600 font-bold">
                          {module.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-gray-900">
                            {module} Module
                          </p>
                          <p className="text-[11px] text-gray-500 font-medium">
                            Subscription: {client.purchasedPlan}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        <span className="text-xs font-bold text-green-600">
                          Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="w-full lg:w-96 space-y-6 lg:space-y-10">
            {/* Organization Metadata */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-6">
                <h2 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Globe size={20} className="text-blue-600" />
                  Organization Details
                </h2>
                <div className="space-y-6">
                  {[
                    {
                      label: "Plan Type",
                      value: client.purchasedPlan,
                      icon: (
                        <CheckCircle2 size={16} className="text-blue-500" />
                      ),
                    },
                    {
                      label: "Admin Account",
                      value: client.adminEmail,
                      icon: <Mail size={16} className="text-blue-500" />,
                    },
                    {
                      label: "Joined On",
                      value: formatDate(client.createdDate),
                      icon: <Calendar size={16} className="text-blue-500" />,
                    },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-4">
                      <div className="mt-1 p-2 bg-blue-50 rounded-lg text-blue-600">
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                          {item.label}
                        </p>
                        <p className="text-sm font-bold text-gray-900 break-all">
                          {item.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Comprehensive Onboarding Tracker */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 md:p-6 border-b border-gray-50 bg-gradient-to-r from-blue-50/50 to-transparent">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm md:text-base">
                    <Zap size={18} className="text-blue-600" />
                    Onboarding Tracker
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                      client.onboardingStatus === "Completed"
                        ? "bg-green-50 text-green-700"
                        : "bg-blue-50 text-blue-700"
                    }`}
                  >
                    {client.onboardingStatus}
                  </span>
                </div>
                {/* Visual Progress Bar */}
                <div className="mt-4">
                  <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-2">
                    <span>Progress</span>
                    <span>
                      {client.onboardingStatus === "Completed" ? "100%" : "60%"}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-1000"
                      style={{
                        width:
                          client.onboardingStatus === "Completed"
                            ? "100%"
                            : "60%",
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Vertical Stepper/Checklist */}
              <div className="p-4 md:p-6 relative">
                {/* Connecting Line */}
                <div className="absolute left-8 md:left-10 top-10 bottom-10 w-0.5 bg-gray-100 -z-10"></div>

                <div className="space-y-6 md:space-y-8">
                  {onboardingSteps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="relative flex items-center gap-4 group"
                    >
                      {/* Step Indicator */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all border-2 z-10 ${
                          step.status === "Completed"
                            ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100"
                            : step.status === "In Progress"
                              ? "bg-white border-blue-600 text-blue-600 animate-pulse ring-4 ring-blue-50"
                              : "bg-white border-gray-200 text-gray-400"
                        }`}
                      >
                        {step.status === "Completed" ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          step.id
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 bg-white">
                        <div className="flex flex-col">
                          <h4
                            className={`text-xs md:text-sm font-bold transition-colors ${
                              step.status === "Completed"
                                ? "text-gray-900"
                                : step.status === "In Progress"
                                  ? "text-blue-600"
                                  : "text-gray-400"
                            }`}
                          >
                            {step.title}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-medium text-gray-500 flex items-center gap-1">
                              {step.icon} {step.date}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Status Tag */}
                      <div
                        className={`hidden sm:block text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-tight ${
                          step.status === "Completed"
                            ? "bg-green-50 text-green-600"
                            : step.status === "In Progress"
                              ? "bg-blue-50 text-blue-600"
                              : "bg-gray-50 text-gray-400"
                        }`}
                      >
                        {step.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
