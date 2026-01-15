import { X } from "lucide-react";
import { useState, useEffect } from "react";
import {
  employeeService,
  departmentService,
  designationService,
} from "../../services";

export default function AddEmployeeModal({ onClose, onSave }) {
  // Form State - matching backend Employee model
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    address: "",
    admin: false,
    departmentId: "",
    designationId: "",
    joinedDate: "",
    skills: "",
    active: true,
    empType: "full-time",
  });

  // State for dropdown data
  const [departments, setDepartments] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Fetch departments and designations on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptResponse, desigResponse] = await Promise.all([
          departmentService.getAllDepartments(),
          designationService.getAllDesignations(),
        ]);
        setDepartments(deptResponse || []);
        setDesignations(desigResponse || []);
      } catch (error) {
        console.error("Error fetching departments/designations:", error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (!form.email || !form.firstName || !form.lastName) {
        alert("Please fill in all required fields: Email, First Name, and Last Name");
        setLoading(false);
        return;
      }

      if (!form.departmentId || !form.designationId) {
        alert("Please select both Department and Designation");
        setLoading(false);
        return;
      }

      // Prepare data for API
      const dataToSave = {
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber,
        address: form.address,
        admin: form.admin,
        departmentId: parseInt(form.departmentId),
        designationId: parseInt(form.designationId),
        joinedDate: form.joinedDate,
        skills: form.skills,
        active: form.active,
        empType: form.empType,
      };

      // Validate parsed IDs
      if (isNaN(dataToSave.departmentId) || isNaN(dataToSave.designationId)) {
        alert("Invalid department or designation selected");
        setLoading(false);
        return;
      }

      // Call API to create employee
      const response = await employeeService.createEmployee(dataToSave);
      onSave(response);
      onClose();
    } catch (error) {
      console.error("Error creating employee:", error);
      alert("Error creating employee: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slideUp">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-purple-50 to-transparent">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Add New Employee
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Creating a new employee account in the system.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-xl transition-colors text-gray-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="overflow-y-auto p-8">
          {loadingData ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">
                Loading departments and designations...
              </div>
            </div>
          ) : (
            <form
              id="addEmployeeForm"
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6"
            >
              {/* First Name */}
              <div>
                <Label label="First Name" required />
                <input
                  type="text"
                  placeholder="e.g., John"
                  value={form.firstName}
                  onChange={(e) => updateField("firstName", e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {/* Last Name */}
              <div>
                <Label label="Last Name" required />
                <input
                  type="text"
                  placeholder="e.g., Doe"
                  value={form.lastName}
                  onChange={(e) => updateField("lastName", e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <Label label="Email Address" required />
                <input
                  type="email"
                  placeholder="e.g., john.doe@company.com"
                  value={form.email}
                  onChange={(e) => updateField("email", e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              {/* Mobile Number */}
              <div>
                <Label label="Phone Number" required />
                <input
                  type="text"
                  placeholder="e.g., 1234567890"
                  value={form.phoneNumber}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    updateField("phoneNumber", val);
                  }}
                  className="input-field"
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                />
              </div>

              {/* Designation */}
              <div>
                <Label label="Designation / Role" required />
                <select
                  value={form.designationId}
                  onChange={(e) => updateField("designationId", e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Designation</option>
                  {designations.map((designation) => (
                    <option key={designation.id} value={designation.id}>
                      {designation.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department */}
              <div>
                <Label label="Department" required />
                <select
                  value={form.departmentId}
                  onChange={(e) => updateField("departmentId", e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="">Select Department</option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employment Type */}
              <div>
                <Label label="Employment Type" required />
                <select
                  value={form.empType}
                  onChange={(e) => updateField("empType", e.target.value)}
                  className="input-field"
                  required
                >
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
              </div>

              {/* Join Date */}
              <div>
                <Label label="Joining Date" required />
                <input
                  type="date"
                  value={form.joinedDate}
                  onChange={(e) => updateField("joinedDate", e.target.value)}
                  className="input-field text-gray-500"
                  required
                />
              </div>

              {/* Skills */}
              <div>
                <Label label="Skills" />
                <input
                  type="text"
                  placeholder="e.g., JavaScript, TypeScript, Node.js"
                  value={form.skills}
                  onChange={(e) => updateField("skills", e.target.value)}
                  className="input-field"
                />
              </div>

              {/* Address - Full Width */}
              <div className="md:col-span-2">
                <Label label="Address" />
                <textarea
                  placeholder="e.g., 123 Main Street, Mumbai, Maharashtra"
                  value={form.address}
                  onChange={(e) => updateField("address", e.target.value)}
                  className="input-field"
                  rows={3}
                />
              </div>
            </form>
          )}
        </div>

        {/* FOOTER */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-xl hover:bg-gray-100 text-sm font-semibold text-gray-700 transition-colors"
          >
            Cancel
          </button>

          <button
            form="addEmployeeForm"
            type="submit"
            disabled={loading || loadingData}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 0.75rem;
          background-color: #f9fafb;
          font-size: 0.875rem;
          color: #1f2937;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          background-color: #fff;
          border-color: #3b82f6;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}

function Label({ label, required }) {
  return (
    <label className="text-xs font-semibold text-gray-600 mb-1.5 block uppercase tracking-wide">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
  );
}
