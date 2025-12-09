import React, { useState, useMemo } from "react";
import { Search, Plus, Filter, ChevronDown, Eye, Edit2, MoreVertical, Trash2, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import AddEmployeeModal from "../../components/employee/AddEmployeeModal";

export default function EmployeePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Filters State
  const [filters, setFilters] = useState({
    department: "",
    role: "",
    status: ""
  });

  // INITIAL 5 EMPLOYEES MOCK DATA
  const INITIAL_EMPLOYEES = [
    {
      id: "001",
      name: "Rahul Sharma",
      designation: "Software Engineer",
      dept: "Engineering",
      joinDate: "2023-01-15",
      contact: "rahul.s@suhtech.com",
      status: "Active",
      avatar: "https://ui-avatars.com/api/?name=Rahul+Sharma&background=0D8ABC&color=fff",
      details: {
        gender: "Male",
        dob: "25 Aug 1995",
        bloodGroup: "B+",
        nationality: "Indian",
        currentAddress: "A-123, Rosewood App, Andheri West, Mumbai",
        city: "Mumbai",
        state: "Maharashtra",
        zip: "400053",
        emergencyName: "Anil Patil",
        emergencyRelation: "Father",
        emergencyPhone: "9876543210",
        aadhar: "XXXX-XXXX-1234",
        pan: "ABCDE1234F"
      }
    },
    {
      id: "002",
      name: "Priya Singh",
      designation: "UI/UX Designer",
      dept: "Design",
      joinDate: "2023-02-10",
      contact: "priya.s@suhtech.com",
      status: "Active",
      avatar: "https://ui-avatars.com/api/?name=Priya+Singh&background=D946EF&color=fff",
      details: {
        gender: "Female",
        dob: "12 Dec 1996",
        bloodGroup: "O+",
        nationality: "Indian",
        currentAddress: "B-402, Sunshine Towers, Pune",
        city: "Pune",
        state: "Maharashtra",
        zip: "411001"
      }
    },
    {
      id: "003",
      name: "Amit Patel",
      designation: "Product Manager",
      dept: "Product",
      joinDate: "2022-11-05",
      contact: "amit.p@suhtech.com",
      status: "Active",
      avatar: "https://ui-avatars.com/api/?name=Amit+Patel&background=F59E0B&color=fff",
      details: {
        gender: "Male",
        dob: "10 Mar 1990",
        bloodGroup: "A+",
        nationality: "Indian",
        currentAddress: "C-101, Green Valley, Bangalore",
        city: "Bangalore",
        state: "Karnataka",
        zip: "560001"
      }
    },
    {
      id: "004",
      name: "Sneha Gupta",
      designation: "HR Manager",
      dept: "HR",
      joinDate: "2021-08-20",
      contact: "sneha.g@suhtech.com",
      status: "On Leave",
      avatar: "https://ui-avatars.com/api/?name=Sneha+Gupta&background=10B981&color=fff",
      details: {
        gender: "Female",
        dob: "20 Aug 1992",
        bloodGroup: "AB+",
        nationality: "Indian",
        currentAddress: "D-505, Blue Heights, Delhi",
        city: "Delhi",
        state: "Delhi",
        zip: "110001"
      }
    },
    {
      id: "005",
      name: "Vikram Malhotra",
      designation: "Backend Dev",
      dept: "Engineering",
      joinDate: "2023-03-12",
      contact: "vikram.m@suhtech.com",
      status: "Active",
      avatar: "https://ui-avatars.com/api/?name=Vikram+Malhotra&background=3B82F6&color=fff",
      details: {
        gender: "Male",
        dob: "15 Jan 1994",
        bloodGroup: "B+",
        nationality: "Indian",
        currentAddress: "E-202, Tech City, Hyderabad",
        city: "Hyderabad",
        state: "Telangana",
        zip: "500081"
      }
    }
  ];

  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const handleAddEmployee = (newEmp) => {
    const nextId = (employees.length + 1).toString().padStart(3, '0');
    const empToAdd = {
      ...newEmp,
      id: nextId,
      status: "Active",
      avatar: `https://ui-avatars.com/api/?name=${newEmp.name.replace(" ", "+")}&background=random&color=fff`,
      dept: newEmp.department,
      contact: newEmp.email,
      joinDate: newEmp.joinDate || new Date().toISOString().split('T')[0],
      designation: newEmp.role,
      details: {} // Initialize empty details
    };
    setEmployees([...employees, empToAdd]); // Add to end
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch =
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.contact.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDept = filters.department ? emp.dept === filters.department : true;
      const matchesRole = filters.role ? emp.designation === filters.role : true;
      const matchesStatus = filters.status ? emp.status === filters.status : true;

      return matchesSearch && matchesDept && matchesRole && matchesStatus;
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
  const uniqueDepts = [...new Set(employees.map(e => e.dept))];
  const uniqueRoles = [...new Set(employees.map(e => e.designation))];
  const uniqueStatuses = ["Active", "On Leave", "Resigned"];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full font-sans">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Employees</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your team members and their account details.</p>
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm shadow-sm flex-1 md:flex-none">
              <Download size={18} className="text-gray-500" /> Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow-md shadow-blue-500/20 transition-all text-sm active:scale-95 flex-1 md:flex-none"
            >
              <Plus size={18} /> Add Employee
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
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-50/50 outline-none transition-all shadow-sm placeholder:text-gray-400"
            />
            <div className="absolute left-3.5 top-2.5 text-gray-400">
              <Search size={18} />
            </div>
          </div>

          {/* Filters Group */}
          <div className="flex flex-wrap gap-3">
            {/* Dept Filter */}
            <div className="relative group">
              <select
                className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer min-w-[140px]"
                value={filters.department}
                onChange={(e) => { setFilters({ ...filters, department: e.target.value }); setCurrentPage(1); }}
              >
                <option value="">All Departments</option>
                {uniqueDepts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Role Filter */}
            <div className="relative group">
              <select
                className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer min-w-[140px]"
                value={filters.role}
                onChange={(e) => { setFilters({ ...filters, role: e.target.value }); setCurrentPage(1); }}
              >
                <option value="">All Roles</option>
                {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative group">
              <select
                className="appearance-none pl-3 pr-8 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 cursor-pointer min-w-[120px]"
                value={filters.status}
                onChange={(e) => { setFilters({ ...filters, status: e.target.value }); setCurrentPage(1); }}
              >
                <option value="">All Status</option>
                {uniqueStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {(filters.department || filters.role || filters.status) && (
              <button
                onClick={() => { setFilters({ department: "", role: "", status: "" }); setCurrentPage(1); }}
                className="px-3 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4 w-12 text-center">#</th>
                  <th className="p-4">Employee Name</th>
                  <th className="p-4">ID</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Email</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {paginatedEmployees.length > 0 ? (
                  paginatedEmployees.map((emp, index) => (
                    <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="p-4 text-center text-gray-400 text-xs text-center">
                        {((currentPage - 1) * itemsPerPage + index + 1).toString().padStart(2, '0')}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={emp.avatar} alt="" className="w-8 h-8 rounded-full bg-gray-100 object-cover" />
                          <span className="font-semibold text-gray-900">{emp.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-500 font-mono text-xs font-medium px-2 py-1 rounded w-fit">{emp.id}</td>
                      <td className="p-4 text-gray-700">{emp.dept}</td>
                      <td className="p-4 text-gray-700">{emp.designation}</td>

                      <td className="p-4 text-gray-500 text-xs">{emp.contact}</td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold tracking-wide border
                                    ${emp.status === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                            emp.status === "On Leave" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                              "bg-red-50 text-red-700 border-red-200"
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${emp.status === "Active" ? "bg-green-500" :
                            emp.status === "On Leave" ? "bg-yellow-500" : "bg-red-500"
                            }`}></span>
                          {emp.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/employee/${emp.id}`)}
                            className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors"
                            title="View Profile"
                          >
                            <Eye size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="p-8 text-center text-gray-500">
                      No employees found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500 bg-gray-50/30">
            <span>Showing {paginatedEmployees.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredEmployees.length)} of {filteredEmployees.length} entries</span>
            <div className="flex gap-2 text-sm font-medium">
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages || totalPages === 0}
                className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Add Employee Modal */}
      {showAddModal && <AddEmployeeModal onClose={() => setShowAddModal(false)} onSave={handleAddEmployee} />}
    </div>
  );
}
