import React, { useState } from "react";
import { X } from "lucide-react";

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
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Employee</h2>
            <p className="text-gray-500 text-sm mt-1">
              Enter employee details below to create a new profile.
            </p>
          </div>

          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-700 cursor-pointer">
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <div className="overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Employee Name */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Employee Name</label>
              <input
                type="text"
                placeholder="e.g., John Doe"
                onChange={(e) => updateField("name", e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
                required
              />
            </div>

            {/* Role */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Role / Designation</label>
              <input
                type="text"
                placeholder="e.g., Frontend Developer"
                onChange={(e) => updateField("role", e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
                required
              />
            </div>

            {/* Department */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Department</label>
              <select
                onChange={(e) => updateField("department", e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
                required
              >
                <option value="">Select Department</option>
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
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Mobile Number</label>
              <input
                type="tel"
                placeholder="e.g., +91 9876543210"
                onChange={(e) => updateField("phone", e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email Address</label>
              <input
                type="email"
                placeholder="e.g., john@company.com"
                onChange={(e) => updateField("email", e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
                required
              />
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Work Location / City</label>
              <input
                type="text"
                placeholder="e.g., Mumbai"
                onChange={(e) => updateField("location", e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
                required
              />
            </div>

            {/* Join Date */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Joining Date</label>
              <input
                type="date"
                onChange={(e) => updateField("joinDate", e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm text-gray-500"
                required
              />
            </div>

            {/* Employment Type */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Employment Type</label>
              <select
                onChange={(e) => updateField("employmentType", e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
                required
              >
                <option value="">Select Type</option>
                <option>Full-time</option>
                <option>Part-time</option>
                <option>Internship</option>
                <option>Contract</option>
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Experience</label>
              <select
                onChange={(e) => updateField("experience", e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all text-sm"
              >
                <option value="">Select Experience</option>
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
        <div className="p-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-100 text-sm font-semibold text-gray-700 transition-colors"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            type="submit"
            className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-semibold shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
          >
            Save Employee
          </button>
        </div>

      </div>
    </div>
  );
}
