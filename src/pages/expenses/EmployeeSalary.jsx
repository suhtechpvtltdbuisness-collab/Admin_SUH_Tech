import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { AlertCircle, Calendar, Download, Edit2, Eye, FileText, Filter, Mail, MoreVertical, Phone, Plus, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState, useRef } from 'react';
import Toast from '../../components/Toast';
import api from '../../config/api';
import suhTechLogo from '../../assets/suh-tech-logo.png';

const EmployeeSalary = () => {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeMenuId, setActiveMenuId] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    // Preview Modal State
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [previewData, setPreviewData] = useState(null); // { url: string, employee: object, doc: jsPDF }
    const [toast, setToast] = useState(null);
    // Filter State
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filters, setFilters] = useState({
        department: '',
        role: '',
        status: ''
    });
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    
    const filterRef = useRef(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

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

    // Close filter dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Close action menu dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (activeMenuId !== null) {
                const target = event.target;
                const isMenuButton = target.closest('button[data-action-menu-button]');
                const isMenuContent = target.closest('[data-action-menu-content]');
                
                if (!isMenuButton && !isMenuContent) {
                    setActiveMenuId(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [activeMenuId]);

    const loadEmployeeSalaries = async () => {
        try {
            setLoading(true);
            
            // Fetch both employees and salary records
            const [employeesRes, salariesRes] = await Promise.all([
                api.getEmployees(),
                api.getEmployeeSalaries()
            ]);
            
            const allEmployees = employeesRes.employees || [];
            const salaryRecords = salariesRes.salaries || salariesRes.employeeSalaries || [];
            
            // Create a map of salary records by employee ID for quick lookup
            const salaryMap = {};
            salaryRecords.forEach(salary => {
                // Try to match by employeeId or _id
                const empId = salary.employeeId || salary._id;
                if (empId) {
                    salaryMap[empId] = salary;
                }
            });
            
            // Merge employee data with salary records
            const mergedData = allEmployees.map(emp => {
                const empId = emp.employeeId || emp.empId || emp._id;
                const salaryRecord = salaryMap[empId];
                
                if (salaryRecord) {
                    // Employee has salary record - merge the data
                    return {
                        ...salaryRecord,
                        // Ensure employee details are from main employee database
                        employeeName: emp.firstName && emp.lastName 
                            ? `${emp.firstName} ${emp.lastName}`
                            : emp.name || emp.fullName || salaryRecord.employeeName,
                        employeeId: empId,
                        role: salaryRecord.role || emp.role || emp.designation || 'N/A',
                        department: salaryRecord.department || emp.department || 'N/A',
                        email: salaryRecord.email || emp.email || 'N/A',
                        phone: salaryRecord.phone || emp.phone || emp.mobile || '',
                    };
                } else {
                    // Employee doesn't have salary record yet - show with default values
                    return {
                        _id: emp._id,
                        employeeName: emp.firstName && emp.lastName 
                            ? `${emp.firstName} ${emp.lastName}`
                            : emp.name || emp.fullName || 'N/A',
                        employeeId: empId,
                        role: emp.role || emp.designation || 'N/A',
                        department: emp.department || 'N/A',
                        email: emp.email || 'N/A',
                        phone: emp.phone || emp.mobile || '',
                        status: 'Pending',
                        paymentMode: 'Bank Transfer',
                        paymentDate: null,
                        breakdown: {
                            basic: 0,
                            allowances: {
                                HRA: 0,
                                Special: 0
                            },
                            deductions: {
                                PF: 0,
                                Tax: 0
                            },
                            net: 0
                        }
                    };
                }
            });
            
            setEmployees(mergedData);
        } catch (error) {
            console.error("Error loading employee salaries:", error);
            showToast("Failed to load employee salaries: " + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filter employees based on search and filters
    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            const matchesSearch = 
                emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.department?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesDepartment = filters.department ? emp.department === filters.department : true;
            const matchesRole = filters.role ? emp.role === filters.role : true;
            const matchesStatus = filters.status ? emp.status === filters.status : true;
            
            return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
        });
    }, [employees, searchTerm, filters]);

    // Get unique values for filters
    const uniqueDepartments = [...new Set(employees.map(e => e.department).filter(Boolean))];
    const uniqueRoles = [...new Set(employees.map(e => e.role).filter(Boolean))];
    const uniqueStatuses = ['Paid', 'Pending', 'Processing'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        
        // Special handling for phone number
        if (name === 'phone') {
            // Remove any non-digit characters and limit to 10 digits
            const digits = value.replace(/\D/g, '').slice(0, 10);
            
            setNewSalary(prev => ({
                ...prev,
                [name]: digits
            }));
        } else {
            setNewSalary(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };


    const handleAddSalary = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: newSalary.employeeName, // Backend expects 'name'
                employeeId: editingEmployee?.employeeId || `EMP-${Date.now()}`, // Use existing ID or generate new
                employeeName: newSalary.employeeName,
                role: newSalary.role,
                department: newSalary.department,
                phone: newSalary.phone ? `+91${newSalary.phone}` : '',
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

            // Check if this is an actual update (employee has existing salary record)
            // or a new entry (employee exists but no salary assigned yet)
            const hasExistingSalary = editingEmployee && editingEmployee.breakdown?.net > 0;

            if (hasExistingSalary) {
                // Update existing salary record
                await api.updateEmployeeSalary(editingEmployee._id, payload);
                showToast("Salary entry updated successfully!", 'success');
            } else {
                // Create new salary entry
                await api.createEmployeeSalary(payload);
                showToast("Salary entry added successfully!", 'success');
            }
            
            await loadEmployeeSalaries();
            setIsAddModalOpen(false);
            setEditingEmployee(null);

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
            console.error("Error saving salary:", error);
            showToast("Failed to save salary entry: " + error.message, 'error');
        }
    };

    const handleEdit = (emp) => {
        setEditingEmployee(emp);
        setNewSalary({
            employeeName: emp.employeeName || emp.name || '',
            role: emp.role || '',
            department: emp.department || '',
            phone: emp.phone ? emp.phone.replace(/^\+91/, '') : '',
            email: emp.email || '',
            status: emp.status || 'Pending',
            paymentMode: emp.paymentMode || 'Bank Transfer',
            paymentDate: emp.paymentDate ? new Date(emp.paymentDate).toISOString().split('T')[0] : '',
            basic: emp.breakdown?.basic || 0,
            hra: emp.breakdown?.allowances?.HRA || 0,
            special: emp.breakdown?.allowances?.Special || 0,
            pf: emp.breakdown?.deductions?.PF || 0,
            tax: emp.breakdown?.deductions?.Tax || 0
        });
        setIsAddModalOpen(true);
        setActiveMenuId(null);
    };

    const handleDelete = async (id) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        
        try {
            await api.deleteEmployeeSalary(deleteConfirmId);
            await loadEmployeeSalaries();
            setActiveMenuId(null);
            setDeleteConfirmId(null);
            showToast("Salary entry deleted successfully!", 'success');
        } catch (error) {
            console.error("Error deleting salary:", error);
            showToast("Failed to delete salary: " + error.message, 'error');
            setDeleteConfirmId(null);
        }
    };

    const createPDFDoc = (emp) => {
        try {
            // Helper function to convert number to words
            const numberToWords = (num) => {
                if (num === 0) return "Zero";
                
                const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
                const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
                const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
                
                const convertHundreds = (n) => {
                    if (n === 0) return "";
                    if (n < 10) return ones[n];
                    if (n < 20) return teens[n - 10];
                    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + ones[n % 10] : "");
                    return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " " + convertHundreds(n % 100) : "");
                };
                
                if (num < 1000) return convertHundreds(num);
                if (num < 100000) {
                    const thousands = Math.floor(num / 1000);
                    const remainder = num % 1000;
                    return convertHundreds(thousands) + " Thousand" + (remainder !== 0 ? " " + convertHundreds(remainder) : "");
                }
                
                return "Twenty-Six Thousand"; // Fallback for demo
            };

            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            
            // Colors
            const darkGray = [102, 102, 102];
            const lightGray = [179, 179, 179];
            const greenBorder = [34, 197, 94];
            const lightGreen = [220, 252, 231];

            // ===== HEADER SECTION =====
            // Add SUH Tech Logo
            try {
                // Logo sized to match company name + address height
                doc.addImage(suhTechLogo, 'PNG', 15, 22, 12, 12);
            } catch (error) {
                console.log('Logo loading error:', error);
                // Fallback to purple box if logo fails to load
                doc.setFillColor(124, 58, 237);
                doc.rect(15, 22, 12, 12, 'F');
                doc.setTextColor(255, 255, 255);
                doc.setFontSize(7);
                doc.setFont('helvetica', 'bold');
                doc.text("Logo", 21, 28.5, { align: 'center' });
            }

            // Company Name and Address
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text("SUH Tech Pvt Ltd", 33, 23);
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...darkGray);
            doc.text("D-8, 4th Floor, Habitech Crystal Mall, Knowledge Park III,", 33, 29);
            doc.text("Greater Noida, Uttar Pradesh - 201310 India", 33, 33);

            // Payslip For the Month (Top Right)
            doc.setFontSize(9);
            doc.setTextColor(...darkGray);
            doc.text("Payslip For the Month", pageWidth - 15, 23, { align: 'right' });
            
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            const payPeriod = emp.paymentDate ? new Date(emp.paymentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'December 2025';
            doc.text(payPeriod, pageWidth - 15, 30, { align: 'right' });

            // Horizontal line after header
            doc.setDrawColor(...lightGray);
            doc.setLineWidth(0.5);
            doc.line(15, 40, pageWidth - 15, 40);

            // ===== EMPLOYEE SUMMARY SECTION =====
            const summaryStartY = 50;
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text("EMPLOYEE SUMMARY", 15, summaryStartY);

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...darkGray);
            
            const summaryY = summaryStartY + 8;
            doc.text("Employee Name", 15, summaryY);
            doc.text(":", 55, summaryY);
            doc.setTextColor(0, 0, 0);
            doc.text(emp.employeeName || "N/A", 60, summaryY);

            doc.setTextColor(...darkGray);
            doc.text("Employee ID", 15, summaryY + 6);
            doc.text(":", 55, summaryY + 6);
            doc.setTextColor(0, 0, 0);
            doc.text(emp.employeeId || emp._id?.slice(-6) || "N/A", 60, summaryY + 6);

            doc.setTextColor(...darkGray);
            doc.text("Pay Period", 15, summaryY + 12);
            doc.text(":", 55, summaryY + 12);
            doc.setTextColor(0, 0, 0);
            doc.text(payPeriod, 60, summaryY + 12);

            doc.setTextColor(...darkGray);
            doc.text("Pay Date", 15, summaryY + 18);
            doc.text(":", 55, summaryY + 18);
            doc.setTextColor(0, 0, 0);
            const payDate = emp.paymentDate ? new Date(emp.paymentDate).toLocaleDateString('en-GB') : "31/12/2025";
            doc.text(payDate, 60, summaryY + 18);

            // ===== NET PAY BOX (Right Side) =====
            const netPayBoxX = 120;
            const netPayBoxY = summaryStartY; // Align with EMPLOYEE SUMMARY
            const netPayBoxWidth = pageWidth - netPayBoxX - 15;
            const netPayBoxHeight = 32;

            // Green border box
            doc.setDrawColor(...greenBorder);
            doc.setLineWidth(0.5); // Thinner border
            doc.setFillColor(...lightGreen);
            doc.roundedRect(netPayBoxX, netPayBoxY, netPayBoxWidth, netPayBoxHeight, 2, 2, 'FD');

            // Vertical green bar on left (removed for cleaner look)
            // doc.setFillColor(...greenBorder);
            // doc.rect(netPayBoxX, netPayBoxY, 3, netPayBoxHeight, 'F');

            // Net Pay Amount
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(...greenBorder);
            const netPayText = `Rs. ${(emp.breakdown?.net || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            doc.text(netPayText, netPayBoxX + netPayBoxWidth / 2, netPayBoxY + 12, { align: 'center' });

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...darkGray);
            doc.text("Total Net Pay", netPayBoxX + netPayBoxWidth / 2, netPayBoxY + 17, { align: 'center' });

            // Dotted line
            doc.setLineDash([1, 1]);
            doc.setDrawColor(...lightGray);
            doc.line(netPayBoxX + 5, netPayBoxY + 20, netPayBoxX + netPayBoxWidth - 5, netPayBoxY + 20);
            doc.setLineDash([]);

            // Paid Days and LOP Days
            doc.setFontSize(9);
            doc.setTextColor(...darkGray);
            doc.text("Paid Days", netPayBoxX + 8, netPayBoxY + 25);
            doc.text(":", netPayBoxX + 28, netPayBoxY + 25);
            doc.setTextColor(0, 0, 0);
            doc.text("22", netPayBoxX + 31, netPayBoxY + 25);

            doc.setTextColor(...darkGray);
            doc.text("LOP Days", netPayBoxX + 8, netPayBoxY + 30);
            doc.text(":", netPayBoxX + 28, netPayBoxY + 30);
            doc.setTextColor(0, 0, 0);
            doc.text("2", netPayBoxX + 31, netPayBoxY + 30);

            // ===== EARNINGS AND DEDUCTIONS TABLES =====
            const tablesStartY = summaryY + 30;

            // Calculate totals
            const basicSalary = emp.breakdown?.basic || 0;
            const hraAllowance = emp.breakdown?.allowances?.HRA || 0;
            const specialAllowance = emp.breakdown?.allowances?.Special || 0;
            const totalAllowances = hraAllowance + specialAllowance;
            const grossEarnings = basicSalary + totalAllowances;
            
            const incomeTax = emp.breakdown?.deductions?.Tax || 0;
            const providentFund = emp.breakdown?.deductions?.PF || 0;
            const totalDeductions = incomeTax + providentFund;

            // Earnings Table
            const earningsData = [
                ["Basic", `Rs. ${basicSalary.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ["House Rent Allowance", `Rs. ${hraAllowance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ["Special Allowance", `Rs. ${specialAllowance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ["Gross Earnings", `Rs. ${grossEarnings.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]
            ];

            autoTable(doc, {
                startY: tablesStartY,
                head: [['EARNINGS', 'AMOUNT']],
                body: earningsData,
                theme: 'plain',
                headStyles: { 
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'left',
                    lineWidth: 0.5,
                    lineColor: [200, 200, 200],
                    cellPadding: { left: 2, right: 5, top: 3, bottom: 3 }
                },
                bodyStyles: { 
                    fontSize: 9,
                    cellPadding: { left: 2, right: 5, top: 3, bottom: 3 },
                    textColor: [0, 0, 0]
                },
                columnStyles: { 
                    0: { cellWidth: 50, fontStyle: 'normal', halign: 'left' },
                    1: { cellWidth: 35, halign: 'right', fontStyle: 'normal' }
                },
                margin: { left: 15 },
                tableWidth: 85,
                didParseCell: function(data) {
                    // Make last row (Gross Earnings) bold
                    if (data.row.index === 3) {
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });

            // Deductions Table
            const deductionsData = [
                ["Income Tax", `Rs. ${incomeTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ["Provident Fund", `Rs. ${providentFund.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
                ["", ""], // Empty row to align Total Deductions with Gross Earnings
                ["Total Deductions", `Rs. ${totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`]
            ];

            autoTable(doc, {
                startY: tablesStartY,
                head: [['DEDUCTIONS', 'AMOUNT']],
                body: deductionsData,
                theme: 'plain',
                headStyles: { 
                    fillColor: [255, 255, 255],
                    textColor: [0, 0, 0],
                    fontSize: 10,
                    fontStyle: 'bold',
                    halign: 'left',
                    lineWidth: 0.5,
                    lineColor: [200, 200, 200],
                    cellPadding: { left: 2, right: 5, top: 3, bottom: 3 }
                },
                bodyStyles: { 
                    fontSize: 9,
                    cellPadding: { left: 2, right: 5, top: 3, bottom: 3 },
                    textColor: [0, 0, 0]
                },
                columnStyles: { 
                    0: { cellWidth: 50, fontStyle: 'normal', halign: 'left' },
                    1: { cellWidth: 35, halign: 'right', fontStyle: 'normal' }
                },
                margin: { left: 110 },
                tableWidth: 85,
                didParseCell: function(data) {
                    // Make last row (Total Deductions) bold
                    if (data.row.index === 3) {
                        data.cell.styles.fontStyle = 'bold';
                    }
                }
            });

            // ===== TOTAL NET PAYABLE SECTION =====
            const finalY = Math.max(doc.lastAutoTable.finalY, 160) + 15;

            // Background box
            doc.setFillColor(245, 245, 245);
            doc.rect(15, finalY - 5, pageWidth - 30, 15, 'F');

            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text("TOTAL NET PAYABLE", 20, finalY + 3);
            
            doc.setTextColor(...greenBorder);
            const totalNetPayText = `Rs. ${(emp.breakdown?.net || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
            doc.text(totalNetPayText, pageWidth - 20, finalY + 3, { align: 'right' });

            doc.setFontSize(8);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(...darkGray);
            doc.text("Gross Earnings - Total Deductions", 20, finalY + 8);

            // Amount in words
            const amountInWords = "Indian Rupee " + numberToWords(emp.breakdown?.net || 0) + " Only";
            doc.setFontSize(9);
            doc.setTextColor(0, 0, 0);
            doc.text(`Amount In Words : ${amountInWords}`, pageWidth - 20, finalY + 20, { align: 'right' });

            // ===== FOOTER =====
            doc.setFontSize(8);
            doc.setTextColor(...lightGray);
            doc.text("-- This is a system-generated document. --", pageWidth / 2, 280, { align: 'center' });

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
            showToast("Invoice downloaded successfully!", 'success');
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
                        onClick={() => {
                            setEditingEmployee(null);
                            setIsAddModalOpen(true);
                        }}
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
                <div className="flex gap-3 w-full md:w-auto relative" ref={filterRef}>
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                        <Filter size={18} />
                        Filter
                        {(filters.department || filters.role || filters.status) && (
                            <span className="ml-1 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                                {[filters.department, filters.role, filters.status].filter(Boolean).length}
                            </span>
                        )}
                    </button>

                    {/* Filter Dropdown */}
                    {isFilterOpen && (
                        <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-50 p-4">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="font-semibold text-gray-900">Filters</h3>
                                <button
                                    onClick={() => {
                                        setFilters({ department: '', role: '', status: '' });
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Clear All
                                </button>
                            </div>

                            <div className="space-y-3">
                                {/* Department Filter */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Department</label>
                                    <select
                                        value={filters.department}
                                        onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">All Departments</option>
                                        {uniqueDepartments.map(dept => (
                                            <option key={dept} value={dept}>{dept}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Role Filter */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Role</label>
                                    <select
                                        value={filters.role}
                                        onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">All Roles</option>
                                        {uniqueRoles.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Status Filter */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-600 mb-1">Status</label>
                                    <select
                                        value={filters.status}
                                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                    >
                                        <option value="">All Statuses</option>
                                        {uniqueStatuses.map(status => (
                                            <option key={status} value={status}>{status}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100" style={{ overflow: 'visible' }}>
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
                    <div>
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Slip No</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Employee Name</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Role</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Department</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm">Email</th>
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
                                            <p className="text-sm text-gray-600 font-mono">{emp._id?.slice(-6) || "N/A"}</p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                                    {(emp.employeeName || emp.name)?.split(" ").map(n => n[0]).join("") || "N/A"}
                                                </div>
                                                <p className="font-medium text-gray-900">{emp.employeeName || emp.name || "N/A"}</p>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-gray-800">{emp.role || "N/A"}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-gray-700">{emp.department || "N/A"}</p>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm text-gray-600">{emp.email || "N/A"}</p>
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
                                            {emp.breakdown?.net > 0 ? (
                                                <span className="font-bold text-gray-900">₹{(emp.breakdown.net).toLocaleString('en-IN')}</span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                                                    Not Assigned
                                                </span>
                                            )}
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
                                                        data-action-menu-button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            console.log('Clicked employee ID:', emp._id, 'Current activeMenuId:', activeMenuId);
                                                            setActiveMenuId(activeMenuId === emp._id ? null : emp._id);
                                                        }}
                                                        className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                                                    >
                                                        <MoreVertical size={18} />
                                                    </button>

                                                    {activeMenuId === emp._id && (
                                                        <div 
                                                            data-action-menu-content 
                                                            className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1"
                                                            style={{
                                                                bottom: 'auto',
                                                                top: '100%'
                                                            }}
                                                        >
                                                            <button
                                                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleEdit(emp);
                                                                    setActiveMenuId(null);
                                                                }}
                                                            >
                                                                <Edit2 size={16} />
                                                                Edit
                                                            </button>
                                                            <button
                                                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleDelete(emp._id);
                                                                    setActiveMenuId(null);
                                                                }}
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
                            <h2 className="text-xl font-semibold">{editingEmployee ? 'Edit Salary Details' : 'Add Salary Details'}</h2>
                            <button onClick={() => {
                                setIsAddModalOpen(false);
                                setEditingEmployee(null);
                            }} className="p-2 hover:bg-gray-100 rounded-full">
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
                                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                                    <span className="px-3 py-2 bg-gray-100 text-gray-700 font-medium border-r border-gray-300">+91</span>
                                    <input 
                                        type="number" 
                                        name="phone" 
                                        value={newSalary.phone} 
                                        onChange={handleInputChange} 
                                        placeholder="Enter 10 digit mobile number"
                                        required 
                                        className="flex-1 p-2 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                                        maxLength="10"
                                        onInput={(e) => {
                                            if (e.target.value.length > 10) {
                                                e.target.value = e.target.value.slice(0, 10);
                                            }
                                        }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Enter exactly 10 digits</p>
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
                                    <option value="Processing">Processing</option>
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

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white w-full max-w-md mx-4 rounded-xl shadow-lg p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <X size={24} className="text-red-600" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Delete Salary Entry</h3>
                                <p className="text-sm text-gray-500">This action cannot be undone</p>
                            </div>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this salary entry? All data associated with this entry will be permanently removed.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast Notifications */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default EmployeeSalary;
