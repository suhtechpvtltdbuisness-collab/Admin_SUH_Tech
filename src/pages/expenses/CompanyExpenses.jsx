import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, MoreVertical, FileText, Calendar, DollarSign, Tag, Receipt, PieChart, TrendingUp, CreditCard } from 'lucide-react';

const CompanyExpenses = () => {
    const [expenses] = useState([
        {
            id: 1,
            title: "Office Renovation Materials",
            category: "Equipment",
            amount: "₹45,000",
            date: "Nov 15, 2023",
            paymentMethod: "Bank Transfer",
            status: "Approved",
            description: "Paint, furniture, and lighting for new meeting room."
        },
        {
            id: 2,
            title: "Monthly Server Costs",
            category: "Software",
            amount: "₹12,500",
            date: "Nov 01, 2023",
            paymentMethod: "Credit Card",
            status: "Paid",
            description: "AWS and DigitalOcean recurring billing."
        },
        {
            id: 3,
            title: "Team Lunch - Q4",
            category: "Misc",
            amount: "₹8,000",
            date: "Oct 28, 2023",
            paymentMethod: "UPI",
            status: "Paid",
            description: "Quarterly team bonding activity."
        },
        {
            id: 4,
            title: "Client Travel Expenses",
            category: "Travel",
            amount: "₹15,200",
            date: "Oct 25, 2023",
            paymentMethod: "Reimbursement",
            status: "Pending",
            description: "Flight and cab charges for Bangalore client visit."
        },
        {
            id: 5,
            title: "Office Internet Bill",
            category: "Utilities",
            amount: "₹2,400",
            date: "Nov 05, 2023",
            paymentMethod: "Auto-Debit",
            status: "Paid",
            description: "Fiber optic connection monthly bill."
        },
    ]);

    const getCategoryColor = (category) => {
        const colors = {
            'Travel': 'bg-purple-100 text-purple-700',
            'Software': 'bg-blue-100 text-blue-700',
            'Utilities': 'bg-yellow-100 text-yellow-700',
            'Rent': 'bg-orange-100 text-orange-700',
            'Equipment': 'bg-indigo-100 text-indigo-700',
            'Marketing': 'bg-pink-100 text-pink-700',
            'Misc': 'bg-gray-100 text-gray-700',
            'Travel': 'bg-purple-100 text-purple-700 border-purple-200',
            'Software': 'bg-blue-100 text-blue-700 border-blue-200',
            'Utilities': 'bg-yellow-100 text-yellow-700 border-yellow-200',
            'Rent': 'bg-orange-100 text-orange-700 border-orange-200',
            'Equipment': 'bg-indigo-100 text-indigo-700 border-indigo-200',
            'Marketing': 'bg-pink-100 text-pink-700 border-pink-200',
            'Misc': 'bg-gray-100 text-gray-700 border-gray-200',
        };
        return colors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Company Expenses</h1>
                    <p className="text-gray-500 text-sm">Track all operational expenses and overheads</p>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm w-full md:w-auto">
                    <Plus size={20} />
                    <span>Add Expense</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-medium uppercase">Total Expenses</p>
                        <h3 className="text-xl font-bold text-gray-800">₹45,250</h3>
                    </div>
                </div>
                <Link to="/expenses/invoices" className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                        <Receipt size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-medium uppercase">Pending Invoices</p>
                        <h3 className="text-xl font-bold text-gray-800">12</h3>
                    </div>
                </Link>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                        <PieChart size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-medium uppercase">Budget Used</p>
                        <h3 className="text-xl font-bold text-gray-800">68%</h3>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <TrendingUp size={24} />
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs font-medium uppercase">MoM Growth</p>
                        <h3 className="text-xl font-bold text-gray-800">+12%</h3>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search expenses..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
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
                                <th className="p-4 font-semibold text-gray-600 text-sm">Expense Details</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Category</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Amount</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Payment Method</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm">Date</th>
                                <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-gray-900">{expense.title}</span>
                                            <span className="text-xs text-gray-500">{expense.description}</span>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(expense.category)}`}>
                                            <Tag size={12} className="mr-1.5" />
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-gray-800">₹{expense.amount.toLocaleString('en-IN')}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <CreditCard size={14} />
                                            {expense.paymentMethod}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={14} />
                                            {expense.date}
                                        </div>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors">
                                            <MoreVertical size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CompanyExpenses;
