import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, MoreVertical, Upload, FileText, CheckCircle, Clock, MapPin, Phone, X } from 'lucide-react';
import api from '../../config/api';

const Invoices = () => {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [newInvoice, setNewInvoice] = useState({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        clientAddress: '',
        serviceDescription: '',
        phaseWork: '',
        startDate: '',
        endDate: '',
        price: '',
        taxRate: 18,
        discount: 0,
        dueDate: '',
        status: 'Draft',
        invoiceDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        try {
            setLoading(true);
            const response = await api.getInvoices();
            setInvoices(response.invoices || []);
        } catch (error) {
            console.error('Error loading invoices:', error);
            alert('Failed to load invoices: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date) => {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const formatAmount = (amount) => {
        return `₹${parseFloat(amount || 0).toLocaleString('en-IN')}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
            case 'Sent':
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
            case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInvoice(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddInvoice = async (e) => {
        e.preventDefault();
        try {
            // const rate = parseFloat(newInvoice.rate) || 0;
            // const quantity = parseFloat(newInvoice.quantity) || 1;
            // const subtotal = rate * quantity;
            const invoiceNumber = `INV-${Date.now()}`;
            const price = parseFloat(newInvoice.price) || 0;
            const subtotal = price;
            const discount = parseFloat(newInvoice.discount) || 0;
            const taxRate = parseFloat(newInvoice.taxRate) || 18;
            const taxAmount = ((subtotal - discount) * taxRate) / 100;
            const total = subtotal - discount + taxAmount;

            const invoiceData = {
                invoiceNumber,
                clientName: newInvoice.clientName,
                clientEmail: newInvoice.clientEmail,
                clientPhone: newInvoice.clientPhone,
                clientAddress: newInvoice.clientAddress,
                phaseWork: newInvoice.phaseWork,
                startDate: newInvoice.startDate,
                endDate: newInvoice.endDate,

                services: [{
                    description: newInvoice.serviceDescription,
                    // quantity: quantity,
                    // unit: newInvoice.unit,
                    rate: price,
                    amount: subtotal
                }],
                subtotal: subtotal,
                taxRate: taxRate,
                taxAmount: taxAmount,
                discount: discount,
                total: total,
                dueDate: newInvoice.dueDate ? new Date(newInvoice.dueDate) : new Date(),
                status: newInvoice.status,
                invoiceDate: newInvoice.invoiceDate ? new Date(newInvoice.invoiceDate) : new Date()
            };

            if (editingInvoice) {
                await api.updateInvoice(editingInvoice._id || editingInvoice.invoiceNumber, invoiceData);
            } else {
                await api.createInvoice(invoiceData);
            }

            await loadInvoices();
            setIsAddModalOpen(false);
            setEditingInvoice(null);
            setNewInvoice({
                clientName: '',
                clientEmail: '',
                clientPhone: '',
                clientAddress: '',
                serviceDescription: '',
                // quantity: 1,
                // unit: 'hours',
                price: '',
                taxRate: 18,
                discount: 0,
                dueDate: '',
                status: 'Draft',
                invoiceDate: new Date().toISOString().split('T')[0]
            });
        } catch (error) {
            console.error('Error saving invoice:', error);
            alert('Failed to save invoice: ' + error.message);
        }
    };

    const handleEditInvoice = (invoice) => {
        const firstService = (invoice.services && invoice.services[0]) || {};
        setEditingInvoice(invoice);
        setNewInvoice({
            clientName: invoice.clientName || '',
            clientEmail: invoice.clientEmail || '',
            clientPhone: invoice.clientPhone || '',
            clientAddress: invoice.clientAddress || '',
            serviceDescription: firstService.description || '',
            // quantity: firstService.quantity || 1,
            // unit: firstService.unit || 'hours',
            phaseWork: invoice.phaseWork || '',
            startDate: invoice.startDate ? new Date(invoice.startDate).toISOString().split('T')[0] : '',
            endDate: invoice.endDate ? new Date(invoice.endDate).toISOString().split('T')[0] : '',
            price: firstService.rate || '',
            taxRate: invoice.taxRate || 18,
            discount: invoice.discount || 0,
            dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
            status: invoice.status || 'Draft',
            invoiceDate: invoice.invoiceDate ? new Date(invoice.invoiceDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        });
        setIsAddModalOpen(true);
        setActiveMenuId(null);
    };

    const handleDeleteInvoice = async (invoiceId) => {
        if (!window.confirm('Are you sure you want to delete this invoice?')) {
            return;
        }
        try {
            await api.deleteInvoice(invoiceId);
            await loadInvoices();
        } catch (error) {
            console.error('Error deleting invoice:', error);
            alert('Failed to delete invoice: ' + error.message);
        }
        setActiveMenuId(null);
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
                    <p className="text-gray-500 text-sm">Manage pending and past invoices</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm flex-1 md:flex-none cursor-pointer">
                        <Upload size={20} />
                        <span>Upload Invoice</span>
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm flex-1 md:flex-none cursor-pointer"
                    >
                        <Plus size={20} />
                        <span>Manual Create</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search invoices..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                        Export
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 font-semibold text-gray-600 text-sm">Invoice Details</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Client Info</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Product & Qty</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Financials</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">Loading invoices...</td>
                                </tr>
                            ) : invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">No invoices found. Create your first invoice!</td>
                                </tr>
                            ) : (
                                invoices.map((inv) => {
                                    const firstService = (inv.services && inv.services[0]) || {};
                                    return (
                                        <tr key={inv._id || inv.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-gray-900">{inv.invoiceNumber || inv.id}</span>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                        <Clock size={12} /> {formatDate(inv.invoiceDate || inv.date)}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col gap-1">
                                                    <span className="font-medium text-gray-800">{inv.clientName}</span>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <Phone size={12} /> {inv.clientPhone || inv.contact}
                                                    </div>
                                                    <div className="flex items-center gap-1 text-xs text-gray-500">
                                                        <MapPin size={12} /> {inv.clientAddress || inv.address}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <p className="text-sm font-medium text-gray-800">{firstService.description || inv.product || 'Service'}</p>
                                                {/* <p className="text-xs text-gray-500">Qty: {firstService.quantity || inv.quantity || 1} {firstService.unit || 'units'}</p> */}
                                            </td>
                                            <td className="p-4">
                                                <span className="font-bold text-gray-800">{formatAmount(inv.total)}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(inv.status)}`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setActiveMenuId(activeMenuId === inv._id ? null : inv._id)}
                                                        className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>
                                                    {activeMenuId === inv._id && (
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                                                            <button
                                                                onClick={() => handleEditInvoice(inv)}
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleDeleteInvoice(inv._id || inv.invoiceNumber)}
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                            >
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Invoice Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">{editingInvoice ? 'Edit Invoice' : 'Manual Invoice Creation'}</h2>
                            <button onClick={() => {
                                setIsAddModalOpen(false);
                                setEditingInvoice(null);
                                setNewInvoice({
                                    clientName: '',
                                    clientEmail: '',
                                    clientPhone: '',
                                    clientAddress: '',
                                    serviceDescription: '',
                                    phaseWork: '',
                                    startDate: '',
                                    endDate: '',
                                    price: '',
                                    taxRate: 18,
                                    discount: 0,
                                    dueDate: '',
                                    status: 'Draft',
                                    invoiceDate: new Date().toISOString().split('T')[0]
                                });
                            }} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddInvoice} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                                <input type="text" name="clientName" value={newInvoice.clientName} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client Email</label>
                                <input type="email" name="clientEmail" value={newInvoice.clientEmail} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Phone)</label>
                                <input type="text" name="clientPhone" value={newInvoice.clientPhone} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input type="text" name="clientAddress" value={newInvoice.clientAddress} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Service Description</label>
                                <input type="text" name="serviceDescription" value={newInvoice.serviceDescription} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input type="number" name="quantity" value={newInvoice.quantity} onChange={handleInputChange} required min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div> */}
                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                                <select name="unit" value={newInvoice.unit} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="hours">Hours</option>
                                    <option value="days">Days</option>
                                    <option value="items">Items</option>
                                    <option value="project">Project</option>
                                </select>
                            </div> */}

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Phase Work
                              </label>
                              <select
                              name="phaseWork"
                              value={newInvoice.phaseWork}
                              onChange={handleInputChange}
                              className="w-full p-2 border border-gray-300 rounded-lg"
                            >
                              <option value="">Select</option>
                              <option value="Deliverable">Deliverable</option>
                              <option value="Not Deliverable">Not Deliverable</option>
                            </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                                <input type="text" name="price" value={newInvoice.price} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>

                            {/* Start Date */}
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                              </label>
                              <input
                                type="date"
                                name="startDate"
                                value={newInvoice.startDate}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                             />
                            </div>
                            
                            {/* End Date */}
                             <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                              </label>
                              <input
                                type="date"
                                name="endDate"
                                value={newInvoice.endDate}
                                onChange={handleInputChange}
                                className="w-full p-2 border border-gray-300 rounded-lg"
                             />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Rate (%)</label>
                                <input type="number" name="taxRate" value={newInvoice.taxRate} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Discount</label>
                                <input type="number" name="discount" value={newInvoice.discount} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Maintenance Due Date</label>
                                <input type="date" name="dueDate" value={newInvoice.dueDate} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={newInvoice.status} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="Draft">Draft</option>
                                    <option value="Sent">Sent</option>
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 mt-4 pt-4 border-t">
                                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                                    {editingInvoice ? 'Update Invoice' : 'Create Invoice'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Invoices;
