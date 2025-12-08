import React from "react";
import { X } from "lucide-react";

export default function JobOpeningModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl mx-4 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold">Add New Job Opening</h2>
            <p className="text-gray-500 text-sm">
              Fill in the details below to create a new job posting.
            </p>
          </div>
          

          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
            <X size={20} />
          </button>
        </div>
        

        {/* Form */}
        <form className="p-6 grid grid-cols-2 gap-6">

          {/* Job Title */}
          <div>
            <label className="text-sm font-medium">Job Title</label>
            <input
              type="text"
              placeholder="e.g., UI/UX Designer, Frontend Developer"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          {/* Department */}
          <div>
            <label className="text-sm font-medium">Department</label>
            <select className="mt-1 w-full p-3 border border-gray-300  rounded-lg bg-gray-50">
              <option>Select Department</option>
              <option>Finance</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Human Resources</option>
              <option>Operations</option>
              <option>Sales</option>
              
            </select>
          </div>

          {/* Employment Type */}
          <div>
            <label className="text-sm font-medium">Employment Type</label>
            <select className="mt-1 w-full p-3 border border-gray-300  rounded-lg bg-gray-50">
              <option>Select Employment Type</option>
              <option>Full-time</option>
                <option>Part-time</option>
                <option>Contract</option>
                <option>Internship</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="text-sm font-medium">Location</label>
            <input
              type="text"
              placeholder="e.g., Mumbai, Remote, On-site"
              className="mt-1 w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
            />
          </div>

          {/* Responsibilities */}
          <div className="col-span-1">
            <label className="text-sm font-medium">
              Key Responsibilities <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              rows="4"
              placeholder="List the primary responsibilities for this role..."
              className="mt-1 w-full p-3 border border-gray-300  rounded-lg bg-gray-50"
            ></textarea>
          </div>

          {/* Required Skills */}
          <div>
            <label className="text-sm font-medium">
              Required Skills <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              rows="4"
              placeholder="Add required technical and soft skills..."
              className="mt-1 w-full p-3 border border-gray-300  rounded-lg bg-gray-50"
            ></textarea>
          </div>

          {/* Experience */}
          <div>
            <label className="text-sm font-medium">Minimum Experience</label>
            <select className="mt-1 w-full p-3 border border-gray-300  rounded-lg bg-gray-50">
              <option>Select Experience</option>
            </select>
          </div>

          {/* Salary Range */}
          <div>
            <label className="text-sm font-medium">Salary Range (Optional)</label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="e.g., 3 LPA"
                className="w-1/2 p-3 border border-gray-300 rounded-lg bg-gray-50"
              />
              <input
                type="text"
                placeholder="e.g., 6 LPA"
                className="w-1/2 p-3 border rounded-lg bg-gray-50"
              />
            </div>
          </div>

          {/* Job Description */}
          <div className="col-span-2">
            <label className="text-sm font-medium">
              Job Description <span className="text-gray-400">(Optional)</span>
            </label>
            <textarea
              rows="4"
              placeholder="Write the complete job description here..."
              className="mt-1 w-full p-3 border border-gray-300  rounded-lg bg-gray-50"
            ></textarea>
          </div>

          {/* Application Email */}
          <div className="col-span-2">
            <label className="text-sm font-medium">Application Email</label>
            <input
              type="email"
              placeholder="Enter email where applicants will send resumes"
              className="mt-1 w-full p-3 border border-gray-300  rounded-lg bg-gray-50"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200  bg-gray-50  ">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300  rounded-lg hover:bg-gray-100 cursor-pointer"
          >
            Cancel
          </button>

          <button className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
            Save Job Opening
          </button>
        </div>
      </div>
    </div>
  );
}
