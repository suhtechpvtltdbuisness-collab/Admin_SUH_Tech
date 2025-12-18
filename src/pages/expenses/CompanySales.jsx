import { BarChart2, DollarSign, Edit2, Filter, Mail, MoreVertical, Phone, Plus, Search, Trash2, TrendingUp, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../../config/api';

const CompanySales = () => {
    const [sales, setSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingSale, setEditingSale] = useState(null);

    const [newSale, setNewSale] = useState({
        clientName: '',
        contactPerson: '',
        email: '',
        phone: '',
        projectTitle: '',
        amount: '',
        date: '',
        status: 'Pending',
        link: '',
        paymentMethod: 'Bank Transfer'
    });

    useEffect(() => {
        loadSales();
    }, []);

    const loadSales = async () => {
        try {
            setLoading(true);
            const res = await api.getSales();
            setSales(res.sales || []);
        } catch (error) {
            console.error("Error loading sales:", error);
            alert("Failed to load sales: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter sales based on search
    const filteredSales = useMemo(() => {
        return sales.filter(sale =>
            sale.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sale.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [sales, searchTerm]);

    // Calculate stats
    const stats = useMemo(() => {
        const totalRevenue = sales.reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0);
        const pendingPayments = sales
            .filter(s => s.status === 'Pending')
            .reduce((sum, sale) => sum + (parseFloat(sale.amount) || 0), 0);
        const activeProjects = sales.filter(s => s.status === 'In Progress').length;

        return {
            totalRevenue,
            pendingPayments,
            activeProjects
        };
    }, [sales]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-700 border-green-200';
            case 'In Progress': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSale(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const openNewModal = () => {
        setEditingSale(null);
        setNewSale({
            clientName: '',
            contactPerson: '',
            email: '',
            phone: '',
            projectTitle: '',
            amount: '',
            date: '',
            status: 'Pending',
            link: '',
            paymentMethod: 'Bank Transfer'
        });
        setIsAddModalOpen(true);
    };

    const openEditModal = (sale) => {
        setEditingSale(sale);
        setNewSale({
            clientName: sale.clientName || '',
            contactPerson: sale.contactPerson || '',
            email: sale.email || '',
            phone: sale.phone || '',
            projectTitle: sale.projectTitle || '',
            amount: sale.amount || '',
            date: sale.date || '',
            status: sale.status || 'Pending',
            link: sale.link || '',
            paymentMethod: sale.paymentMethod || 'Bank Transfer'
        });
        setIsAddModalOpen(true);
        setActiveMenuId(null);
    };

    const handleAddSale = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...newSale,
                amount: parseFloat(newSale.amount) || 0
            };

            if (editingSale) {
                await api.updateSale(editingSale._id, payload);
            } else {
                await api.createSale(payload);
            }

            await loadSales();
            setIsAddModalOpen(false);
            setEditingSale(null);

            // Reset form
            setNewSale({
                clientName: '',
                contactPerson: '',
                email: '',
                phone: '',
                projectTitle: '',
                amount: '',
                date: '',
                status: 'Pending',
                link: '',
                paymentMethod: 'Bank Transfer'
            });
        } catch (error) {
            console.error("Error saving sale:", error);
            alert("Failed to save sale: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this sale entry?")) {
            return;
        }
        try {
            await api.deleteSale(id);
            await loadSales();
            setActiveMenuId(null);
        } catch (error) {
            console.error("Error deleting sale:", error);
            alert("Failed to delete sale: " + error.message);
        }
    };

    const formatCurrency = (amount) => {
        return `₹${(parseFloat(amount) || 0).toLocaleString('en-IN')}`;
    };

    const formatDate = (date) => {
        if (!date) return "-";
        return new Date(date).toLocaleDateString("en-IN", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Company Sales</h1>
                    <p className="text-gray-500 text-sm">Track income, project billing, and revenue status</p>
                </div>
                <button
                    onClick={openNewModal}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm w-full md:w-auto"
                >
                    <Plus size={20} />
                    <span>New Sale Entry</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-medium uppercase">Total Revenue</p>
                        <h3 className="text-xl font-bold text-gray-800">{formatCurrency(stats.totalRevenue)}</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-medium uppercase">Pending Payments</p>
                        <h3 className="text-xl font-bold text-gray-800">{formatCurrency(stats.pendingPayments)}</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <BarChart2 size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-medium uppercase">In Progress</p>
                        <h3 className="text-xl font-bold text-gray-800">{stats.activeProjects}</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search sales, clients, or projects..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 text-sm">Loading sales data...</p>
                    </div>
                ) : filteredSales.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <DollarSign size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">
                            {searchTerm ? "No sales found matching your search." : "No sales entries found. Add your first sale!"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Client Name</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Contact Info</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Project Title</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Revenue</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredSales.map((sale) => (
                                    <tr key={sale._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {sale.clientName?.split(" ").map(n => n[0]).join("") || "N/A"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{sale.clientName || "N/A"}</p>
                                                    <p className="text-xs text-gray-500">{formatDate(sale.date)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm text-gray-800 font-medium">{sale.contactPerson || "N/A"}</p>
                                                {sale.email && (
                                                    <a href={`mailto:${sale.email}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors">
                                                        <Mail size={12} /> {sale.email}
                                                    </a>
                                                )}
                                                {sale.phone && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <Phone size={12} /> {sale.phone}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-gray-600 font-medium">
                                            {sale.projectTitle || "N/A"}
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-gray-900">{formatCurrency(sale.amount)}</span>
                                            <p className="text-xs text-gray-500">{sale.paymentMethod || "N/A"}</p>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(sale.status)}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${sale.status === 'Completed' ? 'bg-green-500' : sale.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
                                                {sale.status || "Pending"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="relative inline-block text-left">
                                                <button
                                                    onClick={() => setActiveMenuId(activeMenuId === sale._id ? null : sale._id)}
                                                    className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {activeMenuId === sale._id && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                                                        <button
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            onClick={() => openEditModal(sale)}
                                                        >
                                                            <Edit2 size={14} />
                                                            Edit
                                                        </button>
                                                        <button
                                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            onClick={() => handleDelete(sale._id)}
                                                        >
                                                            <Trash2 size={14} />
                                                            Delete
                                                        </button>
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

            {/* Add/Edit Sale Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">{editingSale ? "Edit Sale Entry" : "New Sale Entry"}</h2>
                            <button onClick={() => { setIsAddModalOpen(false); setEditingSale(null); }} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSale} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                                <input type="text" name="clientName" value={newSale.clientName} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                                <input type="text" name="contactPerson" value={newSale.contactPerson} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" value={newSale.email} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="text" name="phone" value={newSale.phone} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Title</label>
                                <input type="text" name="projectTitle" value={newSale.projectTitle} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (INR)</label>
                                <input type="number" name="amount" value={newSale.amount} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <select name="paymentMethod" value={newSale.paymentMethod} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Credit Card">Credit Card</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="date" name="date" value={newSale.date} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={newSale.status} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="Pending">Pending</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Completed">Completed</option>
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Project Link (Optional)</label>
                                <input type="url" name="link" value={newSale.link} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>

                            <div className="md:col-span-2 mt-4 pt-4 border-t">
                                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    {editingSale ? "Update Sale Entry" : "Create Sale Entry"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CompanySales;
