import React, { useState } from 'react';
import { Search, Plus, Filter, MoreVertical, FileText, Download, Phone, Mail, Award, AlertCircle, Eye } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const EmployeeSalary = () => {
    const [employees] = useState([
        {
            id: "EMP-001",
            name: "Rahul Sharma",
            role: "Software Engineer",
            department: "Engineering",
            phone: "+91 98765 43210",
            email: "rahul@example.com",
            salaryMonth: "October 2023",
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
            salaryMonth: "October 2023",
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
            salaryMonth: "October 2023",
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

    // Close menu when clicking outside could be handled with a global click listener, 
    // but for now simple toggle is enough. A refined approach would use a ref and useEffect.

    const generatePayslip = (emp) => {
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
            doc.text("Pay Period:", 15, startY + 6);
            doc.text("Payment Date:", 15, startY + 12);

            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`SLIP-${emp.id}-${emp.salaryMonth.substring(0, 3).toUpperCase()}`, 50, startY);
            doc.text(emp.salaryMonth, 50, startY + 6);
            doc.text(emp.paymentDate, 50, startY + 12);

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
            doc.text(`ID: ${emp.id}`, 110, 74);
            doc.text(`Dept: ${emp.department}`, 150, 74);

            // Tables
            const earningsData = [
                ["Basic Salary", `INR ${emp.breakdown.basic.toLocaleString('en-IN')}`],
                ...Object.entries(emp.breakdown.allowances).map(([k, v]) => [`${k} Allowance`, `INR ${v.toLocaleString('en-IN')}`])
            ];

            const deductionsData = [
                ...Object.entries(emp.breakdown.deductions).map(([k, v]) => [`${k}`, `INR ${v.toLocaleString('en-IN')}`])
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
            doc.text(`INR ${emp.breakdown.net.toLocaleString('en-IN')}`, 195, finalY + 10, { align: 'right' });

            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...secondaryColor);
            doc.text(`Payment Mode: ${emp.paymentMode}`, 195, finalY + 18, { align: 'right' });

            // Footer
            doc.setFontSize(8);
            doc.setTextColor(150, 150, 150);
            doc.text("This is detailed salary invoice generated by Admin SUH Tech System.", 105, 280, { align: 'center' });
            doc.text("For any queries, please contact HR.", 105, 285, { align: 'center' });

            // Save
            doc.save(`Invoice_${emp.id}_${emp.salaryMonth}.pdf`);

        } catch (error) {
            console.error("Error generating payslip:", error);
            alert("Failed to generate PDF. Check console for details.");
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
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-sm w-full md:w-auto">
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
                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
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
                                <th className="p-4 font-semibold text-gray-600 text-sm">Payment</th>
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
                                            <div className="flex items-center gap-2 text-xs text-gray-600">
                                                <Mail size={12} /> {emp.email}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <p className="text-sm font-medium text-gray-700">{emp.salaryMonth}</p>
                                        <p className="text-xs text-gray-500">{emp.paymentMode}</p>
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
                                                onClick={() => generatePayslip(emp)}
                                                className="p-2 border border-blue-200 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors flex items-center gap-2 group"
                                                title="Generate Payslip"
                                            >
                                                <Download size={16} />
                                                <span className="text-xs font-medium">Invoice</span>
                                            </button>
                                            <div className="relative">
                                                <button
                                                    onClick={() => setActiveMenuId(activeMenuId === emp.id ? null : emp.id)}
                                                    className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>

                                                {activeMenuId === emp.id && (
                                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1">
                                                        <button
                                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                            onClick={() => {
                                                                // Handle view details
                                                                setActiveMenuId(null);
                                                            }}
                                                        >
                                                            <Eye size={16} className="text-gray-500" />
                                                            View Details
                                                        </button>
                                                        {/* Add more menu items here if needed */}
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
        </div>
    );
};

export default EmployeeSalary;
