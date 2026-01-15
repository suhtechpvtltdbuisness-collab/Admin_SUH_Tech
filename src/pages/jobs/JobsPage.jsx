import { Edit2, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Toast from "../../components/common/Toast";
import JobOpeningModal from "../../components/features/jobs/JobOpeningModal";
import api from "../../config/api";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    title: "",
    type: "Full-time",
    location: "",
    description: "",
    requirements: "",
    responsibilities: "",
    isActive: true,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

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
      showToast("Failed to load jobs: " + error.message, 'error');
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
        showToast("Job updated successfully!", 'success');
      } else {
        await api.createJob(payload);
        showToast("Job created successfully!", 'success');
      }

      await loadJobs();
      setIsModalOpen(false);
      setEditingJob(null);
    } catch (error) {
      console.error("Error saving job:", error);
      showToast("Failed to save job: " + error.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.deleteJob(id);
      showToast("Job deleted successfully!", 'success');
      await loadJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      showToast("Failed to delete job: " + error.message, 'error');
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
              Job Openings
            </h1>
            <p className="text-gray-600 text-sm">
              Manage careers/jobs that appear on the main website.
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <Plus size={20} /> New Job
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-transparent">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              All Jobs
            </h2>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">{jobs.length} Total</span>
          </div>

          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-sm">Loading jobs...</p>
            </div>
          ) : jobs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Plus size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                No job openings found. Create your first job posting!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-transparent border-b border-gray-200 text-xs text-gray-600 uppercase tracking-wider font-semibold">
                    <th className="p-4">Title</th>
                    <th className="p-4">Type</th>
                    <th className="p-4">Location</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {jobs.map((job) => (
                    <tr key={job._id} className="hover:bg-blue-50/30 transition-colors duration-150">
                      <td className="p-4 text-sm text-gray-900 font-medium">
                        {job.title}
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {job.type || "-"}
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {job.location || "-"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${job.isActive
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
                              : "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border border-gray-200"
                            }`}
                        >
                          {job.isActive ? "Active" : "Closed"}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500 font-medium">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveMenuId(
                                activeMenuId === job._id ? null : job._id
                              )
                            }
                            className="p-2.5 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-200 cursor-pointer"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {activeMenuId === job._id && (
                            <div className="origin-top-right absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white z-10">
                              <div className="py-1 text-sm">
                                <button
                                  onClick={() => openEditModal(job)}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(job._id)}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-red-600 hover:bg-red-50 cursor-pointer"
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
            {/* Outer container → handles rounded corners */}
            <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-hidden">

              {/* Inner container → handles scrolling */}
              <div className="max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold">
                    {editingJob ? "Edit Job" : "New Job"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingJob(null);
                    }}
                    className="text-gray-500 hover:text-gray-700 cursor-pointer"
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
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        {editingJob ? "Update" : "Create"} Job
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}

