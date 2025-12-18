import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, Filter, MoreVertical, FileText, Calendar, DollarSign, Tag, Receipt, PieChart, TrendingUp, CreditCard, X } from 'lucide-react';
import api from '../../config/api';

const CompanyExpenses = () => {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newExpense, setNewExpense] = useState({
        title: '',
        category: 'Misc',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        paymentMethod: 'Bank Transfer',
        status: 'Pending',
        description: ''
    });
    const [totalExpenses, setTotalExpenses] = useState(0);
    const [editingExpense, setEditingExpense] = useState(null);
    const [activeMenuId, setActiveMenuId] = useState(null);

    useEffect(() => {
        loadExpenses();
    }, []);

    const loadExpenses = async () => {
        try {
            setLoading(true);
            const response = await api.getExpenses();
            setExpenses(response.expenses || []);
            const total = (response.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);
            setTotalExpenses(total);
        } catch (error) {
            console.error('Error loading expenses:', error);
            alert('Failed to load expenses: ' + error.message);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewExpense(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const expenseData = {
                ...newExpense,
                amount: parseFloat(newExpense.amount),
                date: newExpense.date ? new Date(newExpense.date) : new Date(),
            };

            if (editingExpense) {
                await api.updateExpense(editingExpense._id, expenseData);
            } else {
                await api.createExpense(expenseData);
            }

            await loadExpenses(); // Reload expenses
            setIsAddModalOpen(false);
            setEditingExpense(null);
            setNewExpense({
                title: '',
                category: 'Misc',
                amount: '',
                date: new Date().toISOString().split('T')[0],
                paymentMethod: 'Bank Transfer',
                status: 'Pending',
                description: ''
            });
        } catch (error) {
            console.error('Error saving expense:', error);
            alert('Failed to save expense: ' + error.message);
        }
    };

    const handleEditExpense = (expense) => {
        setEditingExpense(expense);
        setNewExpense({
            title: expense.title || '',
            category: expense.category || 'Misc',
            amount: expense.amount || '',
            date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            paymentMethod: expense.paymentMethod || 'Bank Transfer',
            status: expense.status || 'Pending',
            description: expense.description || ''
        });
        setIsAddModalOpen(true);
        setActiveMenuId(null);
    };

    const handleDeleteExpense = async (expenseId) => {
        if (!window.confirm('Are you sure you want to delete this expense?')) {
            return;
        }
        try {
            await api.deleteExpense(expenseId);
            await loadExpenses();
        } catch (error) {
            console.error('Error deleting expense:', error);
            alert('Failed to delete expense: ' + error.message);
        }
        setActiveMenuId(null);
    };

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Company Expenses</h1>
                    <p className="text-gray-500 text-sm">Track all operational expenses and overheads</p>
                </div>
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm w-full md:w-auto cursor-pointer"
                >
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
                        <h3 className="text-xl font-bold text-gray-800">{formatAmount(totalExpenses)}</h3>
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
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                        <Filter size={18} />
                        Filter
                    </button>
                    <button
                        onClick={() => {
                            if (expenses.length === 0) {
                                alert('No expenses to export');
                                return;
                            }
                            const csv = [
                                ['Title', 'Category', 'Amount', 'Payment Method', 'Status', 'Date', 'Description'],
                                ...expenses.map(exp => [
                                    exp.title || '',
                                    exp.category || '',
                                    exp.amount || 0,
                                    exp.paymentMethod || '',
                                    exp.status || '',
                                    formatDate(exp.date),
                                    exp.description || ''
                                ])
                            ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
                            const blob = new Blob([csv], { type: 'text/csv' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `expenses-${new Date().toISOString().split('T')[0]}.csv`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
                    >
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
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">Loading expenses...</td>
                                </tr>
                            ) : expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-gray-500">No expenses found. Add your first expense!</td>
                                </tr>
                            ) : (
                                expenses.map((expense) => (
                                    <tr key={expense._id || expense.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{expense.title}</span>
                                                <span className="text-xs text-gray-500">{expense.description || ''}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getCategoryColor(expense.category)}`}>
                                                <Tag size={12} className="mr-1.5" />
                                                {expense.category}
                                            </span>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-gray-800">{formatAmount(expense.amount)}</span>
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
                                                {formatDate(expense.date)}
                                            </div>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveMenuId(activeMenuId === expense._id ? null : expense._id)}
                                                    className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                                {activeMenuId === expense._id && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                                                        <button
                                                            onClick={() => handleEditExpense(expense)}
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteExpense(expense._id)}
                                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                        >
                                                            Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Expense Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

                    <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-hidden">


                        <div className="max-h-[90vh] overflow-y-auto">

                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <h2 className="text-xl font-semibold">
                                    {editingExpense ? "Edit Expense" : "New Expense Entry"}
                                </h2>
                                <button
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditingExpense(null);
                                        setNewExpense({
                                            title: "",
                                            category: "Misc",
                                            amount: "",
                                            date: new Date().toISOString().split("T")[0],
                                            paymentMethod: "Bank Transfer",
                                            status: "Pending",
                                            description: "",
                                        });
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleAddExpense} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expense Title</label>
                                    <input type="text" name="title" value={newExpense.title} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                    <select name="category" value={newExpense.category} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg">
                                        <option value="Misc">Misc</option>
                                        <option value="Travel">Travel</option>
                                        <option value="Software">Software</option>
                                        <option value="Utilities">Utilities</option>
                                        <option value="Rent">Rent</option>
                                        <option value="Equipment">Equipment</option>
                                        <option value="Marketing">Marketing</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                    <input type="number" name="amount" value={newExpense.amount} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                                    <input type="text" name="paymentMethod" value={newExpense.paymentMethod} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input type="date" name="date" value={newExpense.date} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select name="status" value={newExpense.status} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg">
                                        <option value="Pending">Pending</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Paid">Paid</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea name="description" value={newExpense.description} onChange={handleInputChange} rows="3" className="w-full p-2 border border-gray-300 rounded-lg"></textarea>
                                </div>

                                <div className="md:col-span-2 mt-4 pt-4 border-t">
                                    <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                                        {editingExpense ? 'Update Expense' : 'Add Expense'}
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

export default CompanyExpenses;
