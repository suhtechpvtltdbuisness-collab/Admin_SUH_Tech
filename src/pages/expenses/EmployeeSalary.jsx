import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, FileText, Download, Phone, Mail, Award, AlertCircle, Eye, X, Calendar } from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const EmployeeSalary = () => {
    const [employees, setEmployees] = useState([
        {
            id: "EMP-001",
            name: "Rahul Sharma",
            role: "Software Engineer",
            department: "Engineering",
            phone: "+91 98765 43210",
            email: "rahul@example.com",
            paymentDate: "31 Oct 2023",
            paymentMode: "Bank Transfer",
            status: "Paid",
            breakdown: {
                basic: 50000,
                allowances: { HRA: 20000, Special: 15000 },
                deductions: { PF: 3000, Tax: 2000 },
                net: 80000
            }
        },
        {
            id: "EMP-002",
            name: "Priya Singh",
            role: "UI/UX Designer",
            department: "Design",
            phone: "+91 98765 43211",
            email: "priya@example.com",
            paymentDate: "31 Oct 2023",
            paymentMode: "Bank Transfer",
            status: "Pending",
            breakdown: {
                basic: 45000,
                allowances: { HRA: 18000, Special: 12000 },
                deductions: { PF: 2500, Tax: 1500 },
                net: 71000
            }
        },
        {
            id: "EMP-003",
            name: "Amit Patel",
            role: "Product Manager",
            department: "Product",
            phone: "+91 98765 43212",
            email: "amit@example.com",
            paymentDate: "31 Oct 2023",
            paymentMode: "Bank Transfer",
            status: "Paid",
            breakdown: {
                basic: 70000,
                allowances: { HRA: 30000, Special: 20000 },
                deductions: { PF: 4000, Tax: 5000 },
                net: 111000
            }
        },
    ]);

    const [activeMenuId, setActiveMenuId] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // Preview Modal State
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null); // { url: string, employee: object, doc: jsPDF }

    const [newSalary, setNewSalary] = useState({
        name: '',
        role: '',
        department: '',
        phone: '',
        status: 'Pending',
        paymentMode: 'Bank Transfer',
        paymentDate: '',
        basic: 0,
        hra: 0,
        special: 0,
        pf: 0,
        tax: 0
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewSalary(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddSalary = (e) => {
        e.preventDefault();
        const basic = parseFloat(newSalary.basic) || 0;
        const hra = parseFloat(newSalary.hra) || 0;
        const special = parseFloat(newSalary.special) || 0;
        const pf = parseFloat(newSalary.pf) || 0;
        const tax = parseFloat(newSalary.tax) || 0;
        const net = basic + hra + special - pf - tax;

        const newEntry = {
            id: `EMP - ${Math.floor(Math.random() * 1000)} `,
            name: newSalary.name,
            role: newSalary.role,
            department: newSalary.department,
            phone: newSalary.phone,
            email: "",
            paymentDate: newSalary.paymentDate,
            paymentMode: newSalary.paymentMode,
            status: newSalary.status,
            breakdown: {
                basic: basic,
                allowances: { HRA: hra, Special: special },
                deductions: { PF: pf, Tax: tax },
                net: net
            }
        };

        setEmployees([...employees, newEntry]);
        setIsAddModalOpen(false);
        setNewSalary({
            name: '',
            role: '',
            department: '',
            phone: '',
            status: 'Pending',
            paymentMode: 'Bank Transfer',
            paymentDate: '',
            basic: 0,
            hra: 0,
            special: 0,
            pf: 0,
            tax: 0
        });
    };

    const createPDFDoc = (emp) => {
        try {
            const doc = new jsPDF();
            // ... (keeping existing PDF generation logic mostly same, just ensuring it handles missing dates gracefully if needed)
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
            doc.text(`SLIP - ${emp.id} `, 50, startY);
            doc.text(emp.paymentDate || "N/A", 50, startY + 6);

            // Employee Details (Boxed)
            doc.setFillColor(...lightGray);
            doc.roundedRect(105, 48, 90, 32, 2, 2, 'F');

            doc.setFontSize(11);
            doc.setTextColor(...primaryColor);
            doc.text("EMPLOYEE DETAILS", 110, 56);

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.text(emp.name, 110, 64);

            doc.setFontSize(9);
            doc.setTextColor(...secondaryColor);
            doc.setFont('helvetica', 'normal');
            doc.text(emp.role, 110, 69);
            doc.text(`ID: ${emp.id} `, 110, 74);
            doc.text(`Dept: ${emp.department} `, 150, 74);

            // Tables
            const earningsData = [
                ["Basic Salary", `INR ${emp.breakdown.basic.toLocaleString('en-IN')} `],
                ...Object.entries(emp.breakdown.allowances).map(([k, v]) => [`${k} Allowance`, `INR ${v.toLocaleString('en-IN')} `])
            ];

            const deductionsData = [
                ...Object.entries(emp.breakdown.deductions).map(([k, v]) => [`${k} `, `INR ${v.toLocaleString('en-IN')} `])
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
                headStyles: { fillColor: [239, 68, 68], textColor: 255, fontSize: 9, fontStyle: 'bold', halign: 'left' }, // Red header for deductions
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
            doc.text(`INR ${emp.breakdown.net.toLocaleString('en-IN')} `, 195, finalY + 10, { align: 'right' });

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...secondaryColor);
            doc.text(`Payment Mode: ${emp.paymentMode} `, 195, finalY + 18, { align: 'right' });

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
            previewData.doc.save(`Invoice_${previewData.employee.id}.pdf`);
        }
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
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm w-full md:w-auto cursor-pointer"
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
                        placeholder="Search by name or ID..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                    />
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select className="flex-1 md:flex-none px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 focus:outline-none focus:border-blue-400 cursor-pointer">
                        <option>October 2023</option>
                        <option>September 2023</option>
                        <option>August 2023</option>
                    </select>
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer">
                        <Filter size={18} />
                        Filter
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
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
                            {employees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                {emp.name.split(" ").map(n => n[0]).join("")}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{emp.name}</p>
                                                <p className="text-xs text-gray-500 font-mono">{emp.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm text-gray-800">{emp.role}</p>
                                        <p className="text-xs text-gray-500">{emp.department}</p>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <Phone size={12} /> {emp.phone}
                                            </div>
                                            {/* Removed Email as requested */}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        {/* Removed salaryMonth */}
                                        {/* Removed Date as requested */}
                                        <p className="text-xs text-gray-500">{emp.paymentMode}</p>

                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar size={14} />
                                            {emp.paymentDate}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="font-bold text-gray-900">₹{emp.breakdown.net.toLocaleString('en-IN')}</span>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${emp.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex items-center justify-end gap-2 relative">
                                            <button
                                                onClick={() => handlePreviewClick(emp)}
                                                className="p-2 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 group cursor-pointer"
                                                title="Preview Invoice"
                                            >
                                                <Eye size={16} />
                                                <span className="text-xs font-medium">Preview</span>
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                                                    className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {activeMenuId === emp.id && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                                                        <button
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            onClick={() => {
                                                                setActiveMenuId(null);
                                                            }}
                                                        >
                                                            <Eye size={16} className="text-gray-500" />
                                                            View Details
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
            </div>

            {/* Add Salary Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
                        <div className="flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-xl font-semibold">Add Salary Details</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddSalary} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                                <input type="text" name="name" value={newSalary.name} onChange={handleInputChange} required className="w-full p-2 border border-gray-300 rounded-lg" />
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
                                <label className="block text-sm font-medium text-gray-700 mb-1">Payment Date</label>
                                <input type="text" name="paymentDate" value={newSalary.paymentDate} onChange={handleInputChange} required placeholder="e.g. 31 Oct 2023" className="w-full p-2 border border-gray-300 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" value={newSalary.status} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-lg">
                                    <option value="Pending">Pending</option>
                                    <option value="Paid">Paid</option>
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
                                <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
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
                                Invoice Preview - {previewData.employee.name}
                            </h2>
                            <button onClick={() => setIsPreviewModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors">
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
