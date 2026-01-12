import { Calendar, Check, Clock, Download, Edit2, Filter, Plus, Search, Trash2, UserCheck, Users, X, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import Toast from '../components/Toast';
import api from '../config/api';
import jsPDF from 'jspdf';

const EmployeeAttendance = () => {
    const [employees, setEmployees] = useState([]);
    const [attendance, setAttendance] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All Status');
    const [toast, setToast] = useState(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
    const [openExportDropdown, setOpenExportDropdown] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        employeeId: '',
        department: '',

        status: '',
        hours: ''
    });



    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openStatusDropdown && !event.target.closest('.status-dropdown')) {
                setOpenStatusDropdown(null);
            }
            if (openExportDropdown && !event.target.closest('.export-dropdown')) {
                setOpenExportDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openStatusDropdown, openExportDropdown]);


    useEffect(() => {
        loadEmployees();
    }, []);

    // Load attendance from local storage whenever date changes
    useEffect(() => {
        loadAttendance();
    }, [selectedDate]);

    const loadEmployees = async () => {
        try {
            setLoading(true);
            const res = await api.getEmployees();
            setEmployees(res.employees || []);
        } catch (error) {
            console.error('Error loading employees:', error);
            showToast('Failed to load employees', 'error');
        } finally {
            setLoading(false);
        }
    };

    const loadAttendance = () => {
        try {
            const storedAttendance = JSON.parse(localStorage.getItem('attendance_records') || '{}');
            const dateRecords = storedAttendance[selectedDate] || {};
            setAttendance(dateRecords);
        } catch (error) {
            console.error('Error loading attendance:', error);
        }
    };

    const saveAttendance = (newAttendance) => {
        try {
            const storedAttendance = JSON.parse(localStorage.getItem('attendance_records') || '{}');
            storedAttendance[selectedDate] = newAttendance;
            localStorage.setItem('attendance_records', JSON.stringify(storedAttendance));
            setAttendance(newAttendance);
        } catch (error) {
            console.error('Error saving attendance:', error);
        }
    };

    const handleCheckIn = (employeeId) => {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        const updatedRecord = {
            ...attendance[employeeId],
            checkIn: time,
            status: 'Present',
            hours: 'In Progress'
        };

        const newAttendance = {
            ...attendance,
            [employeeId]: updatedRecord
        };

        saveAttendance(newAttendance);
        showToast('Check-in recorded successfully!', 'success');
    };

    const handleCheckOut = (employeeId) => {
        const now = new Date();
        const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        const updatedRecord = {
            ...attendance[employeeId],
            checkOut: time,
            status: 'Present',
            hours: '9h 0m' // Default hours, normally calculated or edited
        };

        const newAttendance = {
            ...attendance,
            [employeeId]: updatedRecord
        };

        saveAttendance(newAttendance);
        showToast('Check-out recorded successfully!', 'success');
    };

    const handleAddEmployee = async (e) => {
        e.preventDefault();
        
        // Validate Employee ID starts with EMP
        if (!newEmployee.employeeId.toUpperCase().startsWith('EMP')) {
            showToast('Employee ID must start with "EMP"', 'error');
            return;
        }

        try {
            if (editingEmployee) {
                // Update existing employee
                await api.updateEmployee(editingEmployee._id, newEmployee);
                
                // Also update the attendance record for the current date if status/hours changed
                const updatedRecord = {
                    ...attendance[editingEmployee._id],
                    status: newEmployee.status,
                    hours: newEmployee.hours
                };
                
                const newAttendance = {
                    ...attendance,
                    [editingEmployee._id]: updatedRecord
                };
                saveAttendance(newAttendance);
                
                showToast('Employee updated successfully!', 'success');
            } else {
                // Add new employee
                const res = await api.createEmployee(newEmployee);
                
                // Initialize attendance for new employee
                if (res.employee && res.employee._id) {
                    const newRecord = {
                        checkIn: '-',
                        checkOut: '-',
                        status: newEmployee.status,
                        hours: '0h'
                    };
                     const newAttendance = {
                        ...attendance,
                        [res.employee._id]: newRecord
                    };
                    saveAttendance(newAttendance);
                }
                
                showToast('Employee added successfully!', 'success');
            }
            
            await loadEmployees();
            setIsAddModalOpen(false);
            setEditingEmployee(null);
            // setNewEmployee({
            //     name: '',
            //     employeeId: '',
            //     department: 'Engineering',
            //     avatar: '👨‍💼',
            //     status: 'Present',
            //     hours: '0h'
            // });
        } catch (error) {
            console.error('Error saving employee:', error);
            showToast('Failed to save employee', 'error');
        }
    };

    const handleEdit = (emp) => {
        const empAttendance = attendance[emp._id] || {};
        setEditingEmployee(emp);
        
        // Ensure ID starts with EMP
        let currentId = emp.employeeId || emp.empId || '';
        if (currentId && !currentId.toUpperCase().startsWith('EMP')) {
            currentId = `EMP-${currentId}`;
        }

        setNewEmployee({
            name: emp.name || emp.fullName || emp.employeeName || '',
            employeeId: currentId,
            department: emp.department || 'Engineering',
            status: empAttendance.status || 'Present',
            hours: empAttendance.hours || '0h'
        });
        setIsAddModalOpen(true);
    };

    const handleStatusChange = (empId, newStatus) => {
        const updatedRecord = {
            ...attendance[empId],
            status: newStatus
        };
        
        const newAttendance = {
            ...attendance,
            [empId]: updatedRecord
        };
        
        saveAttendance(newAttendance);
        setOpenStatusDropdown(null);
        showToast(`Status updated to ${newStatus}`, 'success');
    };

    const handleDelete = (id) => {
        setDeleteConfirmId(id);
    };

    const confirmDelete = async () => {
        if (!deleteConfirmId) return;
        
        try {
            await api.deleteEmployee(deleteConfirmId);
            await loadEmployees();
            
            // Optional: Remove attendance records for this employee? 
            // For now, keeping history is safer, but UI won't show it if employee is gone.
            
            showToast('Employee deleted successfully!', 'success');
            setDeleteConfirmId(null);
        } catch (error) {
            console.error('Error deleting employee:', error);
            showToast('Failed to delete employee', 'error');
            setDeleteConfirmId(null);
        }
    };

    const handleDownloadIndividualPDF = (emp) => {
        try {
            const att = attendance[emp._id] || {};
            const employeeName = emp.firstName && emp.lastName 
                ? `${emp.firstName} ${emp.lastName}`
                : emp.name || emp.fullName || emp.employeeName || 'Unknown';
            const employeeId = emp.employeeId || emp.empId || 'N/A';
            
            // Create PDF
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            
            // Company Header with Blue Background
            doc.setFillColor(37, 99, 235); // Blue color
            doc.rect(0, 0, pageWidth, 50, 'F');
            
            // Company Name
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(24);
            doc.setFont('helvetica', 'bold');
            doc.text('SUH TECH PRIVATE LIMITED', pageWidth / 2, 20, { align: 'center' });
            
            // Company Address
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('D-8, 4th Floor, Habitech Crystal Mall, Knowledge Park III, Greater Noida,', pageWidth / 2, 30, { align: 'center' });
            doc.text('Uttar Pradesh - 201310', pageWidth / 2, 36, { align: 'center' });
            
            // Contact Info
            doc.setFontSize(9);
            doc.text('Email: info@suhtech.top | Phone: +91 9211056355 (WhatsApp) | Tel: +91 1204086567', pageWidth / 2, 44, { align: 'center' });
            
            // Document Title
            doc.setTextColor(0, 0, 0);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('ATTENDANCE RECORD', pageWidth / 2, 65, { align: 'center' });
            
            // Date and Record Info Box
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(245, 245, 245);
            doc.roundedRect(15, 75, pageWidth - 30, 25, 3, 3, 'FD');
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text('Date:', 20, 85);
            doc.setFont('helvetica', 'normal');
            doc.text(selectedDate, 50, 85);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Status:', 120, 85);
            doc.setTextColor(att.status === 'Present' ? 34 : att.status === 'Absent' ? 220 : 234, 
                           att.status === 'Present' ? 197 : att.status === 'Absent' ? 38 : 179, 
                           att.status === 'Present' ? 94 : att.status === 'Absent' ? 38 : 8);
            doc.text(att.status || 'Absent', 150, 85);
            
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'bold');
            doc.text('Generated:', 20, 95);
            doc.setFont('helvetica', 'normal');
            doc.text(new Date().toLocaleDateString(), 50, 95);
            
            // Employee Information Section
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('EMPLOYEE INFORMATION:', 15, 115);
            
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.text('Name:', 20, 128);
            doc.setFont('helvetica', 'normal');
            doc.text(employeeName, 60, 128);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Employee ID:', 20, 138);
            doc.setFont('helvetica', 'normal');
            doc.text(employeeId, 60, 138);
            
            doc.setFont('helvetica', 'bold');
            doc.text('Department:', 20, 148);
            doc.setFont('helvetica', 'normal');
            doc.text(emp.department || 'N/A', 60, 148);
            
            // Attendance Details Section
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('ATTENDANCE DETAILS:', 15, 168);
            
            // Table Header
            doc.setFillColor(37, 99, 235);
            doc.setTextColor(255, 255, 255);
            doc.rect(15, 175, pageWidth - 30, 10, 'F');
            
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');
            doc.text('Description', 20, 182);
            doc.text('Time/Value', pageWidth - 50, 182);
            
            // Table Rows
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');
            let yPos = 192;
            
            const rows = [
                ['Check In', att.checkIn || '-'],
                ['Check Out', att.checkOut || '-'],
                ['Working Hours', att.hours || '0h'],
                ['Status', att.status || 'Absent']
            ];
            
            rows.forEach((row, index) => {
                if (index % 2 === 0) {
                    doc.setFillColor(250, 250, 250);
                    doc.rect(15, yPos - 7, pageWidth - 30, 10, 'F');
                }
                doc.setFont('helvetica', 'bold');
                doc.text(row[0], 20, yPos);
                doc.setFont('helvetica', 'normal');
                doc.text(row[1], pageWidth - 50, yPos);
                yPos += 10;
            });
            
            // Footer
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text('This is a computer-generated document. No signature required.', pageWidth / 2, 280, { align: 'center' });
            
            // Save PDF
            doc.save(`${employeeId}_attendance_${selectedDate}.pdf`);
            
            showToast('Attendance PDF downloaded successfully!', 'success');
        } catch (error) {
            console.error('Error downloading attendance:', error);
            showToast('Failed to download attendance PDF', 'error');
        }
    };


    const handleExport = () => {
        try {
            const csv = [
                ['Employee Name', 'Employee ID', 'Department', 'Check In', 'Check Out', 'Working Hours', 'Status'],
                ...filteredEmployees.map(emp => {
                    const att = attendance[emp._id] || {};
                    const employeeName = emp.firstName && emp.lastName 
                        ? `${emp.firstName} ${emp.lastName}`
                        : emp.name || emp.fullName || emp.employeeName || '';
                    return [
                        employeeName,
                        emp.employeeId || emp.empId || '',
                        emp.department || '',
                        att.checkIn || '-',
                        att.checkOut || '-',
                        att.hours || '0h',
                        att.status || 'Absent'
                    ];
                })
            ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance-${selectedDate}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            
            setOpenExportDropdown(false);
            showToast('Attendance exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting:', error);
            showToast('Failed to export attendance', 'error');
        }
    };

    const handleExportWeek = () => {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 6); // Last 7 days including today
            
            const csv = [
                ['Date', 'Employee Name', 'Employee ID', 'Department', 'Check In', 'Check Out', 'Working Hours', 'Status'],
                ...generateDateRangeData(startDate, endDate)
            ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance-last-7-days-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            
            setOpenExportDropdown(false);
            showToast('Last 7 days attendance exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting:', error);
            showToast('Failed to export attendance', 'error');
        }
    };

    const handleExportMonth = () => {
        try {
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 29); // Last 30 days including today
            
            const csv = [
                ['Date', 'Employee Name', 'Employee ID', 'Department', 'Check In', 'Check Out', 'Working Hours', 'Status'],
                ...generateDateRangeData(startDate, endDate)
            ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
            
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `attendance-last-30-days-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
            
            setOpenExportDropdown(false);
            showToast('Last 30 days attendance exported successfully!', 'success');
        } catch (error) {
            console.error('Error exporting:', error);
            showToast('Failed to export attendance', 'error');
        }
    };

    const generateDateRangeData = (startDate, endDate) => {
        const data = [];
        const currentDate = new Date(startDate);
        
        // Get all attendance records from localStorage
        const storedAttendance = JSON.parse(localStorage.getItem('attendance_records') || '{}');
        
        while (currentDate <= endDate) {
            const dateStr = currentDate.toISOString().split('T')[0];
            const dayAttendance = storedAttendance[dateStr] || {};
            
            // Only include data if there are attendance records for this date
            if (Object.keys(dayAttendance).length > 0) {
                employees.forEach(emp => {
                    const att = dayAttendance[emp._id];
                    
                    // Only include employee if they have attendance data for this date
                    if (att) {
                        const employeeName = emp.firstName && emp.lastName 
                            ? `${emp.firstName} ${emp.lastName}`
                            : emp.name || emp.fullName || emp.employeeName || '';
                        
                        // Format date as DD/MM/YYYY with tab prefix to force text format in Excel
                        const [year, month, day] = dateStr.split('-');
                        const formattedDate = `\t${day}/${month}/${year}`;
                        
                        data.push([
                            formattedDate,
                            employeeName,
                            emp.employeeId || emp.empId || '',
                            emp.department || '',
                            att.checkIn || '-',
                            att.checkOut || '-',
                            att.hours || '0h',
                            att.status || 'Absent'
                        ]);
                    }
                });
            }
            
            currentDate.setDate(currentDate.getDate() + 1);
        }
        
        return data;
    };




    const getStatusColor = (status) => {
        switch (status) {
            case 'Present': return 'bg-green-100 text-green-700';
            case 'Absent': return 'bg-red-100 text-red-700';
            case 'Late': return 'bg-yellow-100 text-yellow-700';
            case 'Leave': return 'bg-blue-100 text-blue-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const att = attendance[emp._id] || {};
        // If no attendance record exists for this date, default status is Absent (or 'NA'?) 
        // Logic: If they are in the employee list, they are 'Absent' unless marked otherwise.
        const currentStatus = att.status || 'Absent';
        
        const matchesSearch = (emp.name || emp.fullName || emp.employeeName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (emp.employeeId || emp.empId || '').toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'All Status' || currentStatus === filterStatus;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: employees.length,
        present: Object.values(attendance).filter(a => a.status === 'Present').length,
        absent: employees.length - Object.values(attendance).filter(a => a.status !== 'Absent').length, // Rough estimate
        leave: Object.values(attendance).filter(a => a.status === 'Leave').length
    };
    
    // Correct stats calculation based on explicit records + defaults //
    // Actually, "Absent" counts need to be smarter. //
    // If we have 10 employees and 2 are present, 8 are absent purely by default. //
    const realStats = {
        total: employees.length,
        present: 0,
        absent: 0,
        leave: 0
    };
    
    employees.forEach(emp => {
        const status = attendance[emp._id]?.status || 'Absent';
        if (status === 'Present') realStats.present++;
        else if (status === 'Leave') realStats.leave++;
        else realStats.absent++;
    });

    return (
        <div className="p-4 md:p-6">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Employee Attendance</h1>
                <p className="text-sm md:text-base text-gray-500 mt-1">Track and manage employee attendance records</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs md:text-sm text-gray-500 font-medium">Total Employees</p>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Users size={20} className="text-purple-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-800">{realStats.total}</h3>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs md:text-sm text-gray-500 font-medium">Present</p>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Check size={20} className="text-green-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-green-600">{realStats.present}</h3>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs md:text-sm text-gray-500 font-medium">Absent</p>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-red-100 rounded-lg flex items-center justify-center">
                            <X size={20} className="text-red-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-red-600">{realStats.absent}</h3>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs md:text-sm text-gray-500 font-medium">On Leave</p>
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Calendar size={20} className="text-blue-600" />
                        </div>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-blue-600">{realStats.leave}</h3>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Date Picker */}
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all font-medium text-gray-700"
                        />
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search employees..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all appearance-none bg-white cursor-pointer"
                        >
                            <option>All Status</option>
                            <option>Present</option>
                            <option>Absent</option>
                            <option>Late</option>
                            <option>Leave</option>
                        </select>
                    </div>






                    {/* Export Dropdown */}
                    <div className="relative export-dropdown">
                        <button
                            onClick={() => setOpenExportDropdown(!openExportDropdown)}
                            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-sm hover:shadow w-full"
                        >
                            <Download size={18} />
                            <span className="hidden sm:inline">Export</span>
                            <ChevronDown size={16} className={`transition-transform ${openExportDropdown ? 'rotate-180' : ''}`} />
                        </button>
                        
                        {/* Dropdown Menu */}
                        {openExportDropdown && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <button
                                    onClick={handleExport}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2 text-gray-700 font-medium"
                                >
                                    <Calendar size={14} />
                                    Today
                                </button>
                                <button
                                    onClick={handleExportWeek}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2 text-gray-700 font-medium"
                                >
                                    <Calendar size={14} />
                                    Last 7 Days
                                </button>
                                <button
                                    onClick={handleExportMonth}
                                    className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2 text-gray-700 font-medium"
                                >
                                    <Calendar size={14} />
                                    Last 30 Days
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>


            {/* Attendance Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                {loading ? (
                    <div className="p-8 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                        <p className="text-gray-500 text-sm">Loading attendance...</p>
                    </div>
                ) : filteredEmployees.length === 0 ? (
                    <div className="p-12 text-center">
                        <UserCheck size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 text-sm">No employees found for this date/filter</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[1200px]">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap text-center w-[5%]">S.No</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap w-[20%]">Employee Name</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap text-center w-[12%]">Employee ID</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap hidden md:table-cell w-[12%]">Department</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap text-center w-[10%]">Check In</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap text-center w-[10%]">Check Out</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap hidden lg:table-cell text-center w-[8%]">Working Hours</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap text-center w-[11%]">Status</th>
                                    <th className="p-4 font-semibold text-gray-600 text-sm whitespace-nowrap text-center w-[12%]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredEmployees.map((emp, index) => {
                                    const att = attendance[emp._id] || {};
                                    // Create unique identifier for dropdown
                                    const uniqueId = emp._id || emp.employeeId || `emp-${index}`;
                                    
                                    return (
                                        <tr key={uniqueId} className="hover:bg-gray-50 transition-colors">
                                            <td className="p-4 text-sm text-gray-600 font-medium align-middle text-center">{index + 1 < 10 ? `0${index + 1}` : index + 1}</td>
                                            <td className="p-4 align-middle">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
                                                        {(() => {
                                                            const fullName = emp.firstName && emp.lastName 
                                                                ? `${emp.firstName} ${emp.lastName}`
                                                                : emp.name || emp.fullName || emp.employeeName || 'NA';
                                                            return fullName.split(' ').map(n => n[0]).join('');
                                                        })()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 text-sm md:text-base whitespace-nowrap">
                                                            {emp.firstName && emp.lastName 
                                                                ? `${emp.firstName} ${emp.lastName}`
                                                                : emp.name || emp.fullName || emp.employeeName || 'Unknown'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm text-gray-600 font-medium align-middle text-center">{emp.employeeId || emp.empId || 'N/A'}</td>
                                            <td className="p-4 text-sm text-gray-600 hidden md:table-cell align-middle truncate">{emp.department}</td>
                                            <td className="p-4 align-middle text-center">
                                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                                                    <Clock size={14} className="text-gray-400" />
                                                    <span className={`font-medium ${att.checkIn && att.checkIn !== '-' ? 'text-gray-900' : 'text-gray-400'}`}>
                                                        {att.checkIn || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 align-middle text-center">
                                                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 whitespace-nowrap">
                                                    <Clock size={14} className="text-gray-400" />
                                                    <span className={`font-medium ${att.checkOut && att.checkOut !== '-' ? 'text-gray-900' : 'text-gray-400'}`}>
                                                        {att.checkOut || '-'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-4 text-sm font-semibold text-gray-700 hidden lg:table-cell align-middle text-center">{att.hours || '0h'}</td>
                                            <td className="p-4 align-middle text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(att.status || 'Absent')}`}>
                                                    {att.status || 'Absent'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right align-middle">
                                                <div className="flex gap-3 justify-end items-center">
                                                    {/* Status Dropdown */}
                                                    <div className="relative status-dropdown">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setOpenStatusDropdown(openStatusDropdown === emp._id ? null : emp._id);
                                                            }}
                                                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100 text-sm font-medium"
                                                            title="Change Status"
                                                        >
                                                            <Check size={14} />
                                                            <span className="hidden sm:inline">{att.status || 'Present'}</span>
                                                            <ChevronDown size={14} className={`transition-transform ${openStatusDropdown === emp._id ? 'rotate-180' : ''}`} />
                                                        </button>
                                                        
                                                        {/* Dropdown Menu */}
                                                        {openStatusDropdown === emp._id && (
                                                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                                <button
                                                                    onClick={() => handleStatusChange(emp._id, 'Present')}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 text-green-600 font-medium"
                                                                >
                                                                    <Check size={14} />
                                                                    Present
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(emp._id, 'Absent')}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 text-red-600 font-medium"
                                                                >
                                                                    <X size={14} />
                                                                    Absent
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(emp._id, 'Late')}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 text-pink-600 font-medium"
                                                                >
                                                                    <Clock size={14} />
                                                                    Late
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(emp._id, 'Leave')}
                                                                    className="w-full px-4 py-2 text-left text-sm hover:bg-blue-50 flex items-center gap-2 text-blue-600 font-medium"
                                                                >
                                                                    <Calendar size={14} />
                                                                    On Leave
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(emp._id)}
                                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDownloadIndividualPDF(emp)}
                                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors border border-green-100"
                                                        title="Download PDF"
                                                    >
                                                        <Download size={16} />
                                                    </button>
                                                    
                                                    {/* Check In / Out Button Logic */}
                                                    {(!att.checkIn || att.checkIn === '-') ? (
                                                        <button
                                                            onClick={() => handleCheckIn(emp._id)}
                                                            className="px-3 py-1.5 text-xs font-semibold bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors whitespace-nowrap"
                                                        >
                                                            Check In
                                                        </button>
                                                    ) : (!att.checkOut || att.checkOut === '-') ? (
                                                        <button
                                                            onClick={() => handleCheckOut(emp._id)}
                                                            className="px-3 py-1.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors whitespace-nowrap"
                                                        >
                                                            Check Out
                                                        </button>
                                                    ) : (
                                                        <span className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg whitespace-nowrap">
                                                            Done
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        <div className="pb-40"></div>
                    </div>
                )}

                {/* Footer */}
                {!loading && filteredEmployees.length > 0 && (
                    <div className="p-4 border-t border-gray-100 text-center">
                        <p className="text-sm text-gray-500">
                            Showing {filteredEmployees.length} of {employees.length} employees
                        </p>
                    </div>
                )}
            </div>

            {/* Add/Edit Employee Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-md rounded-xl shadow-2xl animate-fadeIn">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800">{editingEmployee ? 'Edit Employee' : 'Add New Employee'}</h2>
                            <button
                                onClick={() => {
                                    setIsAddModalOpen(false);
                                    setEditingEmployee(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleAddEmployee} className="p-6 space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Employee Name *</label>
                                    <input
                                        type="text"
                                        value={newEmployee.name}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                                        required
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all font-medium"
                                        placeholder=""
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Employee ID *</label>
                                    <input
                                        type="text"
                                        value={newEmployee.employeeId}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, employeeId: e.target.value })}
                                        required
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all font-medium uppercase"
                                        placeholder="EMP-001"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Department *</label>
                                    <div className="relative">
                                        <select
                                            value={newEmployee.department}
                                            onChange={(e) => setNewEmployee({ ...newEmployee, department: e.target.value })}
                                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all font-medium appearance-none bg-white"
                                        >
                                            <option>Engineering</option>
                                            <option>Development</option>
                                            <option>Design</option>
                                            <option>Marketing</option>
                                            <option>HR</option>
                                            <option>Sales</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                                    <div className="relative">
                                        <select
                                            value={newEmployee.status}
                                            onChange={(e) => setNewEmployee({ ...newEmployee, status: e.target.value })}
                                            className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all font-medium appearance-none bg-white"
                                        >
                                            <option>Present</option>
                                            <option>Absent</option>
                                            <option>Late</option>
                                            <option>Leave</option>
                                        </select>
                                        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Hours</label>
                                    <input
                                        type="text"
                                        value={newEmployee.hours}
                                        onChange={(e) => setNewEmployee({ ...newEmployee, hours: e.target.value })}
                                        className="w-full p-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-100 focus:border-purple-500 transition-all font-medium"
                                        placeholder="e.g. 8h 30m"
                                    />
                                </div>
                            </div>



                            <div className="flex gap-3 pt-4 border-t border-gray-100 mt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsAddModalOpen(false);
                                        setEditingEmployee(null);
                                    }}
                                    className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold shadow-md hover:shadow-lg"
                                >
                                    {editingEmployee ? 'Update Changes' : 'Add Employee'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 animate-fadeIn">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                <Trash2 size={32} className="text-red-500" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Employee?</h3>
                            <p className="text-gray-500">
                                Are you sure you want to delete this employee? This action prevents future attendance tracking and cannot be undone.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-semibold shadow-md"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default EmployeeAttendance;
