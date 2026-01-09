import { X } from "lucide-react";
import { useState } from "react";

export default function AddEmployeeModal({ onClose, onSave }) {
  // Form State - matching backend Employee model
  const [form, setForm] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    designation: "",
    department: "",
    skills: "",
    joiningDate: "",
    employeeType: "Full-time",
    address: ""
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Transform skills from comma-separated string to array
    const dataToSave = {
      ...form,
      phone: `+91 ${form.phone}`,
      skills: form.skills.split(',').map(s => s.trim()).filter(Boolean)
    };

    onSave(dataToSave);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slideUp">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 via-purple-50 to-transparent">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Creating a new employee account in the system.
            </p>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-white rounded-xl transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="overflow-y-auto p-8">
          <form id="addEmployeeForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {/* Employee ID */}
            <div>
              <Label label="Employee ID" required />
              <input
                type="text"
                placeholder="e.g., EMP-0001"
                value={form.employeeId}
                onChange={(e) => updateField("employeeId", e.target.value)}
                className="input-field"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Format: EMP-XXXX (e.g., EMP-0001)</p>
            </div>

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
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm border-r pr-2 border-gray-300 pointer-events-none select-none">
                  +91
                </span>
                <input
                  type="text"
                  placeholder=""
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                    updateField("phone", val);
                  }}
                  className="input-field !pl-14"
                  required
                  pattern="[0-9]{10}"
                  title="Please enter a valid 10-digit mobile number"
                />
              </div>
            </div>

            {/* Designation */}
            <div>
              <Label label="Designation / Role" required />
              <input
                type="text"
                placeholder="e.g., Senior Developer"
                value={form.designation}
                onChange={(e) => updateField("designation", e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Department */}
            <div>
              <Label label="Department" required />
              <select
                value={form.department}
                onChange={(e) => updateField("department", e.target.value)}
                className="input-field"
                required
              >
                <option value="">Select Department</option>
                <option>Development</option>
                <option>Design</option>
                <option>DevOps</option>
                <option>QA</option>
                <option>Management</option>
                <option>Sales</option>
                <option>Support</option>
                <option>Other</option>
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <Label label="Employment Type" required />
              <select
                value={form.employeeType}
                onChange={(e) => updateField("employeeType", e.target.value)}
                className="input-field"
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Intern">Intern</option>
              </select>
            </div>

            {/* Join Date */}
            <div>
              <Label label="Joining Date" required />
              <input
                type="date"
                value={form.joiningDate}
                onChange={(e) => updateField("joiningDate", e.target.value)}
                className="input-field text-gray-500"
                required
              />
            </div>

            {/* Skills */}
            <div>
              <Label label="Skills (comma separated)" />
              <input
                type="text"
                placeholder="e.g., React, Node.js, MongoDB"
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
            className="px-8 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            Create
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
