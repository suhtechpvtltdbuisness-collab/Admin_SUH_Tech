import { Edit2, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Toast from "../../components/common/Toast";
import JobOpeningModal from "../../components/features/jobs/JobOpeningModal";
import { authService, employeeService, jobService } from "../../services";

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

  const getErrorMessage = (error) => {
    try {
      const msg = error.message || "";
      if (msg.includes("HTTP error!")) {
        const jsonStrMatch = msg.match(/message:\s*({.*})/);
        if (jsonStrMatch && jsonStrMatch[1]) {
          const parsed = JSON.parse(jsonStrMatch[1]);
          return parsed.message || "An error occurred";
        }
      }
    } catch (e) {
      // ignore parsing error
    }
    return error.message || "An unexpected error occurred.";
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const res = await jobService.getAllJobs();
      const data = res.data || res.jobs || res;
      let jobsList = Array.isArray(data) ? data : [];
      
      // Normalize data to handle both 'active' and 'isActive'
      jobsList = jobsList.map(job => ({
        ...job,
        isActive: job.active !== undefined ? job.active : (job.isActive ?? true)
      }));
      setJobs(jobsList);
    } catch (error) {
      console.error("Error loading jobs:", error);
      showToast(getErrorMessage(error), "error");
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
        active: form.isActive,
      };

      if (editingJob) {
        const jobId = editingJob._id || editingJob.id;
        await jobService.updateJob(jobId, payload);
        showToast("Job updated successfully!", "success");
      } else {
        await jobService.createJob(payload);
        showToast("Job created successfully!", "success");
      }

      await loadJobs();
      setIsModalOpen(false);
      setEditingJob(null);
    } catch (error) {
      console.error("Error saving job:", error);
      showToast(getErrorMessage(error), "error");
    }
  };

  const handleDelete = async (id) => {
    try {
      await jobService.deleteJob(id);
      showToast("Job deleted successfully!", "success");
      await loadJobs();
    } catch (error) {
      console.error("Error deleting job:", error);
      showToast(getErrorMessage(error), "error");
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
    <div className="min-h-screen bg-linear-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6 lg:p-10">
      <div className="max-w-8xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
              Job Openings
            </h1>
            <p className="text-gray-600 text-sm">
              Manage careers/jobs that appear on the main website.
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-linear-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <Plus size={20} /> New Job
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-linear-to-r from-gray-50 to-transparent">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-linear-to-b from-blue-500 to-purple-600 rounded-full"></div>
              All Jobs
            </h2>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
              {jobs.length} Total
            </span>
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
                  <tr className="bg-linear-to-r from-gray-50 to-transparent border-b border-gray-200 text-xs text-gray-600 uppercase tracking-wider font-semibold">
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
                    <tr
                      key={job._id}
                      className="hover:bg-blue-50/30 transition-colors duration-150"
                    >
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
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${
                            job.isActive
                              ? "bg-linear-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
                              : "bg-linear-to-r from-gray-50 to-slate-50 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {job.isActive ? "Active" : "Closed"}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500 font-medium">
                        {formatDate(job.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 text-left">
                          <button
                            onClick={() => openEditModal(job)}
                            className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(job._id || job.id)}
                            className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
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
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
}
