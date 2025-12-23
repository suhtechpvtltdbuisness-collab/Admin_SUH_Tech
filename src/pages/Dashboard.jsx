import {
    Briefcase,
    FileCheck,
    FileText,
    Folder,
    FolderCheck,
    FolderPlus,
    Mail,
    PenSquare,
    Sparkles,
    TrendingDown,
    TrendingUp,
    UserCheck,
    Users
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MessageList from "../components/MessageList";
import RecentList from "../components/RecentList";
import StatCard from "../components/StatCard";
import Toast from "../components/Toast";
import api from "../config/api";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.getStats();
        setStats(response.stats);
      } catch (error) {
        console.error('Error loading stats:', error);
        showToast('Failed to load dashboard stats: ' + error.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    
    loadStats();
  }, []);

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  // Loading skeleton component
  const StatCardSkeleton = () => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-200 rounded w-20"></div>
        </div>
        <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <div className="p-6 lg:p-10">
        {/* Top bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
              Dashboard
            </h2>
            <p className="text-gray-600 text-sm flex items-center gap-2">
              <Sparkles size={16} className="text-blue-500" />
              Welcome back! Here's what's happening today
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : stats ? (
            <>
              <StatCard
                title="Total Projects"
                value={stats.totalProjects || 0}
                icon={Folder}
                gradient="from-blue-500 to-blue-600"
                iconBg="bg-blue-100"
                iconColor="text-blue-600"
                trend="up"
                trendValue="+12%"
              />
              <StatCard
                title="Active Projects"
                value={stats.activeProjects || 0}
                icon={FolderCheck}
                gradient="from-green-500 to-green-600"
                iconBg="bg-green-100"
                iconColor="text-green-600"
                trend="up"
                trendValue="+8%"
              />
              <StatCard
                title="Total Invoices"
                value={stats.totalInvoices || 0}
                icon={FileText}
                gradient="from-purple-500 to-purple-600"
                iconBg="bg-purple-100"
                iconColor="text-purple-600"
              />
              <StatCard
                title="Pending Invoices"
                value={stats.pendingInvoices || 0}
                icon={FileCheck}
                gradient="from-orange-500 to-orange-600"
                iconBg="bg-orange-100"
                iconColor="text-orange-600"
                trend="down"
                trendValue="-5%"
              />
              <StatCard
                title="Total Employees"
                value={stats.totalEmployeesCount || 0}
                icon={Users}
                gradient="from-indigo-500 to-indigo-600"
                iconBg="bg-indigo-100"
                iconColor="text-indigo-600"
              />
              <StatCard
                title="Active Employees"
                value={stats.activeEmployeesCount || 0}
                icon={UserCheck}
                gradient="from-teal-500 to-teal-600"
                iconBg="bg-teal-100"
                iconColor="text-teal-600"
                trend="up"
                trendValue="+3%"
              />
              <StatCard
                title="Total Revenue"
                value={formatCurrency(stats.totalRevenue)}
                icon={TrendingUp}
                gradient="from-emerald-500 to-emerald-600"
                iconBg="bg-emerald-100"
                iconColor="text-emerald-600"
                trend="up"
                trendValue="+18%"
              />
              <StatCard
                title="Total Expenses"
                value={formatCurrency(stats.totalExpenseAmount)}
                icon={TrendingDown}
                gradient="from-rose-500 to-rose-600"
                iconBg="bg-rose-100"
                iconColor="text-rose-600"
                trend="up"
                trendValue="+5%"
              />
            </>
          ) : (
            <>
              <StatCard title="Total Projects" value="0" icon={Folder} gradient="from-blue-500 to-blue-600" iconBg="bg-blue-100" iconColor="text-blue-600" />
              <StatCard title="Active Projects" value="0" icon={FolderCheck} gradient="from-green-500 to-green-600" iconBg="bg-green-100" iconColor="text-green-600" />
              <StatCard title="Total Invoices" value="0" icon={FileText} gradient="from-purple-500 to-purple-600" iconBg="bg-purple-100" iconColor="text-purple-600" />
              <StatCard title="Pending Invoices" value="0" icon={FileCheck} gradient="from-orange-500 to-orange-600" iconBg="bg-orange-100" iconColor="text-orange-600" />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h3 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => navigate("/jobs")}
              className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 text-left overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <Briefcase className="text-white mb-3 group-hover:scale-110 transition-transform" size={28} />
              <h4 className="text-white font-semibold text-lg">Add Job Opening</h4>
              <p className="text-blue-100 text-sm mt-1">Post new positions</p>
            </button>

            <button
              onClick={() => navigate("/projects")}
              className="group bg-white hover:bg-gradient-to-br hover:from-green-50 hover:to-emerald-50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left border-2 border-gray-100 hover:border-green-200"
            >
              <FolderPlus className="text-green-600 mb-3 group-hover:scale-110 transition-transform" size={28} />
              <h4 className="text-gray-900 font-semibold text-lg">Add Project</h4>
              <p className="text-gray-600 text-sm mt-1">Create new project</p>
            </button>

            <button
              onClick={() => navigate("/blog")}
              className="group bg-white hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left border-2 border-gray-100 hover:border-purple-200"
            >
              <PenSquare className="text-purple-600 mb-3 group-hover:scale-110 transition-transform" size={28} />
              <h4 className="text-gray-900 font-semibold text-lg">Add Blog Post</h4>
              <p className="text-gray-600 text-sm mt-1">Write new article</p>
            </button>

            <button
              onClick={() => navigate("/messages")}
              className="group bg-white hover:bg-gradient-to-br hover:from-orange-50 hover:to-red-50 p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 text-left border-2 border-gray-100 hover:border-orange-200"
            >
              <Mail className="text-orange-600 mb-3 group-hover:scale-110 transition-transform" size={28} />
              <h4 className="text-gray-900 font-semibold text-lg">View Messages</h4>
              <p className="text-gray-600 text-sm mt-1">Check inbox</p>
            </button>
          </div>
        </div>

        {/* Bottom two columns */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center mb-5">
              <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                Recent Applications
              </h4>
              <button
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline transition-all"
                onClick={() => navigate("/employees")}
              >
                View All →
              </button>
            </div>
            <RecentList />
          </div>

          <div className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg transition-shadow duration-300">
            <div className="flex justify-between items-center mb-5">
              <h4 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-orange-500 to-red-600 rounded-full"></div>
                Recent Contact Messages
              </h4>
              <button
                className="text-blue-600 hover:text-blue-700 text-sm font-semibold hover:underline transition-all"
                onClick={() => navigate("/messages")}
              >
                View All →
              </button>
            </div>
            <MessageList />
          </div>
        </div>

        {/* Toast Notifications */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
