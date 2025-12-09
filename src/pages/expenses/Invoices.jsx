import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, Upload, FileText, CheckCircle, Clock, MapPin, Phone, X } from 'lucide-react';

const Invoices = () => {
    const [invoices, setInvoices] = useState([
        {
            id: "INV-2023-001",
            clientName: "Tech Solutions Ltd",
            contact: "+91 98765 00001",
            address: "123, IT Park, Bangalore",
            product: "Server Maintenance",
            quantity: 2,
            price: 25000,
            tax: 4500, // 18% GST
            total: 54500,
            status: "Pending",
            date: "Oct 25, 2023"
        },
        {
            id: "INV-2023-002",
            clientName: "Creative Agency",
            contact: "+91 98765 00002",
            address: "456, Design Hub, Mumbai",
            product: "Adobe License Pack",
            quantity: 5,
            price: 12000,
            tax: 10800, // 18% GST on total
            total: 70800,
            status: "Paid",
            date: "Oct 22, 2023"
        },
        {
            id: "INV-2023-003",
            clientName: "StartUp Inc",
            contact: "+91 98765 00003",
            address: "789, HSR Layout, Bangalore",
            product: "Consulting Hours",
            quantity: 10,
            price: 5000,
            tax: 9000,
            total: 59000,
            status: "Overdue",
            date: "Oct 15, 2023"
        }
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newInvoice, setNewInvoice] = useState({
        clientName: '',
        contact: '',
        address: '',
        product: '',
        quantity: 1,
        price: '',
        tax: '',
        status: 'Pending',
        date: ''
    });

    const getStatusColor = (status) => {
        switch (status) {
            case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
            case 'Pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'Overdue': return 'bg-red-100 text-red-700 border-red-200';
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

    const handleAddInvoice = (e) => {
        e.preventDefault();
        const price = parseFloat(newInvoice.price) || 0;
        const quantity = parseFloat(newInvoice.quantity) || 1;
        const tax = parseFloat(newInvoice.tax) || 0;
        const total = (price * quantity) + tax;

        const invoiceToAdd = {
            id: `INV-2023-00${invoices.length + 1}`,
            ...newInvoice,
            quantity: quantity,
            price: price,
            tax: tax,
            total: total
        };

        setInvoices([...invoices, invoiceToAdd]);
        setIsAddModalOpen(false);
        setNewInvoice({
            clientName: '',
            contact: '',
            address: '',
            product: '',
            quantity: 1,
            price: '',
            tax: '',
            status: 'Pending',
            date: ''
        });
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
                            {invoices.map((inv) => (
                                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900">{inv.id}</span>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <Clock size={12} /> {inv.date}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-gray-800">{inv.clientName}</span>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <Phone size={12} /> {inv.contact}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                                <MapPin size={12} /> {inv.address}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-medium text-gray-800">{inv.product}</p>
                                        <p className="text-xs text-gray-500">Qty: {inv.quantity}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-gray-800">₹{inv.total.toLocaleString('en-IN')}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors cursor-pointer">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Invoice Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">Manual Invoice Creation</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddInvoice} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
                                <input type="text" name="clientName" value={newInvoice.clientName} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Contact (Phone)</label>
                                <input type="text" name="contact" value={newInvoice.contact} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                <input type="text" name="address" value={newInvoice.address} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product/Service</label>
                                <input type="text" name="product" value={newInvoice.product} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                                <input type="number" name="quantity" value={newInvoice.quantity} onChange={handleInputChange} required min="1" className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                                <input type="number" name="price" value={newInvoice.price} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Total Tax</label>
                                <input type="number" name="tax" value={newInvoice.tax} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="text" name="date" value={newInvoice.date} onChange={handleInputChange} required placeholder="e.g. Oct 25, 2023" className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={newInvoice.status} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                    <option value="Overdue">Overdue</option>
                                </select>
                            </div>

                            <div className="md:col-span-2 mt-4 pt-4 border-t">
                                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                                    Create Invoice
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
