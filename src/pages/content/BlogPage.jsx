import { Edit2, MoreVertical, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import Toast from "../../components/common/Toast";
import api from "../../config/api";

export default function BlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    imageUrl: "",
    category: "",
    tags: "",
    isPublished: false,
  });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const res = await api.getBlogs();
      setBlogs(res.blogs || []);
    } catch (error) {
      console.error("Error loading blogs:", error);
      showToast("Failed to load blogs: " + error.message, 'error');
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
    setEditingBlog(null);
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      imageUrl: "",
      category: "",
      tags: "",
      isPublished: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (blog) => {
    setEditingBlog(blog);
    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      imageUrl: blog.imageUrl || "",
      category: blog.category || "",
      tags: (blog.tags || []).join(", "),
      isPublished: blog.isPublished || false,
    });
    setIsModalOpen(true);
    setActiveMenuId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: form.title,
        slug: form.slug || undefined,
        excerpt: form.excerpt,
        content: form.content,
        imageUrl: form.imageUrl,
        category: form.category,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isPublished: form.isPublished,
      };

      if (editingBlog) {
        await api.updateBlog(editingBlog._id || editingBlog.slug, payload);
        showToast("Blog post updated successfully!", 'success');
      } else {
        await api.createBlog(payload);
        showToast("Blog post created successfully!", 'success');
      }

      await loadBlogs();
      setIsModalOpen(false);
      setEditingBlog(null);
    } catch (error) {
      console.error("Error saving blog:", error);
      showToast("Failed to save blog: " + error.message, 'error');
    }
  };

  const handleDelete = async (idOrSlug) => {
    try {
      await api.deleteBlog(idOrSlug);
      showToast("Blog post deleted successfully!", 'success');
      await loadBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      showToast("Failed to delete blog: " + error.message, 'error');
    }
    setActiveMenuId(null);
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6 lg:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent mb-2">
              Blog Posts
            </h1>
            <p className="text-gray-600 text-sm">
              Manage all blog posts shown on the main website.
            </p>
          </div>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Plus size={20} /> New Blog Post
          </button>
        </div>

        {/* Table Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-transparent">
            <h2 className="font-bold text-lg text-gray-900 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
              All Blog Posts
            </h2>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
              {blogs.length} Total
            </span>
          </div>

          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-sm">Loading blogs...</p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <Plus size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                No blog posts found. Create your first blog post!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-transparent border-b border-gray-200 text-xs text-gray-600 uppercase tracking-wider font-semibold">
                    <th className="p-4">Title</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Created</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {blogs.map((blog) => (
                    <tr key={blog._id || blog.slug} className="hover:bg-blue-50/30 transition-colors duration-150">
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-gray-900">
                            {blog.title}
                          </span>
                          <span className="text-xs text-gray-500">
                            /blog/{blog.slug}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-700 font-medium">
                        {blog.category || "-"}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-semibold ${blog.isPublished
                            ? "bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200"
                            : "bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border border-amber-200"
                            }`}
                        >
                          {blog.isPublished ? "Published" : "Draft"}
                        </span>
                      </td>
                      <td className="p-4 text-xs text-gray-500 font-medium">
                        {formatDate(blog.createdAt)}
                      </td>
                      <td className="p-4 text-right">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() =>
                              setActiveMenuId(
                                activeMenuId === blog._id ? null : blog._id
                              )
                            }
                            className="p-2.5 rounded-xl hover:bg-blue-50 text-gray-500 hover:text-blue-600 transition-all duration-200"
                          >
                            <MoreVertical size={18} />
                          </button>
                          {activeMenuId === blog._id && (
                            <div className="origin-top-right absolute right-0 mt-1 w-40 rounded-md shadow-lg bg-white z-10">
                              <div className="py-1 text-sm">
                                <button
                                  onClick={() => openEditModal(blog)}
                                  className="w-full px-3 py-2 flex items-center gap-2 text-gray-700 hover:bg-gray-50"
                                >
                                  <Edit2 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleDelete(blog._id || blog.slug)
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-purple-50 to-transparent">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingBlog ? "Edit Blog Post" : "New Blog Post"}
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">Fill in the details below</p>
                </div>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBlog(null);
                  }}
                  className="p-2 rounded-xl hover:bg-white text-gray-500 hover:text-gray-700 transition-all"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    className="w-full border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Slug (optional)
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={form.slug}
                    onChange={handleChange}
                    placeholder="auto-generated from title if empty"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Excerpt
                  </label>
                  <textarea
                    name="excerpt"
                    value={form.excerpt}
                    onChange={handleChange}
                    rows={2}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Content
                  </label>
                  <textarea
                    name="content"
                    value={form.content}
                    onChange={handleChange}
                    rows={5}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Image URL
                  </label>
                  <input
                    type="text"
                    name="imageUrl"
                    value={form.imageUrl}
                    onChange={handleChange}
                    placeholder="https://..."
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <input
                      type="text"
                      name="category"
                      value={form.category}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tags (comma separated)
                    </label>
                    <input
                      type="text"
                      name="tags"
                      value={form.tags}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                    <input
                      type="checkbox"
                      name="isPublished"
                      checked={form.isPublished}
                      onChange={handleChange}
                    />
                    Published
                  </label>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setEditingBlog(null);
                      }}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {editingBlog ? "Update" : "Create"} Blog
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast Notifications */}
        {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}


