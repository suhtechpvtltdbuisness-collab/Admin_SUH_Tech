import {
  BarChart2,
  DollarSign,
  Edit2,
  Filter,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  Trash2,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import Toast from "../../components/common/Toast";
import { authService, clientSaleService } from "../../services";

const CompanySales = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState(null);
  const [toast, setToast] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState("All");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const filterRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [newSale, setNewSale] = useState({
    clientName: "",
    contactPerson: "",
    email: "",
    phone: "",
    projectTitle: "",
    amount: "",
    date: "",
    status: "pending",
    link: "",
    paymentMethod: "Bank Transfer",
  });

  useEffect(() => {
    loadSales();
  }, []);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close action menu dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenuId !== null) {
        const isInsideMenu = event.target.closest("[data-action-menu-wrap]");
        if (!isInsideMenu) setActiveMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [activeMenuId]);

  const handleMenuToggle = (e, id) => {
    e.stopPropagation();
    setActiveMenuId((prev) => (prev === id ? null : id));
  };

  const normaliseRecord = (r) => ({
    // Primary key
    _id: r.id ?? r._id,
    // camelCase — handle both camelCase and snake_case from API
    clientName: r.clientName ?? r.client_name ?? "",
    contactPerson: r.contactPerson ?? r.contact_person ?? "",
    email: r.email ?? "",
    phone: String(r.phone ?? ""),
    projectTitle: r.projectTitle ?? r.project_title ?? r.projectName ?? r.project_name ?? "",
    amount: r.amount ?? 0,
    date: r.date ? r.date.split("T")[0] : "",   // strip time from ISO string
    status: (r.status ?? "pending").toLowerCase(),
    link: r.link ?? "",
    paymentMethod: r.paymentMethod ?? r.payment_method ?? r.paymentMode ?? r.payment_mode ?? "Bank Transfer",
  });

  const loadSales = async () => {
    try {
      setLoading(true);
      const res = await clientSaleService.getAll();
      // Handle: array | { data } | { clients } | { sales } | { records }
      const list = Array.isArray(res)
        ? res
        : res?.data ?? res?.clients ?? res?.records ?? res?.sales ?? [];
      setSales(list.map(normaliseRecord));
    } catch (error) {
      console.error("Error loading sales:", error);
      showToast("Failed to load sales: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter sales based on search and filters
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const matchesSearch =
        sale.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sale.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        filterStatus === "All" || sale.status === filterStatus;
      const matchesPaymentMethod =
        filterPaymentMethod === "All" ||
        sale.paymentMethod === filterPaymentMethod;
      return matchesSearch && matchesStatus && matchesPaymentMethod;
    });
  }, [sales, searchTerm, filterStatus, filterPaymentMethod]);

  // Calculate stats
  const stats = useMemo(() => {
    const totalRevenue = sales.reduce(
      (sum, sale) => sum + (parseFloat(sale.amount) || 0),
      0,
    );
    const pendingPayments = sales
      .filter((s) => s.status === "pending")
      .reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0);
    const activeProjects = sales.filter(
      (s) => s.status === "processing",
    ).length;

    return {
      totalRevenue,
      pendingPayments,
      activeProjects,
    };
  }, [sales]);

  const getStatusColor = (status) => {
    switch ((status || "").toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-700 border-green-200";
      case "processing":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSale((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openNewModal = () => {
    setEditingSale(null);
    setNewSale({
      clientName: "",
      contactPerson: "",
      email: "",
      phone: "",
      projectTitle: "",
      amount: "",
      date: "",
      status: "pending",
      link: "",
      paymentMethod: "Bank Transfer",
    });
    setIsAddModalOpen(true);
  };

  const openEditModal = (sale) => {
    setEditingSale(sale);
    // sale is already normalised by normaliseRecord(), so all fields are camelCase
    setNewSale({
      clientName: sale.clientName || "",
      contactPerson: sale.contactPerson || "",
      email: sale.email || "",
      phone: sale.phone || "",
      projectTitle: sale.projectTitle || "",
      amount: sale.amount || "",
      date: sale.date || "",
      status: (sale.status || "pending").toLowerCase(),
      link: sale.link || "",
      paymentMethod: sale.paymentMethod || "Bank Transfer",
    });
    setIsAddModalOpen(true);
    setActiveMenuId(null);
  };

  const handleAddSale = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newSale,
        amount: parseFloat(newSale.amount) || 0,
      };

      if (editingSale) {
        // PATCH /expenses/client/:id
        await clientSaleService.update(editingSale._id, payload);
        showToast("Sale entry updated successfully!", "success");
      } else {
        // POST /expenses/client
        await clientSaleService.create(payload);
        showToast("Sale entry created successfully!", "success");
      }

      await loadSales();
      setIsAddModalOpen(false);
      setEditingSale(null);

      setNewSale({
        clientName: "",
        contactPerson: "",
        email: "",
        phone: "",
        projectTitle: "",
        amount: "",
        date: "",
        status: "Pending",
        link: "",
        paymentMethod: "Bank Transfer",
      });
    } catch (error) {
      console.error("Error saving sale:", error);
      showToast("Failed to save sale: " + error.message, "error");
    }
  };

  const handleDelete = async (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      // DELETE /expenses/client/:id
      await clientSaleService.delete(deleteConfirmId);
      showToast("Sale entry deleted successfully!", "success");
      await loadSales();
      setActiveMenuId(null);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error("Error deleting sale:", error);
      showToast("Failed to delete sale: " + error.message, "error");
      setDeleteConfirmId(null);
    }
  };

  const formatCurrency = (amount) => {
    return `₹${(parseFloat(amount) || 0).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Company Sales</h1>
          <p className="text-gray-500 text-sm">
            Track income, project billing, and revenue status
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm w-full md:w-auto"
        >
          <Plus size={20} />
          <span>New Sale Entry</span>
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase">
              Total Revenue
            </p>
            <h3 className="text-xl font-bold text-gray-800">
              {formatCurrency(stats.totalRevenue)}
            </h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
            <DollarSign size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase">
              Pending Payments
            </p>
            <h3 className="text-xl font-bold text-gray-800">
              {formatCurrency(stats.pendingPayments)}
            </h3>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
            <BarChart2 size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-xs font-medium uppercase">
              In Progress
            </p>
            <h3 className="text-xl font-bold text-gray-800">
              {stats.activeProjects}
            </h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search sales, clients, or projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
          >
            <Filter size={18} />
            Filter
          </button>
          {isFilterOpen && (
            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10 p-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="All">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={filterPaymentMethod}
                  onChange={(e) => setFilterPaymentMethod(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="All">All Methods</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setFilterStatus("All");
                  setFilterPaymentMethod("All");
                  setIsFilterOpen(false);
                }}
                className="w-full px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        className="bg-white rounded-xl shadow-sm border border-gray-100"
        style={{ overflow: "visible" }}
      >
        {loading ? (
          <div className="p-8 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 text-sm">Loading sales data...</p>
          </div>
        ) : filteredSales.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
              <DollarSign size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 text-sm">
              {searchTerm
                ? "No sales found matching your search."
                : "No sales entries found. Add your first sale!"}
            </p>
          </div>
        ) : (
          <div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-3 font-semibold text-gray-600 text-xs">
                    Client Name
                  </th>
                  <th className="p-3 font-semibold text-gray-600 text-xs">
                    Email
                  </th>
                  <th className="p-3 font-semibold text-gray-600 text-xs">
                    Phone
                  </th>
                  <th className="p-3 font-semibold text-gray-600 text-xs">
                    Project Title
                  </th>
                  <th className="p-3 font-semibold text-gray-600 text-xs">
                    Amount
                  </th>
                  <th className="p-3 font-semibold text-gray-600 text-xs">
                    Payment Method
                  </th>
                  <th className="p-3 font-semibold text-gray-600 text-xs">
                    Date
                  </th>
                  <th className="p-3 font-semibold text-gray-600 text-xs">
                    Status
                  </th>
                  <th className="p-3 font-semibold text-gray-600 text-xs text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredSales.map((sale) => (
                  <tr
                    key={sale._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                          {sale.clientName
                            ?.split(" ")
                            .map((n) => n[0])
                            .join("") || "N/A"}
                        </div>
                        <p className="font-medium text-gray-900 text-sm truncate max-w-[120px]">
                          {sale.clientName || "N/A"}
                        </p>
                      </div>
                    </td>
                    <td className="p-3">
                      {sale.email ? (
                        <a
                          href={`mailto:${sale.email}`}
                          className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors truncate max-w-[150px]"
                        >
                          <Mail size={12} />{" "}
                          <span className="truncate">{sale.email}</span>
                        </a>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-3">
                      {sale.phone ? (
                        <div className="flex items-center gap-1 text-xs text-gray-600">
                          <Phone size={12} /> {sale.phone}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="p-3 text-xs text-gray-600 font-medium truncate max-w-[150px]">
                      {sale.projectTitle || "N/A"}
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-gray-900 text-sm whitespace-nowrap">
                        {formatCurrency(sale.amount)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-gray-600">
                        {sale.paymentMethod || "N/A"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="text-xs text-gray-600 whitespace-nowrap">
                        {formatDate(sale.date)}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(sale.status)}`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${(sale.status || "").toLowerCase() === "paid" ? "bg-green-500"
                            : (sale.status || "").toLowerCase() === "processing" ? "bg-blue-500"
                              : "bg-yellow-500"
                            }`}
                        ></span>
                        {sale.status || "Pending"}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="relative inline-block text-left" data-action-menu-wrap>
                        <button
                          data-action-menu-button
                          onClick={(e) => handleMenuToggle(e, sale._id)}
                          className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          <MoreVertical size={16} />
                        </button>

                        {activeMenuId === sale._id && (
                          <div
                            data-action-menu-content
                            className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1"
                            style={{
                              bottom: "auto",
                              top: "100%",
                            }}
                          >
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(sale);
                                setActiveMenuId(null);
                              }}
                            >
                              <Edit2 size={14} />
                              Edit
                            </button>
                            <button
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(sale._id);
                                setActiveMenuId(null);
                              }}
                            >
                              <Trash2 size={14} />
                              Delete
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

      {/* Add/Edit Sale Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {editingSale ? "Edit Sale Entry" : "New Sale Entry"}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingSale(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleAddSale}
              className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client Name
                </label>
                <input
                  type="text"
                  name="clientName"
                  value={newSale.clientName}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contact Person
                </label>
                <input
                  type="text"
                  name="contactPerson"
                  value={newSale.contactPerson}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newSale.email}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={newSale.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Title
                </label>
                <input
                  type="text"
                  name="projectTitle"
                  value={newSale.projectTitle}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (INR)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={newSale.amount}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  name="paymentMethod"
                  value={newSale.paymentMethod}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={newSale.date}
                  onChange={handleInputChange}
                  required
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={newSale.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Link (Optional)
                </label>
                <input
                  type="url"
                  name="link"
                  value={newSale.link}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="md:col-span-2 mt-4 pt-4 border-t">
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSale ? "Update Sale Entry" : "Create Sale Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md mx-4 rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Sale Entry
                </h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this sale entry? All data
              associated with this entry will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
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
  );
};

export default CompanySales;
