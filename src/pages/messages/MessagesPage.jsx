import { Mail, MessageSquare, Users } from "lucide-react";
import { useEffect, useState } from "react";
import Toast from "../../components/common/Toast";
import { authService, employeeService, messageService } from "../../services";

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState("contacts");
  const [contacts, setContacts] = useState([]);
  const [infos, setInfos] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingInfos, setLoadingInfos] = useState(true);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoadingContacts(true);
        const res = await messageService.getAllMessages();
        const messagesArray = Array.isArray(res) ? res : (res.data || res.messages || []);
        setContacts(messagesArray);
      } catch (error) {
        console.error("Error loading contacts:", error);
        showToast("Failed to load contact messages: " + error.message, "error");
      } finally {
        setLoadingContacts(false);
      }
    };

    const loadInfos = async () => {
      try {
        setLoadingInfos(true);
        const res = await api.getUserInfos();
        setInfos(res.infos || []);
      } catch (error) {
        console.error("Error loading user infos:", error);
        showToast("Failed to load project leads: " + error.message, "error");
      } finally {
        setLoadingInfos(false);
      }
    };

    const loadEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const employees = await employeeService.getAllEmployees();
        // Filter out the specific employee with email john.doe@example.com
        const filteredEmployees = (employees || []).filter(
          (emp) => emp.email !== "john.doe@example.com",
        );
        setEmployees(filteredEmployees);
      } catch (error) {
        console.error("Error loading employees:", error);
        showToast("Failed to load employees: " + error.message, "error");
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadContacts();
    loadInfos();
    loadEmployees();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
              Messages & Inquiries
            </h1>
            <p className="text-gray-600 text-sm">
              All contact form messages and project interest inquiries from the
              main website.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-gray-100 w-fit">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === "contacts"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Mail size={18} /> Contact Messages ({contacts.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("infos")}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === "infos"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Users size={18} /> Project Leads ({infos.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab("employees")}
            className={`px-5 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
              activeTab === "employees"
                ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Users size={18} /> Employees ({employees.length})
            </span>
          </button>
        </div>

        {/* Content */}
        {activeTab === "contacts" ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-transparent">
              <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                Contact Form Messages
              </h2>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                {contacts.length} Total
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {loadingContacts ? (
                <div className="p-8 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 text-sm">Loading messages...</p>
                </div>
              ) : contacts.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    No messages received yet.
                  </p>
                </div>
              ) : (
                contacts.map((c) => (
                  <div
                    key={c._id}
                    className="p-5 flex flex-col md:flex-row md:items-start justify-between gap-4 hover:bg-blue-50/30 transition-colors duration-150"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold shadow-md flex-shrink-0">
                        {c.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-base">
                          {c.name}
                        </p>
                        <p className="text-sm text-blue-600 font-medium">
                          {c.email}
                        </p>
                        <p className="mt-2 text-sm text-gray-700 leading-relaxed">
                          {c.message}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium md:text-right flex-shrink-0">
                      {c.createdAt &&
                        new Date(c.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : activeTab === "employees" ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-transparent">
              <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                Employees
              </h2>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                {employees.length} Total
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {loadingEmployees ? (
                <div className="p-8 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 text-sm">Loading employees...</p>
                </div>
              ) : employees.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Users size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">No employees found.</p>
                </div>
              ) : (
                employees.map((emp) => (
                  <div
                    key={emp._id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-blue-50/30 transition-colors duration-150"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-base mb-2">
                        {emp.name}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold">
                          Role: {emp.role || "N/A"}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold">
                          Email: {emp.email || "N/A"}
                        </span>
                        {emp.phone && (
                          <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold">
                            Phone: {emp.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium md:text-right flex-shrink-0">
                      {emp.createdAt &&
                        new Date(emp.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-transparent">
              <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
                <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                Project Interest / FAQ Leads
              </h2>
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                {infos.length} Total
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {loadingInfos ? (
                <div className="p-8 flex flex-col items-center justify-center">
                  <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                  <p className="text-gray-500 text-sm">Loading leads...</p>
                </div>
              ) : infos.length === 0 ? (
                <div className="p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                    <Users size={32} className="text-gray-400" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    No leads received yet.
                  </p>
                </div>
              ) : (
                infos.map((u) => (
                  <div
                    key={u._id}
                    className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-blue-50/30 transition-colors duration-150"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-base mb-2">
                        {u.name}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200 rounded-lg text-xs font-semibold">
                          Interest: {u.interest}
                        </span>
                        <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200 rounded-lg text-xs font-semibold">
                          Favorite: {u.favorite}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 font-medium md:text-right flex-shrink-0">
                      {u.createdAt &&
                        new Date(u.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
