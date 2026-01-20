import { Edit2, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Toast from "../../components/common/Toast";
import { authService, employeeService, projectService } from "../../services";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    projectName: "",
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    description: "",
    serviceType: "Web Development",
    startDate: "",
    endDate: "",
    status: "Planning",
    budget: "",
    technologies: "",
  });

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await projectService.getAllProjects();
      setProjects(res.projects || res.data || res || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      showToast("Failed to load projects: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openNewModal = () => {
    setEditingProject(null);
    setForm({
      projectName: "",
      clientName: "",
      clientEmail: "",
      clientPhone: "",
      clientAddress: "",
      description: "",
      serviceType: "Web Development",
      startDate: "",
      endDate: "",
      status: "Planning",
      budget: "",
      technologies: "",
    });
    setIsModalOpen(true);
  };

  const openEditModal = (project) => {
    setEditingProject(project);
    setForm({
      projectName: project.projectName || "",
      clientName: project.clientName || "",
      clientEmail: project.clientEmail || "",
      clientPhone: project.clientPhone || "",
      clientAddress: project.clientAddress || "",
      description: project.description || "",
      serviceType: project.serviceType || "Web Development",
      startDate: project.startDate
        ? new Date(project.startDate).toISOString().split("T")[0]
        : "",
      endDate: project.endDate
        ? new Date(project.endDate).toISOString().split("T")[0]
        : "",
      status: project.status || "Planning",
      budget: project.budget || "",
      technologies: (project.technologies || []).join(", "),
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        projectName: form.projectName,
        clientName: form.clientName,
        clientEmail: form.clientEmail,
        clientPhone: form.clientPhone,
        clientAddress: form.clientAddress,
        description: form.description,
        serviceType: form.serviceType,
        startDate: form.startDate ? new Date(form.startDate) : undefined,
        endDate: form.endDate ? new Date(form.endDate) : undefined,
        status: form.status,
        budget: parseFloat(form.budget) || 0,
        technologies: form.technologies
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      };

      if (editingProject) {
        await projectService.updateProjectById(
          editingProject._id || editingProject.projectCode,
          payload,
        );
        showToast("Project updated successfully!", "success");
      } else {
        await projectService.createProject(payload);
        showToast("Project created successfully!", "success");
      }

      await loadProjects();
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error("Error saving project:", error);
      showToast("Failed to save project: " + error.message, "error");
    }
  };

  const handleDelete = async (idOrCode) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }
    try {
      await projectService.deleteProjectById(idOrCode);
      showToast("Project deleted successfully!", "success");
      await loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      showToast("Failed to delete project: " + error.message, "error");
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

  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString("en-IN")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2 cursor-pointer">
              Projects
            </h1>
            <p className="text-gray-600 text-sm">
              Manage all client projects from the main website.
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
          >
            <Plus size={20} /> New Project
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-transparent">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              All Projects
            </h2>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
              {projects.length} Total
            </span>
          </div>

          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-sm">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Plus size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                No projects found. Create your first project!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-transparent border-b border-gray-200 text-xs text-gray-600 uppercase tracking-wider font-semibold">
                    <th className="p-4">Project Name</th>
                    <th className="p-4">Project ID</th>
                    <th className="p-4">Client Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Service Type</th>
                    <th className="p-4">Budget</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Start Date</th>
                    <th className="p-4">End Date</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map((p) => (
                    <tr
                      key={p._id || p.projectCode}
                      className="hover:bg-blue-50/30 transition-colors duration-150"
                    >
                      <td className="p-4">
                        <span className="font-medium text-sm text-gray-900">
                          {p.projectName}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-xs text-gray-500">
                          {p.projectCode}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {p.clientName}
                      </td>
                      <td className="p-4 text-sm text-blue-600">
                        {p.clientEmail}
                      </td>
                      <td className="p-4 text-sm text-gray-700">
                        {p.serviceType}
                      </td>
                      <td className="p-4 text-sm text-gray-900 font-semibold">
                        {formatCurrency(p.budget)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${
                            p.status === "Completed"
                              ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
                              : p.status === "In Progress"
                                ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200"
                                : p.status === "On Hold"
                                  ? "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200"
                                  : "bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border border-gray-200"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(p.startDate)}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(p.endDate)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveMenuId(
                                activeMenuId === p._id ? null : p._id,
                              )
                            }
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 cursor-pointer"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {activeMenuId === p._id && (
                            <div className="origin-top-right absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white z-10">
                              <div className="py-1 text-sm">
                                <button
                                  onClick={() => openEditModal(p)}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50 cursor-pointer"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(p._id || p.projectCode)
                                  }
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
            <div className="w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-hidden bg-white">
              {/* Scrollable content INSIDE */}
              <div className="max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-4 border-b border-gray-100">
                  <h2 className="text-lg font-semibold">
                    {editingProject ? "Edit Project" : "New Project"}
                  </h2>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingProject(null);
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
                        Project Name
                      </label>
                      <input
                        type="text"
                        name="projectName"
                        value={form.projectName}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Service Type
                      </label>
                      <select
                        name="serviceType"
                        value={form.serviceType}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer"
                      >
                        <option>Web Development</option>
                        <option>Mobile Development</option>
                        <option>Cloud Services</option>
                        <option>DevOps</option>
                        <option>Consulting</option>
                        <option>Maintenance</option>
                        <option>Custom Software</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Name
                      </label>
                      <input
                        type="text"
                        name="clientName"
                        value={form.clientName}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Email
                      </label>
                      <input
                        type="email"
                        name="clientEmail"
                        value={form.clientEmail}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Client Phone
                      </label>
                      <input
                        type="text"
                        name="clientPhone"
                        value={form.clientPhone}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Budget (INR)
                      </label>
                      <input
                        type="number"
                        name="budget"
                        value={form.budget}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client Address
                    </label>
                    <input
                      type="text"
                      name="clientAddress"
                      value={form.clientAddress}
                      onChange={handleChange}
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

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={form.startDate}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1 cursor-pointer">
                        End Date
                      </label>
                      <input
                        type="date"
                        name="endDate"
                        value={form.endDate}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Technologies (comma separated)
                    </label>
                    <input
                      type="text"
                      name="technologies"
                      value={form.technologies}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm cursor-pointer"
                      >
                        <option>Planning</option>
                        <option>In Progress</option>
                        <option>On Hold</option>
                        <option>Completed</option>
                        <option>Cancelled</option>
                      </select>
                    </div>

                    <div className="space-x-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          setEditingProject(null);
                        }}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
                      >
                        {editingProject ? "Update" : "Create"} Project
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
