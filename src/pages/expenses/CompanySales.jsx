import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, ExternalLink, Phone, Mail, User, Briefcase, Calendar, CheckCircle, TrendingUp, DollarSign, BarChart2, X } from 'lucide-react';

const CompanySales = () => {
    const [sales, setSales] = useState([
        {
            id: 1,
            clientName: "Acme Corp",
            contactPerson: "John Doe",
            email: "john@acme.com",
            phone: "+91 98765 43210",
            projectTitle: "E-commerce Platform Revamp",
            amount: "₹1,50,000",
            date: "Oct 24, 2023",
            status: "Completed",
            link: "https://acme.com"
        },
        {
            id: 2,
            clientName: "Globex Inc",
            contactPerson: "Jane Smith",
            email: "jane@globex.io",
            phone: "+91 88888 77777",
            projectTitle: "iOS & Android App Design",
            amount: "₹2,75,000",
            date: "Oct 26, 2023",
            status: "In Progress",
            link: "https://globex.io"
        },
        {
            id: 3,
            clientName: "Soylent Corp",
            contactPerson: "Richard Roe",
            email: "richard@soylent.green",
            phone: "+91 77777 66666",
            projectTitle: "SEO & Digital Marketing",
            amount: "₹45,000",
            date: "Oct 28, 2023",
            status: "Pending",
            link: "https://soylent.green"
        },
        {
            id: 4,
            clientName: "Initech",
            contactPerson: "Peter Gibbons",
            email: "peter@initech.com",
            phone: "+91 66666 55555",
            projectTitle: "Custom CRM Implementation",
            amount: "₹3,20,000",
            date: "Oct 29, 2023",
            status: "In Progress",
            link: "https://initech.com",
            paymentMethod: "Bank Transfer"
        },
        {
            id: 5,
            clientName: "Umbrella Corp",
            contactPerson: "Albert Wesker",
            email: "albert@umbrella.com",
            phone: "+91 55555 44444",
            projectTitle: "Security Dashboard",
            amount: "₹5,50,000",
            date: "Oct 30, 2023",
            status: "Completed",
            link: "https://umbrella.com",
            paymentMethod: "Credit Card"
        },
    ]);

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
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

    const handleAddSale = (e) => {
        e.preventDefault();
        const saleToAdd = {
            id: sales.length + 1,
            ...newSale,
            amount: `₹${parseFloat(newSale.amount || 0).toLocaleString('en-IN')}`
        };
        setSales([...sales, saleToAdd]);
        setIsAddModalOpen(false);
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
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Company Sales</h1>
                    <p className="text-gray-500 text-sm">Track income, project billing, and revenue status</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm w-full md:w-auto cursor-pointer"
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
                        <h3 className="text-xl font-bold text-gray-800">₹12,45,000</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-medium uppercase">Pending Payments</p>
                        <h3 className="text-xl font-bold text-gray-800">₹3,20,000</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <BarChart2 size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-medium uppercase">Active Projects</p>
                        <h3 className="text-xl font-bold text-gray-800">8</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search sales or projects..."
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
                                <th className="p-4 font-semibold text-gray-600 text-sm">Client Name</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Contact Info</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Project Title</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Revenue</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {sales.map((sale) => (
                                <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                {sale.clientName.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{sale.clientName}</p>
                                                <p className="text-xs text-gray-500">{sale.date}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm text-gray-800 font-medium">{sale.contactPerson}</p>
                                            <a href={`mailto:${sale.email}`} className="flex items-center gap-2 text-xs text-gray-600 hover:text-blue-600 transition-colors">
                                                <Mail size={12} /> {sale.email}
                                            </a>
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <Phone size={12} /> {sale.phone}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4 text-sm text-gray-600 font-medium">
                                        {sale.projectTitle}
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-gray-900">{sale.amount}</span>
                                        <p className="text-xs text-gray-500">{sale.paymentMethod}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(sale.status)}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${sale.status === 'Completed' ? 'bg-green-500' : sale.status === 'In Progress' ? 'bg-blue-500' : 'bg-yellow-500'}`}></span>
                                            {sale.status}
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

            {/* Add Sale Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  {/* Outer container – handles border radius */}
  <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-hidden">
    
    {/* Inner container – handles scrolling */}
    <div className="max-h-[90vh] overflow-y-auto">
      
      <div className="flex justify-between items-center p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold">New Sale Entry</h2>
        <button
          onClick={() => setIsAddModalOpen(false)}
          className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
        >
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input type="number" name="amount" value={newSale.amount} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                <input type="text" name="paymentMethod" value={newSale.paymentMethod} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                <input type="text" name="date" value={newSale.date} onChange={handleInputChange} required placeholder="e.g. Oct 24, 2023" className="w-full p-2 border border-gray-300 rounded-lg" />
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
                                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                                    Create Sale Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                </div>
            )}
        </div>
    );
};

export default CompanySales;
