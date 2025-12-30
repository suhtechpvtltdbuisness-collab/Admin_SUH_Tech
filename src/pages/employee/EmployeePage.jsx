import { ChevronDown, Download, Eye, Plus, Search, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import AddEmployeeModal from "../../components/employee/AddEmployeeModal";
import Toast from "../../components/Toast";
import api from "../../config/api";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function EmployeePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [toast, setToast] = useState(null);
  const itemsPerPage = 10;

  // Filters State //
  const [filters, setFilters] = useState({
    department: "",
    status: ""
  });

  // Toast helper
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Load employees from API
  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const response = await api.getEmployees();
      setEmployees(response.employees || []);
    } catch (error) {
      console.error("Error loading employees:", error);
      showToast("Failed to load employees: " + error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEmployee = async (newEmp) => {
    try {
      await api.createEmployee(newEmp);
      await loadEmployees();
      setShowAddModal(false);
      showToast("Employee added successfully!", 'success');
    } catch (error) {
      console.error("Error adding employee:", error);
      showToast("Failed to add employee: " + error.message, 'error');
    }
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        emp.employeeId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = filters.department ? emp.department === filters.department : true;
      const matchesStatus = filters.status ? emp.status === filters.status : true;

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, filters]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  // Unique Options for Dropdowns
  const uniqueDepts = [...new Set(employees.map(e => e.department))];
  const uniqueStatuses = ["Active", "On Leave", "Terminated", "Resigned"];

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  const handleExportPDF = () => {
    try {
      const doc = new jsPDF();
      let yPos = 15;

      // Header
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 45, 'F');

      // Company Name
      doc.setFontSize(26);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('SUH TECH PRIVATE LIMITED', 105, yPos, { align: 'center' });

      yPos += 8;
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.text('D-8, 4th Floor, Habitech Crystal Mall, Knowledge Park III, Greater Noida,', 105, yPos, { align: 'center' });
      yPos += 4;
      doc.text('Uttar Pradesh - 201310', 105, yPos, { align: 'center' });
      yPos += 5;
      doc.text('Email: info@suhtech.top | Phone: +91 9211056355 (WhatsApp) | Tel: +91 1204086567', 105, yPos, { align: 'center' });

      yPos = 55;

      // Document Title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('EMPLOYEES REPORT', 105, yPos, { align: 'center' });

      yPos += 10;

      // Table data
      const tableData = filteredEmployees.map((emp, index) => [
        index + 1,
        `${emp.firstName} ${emp.lastName}`,
        emp.employeeId || '-',
        emp.department || '-',
        emp.designation || '-',
        formatDate(emp.joiningDate),
        emp.email || '-',
        emp.status || '-'
      ]);

      // Generate table
      autoTable(doc, {
        startY: yPos,
        head: [['Sr. No.', 'Name', 'ID', 'Department', 'Designation', 'Joining Date', 'Email', 'Status']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 8,
          halign: 'center',
          valign: 'middle',
          minCellHeight: 10
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [50, 50, 50]
        },
        columnStyles: {
          0: { cellWidth: 12, halign: 'center' },  // Sr. No.
          1: { cellWidth: 30 },                     // Name
          2: { cellWidth: 20, halign: 'center' },  // ID
          3: { cellWidth: 25 },                     // Department
          4: { cellWidth: 28 },                     // Designation
          5: { cellWidth: 22, halign: 'center' },  // Joining Date
          6: { cellWidth: 40 },                     // Email
          7: { cellWidth: 15, halign: 'center' }   // Status
        },
        alternateRowStyles: {
          fillColor: [245, 247, 250]
        },
        margin: { top: 10, left: 14, right: 14 },
        styles: {
          cellPadding: 3,
          lineColor: [220, 220, 220],
          lineWidth: 0.1
        }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.getWidth() / 2,
          doc.internal.pageSize.getHeight() - 10,
          { align: 'center' }
        );
        doc.text(
          `Generated on ${new Date().toLocaleDateString('en-IN')}`,
          14,
          doc.internal.pageSize.getHeight() - 10
        );
      }

      // Save PDF
      doc.save(`Employees_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('Employees exported to PDF successfully!', 'success');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showToast('Failed to export PDF: ' + error.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
              Employees
            </h1>
            <p className="text-gray-600 text-sm">Manage your team members and their account details.</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={handleExportPDF}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-all text-sm shadow-sm flex-1 md:flex-none hover:shadow-md"
            >
              <Download size={18} className="text-gray-500" /> Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-semibold shadow-lg transition-all text-sm flex-1 md:flex-none hover:shadow-xl"
            >
              <Plus size={20} /> Add Employee
            </button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col xl:flex-row gap-4 justify-between">
          {/* Search */}
          <div className="relative flex-1 min-w-[300px] max-w-lg">
            <input
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm text-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm placeholder:text-gray-400"
            />
            <div className="absolute left-3.5 top-3 text-gray-400">
              <Search size={20} />
            </div>
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap gap-3">
            {/* Dept Filter */}
            <div className="relative group">
              <select
                className="appearance-none pl-3 pr-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer min-w-[160px]"
                value={filters.department}
                onChange={(e) => { setFilters({ ...filters, department: e.target.value }); setCurrentPage(1); }}
              >
                <option value="">All Departments</option>
                {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative group">
              <select
                className="appearance-none pl-3 pr-8 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer min-w-[140px]"
                value={filters.status}
                onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}
              >
                <option value="">All Status</option>
                {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {(filters.department || filters.status) && (
              <button
                onClick={() => { setFilters({ department: "", status: "" }); setCurrentPage(1); }}
                className="px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 rounded-xl transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-transparent">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              All Employees
            </h2>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
              {filteredEmployees.length} Total
            </span>
          </div>

          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-sm">Loading employees...</p>
            </div>
          ) : paginatedEmployees.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Users size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                No employees found matching your criteria.
              </p>
            </div>
          ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-transparent border-b border-gray-200 text-xs text-gray-600 uppercase tracking-wider font-semibold">
                  <th className="p-4 w-12 text-center">Sr. No.</th>
                  <th className="p-4">Employee Name</th>
                  <th className="p-4">ID</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Joining Date</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {paginatedEmployees.map((emp, index) => (
                  <tr key={emp._id} className="hover:bg-blue-50/30 transition-colors duration-150">
                    <td className="p-4 text-center text-gray-400 text-xs">
                      {((currentPage - 1) * itemsPerPage + index + 1).toString().padStart(2, '0')}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold">
                          {emp.firstName?.[0]}{emp.lastName?.[0]}
                        </div>
                        <span className="font-semibold text-gray-900">{emp.firstName} {emp.lastName}</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-mono text-xs font-medium">{emp.employeeId}</td>
                    <td className="p-4 text-gray-700 font-medium">{emp.department}</td>
                    <td className="p-4 text-gray-700">{emp.designation}</td>
                    <td className="p-4 text-gray-500 text-xs font-medium">{formatDate(emp.joiningDate)}</td>
                    <td className="p-4 text-blue-600 text-xs font-medium">{emp.email}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${
                        emp.status === "Active" ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200" :
                        emp.status === "On Leave" ? "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200" :
                        emp.status === "Resigned" ? "bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200" :
                        "bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200"
                      }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/employee/${emp._id || emp.employeeId}`)}
                          className="p-2 rounded-xl hover:bg-blue-50 text-blue-600 transition-all duration-200"
                          title="View Profile"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}

          {/* Pagination Controls */}
          {!loading && paginatedEmployees.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-600 bg-gradient-to-r from-gray-50/50 to-transparent">
            <span className="font-medium">Showing {((currentPage - 1) * itemsPerPage + 1)} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} entries</span>
            <div className="flex gap-2 text-sm font-semibold">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-blue-50 border-2 border-gray-200 rounded-xl hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-4 py-2 bg-blue-50 border-2 border-gray-200 rounded-xl hover:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                Next
              </button>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Add Employee Modal */}
      {showAddModal && <AddEmployeeModal onClose={() => setShowAddModal(false)} onSave={handleAddEmployee} />}

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
    