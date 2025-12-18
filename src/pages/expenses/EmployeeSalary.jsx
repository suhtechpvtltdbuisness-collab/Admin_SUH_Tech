import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AlertCircle, Calendar, Download, Eye, FileText, Filter, Mail, MoreVertical, Phone, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import api from '../../config/api';

const EmployeeSalary = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // Preview Modal State
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null); // { url: string, employee: object, doc: jsPDF }

    const [newSalary, setNewSalary] = useState({
        employeeName: '',
        role: '',
        department: '',
        phone: '',
        email: '',
        status: 'Pending',
        paymentMode: 'Bank Transfer',
        paymentDate: '',
        basic: 0,
        hra: 0,
        special: 0,
        pf: 0,
        tax: 0
    });

    useEffect(() => {
        loadEmployeeSalaries();
    }, []);

    const loadEmployeeSalaries = async () => {
        try {
            setLoading(true);
            const res = await api.getEmployeeSalaries();
            setEmployees(res.salaries || res.employeeSalaries || []);
        } catch (error) {
            console.error("Error loading employee salaries:", error);
            alert("Failed to load employee salaries: " + error.message);
        } finally {
            setLoading(false);
        }
    };

    // Filter employees based on search
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp =>
            emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.department?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [employees, searchTerm]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSalary(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddSalary = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                employeeName: newSalary.employeeName,
                role: newSalary.role,
                department: newSalary.department,
                phone: newSalary.phone,
                email: newSalary.email,
                paymentDate: newSalary.paymentDate,
                paymentMode: newSalary.paymentMode,
                status: newSalary.status,
                breakdown: {
                    basic: parseFloat(newSalary.basic) || 0,
                    allowances: {
                        HRA: parseFloat(newSalary.hra) || 0,
                        Special: parseFloat(newSalary.special) || 0
                    },
                    deductions: {
                        PF: parseFloat(newSalary.pf) || 0,
                        Tax: parseFloat(newSalary.tax) || 0
                    }
                }
            };

            // Calculate net
            const total = payload.breakdown.basic +
                          payload.breakdown.allowances.HRA +
                          payload.breakdown.allowances.Special;
            const deductions = payload.breakdown.deductions.PF +
                               payload.breakdown.deductions.Tax;
            payload.breakdown.net = total - deductions;

            await api.createEmployeeSalary(payload);
            await loadEmployeeSalaries();
            setIsAddModalOpen(false);

            // Reset form
            setNewSalary({
                employeeName: '',
                role: '',
                department: '',
                phone: '',
                email: '',
                status: 'Pending',
                paymentMode: 'Bank Transfer',
                paymentDate: '',
                basic: 0,
                hra: 0,
                special: 0,
                pf: 0,
                tax: 0
            });
        } catch (error) {
            console.error("Error adding salary:", error);
            alert("Failed to add salary entry: " + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this salary entry?")) {
            return;
        }
        try {
            await api.deleteEmployeeSalary(id);
            await loadEmployeeSalaries();
            setActiveMenuId(null);
        } catch (error) {
            console.error("Error deleting salary:", error);
            alert("Failed to delete salary: " + error.message);
        }
    };

    const createPDFDoc = (emp) => {
        try {
            const doc = new jsPDF();
            // Colors
            const primaryColor = [37, 99, 235]; // Blue 600
            const secondaryColor = [71, 85, 105]; // Slate 600
            const lightGray = [241, 245, 249]; // Slate 100

            // Header Background
            doc.setFillColor(...primaryColor);
            doc.rect(0, 0, 210, 40, 'F');

            // Title
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text("PAYSLIP", 15, 25);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text("PAYMENT ADVICE / INVOICE", 15, 32);

            // Company Details (Right Side of Header)
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text("Admin SUH Tech", 195, 15, { align: 'right' });

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.text("123 Tech Park, Innovation Street", 195, 22, { align: 'right' });
            doc.text("Bangalore, India - 560100", 195, 27, { align: 'right' });
            doc.text("contact@suhtech.com | +91 12345 67890", 195, 32, { align: 'right' });

            // Invoice/Slip Details
            doc.setTextColor(0, 0, 0);
            const startY = 55;

            doc.setFontSize(10);
            doc.setTextColor(...secondaryColor);
            doc.text("Slip Number:", 15, startY);
            doc.text("Payment Date:", 15, startY + 6);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`SLIP-${emp._id?.slice(-6) || 'N/A'}`, 50, startY);
            doc.text(emp.paymentDate || "N/A", 50, startY + 6);

            // Employee Details (Boxed)
            doc.setFillColor(...lightGray);
            doc.roundedRect(105, 48, 90, 32, 2, 2, 'F');

            doc.setFontSize(11);
            doc.setTextColor(...primaryColor);
            doc.text("EMPLOYEE DETAILS", 110, 56);

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(emp.employeeName || "N/A", 110, 64);

            doc.setFontSize(9);
            doc.setTextColor(...secondaryColor);
            doc.setFont('helvetica', 'normal');
            doc.text(emp.role || "N/A", 110, 69);
            doc.text(`Dept: ${emp.department || "N/A"}`, 110, 74);

            // Tables
            const earningsData = [
                ["Basic Salary", `INR ${(emp.breakdown?.basic || 0).toLocaleString('en-IN')}`],
                ...Object.entries(emp.breakdown?.allowances || {}).map(([k, v]) => [`${k} Allowance`, `INR ${v.toLocaleString('en-IN')}`])
            ];

            const deductionsData = [
                ...Object.entries(emp.breakdown?.deductions || {}).map(([k, v]) => [`${k}`, `INR ${v.toLocaleString('en-IN')}`])
            ];

            // Earnings Table
            autoTable(doc, {
                startY: 90,
                head: [['EARNINGS', 'AMOUNT']],
                body: earningsData,
                theme: 'grid',
                headStyles: { fillColor: primaryColor, textColor: 255, fontSize: 9, fontStyle: 'bold', halign: 'left' },
                bodyStyles: { fontSize: 9, cellPadding: 4 },
                columnStyles: { 0: { cellWidth: 50 }, 1: { halign: 'right', fontStyle: 'bold' } },
                margin: { left: 15 },
                tableWidth: 85
            });

            // Deductions Table
            autoTable(doc, {
                startY: 90,
                head: [['DEDUCTIONS', 'AMOUNT']],
                body: deductionsData,
                theme: 'grid',
                headStyles: { fillColor: [239, 68, 68], textColor: 255, fontSize: 9, fontStyle: 'bold', halign: 'left' },
                bodyStyles: { fontSize: 9, cellPadding: 4 },
                columnStyles: { 0: { cellWidth: 50 }, 1: { halign: 'right', fontStyle: 'bold' } },
                margin: { left: 110 },
                tableWidth: 85
            });

            const finalY = Math.max(doc.lastAutoTable.finalY, 130) + 10;

            // Total Net Pay Section
            doc.setDrawColor(...primaryColor);
            doc.setLineWidth(0.5);
            doc.line(15, finalY, 195, finalY);

            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text("NET PAYABLE AMOUNT", 15, finalY + 10);

            doc.setFontSize(16);
            doc.setTextColor(...primaryColor);
            doc.text(`INR ${(emp.breakdown?.net || 0).toLocaleString('en-IN')}`, 195, finalY + 10, { align: 'right' });

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...secondaryColor);
            doc.text(`Payment Mode: ${emp.paymentMode || "N/A"}`, 195, finalY + 18, { align: 'right' });

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("This is detailed salary invoice generated by Admin SUH Tech System.", 105, 280, { align: 'center' });
            doc.text("For any queries, please contact HR.", 105, 285, { align: 'center' });

            return doc;
        } catch (error) {
            console.error("Error creating payslip doc:", error);
            return null;
        }
    };

    const handlePreviewClick = (emp) => {
        const doc = createPDFDoc(emp);
        if (doc) {
            const pdfBlob = doc.output('blob');
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setPreviewData({
                url: pdfUrl,
                employee: emp,
                doc: doc
            });
            setIsPreviewModalOpen(true);
        }
    };

    const handleDownload = () => {
        if (previewData && previewData.doc) {
            previewData.doc.save(`Invoice_${previewData.employee._id || 'salary'}.pdf`);
        }
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
                    <h1 className="text-2xl font-bold text-gray-800">Employee Salary</h1>
                    <p className="text-gray-500 text-sm">Manage payroll, salary breakdown, and payment status</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm w-full md:w-auto"
                    >
                        <Plus size={20} />
                        <span>Add Salary Entry</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name, role, or department..."
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
                        <p className="text-gray-500 text-sm">Loading employee salaries...</p>
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                            <AlertCircle size={32} className="text-gray-400" />
                        </div>
                        <p className="text-gray-500 text-sm">
                            {searchTerm ? "No employees found matching your search." : "No salary entries found. Add your first entry!"}
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1000px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Employee</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Designation</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Details</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Payment Mode</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Payment Date</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Net Salary</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp._id} className="hover:bg-gray-50 transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {emp.employeeName?.split(" ").map(n => n[0]).join("") || "N/A"}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{emp.employeeName || "N/A"}</p>
                                                    <p className="text-xs text-gray-500 font-mono">{emp._id?.slice(-6) || ""}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-gray-800">{emp.role || "N/A"}</p>
                                            <p className="text-xs text-gray-500">{emp.department || "N/A"}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2 text-xs text-gray-600">
                                                    <Phone size={12} /> {emp.phone || "N/A"}
                                                </div>
                                                {emp.email && (
                                                    <div className="flex items-center gap-2 text-xs text-gray-600">
                                                        <Mail size={12} /> {emp.email}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-xs text-gray-500">{emp.paymentMode || "N/A"}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Calendar size={14} />
                                                {formatDate(emp.paymentDate)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="font-bold text-gray-900">₹{(emp.breakdown?.net || 0).toLocaleString('en-IN')}</span>
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${emp.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {emp.status || "Pending"}
                                            </span>
                                        </td>
                                        <td className="p-4 text-right">
                                            <div className="flex items-center justify-end gap-2 relative">
                                                <button
                                                    onClick={() => handlePreviewClick(emp)}
                                                    className="p-2 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 group"
                                                    title="Preview Invoice"
                                                >
                                                    <Eye size={16} />
                                                    <span className="text-xs font-medium">Preview</span>
                                                </button>
                                                <div className="relative">
                                                    <button
                                                        onClick={() => setActiveMenuId(activeMenuId === emp._id ? null : emp._id)}
                                                        className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {activeMenuId === emp._id && (
                                                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                                                            <button
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                onClick={() => handleDelete(emp._id)}
                                                            >
                                                                <X size={16} />
                                                                Delete
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add Salary Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">Add Salary Details</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSalary} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                                <input type="text" name="employeeName" value={newSalary.employeeName} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <input type="text" name="role" value={newSalary.role} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                                <input type="text" name="department" value={newSalary.department} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                <input type="text" name="phone" value={newSalary.phone} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input type="email" name="email" value={newSalary.email} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                                <input type="date" name="paymentDate" value={newSalary.paymentDate} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={newSalary.status} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
                                <select name="paymentMode" value={newSalary.paymentMode} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="Bank Transfer">Bank Transfer</option>
                                    <option value="Cash">Cash</option>
                                    <option value="Cheque">Cheque</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary</label>
                                <input type="number" name="basic" value={newSalary.basic} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">HRA</label>
                                <input type="number" name="hra" value={newSalary.hra} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Special Allowance</label>
                                <input type="number" name="special" value={newSalary.special} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PF Deduction</label>
                                <input type="number" name="pf" value={newSalary.pf} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tax Deduction</label>
                                <input type="number" name="tax" value={newSalary.tax} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>

                            <div className="md:col-span-2 mt-4 pt-4 border-t">
                                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                    Add Salary Entry
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Preview Modal */}
            {isPreviewModalOpen && previewData && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-4xl h-[90vh] mx-4 rounded-xl shadow-2xl flex flex-col">
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h2 className="text-xl font-semibold flex items-center gap-2">
                                <FileText className="text-blue-600" />
                                Invoice Preview - {previewData.employee.employeeName}
                            </h2>
                            <button onClick={() => setIsPreviewModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 bg-gray-100 p-4 overflow-hidden">
                            <iframe
                                src={previewData.url}
                                className="w-full h-full rounded-lg border border-gray-300 shadow-sm bg-white"
                                title="PDF Preview"
                            ></iframe>
                        </div>

                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3 rounded-b-xl">
                            <button
                                onClick={() => setIsPreviewModalOpen(false)}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 font-medium"
                            >
                                Close
                            </button>
                            <button
                                onClick={handleDownload}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-sm"
                            >
                                <Download size={18} />
                                Download Invoice
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeSalary;
