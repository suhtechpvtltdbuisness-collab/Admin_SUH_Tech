import React, { useState } from "react";
import { X, Asterisk } from "lucide-react";

export default function AddEmployeeModal({ onClose, onSave }) {
  // Form State
  const [form, setForm] = useState({
    name: "",
    role: "",
    department: "",
    employmentType: "",
    email: "",
    phone: "",
    location: "",
    joinDate: "",
    experience: "",
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Basic HTML validation handles the 'required' checks. 
    // We just pass data strictly if valid.
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-slideUp">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Creating a new account in directory.
            </p>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="overflow-y-auto p-8">
          <form id="addEmployeeForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {/* Employee Name */}
            <div>
              <Label label="Employee Name" required />
              <input
                type="text"
                placeholder="e.g., John Doe"
                onChange={(e) => updateField("name", e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Role */}
            <div>
              <Label label="Role / Designation" required />
              <input
                type="text"
                placeholder="e.g., Frontend Developer"
                onChange={(e) => updateField("role", e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Department */}
            <div>
              <Label label="Department" required />
              <select
                onChange={(e) => updateField("department", e.target.value)}
                className="input-field"
                required
                defaultValue=""
              >
                <option value="" disabled>Select Department</option>
                <option>Engineering</option>
                <option>Design</option>
                <option>Product</option>
                <option>Finance</option>
                <option>HR</option>
                <option>Marketing</option>
                <option>Sales</option>
              </select>
            </div>

            {/* Mobile Number */}
            <div>
              <Label label="Mobile Number" required />
              <input
                type="tel"
                placeholder="e.g., +91 9876543210"
                onChange={(e) => updateField("phone", e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label label="Email Address" required />
              <input
                type="email"
                placeholder="e.g., john@company.com"
                onChange={(e) => updateField("email", e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Location */}
            <div>
              <Label label="Work Location" required />
              <input
                type="text"
                placeholder="e.g., Mumbai, India"
                onChange={(e) => updateField("location", e.target.value)}
                className="input-field"
                required
              />
            </div>

            {/* Join Date */}
            <div>
              <Label label="Joining Date" required />
              <input
                type="date"
                onChange={(e) => updateField("joinDate", e.target.value)}
                className="input-field text-gray-500"
                required
              />
            </div>

            {/* Employment Type */}
            <div>
              <Label label="Employment Type" required />
              <select
                onChange={(e) => updateField("employmentType", e.target.value)}
                className="input-field"
                required
                defaultValue=""
              >
                <option value="" disabled>Select Type</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
                <option>Contract</option>
              </select>
            </div>

            {/* Experience */}
            <div>
              <Label label="Experience" required />
              <select
                onChange={(e) => updateField("experience", e.target.value)}
                className="input-field"
                required
                defaultValue=""
              >
                <option value="" disabled>Select Experience</option>
                <option>Fresher</option>
                <option>0–1 years</option>
                <option>1–3 years</option>
                <option>3–5 years</option>
                <option>5–10 years</option>
                <option>10+ years</option>
              </select>
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
