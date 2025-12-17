import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import StatCard from "../components/StatCard";
import ActionButton from "../components/ActionButton";
import RecentList from "../components/RecentList";
import MessageList from "../components/MessageList";
import JobOpeningModal from "../components/JobOpeningModal";
import { Bell } from "lucide-react";
import api from "../config/api";

export default function Dashboard() {
  const [openJobModal, setOpenJobModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await api.getStats();
        setStats(response.stats);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-10 overflow-y-auto">
        {/* Top bar */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-gray-100">
              <Bell size={22} />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center"></div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {loading ? (
            <>
              <StatCard title="Loading..." value="-" />
              <StatCard title="Loading..." value="-" />
              <StatCard title="Loading..." value="-" />
              <StatCard title="Loading..." value="-" />
            </>
          ) : stats ? (
            <>
              <StatCard title="Total Projects" value={stats.totalProjects || 0} />
              <StatCard title="Active Projects" value={stats.activeProjects || 0} />
              <StatCard title="Total Invoices" value={stats.totalInvoices || 0} />
              <StatCard title="Pending Invoices" value={stats.pendingInvoices || 0} />
              <StatCard title="Total Employees" value={stats.totalEmployeesCount || 0} />
              <StatCard title="Active Employees" value={stats.activeEmployeesCount || 0} />
              <StatCard title="Total Revenue" value={formatCurrency(stats.totalRevenue)} />
              <StatCard title="Total Expenses" value={formatCurrency(stats.totalExpenseAmount)} />
            </>
          ) : (
            <>
              <StatCard title="Total Projects" value="0" />
              <StatCard title="Active Projects" value="0" />
              <StatCard title="Total Invoices" value="0" />
              <StatCard title="Pending Invoices" value="0" />
            </>
          )}
        </div>

        {/* Quick Actions */}
        <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-4 gap-4 mb-10">
          <ActionButton
            primary
            label="Add Job Opening"
            onClick={() => setOpenJobModal(true)}  // ⬅️ OPEN MODAL
          />
          <ActionButton label="Add Project" />
          <ActionButton label="Add Blog Post" />
          <ActionButton label="View Messages" />
        </div>

        {/* Bottom two columns */}
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-lg">Recent Applications</h4>
              <button className="text-blue-600 text-sm">View All</button>
            </div>

            <RecentList />
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-lg">Recent Contact Messages</h4>
              <button className="text-blue-600 text-sm">View All</button>
            </div>

            <MessageList />
          </div>
        </div>
      </main>

      {/* MODAL */}
      {openJobModal && (
        <JobOpeningModal onClose={() => setOpenJobModal(false)} />
      )}
    </div>
  );
}
