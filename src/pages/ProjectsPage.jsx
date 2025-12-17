import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Plus, MoreVertical, Edit2, Trash2 } from "lucide-react";
import api from "../config/api";

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
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

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await api.getProjects();
      setProjects(res.projects || []);
    } catch (error) {
      console.error("Error loading projects:", error);
      alert("Failed to load projects: " + error.message);
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
        await api.updateProject(
          editingProject._id || editingProject.projectCode,
          payload
        );
      } else {
        await api.createProject(payload);
      }

      await loadProjects();
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error("Error saving project:", error);
      alert("Failed to save project: " + error.message);
    }
  };

  const handleDelete = async (idOrCode) => {
    if (!window.confirm("Are you sure you want to delete this project?")) {
      return;
    }
    try {
      await api.deleteProject(idOrCode);
      await loadProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Failed to delete project: " + error.message);
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Projects
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Manage all client projects from the main website.
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} /> New Project
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900 text-sm md:text-base">
              All Projects
            </h2>
            <span className="text-xs text-gray-500">
              Total: {projects.length}
            </span>
          </div>

          {loading ? (
            <p className="p-6 text-gray-500 text-sm">Loading projects...</p>
          ) : projects.length === 0 ? (
            <p className="p-6 text-gray-500 text-sm">
              No projects found. Create your first project!
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase">
                    <th className="p-3">Project</th>
                    <th className="p-3">Client</th>
                    <th className="p-3">Service Type</th>
                    <th className="p-3">Budget</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Dates</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {projects.map((p) => (
                    <tr key={p._id || p.projectCode}>
                      <td className="p-3">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-gray-900">
                            {p.projectName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {p.projectCode}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        <div className="flex flex-col">
                          <span>{p.clientName}</span>
                          <span className="text-xs text-gray-500">
                            {p.clientEmail}
                          </span>
                        </div>
                      </td>
                      <td className="p-3 text-sm text-gray-700">
                        {p.serviceType}
                      </td>
                      <td className="p-3 text-sm text-gray-900 font-semibold">
                        {formatCurrency(p.budget)}
                      </td>
                      <td className="p-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                            p.status === "Completed"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : p.status === "In Progress"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : p.status === "On Hold"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : "bg-gray-50 text-gray-600 border-gray-200"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-gray-500">
                        <div className="flex flex-col">
                          <span>Start: {formatDate(p.startDate)}</span>
                          <span>End: {formatDate(p.endDate)}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveMenuId(
                                activeMenuId === p._id ? null : p._id
                              )
                            }
                            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700"
                          >
                            <MoreVertical size={16} />
                          </button>
                          {activeMenuId === p._id && (
                            <div className="origin-top-right absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1 text-sm">
                                <button
                                  onClick={() => openEditModal(p)}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(p._id || p.projectCode)
                                  }
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
                  {editingProject ? "Edit Project" : "New Project"}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingProject(null);
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="endDate"
                      value={form.endDate}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingProject ? "Update" : "Create"} Project
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


