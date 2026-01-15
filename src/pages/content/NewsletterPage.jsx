import { Calendar, Mail, Search, TrendingUp, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Toast from "../../components/common/Toast";
import api from "../../config/api";

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load subscribers
  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = async () => {
    try {
      setLoading(true);
      const response = await api.getNewsletterSubscribers();
      setSubscribers(response.subscribers || []);
    } catch (error) {
      console.error("Error loading subscribers:", error);
      showToast("Failed to load subscribers: " + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter subscribers based on search
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter(sub =>
      sub.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [subscribers, searchTerm]);

  // Stats
  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.isActive).length,
    thisMonth: subscribers.filter(s => {
      const date = new Date(s.subscribedAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length,
    thisWeek: subscribers.filter(s => {
      const date = new Date(s.subscribedAt);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    }).length
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
              Newsletter Subscribers
            </h1>
            <p className="text-gray-600 text-sm">
              Manage your newsletter subscribers and track growth.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Subscribers */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <Users size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</h3>
            <p className="text-sm text-gray-600">Total Subscribers</p>
          </div>

          {/* Active Subscribers */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                <Mail size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.active}</h3>
            <p className="text-sm text-gray-600">Active Subscribers</p>
          </div>

          {/* This Month */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Calendar size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.thisMonth}</h3>
            <p className="text-sm text-gray-600">This Month</p>
          </div>

          {/* This Week */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <TrendingUp size={24} className="text-white" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.thisWeek}</h3>
            <p className="text-sm text-gray-600">This Week</p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm placeholder:text-gray-400"
            />
            <div className="absolute left-3.5 top-3 text-gray-400">
              <Search size={20} />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-transparent">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              All Subscribers
            </h2>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
              {filteredSubscribers.length} {filteredSubscribers.length === 1 ? 'Subscriber' : 'Subscribers'}
            </span>
          </div>

          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-sm">Loading subscribers...</p>
            </div>
          ) : filteredSubscribers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Mail size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                {searchTerm ? "No subscribers found matching your search." : "No subscribers yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-transparent border-b border-gray-200 text-xs text-gray-600 uppercase tracking-wider font-semibold">
                    <th className="p-4 w-12">#</th>
                    <th className="p-4">Email Address</th>
                    <th className="p-4">Subscribed At</th>
                    <th className="p-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSubscribers.map((subscriber, index) => (
                    <tr key={subscriber._id} className="hover:bg-blue-50/30 transition-colors duration-150">
                      <td className="p-4 text-gray-400 text-xs font-medium">
                        {(index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {subscriber.email.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-blue-600 font-medium">{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600 font-medium">
                        {formatDate(subscriber.subscribedAt)}
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${subscriber.isActive
                          ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
                          : "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border border-gray-200"
                          }`}>
                          {subscriber.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
