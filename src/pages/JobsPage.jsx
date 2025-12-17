import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import api from "../config/api";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [form, setForm] = useState({
    title: "",
    type: "Full-time",
    location: "",
    description: "",
    requirements: "",
    responsibilities: "",
    isActive: true,
  });

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await api.getJobs();
      setJobs(res.jobs || []);
    } catch (error) {
      console.error("Error loading jobs:", error);
      alert("Failed to load jobs: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const openNewModal = () => {
    setEditingJob(null);
    setForm({
      title: "",
      type: "Full-time",
      location: "",
      description: "",
      requirements: "",
      responsibilities: "",
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (job) => {
    setEditingJob(job);
    setForm({
      title: job.title || "",
      type: job.type || "Full-time",
      location: job.location || "",
      description: job.description || "",
      requirements: (job.requirements || []).join("\n"),
      responsibilities: (job.responsibilities || []).join("\n"),
      isActive: job.isActive ?? true,
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        type: form.type,
        location: form.location,
        description: form.description,
        requirements: form.requirements
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        responsibilities: form.responsibilities
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean),
        isActive: form.isActive,
      };

      if (editingJob) {
        await api.updateJob(editingJob._id, payload);
      } else {
        await api.createJob(payload);
      }

      await loadJobs();
      setIsModalOpen(false);
      setEditingJob(null);
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Failed to save job: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) {
      return;
    }
    try {
      await api.deleteJob(id);
      await loadJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("Failed to delete job: " + error.message);
    }
    setActiveMenuId(null);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Job Openings
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage careers/jobs that appear on the main website.
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} /> New Job
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 text-sm md:text-base">
              All Jobs
            </h2>
            <span className="text-xs text-gray-500">Total: {jobs.length}</span>
          </div>

          {loading ? (
            <p className="p-6 text-gray-500 text-sm">Loading jobs...</p>
          ) : jobs.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">
              No job openings found. Create your first job posting!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                    <th className="p-3">Title</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Created</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobs.map((job) => (
                    <tr key={job._id}>
                      <td className="p-3 text-sm text-gray-900 font-medium">
                        {job.title}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {job.type || "-"}
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {job.location || "-"}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            job.isActive
                              ? "bg-green-50 text-green-700 border-green-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {job.isActive ? "Active" : "Closed"}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="p-3 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveMenuId(
                                activeMenuId === job._id ? null : job._id
                              )
                            }
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {activeMenuId === job._id && (
                            <div className="origin-top-right absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1 text-sm">
                                <button
                                  onClick={() => openEditModal(job)}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(job._id)}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
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

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold">
                  {editingJob ? "Edit Job" : "New Job"}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingJob(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={form.title}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Job Type
                    </label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option>Full-time</option>
                      <option>Part-time</option>
                      <option>Contract</option>
                      <option>Internship</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="Remote / City"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Responsibilities (one per line)
                  </label>
                  <textarea
                    name="responsibilities"
                    value={form.responsibilities}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Requirements (one per line)
                  </label>
                  <textarea
                    name="requirements"
                    value={form.requirements}
                    onChange={handleChange}
                    rows={3}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                    />
                    Active (visible on website)
                  </label>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingJob(null);
                      }}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingJob ? "Update" : "Create"} Job
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


