import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  AlertCircle,
  Calendar,
  Download,
  Edit2,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Mail,
  MoreVertical,
  Phone,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import Toast from "../../components/common/Toast";
import { authService, employeeService, expenseService, attendanceService } from "../../services";

// Import logo, icons, and stamp from public folder
const suhTechLogo = "/suh-tech-logo.png";
const emailIcon = "/email-icon.png";
const phoneIcon = "/phone-icon.png";
const companyStamp = "/company-stamp.png";

const EmployeeSalary = () => {
  const [employees, setEmployees] = useState([]);          // only those WITH salary records
  const [allEmployeesList, setAllEmployeesList] = useState([]); // ALL employees for the dropdown
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
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
    department: "",
    role: "",
    status: "",
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const filterRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const [newSalary, setNewSalary] = useState({
    userId: "",
    employeeName: "",
    role: "",
    department: "",      // display name (shown in form)
    departmentId: "",   // numeric ID (sent in API payload)
    phone: "",
    email: "",
    status: "pending",
    paymentMode: "cash",
    paymentDate: "",
    basic: 0,
    hra: 0,
    conveyance: 0,
    special: 0,
    pf: 0,
    tax: 0,
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Close action menu dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenuId !== null) {
        const target = event.target;
        // Use closest on a wrapper div — works even when clicking SVG icons inside the button
        const isInsideMenu = target.closest("[data-action-menu-wrap]");
        if (!isInsideMenu) {
          setActiveMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuId]);

  // helper — stable toggle that won't race with the close-outside handler
  const handleMenuToggle = (e, menuId) => {
    e.stopPropagation();
    setActiveMenuId((prev) => (prev === menuId ? null : menuId));
  };

  const loadEmployeeSalaries = async () => {
    try {
      setLoading(true);

      // Fetch both employees and salary records in parallel
      const [employeesRes, salariesRes] = await Promise.all([
        employeeService.getAllEmployees(),
        expenseService.getEmployeeSalaries(),
      ]);

      // Filter out test/placeholder employees
      const allEmployees = (employeesRes || []).filter(
        (emp) => emp.email !== "john.doe@example.com",
      );

      // Normalise salary records — the DB returns snake_case field names
      // (user_id, basic_salary, payment_mode, etc.), so we map them to camelCase
      const rawRecords = Array.isArray(salariesRes)
        ? salariesRes
        : salariesRes?.data
        ?? salariesRes?.records
        ?? salariesRes?.salaries
        ?? salariesRes?.employeeSalaries
        ?? [];

      const salaryRecords = rawRecords.map((r) => ({
        // The expense record's own primary key — used for PATCH /expenses/employee/:id and DELETE
        expenseId: r.id ?? r._id,
        userId: r.user_id ?? r.userId,
        amount: r.amount,
        phone: r.phone,
        status: r.status,
        role: r.role,
        // department is stored as numeric ID in DB
        departmentId: r.department ?? r.departmentId,
        paymentMode: r.payment_mode ?? r.paymentMode,
        basicSalary: r.basic_salary ?? r.basicSalary ?? 0,
        hra: r.hra ?? 0,
        conveyance: r.conveyance ?? 0,
        specialAllowance: r.special_allowance ?? r.specialAllowance ?? 0,
        pfDeductions: r.pf_deductions ?? r.pfDeductions ?? 0,
        taxDeductions: r.tax_deductions ?? r.taxDeductions ?? 0,
        paymentDate: r.date ?? r.paymentDate,
        createdAt: r.created_at ?? r.createdAt,
      }));

      // Salary map keyed by userId for quick lookup
      const salaryMap = {};
      salaryRecords.forEach((s) => {
        if (s.userId != null) salaryMap[String(s.userId)] = s;
      });

      // Merge employee data with their salary record
      const mergedData = allEmployees.map((emp) => {
        const empId = emp.id ?? emp.employeeId ?? emp.empId ?? emp._id;
        const salary = empId != null ? salaryMap[String(empId)] : undefined;

        const basicSalary = salary?.basicSalary ?? 0;
        const hraAmt = salary?.hra ?? 0;
        const conveyance = salary?.conveyance ?? 0;
        const specialAmt = salary?.specialAllowance ?? 0;
        const pfDed = salary?.pfDeductions ?? 0;
        const taxDed = salary?.taxDeductions ?? 0;
        const netSalary = basicSalary + hraAmt + conveyance + specialAmt - pfDed - taxDed;

        const fullName = emp.firstName && emp.lastName
          ? `${emp.firstName} ${emp.lastName}`
          : emp.name || emp.fullName || "N/A";

        if (salary) {
          return {
            // Use the expense record's ID for PATCH/DELETE calls
            _id: salary.expenseId,
            expenseId: salary.expenseId,
            employeeName: fullName,
            employeeId: empId,
            userId: salary.userId ?? empId,
            departmentId: emp.departmentId ?? salary.departmentId,
            role: salary.role || emp.role || emp.designation || "N/A",
            department: emp.department || "N/A",
            email: emp.email || "N/A",
            phone: salary.phone || emp.phone || emp.mobile || "",
            status: salary.status || "pending",
            paymentMode: salary.paymentMode || "cash",
            paymentDate: salary.paymentDate || null,
            amount: salary.amount || 0,
            basicSalary: basicSalary,
            hra: hraAmt,
            conveyance: conveyance,
            specialAllowance: specialAmt,
            pfDeductions: pfDed,
            taxDeductions: taxDed,
            breakdown: {
              basic: basicSalary,
              allowances: { HRA: hraAmt, Special: specialAmt, Conveyance: conveyance },
              deductions: { PF: pfDed, Tax: taxDed },
              net: netSalary,
            },
          };
        } else {
          // Employee has no salary record yet
          return {
            _id: null,            // no expense record yet
            expenseId: null,
            employeeName: fullName,
            employeeId: empId,
            userId: empId,
            departmentId: emp.departmentId,
            role: emp.role || emp.designation || "N/A",
            department: emp.department || "N/A",
            email: emp.email || "N/A",
            phone: emp.phone || emp.mobile || "",
            status: "pending",
            paymentMode: "cash",
            paymentDate: null,
            breakdown: {
              basic: 0,
              allowances: { HRA: 0, Special: 0, Conveyance: 0 },
              deductions: { PF: 0, Tax: 0 },
              net: 0,
            },
          };
        }
      });

      // All employees go into the dropdown list
      setAllEmployeesList(mergedData);

      // Only show employees who have an actual salary record in the DB
      setEmployees(mergedData.filter((emp) => emp.expenseId != null));
    } catch (error) {
      console.error("Error loading employee salaries:", error);
      showToast("Failed to load employee salaries: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  // Filter employees based on search and filters
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.employeeName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = filters.department
        ? emp.department === filters.department
        : true;
      const matchesRole = filters.role ? emp.role === filters.role : true;
      const matchesStatus = filters.status
        ? emp.status === filters.status
        : true;

      return matchesSearch && matchesDepartment && matchesRole && matchesStatus;
    });
  }, [employees, searchTerm, filters]);

  // Get unique values for filters
  const uniqueDepartments = [
    ...new Set(employees.map((e) => e.department).filter(Boolean)),
  ];
  const uniqueRoles = [
    ...new Set(employees.map((e) => e.role).filter(Boolean)),
  ];
  const uniqueStatuses = ["Paid", "Pending", "Processing"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for phone number
    if (name === "phone") {
      // Remove any non-digit characters and limit to 10 digits
      const digits = value.replace(/\D/g, "").slice(0, 10);

      setNewSalary((prev) => ({
        ...prev,
        [name]: digits,
      }));
    } else {
      setNewSalary((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAddSalary = async (e) => {
    e.preventDefault();
    try {
      const basicSalary = parseFloat(newSalary.basic) || 0;
      const hra = parseFloat(newSalary.hra) || 0;
      const conveyance = parseFloat(newSalary.conveyance) || 0;
      const specialAllowance = parseFloat(newSalary.special) || 0;
      const pfDeductions = parseFloat(newSalary.pf) || 0;
      const taxDeductions = parseFloat(newSalary.tax) || 0;
      const amount = basicSalary + hra + conveyance + specialAllowance - pfDeductions - taxDeductions;

      // userId — must be a valid number
      const rawUserId = editingEmployee?.userId ?? editingEmployee?.employeeId ?? newSalary.userId;
      const userId = parseInt(rawUserId, 10);
      if (!userId || isNaN(userId)) {
        showToast("Please select an employee before saving.", "error");
        return;
      }

      // departmentId — must be a valid number (numeric dept ID, e.g. 1)
      const departmentId = parseInt(newSalary.departmentId, 10);
      if (isNaN(departmentId)) {
        showToast("Could not resolve Department ID. Please re-select the employee.", "error");
        return;
      }

      // Build payload — all type coercion is done inside expenseService._buildPayload
      const payload = {
        userId,
        amount,
        phone: newSalary.phone || "",
        status: newSalary.status || "pending",
        role: newSalary.role || "",
        department: departmentId,
        paymentMode: newSalary.paymentMode || "cash",
        basicSalary,
        hra,
        conveyance,
        specialAllowance,
        pfDeductions,
        taxDeductions,
        date: newSalary.paymentDate,
      };

      const hasExistingSalary = editingEmployee && editingEmployee.expenseId != null;

      if (hasExistingSalary) {
        // PATCH /expenses/employee/:expenseId
        await expenseService.updateEmployeeSalary(editingEmployee.expenseId, payload);
        showToast("Salary entry updated successfully!", "success");
      } else {
        // POST /expenses/employee
        await expenseService.addEmployeeSalary(payload);
        showToast("Salary entry added successfully!", "success");
      }

      await loadEmployeeSalaries();
      setIsAddModalOpen(false);
      setEditingEmployee(null);

      // Reset form
      setNewSalary({
        userId: "",
        employeeName: "",
        role: "",
        department: "",
        departmentId: "",
        phone: "",
        email: "",
        status: "pending",
        paymentMode: "cash",
        paymentDate: "",
        basic: 0,
        hra: 0,
        conveyance: 0,
        special: 0,
        pf: 0,
        tax: 0,
      });
    } catch (error) {
      console.error("Error saving salary:", error);
      showToast("Failed to save salary entry: " + error.message, "error");
    }
  };

  const handleEdit = (emp) => {
    // Guard: can only edit if a salary record exists
    if (!emp.expenseId) {
      showToast("No salary record exists yet. Use 'Add Salary Entry' to create one.", "info");
      return;
    }
    setEditingEmployee(emp);
    setNewSalary({
      userId: String(emp.userId ?? emp.employeeId ?? ""),
      employeeName: emp.employeeName || emp.name || "",
      role: emp.role || "",
      department: emp.department || "",
      departmentId: String(emp.departmentId ?? ""),
      phone: emp.phone ? String(emp.phone).replace(/^\+91/, "") : "",
      email: emp.email || "",
      status: (emp.status || "pending").toLowerCase(),
      paymentMode: (emp.paymentMode || "cash").toLowerCase(),
      paymentDate: emp.paymentDate
        ? new Date(emp.paymentDate).toISOString().split("T")[0]
        : "",
      // Prefer flat fields (normalised from DB) over breakdown object
      basic: Number(emp.basicSalary) || emp.breakdown?.basic || 0,
      hra: Number(emp.hra) || emp.breakdown?.allowances?.HRA || 0,
      conveyance: Number(emp.conveyance) || emp.breakdown?.allowances?.Conveyance || 0,
      special: Number(emp.specialAllowance) || emp.breakdown?.allowances?.Special || 0,
      pf: Number(emp.pfDeductions) || emp.breakdown?.deductions?.PF || 0,
      tax: Number(emp.taxDeductions) || emp.breakdown?.deductions?.Tax || 0,
    });
    setIsAddModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      // DELETE /expenses/employee/:expenseId
      await expenseService.deleteEmployeeSalary(deleteConfirmId);
      await loadEmployeeSalaries();
      setActiveMenuId(null);
      setDeleteConfirmId(null);
      showToast("Salary entry deleted successfully!", "success");
    } catch (error) {
      console.error("Error deleting salary:", error);
      showToast("Failed to delete salary: " + error.message, "error");
      setDeleteConfirmId(null);
    }
  };

  const createPDFDoc = (emp, paidDays = 0, lopDays = 0) => {
    try {
      // Helper function to convert number to words
      const numberToWords = (num) => {
        if (num === 0) return "Zero";

        const ones = [
          "",
          "One",
          "Two",
          "Three",
          "Four",
          "Five",
          "Six",
          "Seven",
          "Eight",
          "Nine",
        ];
        const tens = [
          "",
          "",
          "Twenty",
          "Thirty",
          "Forty",
          "Fifty",
          "Sixty",
          "Seventy",
          "Eighty",
          "Ninety",
        ];
        const teens = [
          "Ten",
          "Eleven",
          "Twelve",
          "Thirteen",
          "Fourteen",
          "Fifteen",
          "Sixteen",
          "Seventeen",
          "Eighteen",
          "Nineteen",
        ];

        const convertHundreds = (n) => {
          if (n === 0) return "";
          if (n < 10) return ones[n];
          if (n < 20) return teens[n - 10];
          if (n < 100)
            return (
              tens[Math.floor(n / 10)] +
              (n % 10 !== 0 ? " " + ones[n % 10] : "")
            );
          return (
            ones[Math.floor(n / 100)] +
            " Hundred" +
            (n % 100 !== 0 ? " " + convertHundreds(n % 100) : "")
          );
        };

        if (num < 1000) return convertHundreds(num);
        if (num < 100000) {
          const thousands = Math.floor(num / 1000);
          const remainder = num % 1000;
          return (
            convertHundreds(thousands) +
            " Thousand" +
            (remainder !== 0 ? " " + convertHundreds(remainder) : "")
          );
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
      // Add SUH Tech Logo - Commented out temporarily to ensure stable generation
      /*
      try {
        const logoSize = 20; 
        doc.addImage(suhTechLogo, "PNG", 15, 15, logoSize, logoSize);
      } catch (error) {
        console.log("Logo loading error:", error);
      }
      */

      // Simple fallback for logo space
      doc.setFillColor(59, 130, 246);
      doc.rect(15, 15, 20, 20, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text("SUH", 25, 27, { align: "center" });

      // Company Name and Address (aligned with logo)
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("SUH Tech Pvt Ltd", 40, 21);

      doc.setFontSize(9);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(
        "D-8, 4th Floor, Habitech Crystal Mall, Knowledge Park III,",
        40,
        27,
      );
      doc.text("Greater Noida, Uttar Pradesh - 201310 India", 40, 31);

      // Payslip For the Month (Top Right)
      doc.setFontSize(9);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Payslip For the Month", pageWidth - 15, 23, { align: "right" });

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      const payPeriod = emp.paymentDate
        ? new Date(emp.paymentDate).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        })
        : "December 2025";
      doc.text(payPeriod, pageWidth - 15, 30, { align: "right" });

      // Horizontal line after header (thick border)
      doc.setDrawColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setLineWidth(1.5);
      doc.line(15, 50, pageWidth - 15, 50);

      // ===== EMPLOYEE SUMMARY SECTION =====
      const summaryStartY = 58;

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("EMPLOYEE SUMMARY", 15, summaryStartY);

      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);

      const summaryY = summaryStartY + 8;
      doc.text("Employee Name", 15, summaryY);
      doc.text(":", 55, summaryY);
      doc.setTextColor(0, 0, 0);
      doc.text(emp.employeeName || "N/A", 60, summaryY);

      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Employee ID", 15, summaryY + 5);
      doc.text(":", 55, summaryY + 5);
      doc.setTextColor(0, 0, 0);
      doc.text(String(emp.employeeId || emp._id?.slice(-6) || "N/A"), 60, summaryY + 5);

      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Pay Period", 15, summaryY + 10);
      doc.text(":", 55, summaryY + 10);
      doc.setTextColor(0, 0, 0);
      doc.text(payPeriod, 60, summaryY + 10);

      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Pay Date", 15, summaryY + 15);
      doc.text(":", 55, summaryY + 15);
      doc.setTextColor(0, 0, 0);
      const payDate = emp.paymentDate
        ? new Date(emp.paymentDate).toLocaleDateString("en-GB")
        : "31/12/2025";
      doc.text(payDate, 60, summaryY + 15);

      // ===== NET PAY BOX (Right Side) =====
      const netPayBoxX = 120;
      const netPayBoxY = summaryStartY; // Align with EMPLOYEE SUMMARY
      const netPayBoxWidth = pageWidth - netPayBoxX - 15;
      const netPayBoxHeight = 32;

      // Green border box
      doc.setDrawColor(greenBorder[0], greenBorder[1], greenBorder[2]);
      doc.setLineWidth(0.5); // Thinner border
      doc.setFillColor(lightGreen[0], lightGreen[1], lightGreen[2]);
      doc.roundedRect(
        netPayBoxX,
        netPayBoxY,
        netPayBoxWidth,
        netPayBoxHeight,
        2,
        2,
        "FD",
      );

      // Net Pay Amount
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(greenBorder[0], greenBorder[1], greenBorder[2]);
      const netPayText = `Rs. ${(emp.breakdown?.net || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.text(netPayText, netPayBoxX + netPayBoxWidth / 2, netPayBoxY + 12, {
        align: "center",
      });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(
        "Total Net Pay",
        netPayBoxX + netPayBoxWidth / 2,
        netPayBoxY + 17,
        { align: "center" },
      );

      // Dotted line
      doc.setLineDash([1, 1]);
      doc.setDrawColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.line(
        netPayBoxX + 5,
        netPayBoxY + 20,
        netPayBoxX + netPayBoxWidth - 5,
        netPayBoxY + 20,
      );
      doc.setLineDash([]);

      // Paid Days and LOP Days
      doc.setFontSize(9);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Paid Days", netPayBoxX + 8, netPayBoxY + 25);
      doc.text(":", netPayBoxX + 28, netPayBoxY + 25);
      doc.setTextColor(0, 0, 0);
      doc.text(String(paidDays || 0), netPayBoxX + 31, netPayBoxY + 25);

      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("LOP Days", netPayBoxX + 8, netPayBoxY + 30);
      doc.text(":", netPayBoxX + 28, netPayBoxY + 30);
      doc.setTextColor(0, 0, 0);
      doc.text(String(lopDays || 0), netPayBoxX + 31, netPayBoxY + 30);

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
        [
          "Basic",
          `Rs. ${basicSalary.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ],
        [
          "House Rent Allowance",
          `Rs. ${hraAllowance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ],
        [
          "Special Allowance",
          `Rs. ${specialAllowance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ],
        [
          "Gross Earnings",
          `Rs. ${grossEarnings.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ],
      ];

      autoTable(doc, {
        startY: tablesStartY,
        head: [["EARNINGS", "AMOUNT"]],
        body: earningsData,
        theme: "plain",
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontSize: 10,
          fontStyle: "bold",
          halign: "left",
          lineWidth: 0.5,
          lineColor: [200, 200, 200],
          cellPadding: { left: 2, right: 5, top: 3, bottom: 3 },
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: { left: 2, right: 5, top: 3, bottom: 3 },
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: "normal", halign: "left" },
          1: { cellWidth: 35, halign: "right", fontStyle: "normal" },
        },
        margin: { left: 15 },
        tableWidth: 85,
        didParseCell: function (data) {
          // Make last row (Gross Earnings) bold
          if (data.row.index === 3) {
            data.cell.styles.fontStyle = "bold";
          }
        },
      });

      // Deductions Table
      const deductionsData = [
        [
          "Income Tax",
          `Rs. ${incomeTax.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ],
        [
          "Provident Fund",
          `Rs. ${providentFund.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ],
        ["", ""], // Empty row to align Total Deductions with Gross Earnings
        [
          "Total Deductions",
          `Rs. ${totalDeductions.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        ],
      ];

      autoTable(doc, {
        startY: tablesStartY,
        head: [["DEDUCTIONS", "AMOUNT"]],
        body: deductionsData,
        theme: "plain",
        headStyles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          fontSize: 10,
          fontStyle: "bold",
          halign: "left",
          lineWidth: 0.5,
          lineColor: [200, 200, 200],
          cellPadding: { left: 2, right: 5, top: 3, bottom: 3 },
        },
        bodyStyles: {
          fontSize: 9,
          cellPadding: { left: 2, right: 5, top: 3, bottom: 3 },
          textColor: [0, 0, 0],
        },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: "normal", halign: "left" },
          1: { cellWidth: 35, halign: "right", fontStyle: "normal" },
        },
        margin: { left: 110 },
        tableWidth: 85,
        didParseCell: function (data) {
          // Make last row (Total Deductions) bold
          if (data.row.index === 3) {
            data.cell.styles.fontStyle = "bold";
          }
        },
      });

      // ===== TOTAL NET PAYABLE SECTION =====
      const finalY = Math.max(doc.lastAutoTable.finalY, 160) + 15;

      // Background box
      doc.setFillColor(245, 245, 245);
      doc.rect(15, finalY - 5, pageWidth - 30, 15, "F");

      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("TOTAL NET PAYABLE", 20, finalY + 3);

      doc.setTextColor(greenBorder[0], greenBorder[1], greenBorder[2]);
      const totalNetPayText = `Rs. ${(emp.breakdown?.net || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      doc.text(totalNetPayText, pageWidth - 20, finalY + 3, { align: "right" });

      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text("Gross Earnings - Total Deductions", 20, finalY + 8);

      // Amount in words
      const amountInWords =
        "Indian Rupee " + numberToWords(emp.breakdown?.net || 0) + " Only";
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text(
        `Amount In Words : ${amountInWords}`,
        pageWidth - 20,
        finalY + 20,
        { align: "right" },
      );

      // Company Stamp - Left side below Total Net Payable
      try {
        const stampSize = 40; // Larger size for prominence
        const stampX = 20; // More left position
        const stampY = finalY + 25; // Below the amount in words
        doc.addImage(companyStamp, "PNG", stampX, stampY, stampSize, stampSize);
      } catch (error) {
        console.log("Stamp loading error:", error);
        // Fallback: Draw a circular stamp outline
        const stampX = 40;
        const stampY = finalY + 45;
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(1.5);
        doc.circle(stampX, stampY, 18, "S");
        doc.setFontSize(7);
        doc.setTextColor(34, 197, 94);
        doc.setFont("helvetica", "bold");
        doc.text("SUH TECH", stampX, stampY - 2, { align: "center" });
        doc.text("PVT LTD", stampX, stampY + 4, { align: "center" });
      }

      // ===== FOOTER =====
      // Contact Information - Single line, no icons, gray text
      const contactStartY = 265;

      doc.setFontSize(9); // Increased from 8
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.setFont("helvetica", "normal");

      // Single line: Phone Number: +91 9211056355 | Email: info@suhtech.top
      const contactText =
        "Phone Number: +91 9211056355  |  Email: info@suhtech.top";
      doc.text(contactText, pageWidth / 2, contactStartY, { align: "center" });

      // System-generated text below contact info
      doc.setFontSize(8);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(
        "-- This is a system-generated document. --",
        pageWidth / 2,
        contactStartY + 10,
        { align: "center" },
      );

      return doc;
    } catch (error) {
      console.error("Error creating payslip doc:", error);
      return null;
    }
  };

  const handlePreviewClick = async (emp) => {
    let paidDays = 0;
    let lopDays = 0;
    
    try {
      const targetId = emp.userId || emp.employeeId || emp._id;
      if (targetId) {
        const attendanceRecords = await attendanceService.getAttendanceByUserId(targetId);
        if (Array.isArray(attendanceRecords) && attendanceRecords.length > 0) {
          const payDate = emp.paymentDate ? new Date(emp.paymentDate) : new Date();
          const payMonth = payDate.getMonth();
          const payYear = payDate.getFullYear();
          let presentCount = 0;
          let absentCount = 0;
          
          attendanceRecords.forEach(record => {
             const recordDateStr = record.date || record.createdAt;
             if (!recordDateStr) return;
             // Ensure valid date parsing
             let recordDate;
             try {
                recordDate = new Date(recordDateStr);
             } catch(e) { return; }
             
             if (recordDate.getMonth() === payMonth && recordDate.getFullYear() === payYear) {
                const status = (record.status || "").toLowerCase();
                if (status === "present" || status === "on leave" || status === "wfh") {
                  presentCount += 1;
                } else if (status === "half-day" || status === "half day") {
                  presentCount += 0.5;
                  absentCount += 0.5;
                } else if (status === "absent") {
                  absentCount += 1;
                }
             }
          });
          
          paidDays = presentCount;
          lopDays = absentCount;
        }
      }
    } catch (error) {
      console.error("Error calculating attendance for preview:", error);
    }

    const doc = createPDFDoc(emp, paidDays, lopDays);
    if (doc) {
      // Reverting to blob URL as data URI might be too large/unsupported by the browser
      const pdfBlob = doc.output("blob");
      const pdfUrl = URL.createObjectURL(pdfBlob);
      setPreviewData({
        url: pdfUrl,
        employee: emp,
        doc: doc,
      });
      setIsPreviewModalOpen(true);
    }
  };

  const handleDownload = () => {
    if (previewData && previewData.doc) {
      previewData.doc.save(
        `Invoice_${previewData.employee._id || "salary"}.pdf`,
      );
      showToast("Invoice downloaded successfully!", "success");
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 md:p-6 min-w-0 overflow-hidden">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employee Salary</h1>
          <p className="text-gray-500 text-sm">
            Manage payroll, salary breakdown, and payment status
          </p>
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
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
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
                {
                  [filters.department, filters.role, filters.status].filter(
                    Boolean,
                  ).length
                }
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
                    setFilters({ department: "", role: "", status: "" });
                  }}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-3">
                {/* Department Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Department
                  </label>
                  <select
                    value={filters.department}
                    onChange={(e) =>
                      setFilters({ ...filters, department: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">All Departments</option>
                    {uniqueDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Role Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Role
                  </label>
                  <select
                    value={filters.role}
                    onChange={(e) =>
                      setFilters({ ...filters, role: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">All Roles</option>
                    {uniqueRoles.map((role) => (
                      <option key={role} value={role}>
                        {role}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">All Statuses</option>
                    {uniqueStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 flex flex-col items-center justify-center">
              <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500 text-sm">
                Loading employee salaries...
              </p>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <AlertCircle size={32} className="text-gray-400" />
              </div>
              <p className="text-gray-500 text-sm">
                {searchTerm
                  ? "No employees found matching your search."
                  : "No salary entries found. Add your first entry!"}
              </p>
            </div>
          ) : (
            <div>
              <table className="w-full text-left border-collapse" style={{ minWidth: '900px' }}>
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-gray-600 text-sm" style={{ minWidth: '80px' }}>
                      Slip No
                    </th>
                    <th className="p-4 font-semibold text-gray-600 text-sm" style={{ minWidth: '160px' }}>
                      Employee Name
                    </th>
                    <th className="p-4 font-semibold text-gray-600 text-sm" style={{ minWidth: '120px' }}>
                      Role
                    </th>
                    <th className="p-4 font-semibold text-gray-600 text-sm" style={{ minWidth: '110px' }}>
                      Department
                    </th>
                    <th className="p-4 font-semibold text-gray-600 text-sm" style={{ minWidth: '180px' }}>
                      Email
                    </th>
                    <th className="p-4 font-semibold text-gray-600 text-sm" style={{ minWidth: '100px' }}>
                      Pay Mode
                    </th>
                    <th className="p-4 font-semibold text-gray-600 text-sm" style={{ minWidth: '110px' }}>
                      Pay Date
                    </th>
                    <th className="p-4 font-semibold text-gray-600 text-sm" style={{ minWidth: '110px' }}>
                      Net Salary
                    </th>
                    <th className="p-4 font-semibold text-gray-600 text-sm" style={{ minWidth: '90px' }}>
                      Status
                    </th>
                    <th className="p-4 font-semibold text-gray-600 text-sm text-right" style={{ minWidth: '130px' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Slip No */}
                      <td className="p-4">
                        <p className="text-sm text-gray-600 font-mono">
                          {emp._id != null ? String(emp._id).slice(-6) : "N/A"}
                        </p>
                      </td>
                      {/* Employee Name */}
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 flex-shrink-0 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                            {(emp.employeeName || emp.name)
                              ?.split(" ")
                              .map((n) => n[0])
                              .join("") || "?"}
                          </div>
                          <p
                            className="font-medium text-gray-900 text-sm truncate max-w-[110px]"
                            title={emp.employeeName || emp.name || "N/A"}
                          >
                            {emp.employeeName || emp.name || "N/A"}
                          </p>
                        </div>
                      </td>
                      {/* Role */}
                      <td className="p-4">
                        <p
                          className="text-sm text-gray-800 truncate max-w-[110px]"
                          title={emp.role || "N/A"}
                        >
                          {emp.role || "N/A"}
                        </p>
                      </td>
                      {/* Department */}
                      <td className="p-4">
                        <p
                          className="text-sm text-gray-700 truncate max-w-[100px]"
                          title={emp.department || "N/A"}
                        >
                          {emp.department || "N/A"}
                        </p>
                      </td>
                      {/* Email with tooltip */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 group relative">
                          <Mail size={13} className="text-gray-400 flex-shrink-0" />
                          <span
                            className="text-sm text-gray-600 truncate max-w-[140px] cursor-default"
                            title={emp.email || "N/A"}
                          >
                            {emp.email || "N/A"}
                          </span>
                        </div>
                      </td>
                      {/* Payment Mode */}
                      <td className="p-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-xs font-medium text-gray-600 capitalize">
                          {emp.paymentMode || "N/A"}
                        </span>
                      </td>
                      {/* Payment Date */}
                      <td className="p-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 whitespace-nowrap">
                          <Calendar size={13} className="flex-shrink-0" />
                          {formatDate(emp.paymentDate)}
                        </div>
                      </td>
                      <td className="p-4">
                        {(() => {
                          // Prefer emp.amount (direct from API), fallback to breakdown.net
                          const net = emp.amount || emp.breakdown?.net || 0;
                          return net > 0 ? (
                            <span className="font-bold text-gray-900">
                              ₹{Number(net).toLocaleString("en-IN")}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                              Not Assigned
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${emp.status === "paid" || emp.status === "Paid"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                            }`}
                        >
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
                          <div className="relative" data-action-menu-wrap>
                            <button
                              data-action-menu-button
                              onClick={(e) => handleMenuToggle(e, emp.expenseId)}
                              className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {activeMenuId === emp.expenseId && (
                              <div
                                data-action-menu-content
                                className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-50 py-1"
                                style={{
                                  bottom: "auto",
                                  top: "100%",
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
                                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 ${emp.expenseId
                                    ? "text-red-600 hover:bg-red-50"
                                    : "text-gray-300 cursor-not-allowed"
                                    }`}
                                  disabled={!emp.expenseId}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (emp.expenseId) {
                                      handleDelete(emp.expenseId);
                                      setActiveMenuId(null);
                                    }
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
      </div>

      {/* Add Salary Modal */}
      {
        isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-y-auto max-h-[90vh]">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold">
                  {editingEmployee ? "Edit Salary Details" : "Add Salary Details"}
                </h2>
                <button
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingEmployee(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <form
                onSubmit={handleAddSalary}
                className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Employee Selector - spans full width */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Employee <span className="text-red-500">*</span>
                  </label>
                  {editingEmployee ? (
                    // When editing, show the employee name as read-only
                    <div className="w-full p-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 text-sm">
                      {newSalary.employeeName || "—"}
                      <span className="ml-2 text-xs text-gray-400">(Employee ID: {newSalary.userId})</span>
                    </div>
                  ) : (
                    <select
                      required
                      value={newSalary.userId}
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        // Find the employee from our already-loaded list
                        const emp = allEmployeesList.find(
                          (emp) => String(emp.userId ?? emp.employeeId ?? emp.id ?? emp._id) === selectedId
                        );
                        if (emp) {
                          const empId = emp.id ?? emp.employeeId ?? emp.empId ?? emp._id;
                          const fullName = emp.firstName && emp.lastName
                            ? `${emp.firstName} ${emp.lastName}`
                            : emp.name || emp.fullName || emp.employeeName || "";
                          const rawPhone = emp.phone || emp.mobile || emp.phoneNumber || "";
                          setNewSalary((prev) => ({
                            ...prev,
                            userId: String(empId),
                            employeeName: fullName,
                            role: emp.role || emp.designation || prev.role,
                            department: emp.department || prev.department,
                            departmentId: String(emp.departmentId ?? ""),
                            phone: rawPhone.replace(/^\+91/, ""),
                            email: emp.email || prev.email,
                          }));
                        } else {
                          setNewSalary((prev) => ({ ...prev, userId: selectedId }));
                        }
                      }}
                      className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white"
                    >
                      <option value="">— Choose an employee —</option>
                      {allEmployeesList.map((emp) => {
                        // Use same field priority as the find() in onChange
                        const empId = emp.userId ?? emp.employeeId ?? emp.id ?? emp._id;
                        const fullName = emp.employeeName ||
                          (emp.firstName && emp.lastName
                            ? `${emp.firstName} ${emp.lastName}`
                            : emp.name || emp.fullName || "Unknown");
                        return (
                          <option key={empId} value={String(empId)}>
                            {fullName} {emp.email && emp.email !== "N/A" ? `(${emp.email})` : ""}
                          </option>
                        );
                      })}
                    </select>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <input
                    type="text"
                    name="role"
                    value={newSalary.role}
                    onChange={handleInputChange}
                    placeholder="e.g. Frontend Developer"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    value={newSalary.department}
                    onChange={handleInputChange}
                    placeholder="e.g. Engineering"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <span className="px-3 py-2 bg-gray-100 text-gray-700 font-medium border-r border-gray-300">
                      +91
                    </span>
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
                  <p className="text-xs text-gray-500 mt-1">
                    Enter exactly 10 digits
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={newSalary.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Date
                  </label>
                  <input
                    type="date"
                    name="paymentDate"
                    value={newSalary.paymentDate}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    name="status"
                    value={newSalary.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="processing">Processing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Mode
                  </label>
                  <select
                    name="paymentMode"
                    value={newSalary.paymentMode}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  >
                    <option value="bank transfer">Bank Transfer</option>
                    <option value="cash">Cash</option>
                    <option value="cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Basic Salary
                  </label>
                  <input
                    type="number"
                    name="basic"
                    value={newSalary.basic}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HRA
                  </label>
                  <input
                    type="number"
                    name="hra"
                    value={newSalary.hra}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conveyance
                  </label>
                  <input
                    type="number"
                    name="conveyance"
                    value={newSalary.conveyance}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Special Allowance
                  </label>
                  <input
                    type="number"
                    name="special"
                    value={newSalary.special}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PF Deduction
                  </label>
                  <input
                    type="number"
                    name="pf"
                    value={newSalary.pf}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Deduction
                  </label>
                  <input
                    type="number"
                    name="tax"
                    value={newSalary.tax}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* ── Live Net Salary Preview ── */}
                <div className="md:col-span-2 mt-2">
                  {(() => {
                    const basic = parseFloat(newSalary.basic) || 0;
                    const hra = parseFloat(newSalary.hra) || 0;
                    const conv = parseFloat(newSalary.conveyance) || 0;
                    const special = parseFloat(newSalary.special) || 0;
                    const pf = parseFloat(newSalary.pf) || 0;
                    const tax = parseFloat(newSalary.tax) || 0;
                    const gross = basic + hra + conv + special;
                    const deduct = pf + tax;
                    const net = gross - deduct;
                    return (
                      <div className="rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-purple-50 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-6 text-sm">
                          <div className="text-center">
                            <p className="text-gray-500 text-xs mb-0.5">Gross Earnings</p>
                            <p className="font-semibold text-gray-800">₹{gross.toLocaleString("en-IN")}</p>
                          </div>
                          <div className="text-gray-300 text-lg">−</div>
                          <div className="text-center">
                            <p className="text-gray-500 text-xs mb-0.5">Deductions</p>
                            <p className="font-semibold text-red-500">₹{deduct.toLocaleString("en-IN")}</p>
                          </div>
                          <div className="text-gray-300 text-lg">=</div>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-blue-600 font-medium mb-0.5">Net Salary</p>
                          <p className="text-2xl font-bold text-blue-700">₹{net.toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="md:col-span-2 mt-4 pt-4 border-t">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    {editingEmployee?.expenseId
                      ? "Update Salary Entry"
                      : "Add Salary Entry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Preview Modal */}
      {
        isPreviewModalOpen && previewData && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-4xl h-[90vh] mx-4 rounded-xl shadow-2xl flex flex-col">
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FileText className="text-blue-600" />
                  Invoice Preview - {previewData.employee.employeeName}
                </h2>
                <button
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 bg-gray-100 p-4 overflow-hidden flex flex-col items-center justify-center relative">
                {previewData.url ? (
                  <>
                    <iframe
                      src={previewData.url}
                      className="w-full h-full rounded-lg border border-gray-300 shadow-sm bg-white"
                      title="PDF Preview"
                    ></iframe>
                    <div className="absolute bottom-8 right-8">
                      <button
                        onClick={() => window.open(previewData.url, '_blank')}
                        className="bg-white/90 hover:bg-white text-blue-600 px-4 py-2 rounded-lg shadow-lg border border-blue-100 flex items-center gap-2 text-sm font-semibold transition-all"
                      >
                        <ExternalLink size={16} />
                        Open in New Tab
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4 mx-auto"></div>
                    <p className="text-gray-500">Generating preview...</p>
                  </div>
                )}
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
        )
      }

      {/* Delete Confirmation Modal */}
      {
        deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-md mx-4 rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <X size={24} className="text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Delete Salary Entry
                  </h3>
                  <p className="text-sm text-gray-500">
                    This action cannot be undone
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this salary entry? All data
                associated with this entry will be permanently removed.
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
        )
      }

      {/* Toast Notifications */}
      {
        toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )
      }
    </div >
  );
};

export default EmployeeSalary;
