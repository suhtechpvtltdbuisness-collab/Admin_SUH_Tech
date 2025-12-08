import React, { useState } from "react";
import { Search, Filter, Plus, ChevronDown, Eye, Edit2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AddEmployeeModal from "../components/employee/AddEmployeeModal";

export default function EmployeePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Initial Data
  const [employees, setEmployees] = useState([
    {
      id: "Emp-00123",
      name: "Olivia Rhye",
      designation: "Software Engineer",
      dept: "Engineering",
      joinDate: "15 Jan 2022",
      contact: "Olivia.R@Corp.Com",
      status: "Active",
      avatar: "https://ui-avatars.com/api/?name=Olivia+Rhye&background=random&color=fff"
    },
    {
      id: "Emp-00124",
      name: "Phoenix Baker",
      designation: "Product Manager",
      dept: "Product",
      joinDate: "20 Feb 2022",
      contact: "Phoenix.B@Corp.Com",
      status: "Active",
      avatar: "https://ui-avatars.com/api/?name=Phoenix+Baker&background=random&color=fff"
    },
    {
      id: "Emp-00125",
      name: "Lana Steiner",
      designation: "UI/UX Designer",
      dept: "Design",
      joinDate: "10 Mar 2022",
      contact: "Lana.S@Corp.Com",
      status: "On Leave",
      avatar: "https://ui-avatars.com/api/?name=Lana+Steiner&background=random&color=fff"
    },
    {
      id: "Emp-00126",
      name: "Demi Wilkinson",
      designation: "Backend Dev",
      dept: "Engineering",
      joinDate: "05 Apr 2022",
      contact: "Demi.W@Corp.Com",
      status: "Active",
      avatar: "https://ui-avatars.com/api/?name=Demi+Wilkinson&background=random&color=fff"
    },
    {
      id: "Emp-00127",
      name: "Candice Wu",
      designation: "HR Manager",
      dept: "HR",
      joinDate: "12 May 2022",
      contact: "Candice.W@Corp.Com",
      status: "Resigned",
      avatar: "https://ui-avatars.com/api/?name=Candice+Wu&background=random&color=fff"
    }
  ]);

  const handleAddEmployee = (newEmp) => {
    const empToAdd = {
      ...newEmp,
      id: `Emp-${(100 + employees.length + 1).toString().padStart(5, '0')}`,
      status: "Active",
      avatar: `https://ui-avatars.com/api/?name=${newEmp.name.replace(" ", "+")}&background=random&color=fff`,
      dept: newEmp.department,
      contact: newEmp.email,
      joinDate: newEmp.joinDate || "Today"
    };
    setEmployees([...employees, empToAdd]);
  };

  const filteredEmployees = employees.filter(emp => {
    return emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8 md:p-10 overflow-y-auto w-full">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-3xl font-bold text-gray-900">Employee List</h2>

          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors text-sm shadow-sm">
              Export
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg shadow-blue-500/20 transition-all text-sm active:scale-95"
            >
              <Plus size={18} /> Add Employee
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="relative flex-1 min-w-[300px]">
            <input
              type="text"
              placeholder="Search by name, id, email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-4 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all shadow-sm"
            />
            <div className="absolute right-3 top-2.5 text-gray-400">
              <Search size={18} />
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
              Department <ChevronDown size={14} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
              Designation <ChevronDown size={14} />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
              Status <ChevronDown size={14} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-200 text-gray-500 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4 w-10"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-gray-300" /></th>
                  <th className="p-4">Sr No</th>
                  <th className="p-4">Emp Name</th>
                  <th className="p-4">Emp ID</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Designation</th>
                  <th className="p-4">Joining Date</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-100">
                {filteredEmployees.map((emp, index) => (
                  <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4"><input type="checkbox" className="rounded text-blue-600 focus:ring-blue-500 border-gray-300" /></td>
                    <td className="p-4 text-gray-500 font-medium">{(index + 1).toString().padStart(2, '0')}</td>
                    <td className="p-4">
                      <button onClick={() => navigate(`/employee/${emp.id}`)} className="font-medium text-gray-900 hover:text-blue-600">
                        {emp.name}
                      </button>
                    </td>
                    <td className="p-4 text-gray-500">{emp.id}</td>
                    <td className="p-4 text-gray-900">{emp.dept}</td>
                    <td className="p-4 text-gray-900">{emp.designation}</td>
                    <td className="p-4 text-gray-500">{emp.joinDate}</td>
                    <td className="p-4 text-gray-500">{emp.contact}</td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border
                                ${emp.status === "Active" ? "bg-green-50 text-green-700 border-green-200" :
                          emp.status === "On Leave" ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                            "bg-red-50 text-red-700 border-red-200"
                        }`}>
                        {emp.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/employee/${emp.id}`)}
                          className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50"
                        >
                          <Eye size={18} />
                        </button>
                        <button className="text-gray-400 hover:text-blue-600 transition-colors p-1.5 rounded-lg hover:bg-blue-50">
                          <Edit2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center text-sm text-gray-500">
            <span>Showing 1-10 of 100</span>
            <div className="flex gap-2 text-sm font-medium">
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Previous</button>
              <button className="px-3 py-1 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600">Next</button>
            </div>
          </div>
        </div>
      </main>

      {/* Add Employee Modal */}
      {showAddModal && <AddEmployeeModal onClose={() => setShowAddModal(false)} onSave={handleAddEmployee} />}
    </div>
  );
}
