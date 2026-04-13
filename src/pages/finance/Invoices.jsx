import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreVertical,
  Upload,
  FileText,
  CheckCircle,
  Clock,
  MapPin,
  Phone,
  X,
  Download,
  ChevronDown,
} from "lucide-react";
import { authService, employeeService, manualInvoiceService } from "../../services";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import Toast from "../../components/common/Toast";

const SERVICE_TYPES = [
  "One-Time Project",
  "AMC (Annual Maintenance Contract)",
  "Weekly Deliverables",
  "Monthly Deliverables",
  "Project Updates",
  "Maintenance",
  "Consulting",
  "Custom",
];

const SERVICE_CATEGORIES = [
  "Development",
  "Design",
  "Maintenance",
  "Support",
  "Consulting",
  "Infrastructure",
  "Testing",
  "Other",
];

// Helper function to format dates
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch (error) {
    return "N/A";
  }
};

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [expandedInvoiceId, setExpandedInvoiceId] = useState(null);
  const [openPhaseId, setOpenPhaseId] = useState(null);
  const fileInputRef = React.useRef(null);
  const [uploadingFile, setUploadingFile] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    invoiceId: null,
  });
  const [newInvoice, setNewInvoice] = useState({
    clientName: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    serviceDescription: "",
    phaseWork: "",
    startDate: "",
    endDate: "",
    price: "",
    taxRate: 18,
    discount: 0,
    dueDate: "",
    status: "Sent",
    invoiceDate: new Date().toISOString().split("T")[0],
    phases: [
      {
        id: 1,
        remarks: "",
        serviceType: "",
        serviceCategory: "",
        startDate: "",
        endDate: "",
        price: "",
      },
      {
        id: 2,
        remarks: "",
        serviceType: "",
        serviceCategory: "",
        startDate: "",
        endDate: "",
        price: "",
      },
      {
        id: 3,
        remarks: "",
        serviceType: "",
        serviceCategory: "",
        startDate: "",
        endDate: "",
        price: "",
      },
      {
        id: 4,
        remarks: "",
        serviceType: "",
        serviceCategory: "",
        startDate: "",
        endDate: "",
        price: "",
      },
    ],
  });

  useEffect(() => {
    loadInvoices();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeMenuId !== null) {
        const target = event.target;
        const isMenuButton = target.closest("button[data-menu-button]");
        const isMenuContent = target.closest("[data-menu-content]");

        if (!isMenuButton && !isMenuContent) {
          setActiveMenuId(null);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeMenuId]);

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isFilterOpen) {
        const target = event.target;
        const isFilterButton = target.closest("[data-filter-button]");
        const isFilterContent = target.closest("[data-filter-content]");

        if (!isFilterButton && !isFilterContent) {
          setIsFilterOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFilterOpen]);

  // Close export dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isExportOpen) {
        const target = event.target;
        const isExportButton = target.closest("[data-export-button]");
        const isExportContent = target.closest("[data-export-content]");

        if (!isExportButton && !isExportContent) {
          setIsExportOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isExportOpen]);

  const loadInvoices = async () => {
    try {
      setLoading(true);

      const response = await manualInvoiceService.getAllInvoices();
      const rawInvoices = response.invoices || response.data || [];

      const normalized = rawInvoices.map((inv) => {
        const phases = [
          { id: 1, remarks: inv.phase1Remarks || "", price: inv.phase1Price || 0, startDate: inv.phase1StartDate || "", endDate: inv.phase1EndDate || "", serviceType: inv.serviceType || "", serviceCategory: inv.serviceCategory || "" },
          { id: 2, remarks: inv.phase2Remarks || "", price: inv.phase2Price || 0, startDate: inv.phase2StartDate || "", endDate: inv.phase2EndDate || "", serviceType: inv.serviceType || "", serviceCategory: inv.serviceCategory || "" },
          { id: 3, remarks: inv.phase3Remarks || "", price: inv.phase3Price || 0, startDate: inv.phase3StartDate || "", endDate: inv.phase3EndDate || "", serviceType: inv.serviceType || "", serviceCategory: inv.serviceCategory || "" },
          { id: 4, remarks: inv.phase4Remarks || "", price: inv.phase4Price || 0, startDate: inv.phase4StartDate || "", endDate: inv.phase4EndDate || "", serviceType: inv.serviceType || "", serviceCategory: inv.serviceCategory || "" },
        ];

        return {
          ...inv,
          _id: inv._id || inv.id,
          invoiceNumber: inv._id || inv.id,
          clientPhone: inv.contactPhone,
          clientAddress: inv.address,
          dueDate: inv.maintenanceDueDate,
          status: inv.status ? inv.status.charAt(0).toUpperCase() + String(inv.status).slice(1).toLowerCase() : "Sent",
          services: [{ description: inv.serviceDescription, rate: inv.phase1Price || inv.price, amount: inv.phase1Price || inv.price }],
          phases: phases.filter((p) => Number(p.price) > 0),
        };
      });

      setInvoices(normalized);
    } catch (error) {
      console.error("Error loading invoices:", error);
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatAmount = (amount) => {
    const num = Number(amount);
    return `₹${isNaN(num) ? "0" : num.toLocaleString("en-IN")}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      // case 'Paid': return 'bg-green-100 text-green-700 border-green-200';
      case "Sent":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "Draft":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "Overdue":
        return "bg-red-100 text-red-700 border-red-200";
      // case 'Draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getErrorMessage = (error) => {
    try {
      const msg = error.message || "";
      if (msg.includes("HTTP error!")) {
        const jsonStrMatch = msg.match(/message:\s*({.*})/);
        if (jsonStrMatch && jsonStrMatch[1]) {
          const parsed = JSON.parse(jsonStrMatch[1]);
          return parsed.message || "An error occurred";
        }
      }
    } catch (e) {}
    return error.message || "An unexpected error occurred.";
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewInvoice((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhaseChange = (phaseId, field, value) => {
    setNewInvoice((prev) => ({
      ...prev,
      phases: prev.phases.map((p) =>
        p.id === phaseId ? { ...p, [field]: value } : p,
      ),
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log("Selected file:", file.name, file.type, file.size);

    // Check if it's a PDF //
    if (file.type !== "application/pdf") {
      showToast("Please upload a PDF file only!", "error");
      e.target.value = "";
      return;
    }

    setUploadingFile(file);
    setLoading(true);

    try {
      const arrayBuffer = await file.arrayBuffer();

      // Dynamic import of pdfjs-dist //
      const pdfjsLib = await import("pdfjs-dist");

      // Use jsdelivr CDN for worker with matching version
      const version = pdfjsLib.version || "4.0.379";
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";

      // Extract text from all pages //
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item) => item.str).join(" ");
        fullText += pageText + "\n";
      }

      console.log("Extracted PDF text:", fullText);

      // Parse invoice data from text //
      const extractedData = parseInvoiceText(fullText);

      // Automatically save the invoice //
      const invoiceNumber = `INV-${Date.now()}`;
      const price = parseFloat(extractedData.price) || 0;
      const subtotal = price;
      const discount = parseFloat(extractedData.discount) || 0;
      const taxRate = parseFloat(extractedData.taxRate) || 18;
      const taxAmount = ((subtotal - discount) * taxRate) / 100;
      const total = subtotal - discount + taxAmount;

      const invoiceData = {
        invoiceNumber,
        clientName: extractedData.clientName || "Unknown Client",
        clientEmail: extractedData.clientEmail || "",
        clientPhone: extractedData.clientPhone || "",
        clientAddress: extractedData.clientAddress || "",
        services: [
          {
            description: extractedData.serviceDescription || "Service from PDF",
            rate: price,
            amount: subtotal,
          },
        ],
        subtotal: subtotal,
        taxRate: taxRate,
        taxAmount: taxAmount,
        discount: discount,
        total: total,
        dueDate: extractedData.dueDate
          ? new Date(extractedData.dueDate)
          : new Date(),
        status: "sent",
        invoiceDate: extractedData.invoiceDate
          ? new Date(extractedData.invoiceDate)
          : new Date(),
      };

      // Save to backend or local state //
      try {
        await manualInvoiceService.createInvoice(invoiceData);
        await loadInvoices();
        showToast("Invoice uploaded successfully", "success");
      } catch (apiError) {
        console.warn("API save failed, saving locally:", apiError.message);
        // Fallback: Add to local state
        setInvoices((prev) => [
          ...prev,
          { ...invoiceData, _id: Date.now().toString() },
        ]);
        showToast(getErrorMessage(apiError), "error");
      }
    } catch (error) {
      console.error("Error parsing PDF:", error);
      showToast(getErrorMessage(error), "error");
    } finally {
      setLoading(false);
      setUploadingFile(null);
      e.target.value = "";
    }
  };

  // Helper function to parse invoice text
  const parseInvoiceText = (text) => {
    const data = {};

    // Extract client name (improved patterns)
    const clientPatterns = [
      /(?:Bill To|Client|Customer|To)[:\s]+([A-Za-z\s\.]+?)(?:\n|Email|Phone|Address|$)/i,
      /(?:Name|Client Name)[:\s]+([A-Za-z\s\.]+?)(?:\n|Email|Phone|$)/i,
      /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$/m, // Capitalized names on their own line
    ];
    for (const pattern of clientPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.clientName = match[1].trim();
        if (data.clientName.length > 2) break; // Valid name found
      }
    }

    // Extract email //
    const emailMatch = text.match(
      /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/,
    );
    if (emailMatch) data.clientEmail = emailMatch[0];

    // Extract phone (remove +91 prefix)
    const phoneMatch = text.match(
      /(?:Phone|Tel|Mobile)[:\s]*(?:\+91)?\s*([\d\s\-\(\)]{10,})/i,
    );
    if (phoneMatch) {
      // Remove +91 and clean up
      data.clientPhone = phoneMatch[1].replace(/\+91/g, "").trim();
    }

    // Extract address (improved pattern) //
    const addressPatterns = [
      /(?:Address|Location)[:\s]+([^\n]{10,})/i,
      /(?:Address|Location)[:\s]+([^\n]+(?:\n[^\n]+)?)/i, // Multi-line address
    ];
    for (const pattern of addressPatterns) {
      const match = text.match(pattern);
      if (match) {
        data.clientAddress = match[1].trim().replace(/\n/g, ", ");
        break;
      }
    }

    // Extract total/price (Rs. or ₹)
    const pricePatterns = [
      /(?:Total|Grand Total|Amount|Net Amount)[:\s]*(?:Rs\.?|₹)\s*([\d,]+\.?\d*)/i,
      /(?:Rs\.?|₹)\s*([\d,]+\.?\d*)/,
    ];
    for (const pattern of pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.price = match[1].replace(/,/g, "");
        break;
      }
    }

    // Extract service/product description (improved)
    const servicePatterns = [
      /(?:Description|Service|Item|Product)[:\s]+([^\n]+)/i,
      /(?:For|Regarding)[:\s]+([^\n]+)/i,
    ];
    for (const pattern of servicePatterns) {
      const match = text.match(pattern);
      if (match) {
        data.serviceDescription = match[1].trim();
        if (data.serviceDescription.length > 3) break;
      }
    }

    // Extract tax rate
    const taxMatch = text.match(/(?:GST|Tax|VAT)[:\s]*(\d+)%/i);
    if (taxMatch) data.taxRate = parseInt(taxMatch[1]);

    // Extract dates
    const datePattern = /(\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4})/g;
    const dates = text.match(datePattern);
    if (dates && dates.length > 0) {
      // Try to convert to YYYY-MM-DD format
      try {
        const date = new Date(dates[0]);
        if (!isNaN(date.getTime())) {
          data.invoiceDate = date.toISOString().split("T")[0];
        }
      } catch (e) {
        console.warn("Could not parse date:", dates[0]);
      }
    }

    return data;
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    try {
      console.log("=== SAVE INVOICE DEBUG ===");
      console.log("Editing Invoice:", editingInvoice);
      console.log("Editing Invoice ID:", editingInvoice?._id);

      const invoiceNumber = `INV-${Date.now()}`;
      const price = parseFloat(newInvoice.price) || 0;
      const subtotal = price;
      const discount = parseFloat(newInvoice.discount) || 0;
      const taxRate = parseFloat(newInvoice.taxRate) || 18;
      const taxAmount = ((subtotal - discount) * taxRate) / 100;
      const total = subtotal - discount + taxAmount;

      const p1 = newInvoice.phases && newInvoice.phases[0] ? newInvoice.phases[0] : {};
      const p2 = newInvoice.phases && newInvoice.phases[1] ? newInvoice.phases[1] : {};
      const p3 = newInvoice.phases && newInvoice.phases[2] ? newInvoice.phases[2] : {};
      const p4 = newInvoice.phases && newInvoice.phases[3] ? newInvoice.phases[3] : {};

      const invoiceData = {
        clientName: newInvoice.clientName,
        clientEmail: newInvoice.clientEmail,
        contactPhone: newInvoice.clientPhone || "",
        address: newInvoice.clientAddress || "",
        serviceDescription: newInvoice.serviceDescription || "",
        phaseWork: newInvoice.phaseWork || "",
        serviceType: p1.serviceType || newInvoice.serviceType || "",
        serviceCategory: p1.serviceCategory || newInvoice.serviceCategory || "",
        
        phase1Remarks: p1.remarks || "",
        phase1Price: Number(p1.price) || (p1.remarks ? Number(newInvoice.price) || 0 : 0),
        phase1StartDate: p1.startDate || newInvoice.startDate || "",
        phase1EndDate: p1.endDate || newInvoice.endDate || "",
        
        phase2Remarks: p2.remarks || "",
        phase2Price: Number(p2.price) || 0,
        phase2StartDate: p2.startDate || "",
        phase2EndDate: p2.endDate || "",
        
        phase3Remarks: p3.remarks || "",
        phase3Price: Number(p3.price) || 0,
        phase3StartDate: p3.startDate || "",
        phase3EndDate: p3.endDate || "",
        
        phase4Remarks: p4.remarks || "",
        phase4Price: Number(p4.price) || 0,
        phase4StartDate: p4.startDate || "",
        phase4EndDate: p4.endDate || "",
        
        taxRate: Number(taxRate) || 18,
        discount: Number(discount) || 0,
        maintenanceDueDate: newInvoice.dueDate ? new Date(newInvoice.dueDate).toISOString().split("T")[0] : "",
        status: newInvoice.status ? String(newInvoice.status).toLowerCase() : "sent"
      };

      console.log("Invoice Data:", invoiceData);

      if (editingInvoice && (editingInvoice._id || editingInvoice.id)) {
        const targetId = editingInvoice._id || editingInvoice.id;
        console.log("Updating invoice with ID:", targetId);
        try {
          await manualInvoiceService.updateInvoice(targetId, invoiceData);
          console.log("Invoice updated successfully via API");
          showToast("Invoice updated successfully!", "success");
        } catch (apiError) {
          console.warn(
            "API update failed, updating locally:",
            apiError.message,
          );
          // Fallback: Update invoice locally if API fails
          setInvoices((prevInvoices) =>
            prevInvoices.map((inv) =>
              (inv._id === targetId || inv.id === targetId)
                ? { ...inv, ...invoiceData, _id: targetId }
                : inv,
            ),
          );
          showToast(getErrorMessage(apiError), "error");
        }
      } else {
        console.log("Creating new invoice");
        await manualInvoiceService.createInvoice(invoiceData);
        console.log("Invoice created successfully");
        await loadInvoices();
      }

      setIsAddModalOpen(false);
      setEditingInvoice(null);
      setNewInvoice({
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientAddress: "",
        serviceDescription: "",
        price: "",
        taxRate: 18,
        discount: 0,
        dueDate: "",
        status: "Sent",
        invoiceDate: new Date().toISOString().split("T")[0],
      });
    } catch (error) {
      console.error("=== SAVE INVOICE ERROR ===");
      console.error("Error details:", error);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      showToast(getErrorMessage(error), "error");
    }
  };

  const handleEditInvoice = (invoice) => {
    const firstService = (invoice.services && invoice.services[0]) || {};
    setEditingInvoice(invoice);
    setNewInvoice({
      clientName: invoice.clientName || "",
      clientEmail: invoice.clientEmail || "",
      clientPhone: invoice.clientPhone || "",
      clientAddress: invoice.clientAddress || "",
      serviceDescription: firstService.description || "",
      // quantity: firstService.quantity || 1,
      // unit: firstService.unit || 'hours',
      phaseWork: invoice.phaseWork || "",
      startDate: invoice.startDate
        ? new Date(invoice.startDate).toISOString().split("T")[0]
        : "",
      endDate: invoice.endDate
        ? new Date(invoice.endDate).toISOString().split("T")[0]
        : "",
      price: firstService.rate || "",
      taxRate: invoice.taxRate || 18,
      discount: invoice.discount || 0,
      dueDate: invoice.dueDate
        ? new Date(invoice.dueDate).toISOString().split("T")[0]
        : "",
      status: invoice.status || "Sent",
      invoiceDate: invoice.invoiceDate
        ? new Date(invoice.invoiceDate).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0],
      phases:
        invoice.phases && invoice.phases.length
          ? invoice.phases
          : [
              {
                id: 1,
                remarks: "",
                serviceType: "",
                serviceCategory: "",
                startDate: "",
                endDate: "",
                price: "",
              },
              {
                id: 2,
                remarks: "",
                serviceType: "",
                serviceCategory: "",
                startDate: "",
                endDate: "",
                price: "",
              },
              {
                id: 3,
                remarks: "",
                serviceType: "",
                serviceCategory: "",
                startDate: "",
                endDate: "",
                price: "",
              },
              {
                id: 4,
                remarks: "",
                serviceType: "",
                serviceCategory: "",
                startDate: "",
                endDate: "",
                price: "",
              },
            ],
    });
    setIsAddModalOpen(true);
    setActiveMenuId(null);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    setConfirmModal({ isOpen: true, invoiceId });
  };

  const confirmDelete = async () => {
    const invoiceId = confirmModal.invoiceId;
    setConfirmModal({ isOpen: false, invoiceId: null });
    try {
      try {
        await manualInvoiceService.deleteInvoice(invoiceId);
        showToast("Invoice deleted successfully!", "success");
        await loadInvoices();
      } catch (apiError) {
        console.warn("API delete failed, deleting locally:", apiError.message);
        // Fallback: Delete invoice locally if API fails
        setInvoices((prevInvoices) =>
          prevInvoices.filter((inv) => inv._id !== invoiceId),
        );
        showToast(getErrorMessage(apiError), "error");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      showToast(getErrorMessage(error), "error");
    }
    setActiveMenuId(null);
  };

  // Download Individual Invoice as PDF
  const handleDownloadInvoice = (invoice) => {
    try {
      const doc = new jsPDF();
      let yPos = 15;

      // HEADER BOX
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 45, "F");

      // Company Name
      doc.setFontSize(26);
      doc.setFont(undefined, "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("SUH TECH PRIVATE LIMITED", 105, yPos, { align: "center" });

      yPos += 8;
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text(
        "D-8, 4th Floor, Habitech Crystal Mall, Knowledge Park III, Greater Noida,",
        105,
        yPos,
        { align: "center" },
      );
      yPos += 4;
      doc.text("Uttar Pradesh - 201310", 105, yPos, { align: "center" });
      yPos += 5;
      doc.text(
        "Email: info@suhtech.top | Phone: +91 9211056355 (WhatsApp) | Tel: +91 1204086567",
        105,
        yPos,
        { align: "center" },
      );

      yPos = 55;

      // Invoice Title
      doc.setFontSize(20);
      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("INVOICE", 105, yPos, { align: "center" });

      yPos += 10;

      // Invoice Info Box
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");
      doc.setDrawColor(200, 200, 200);
      doc.setFillColor(245, 247, 250);
      doc.rect(14, yPos, 182, 20, "FD");

      yPos += 6;
      doc.setFont(undefined, "bold");
      doc.text("Invoice Number:", 18, yPos);
      doc.setFont(undefined, "normal");
      doc.text(invoice.invoiceNumber || invoice._id, 60, yPos);

      doc.setFont(undefined, "bold");
      doc.text("Date:", 120, yPos);
      doc.setFont(undefined, "normal");
      doc.text(
        new Date(invoice.invoiceDate || invoice.date).toLocaleDateString(
          "en-IN",
        ),
        140,
        yPos,
      );

      yPos += 6;
      doc.setFont(undefined, "bold");
      doc.text("Status:", 18, yPos);
      doc.setFont(undefined, "normal");

      // Status with color
      if (invoice.status === "Sent") {
        doc.setTextColor(34, 197, 94);
      } else if (invoice.status === "Draft") {
        doc.setTextColor(234, 179, 8);
      } else if (invoice.status === "Overdue") {
        doc.setTextColor(239, 68, 68);
      }
      doc.text(invoice.status, 60, yPos);
      doc.setTextColor(0, 0, 0);

      doc.setFont(undefined, "bold");
      doc.text("Due Date:", 120, yPos);
      doc.setFont(undefined, "normal");
      doc.text(
        new Date(invoice.dueDate).toLocaleDateString("en-IN"),
        140,
        yPos,
      );

      yPos += 16;

      // Client Information
      doc.setFontSize(12);
      doc.setFont(undefined, "bold");
      doc.text("BILL TO:", 14, yPos);

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text(invoice.clientName || "N/A", 14, yPos);

      yPos += 6;
      doc.setFont(undefined, "normal");
      if (invoice.clientAddress) {
        doc.text(invoice.clientAddress, 14, yPos);
        yPos += 6;
      }
      if (invoice.clientPhone || invoice.contact) {
        doc.text(
          "Phone: " + (invoice.clientPhone || invoice.contact),
          14,
          yPos,
        );
        yPos += 6;
      }
      if (invoice.clientEmail) {
        doc.text("Email: " + invoice.clientEmail, 14, yPos);
        yPos += 6;
      }

      yPos += 8;

      // Services/Phases Table
      if (
        Array.isArray(invoice.phases) &&
        invoice.phases.some((p) => Number(p.price) > 0)
      ) {
        // Phases exist
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text("PHASES:", 14, yPos);
        yPos += 8;

        const phasesData = invoice.phases
          .filter((p) => Number(p.price) > 0)
          .map((phase, idx) => [
            idx + 1,
            phase.remarks || "N/A",
            phase.serviceType || "N/A",
            new Date(phase.startDate).toLocaleDateString("en-IN"),
            new Date(phase.endDate).toLocaleDateString("en-IN"),
            "Rs. " +
              Number(phase.price).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              }),
          ]);

        autoTable(doc, {
          startY: yPos,
          head: [
            [
              "#",
              "Remarks",
              "Service Type",
              "Start Date",
              "End Date",
              "Amount",
            ],
          ],
          body: phasesData,
          theme: "grid",
          headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 9 },
          bodyStyles: { fontSize: 8 },
          columnStyles: {
            0: { cellWidth: 10 },
            5: { halign: "right" },
          },
        });

        yPos = doc.lastAutoTable.finalY + 10;
      } else if (invoice.services && invoice.services.length > 0) {
        // Services exist
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text("SERVICES:", 14, yPos);
        yPos += 8;

        const servicesData = invoice.services.map((service, idx) => [
          idx + 1,
          service.description || "Service",
          "Rs. " +
            Number(service.rate || service.amount || 0).toLocaleString(
              "en-IN",
              { minimumFractionDigits: 2 },
            ),
        ]);

        autoTable(doc, {
          startY: yPos,
          head: [["#", "Description", "Amount"]],
          body: servicesData,
          theme: "grid",
          headStyles: { fillColor: [37, 99, 235], textColor: 255, fontSize: 9 },
          bodyStyles: { fontSize: 9 },
          columnStyles: {
            0: { cellWidth: 10 },
            2: { halign: "right", cellWidth: 40 },
          },
        });

        yPos = doc.lastAutoTable.finalY + 10;
      }

      // Total Amount Box
      doc.setFillColor(245, 247, 250);
      doc.setDrawColor(200, 200, 200);
      doc.rect(120, yPos, 76, 30, "FD");

      yPos += 8;
      doc.setFontSize(10);
      doc.setFont(undefined, "normal");

      if (invoice.subtotal) {
        doc.text("Subtotal:", 124, yPos);
        doc.text(
          "Rs. " +
            Number(invoice.subtotal).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            }),
          192,
          yPos,
          { align: "right" },
        );
        yPos += 6;
      }

      if (invoice.discount && Number(invoice.discount) > 0) {
        doc.text("Discount:", 124, yPos);
        doc.text(
          "- Rs. " +
            Number(invoice.discount).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            }),
          192,
          yPos,
          { align: "right" },
        );
        yPos += 6;
      }

      if (invoice.taxAmount) {
        doc.text(`Tax (${invoice.taxRate || 18}%):`, 124, yPos);
        doc.text(
          "Rs. " +
            Number(invoice.taxAmount).toLocaleString("en-IN", {
              minimumFractionDigits: 2,
            }),
          192,
          yPos,
          { align: "right" },
        );
        yPos += 6;
      }

      doc.setFont(undefined, "bold");
      doc.setFontSize(12);
      doc.text("Total:", 124, yPos);
      doc.text(
        "Rs. " +
          Number(invoice.total).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          }),
        192,
        yPos,
        { align: "right" },
      );

      // Footer
      yPos = 270;
      doc.setFontSize(8);
      doc.setFont(undefined, "italic");
      doc.setTextColor(100, 100, 100);
      doc.text("Thank you for your business!", 105, yPos, { align: "center" });
      yPos += 4;
      doc.text(
        "For any queries, please contact us at info@suhtech.top",
        105,
        yPos,
        { align: "center" },
      );

      // Save PDF
      const fileName = `Invoice_${invoice.invoiceNumber || invoice._id}_${invoice.clientName.replace(/\s+/g, "_")}.pdf`;
      doc.save(fileName);

      showToast("Invoice downloaded successfully!", "success");
      setActiveMenuId(null);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      showToast("Failed to download invoice: " + error.message, "error");
    }
  };

  // PDF Export Function - Professional Invoice Format
  const handleExportPDF = () => {
    try {
      console.log("Starting PDF export...");

      // Get filtered invoices
      const filteredData = getFilteredInvoices();
      console.log("Filtered data:", filteredData);

      if (!filteredData || filteredData.length === 0) {
        showToast("No invoices to export!", "error");
        return;
      }

      // Create separate PDF for each invoice //
      filteredData.forEach((invoice, invIndex) => {
        const doc = new jsPDF();
        let yPos = 15;

        // HEADER BOX //
        doc.setFillColor(37, 99, 235);
        doc.rect(0, 0, 210, 45, "F");

        // Company Name //
        doc.setFontSize(26);
        doc.setFont(undefined, "bold");
        doc.setTextColor(255, 255, 255);
        doc.text("SUH TECH PRIVATE LIMITED", 105, yPos, { align: "center" });

        yPos += 8;
        doc.setFontSize(9);
        doc.setFont(undefined, "normal");
        doc.text(
          "D-8, 4th Floor, Habitech Crystal Mall, Knowledge Park III, Greater Noida,",
          105,
          yPos,
          { align: "center" },
        );
        yPos += 4;
        doc.text("Uttar Pradesh - 201310", 105, yPos, { align: "center" });
        yPos += 5;
        doc.text(
          "Email: info@suhtech.top | Phone: +91 9211056355 (WhatsApp) | Tel: +91 1204086567",
          105,
          yPos,
          { align: "center" },
        );

        yPos = 55;

        // Invoice Title
        doc.setFontSize(20);
        doc.setFont(undefined, "bold");
        doc.setTextColor(0, 0, 0);
        const firstService = (invoice.services && invoice.services[0]) || {};
        doc.text("INVOICE", 105, yPos, { align: "center" });

        yPos += 10;

        // Invoice Info Box
        doc.setDrawColor(200, 200, 200);
        doc.setLineWidth(0.5);
        doc.rect(14, yPos, 182, 20);

        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text("Invoice No:", 18, yPos + 7);
        doc.setFont(undefined, "normal");
        doc.text(invoice.invoiceNumber || invoice._id || "N/A", 45, yPos + 7);

        doc.setFont(undefined, "bold");
        doc.text("Date:", 18, yPos + 14);
        doc.setFont(undefined, "normal");
        doc.text(
          formatDate(invoice.invoiceDate || invoice.date) ||
            new Date().toLocaleDateString("en-IN"),
          45,
          yPos + 14,
        );

        doc.setFont(undefined, "bold");
        doc.text("Status:", 130, yPos + 7);
        doc.setFont(undefined, "normal");
        const status = invoice.status || "Draft";
        if (status === "Sent") {
          doc.setTextColor(34, 197, 94);
        } else if (status === "Draft") {
          doc.setTextColor(234, 179, 8);
        } else {
          doc.setTextColor(239, 68, 68);
        }
        doc.text(status, 150, yPos + 7);
        doc.setTextColor(0, 0, 0);

        yPos += 28;

        // ==================== CLIENT DETAILS BOX ====================
        doc.setFillColor(245, 247, 250);
        doc.rect(14, yPos, 182, 28, "FD");

        yPos += 7;
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text("BILL TO:", 18, yPos);

        yPos += 6;
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        doc.text(invoice.clientName || "N/A", 18, yPos);
        yPos += 5;
        doc.text("Email: " + (invoice.clientEmail || "N/A"), 18, yPos);
        yPos += 5;
        doc.text("Phone: " + (invoice.clientPhone || "N/A"), 18, yPos);
        yPos += 5;
        doc.text("Address: " + (invoice.clientAddress || "N/A"), 18, yPos);

        yPos += 10;

        // ==================== SERVICES TABLE ====================
        doc.setFontSize(12);
        doc.setFont(undefined, "bold");
        doc.text("SERVICES", 14, yPos);
        yPos += 6;

        // Table header
        doc.setFillColor(50, 50, 50);
        doc.rect(14, yPos, 182, 10, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(10);
        doc.setFont(undefined, "bold");
        doc.text("Description", 18, yPos + 7);
        doc.text("Price (Rs.)", 170, yPos + 7, { align: "right" });

        yPos += 10;
        doc.setTextColor(0, 0, 0);
        doc.setFont(undefined, "normal");

        // Services rows
        let subtotal = 0;
        if (invoice.services && invoice.services.length > 0) {
          invoice.services.forEach((service, idx) => {
            if (yPos > 250) {
              doc.addPage();
              yPos = 20;
            }

            const price = Number(service.price) || 0;
            subtotal += price;

            // Row background
            if (idx % 2 === 0) {
              doc.setFillColor(250, 250, 250);
              doc.rect(14, yPos, 182, 8, "F");
            }

            // Borders
            doc.setDrawColor(220, 220, 220);
            doc.line(14, yPos, 196, yPos);

            doc.setFontSize(9);
            doc.text(service.description || "Service", 18, yPos + 5);
            doc.text(
              price.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }),
              170,
              yPos + 5,
              { align: "right" },
            );
            yPos += 8;
          });
        }

        // Bottom border of table
        doc.setDrawColor(50, 50, 50);
        doc.setLineWidth(0.5);
        doc.line(14, yPos, 196, yPos);

        yPos += 5;

        // ==================== PHASES (if available) ====================
        if (invoice.phases && invoice.phases.some((p) => Number(p.price) > 0)) {
          yPos += 5;

          doc.setFontSize(11);
          doc.setFont(undefined, "bold");
          doc.text("PROJECT TIMELINE", 14, yPos);
          yPos += 6;

          doc.setFontSize(9);
          doc.setFont(undefined, "normal");

          invoice.phases.forEach((phase, idx) => {
            if (Number(phase.price) > 0) {
              if (yPos > 260) {
                doc.addPage();
                yPos = 20;
              }

              doc.setFont(undefined, "bold");
              doc.text(
                "Phase " + (idx + 1) + ": " + (phase.remarks || "Phase"),
                18,
                yPos,
              );
              yPos += 5;
              doc.setFont(undefined, "normal");
              doc.text(
                "Duration: " +
                  formatDate(phase.startDate) +
                  " to " +
                  formatDate(phase.endDate),
                18,
                yPos,
              );
              yPos += 5;
              doc.text(
                "Amount: Rs. " +
                  Number(phase.price).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                  }),
                18,
                yPos,
              );
              yPos += 6;
            }
          });

          yPos += 5;
        }

        // ==================== PRICING SUMMARY ====================
        const total = Number(invoice.total) || subtotal;
        const tax = total * 0.18; // 18% GST
        const grandTotal = total + tax;

        // Summary box
        const summaryY = yPos;
        doc.setDrawColor(200, 200, 200);
        doc.rect(120, summaryY, 76, 28);

        yPos = summaryY + 7;
        doc.setFontSize(10);
        doc.setFont(undefined, "normal");
        doc.text("Subtotal:", 125, yPos);
        doc.text(
          "Rs. " +
            total.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          190,
          yPos,
          { align: "right" },
        );

        yPos += 6;
        doc.text("GST (18%):", 125, yPos);
        doc.text(
          "Rs. " +
            tax.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          190,
          yPos,
          { align: "right" },
        );

        yPos += 8;
        doc.setFillColor(37, 99, 235);
        doc.rect(120, yPos - 5, 76, 10, "F");
        doc.setFont(undefined, "bold");
        doc.setFontSize(12);
        doc.setTextColor(255, 255, 255);
        doc.text("TOTAL:", 125, yPos + 2);
        doc.text(
          "Rs. " +
            grandTotal.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }),
          190,
          yPos + 2,
          { align: "right" },
        );
        doc.setTextColor(0, 0, 0);

        yPos += 15;

        // TERMS & CONDITIONS //
        if (yPos > 220) {
          doc.addPage();
          yPos = 20;
        }

        yPos += 5;
        doc.setFontSize(11);
        doc.setFont(undefined, "bold");
        doc.text("TERMS & CONDITIONS", 14, yPos);
        yPos += 6;

        doc.setFontSize(8);
        doc.setFont(undefined, "normal");
        const terms = [
          "1. Changes beyond the defined scope will be treated as additional work.",
          "2. Client must provide accurate details before development.",
          "3. SUH Tech reserves the right to showcase the project in its portfolio.",
          "4. Payment terms: 50% advance, 50% on completion.",
          "5. Delivery timeline subject to timely client inputs and approvals.",
        ];

        terms.forEach((term) => {
          if (yPos > 275) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(term, 14, yPos);
          yPos += 5;
        });

        // FOOTER //
        yPos = 280;
        doc.setDrawColor(200, 200, 200);
        doc.line(14, yPos, 196, yPos);
        yPos += 5;

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont(undefined, "bold");
        doc.text("Authorized By:", 14, yPos);
        doc.setFont(undefined, "normal");
        doc.text("SUH Tech Private Limited", 40, yPos);

        yPos += 5;
        doc.setFontSize(7);
        doc.setFont(undefined, "italic");
        doc.text(
          "Pricing is flexible and can be adjusted based on additional requirements or changes to the scope.",
          105,
          yPos,
          { align: "center" },
        );

        // Save PDF
        const fileName = `Invoice_${invoice.invoiceNumber || invoice._id}_${new Date().getTime()}.pdf`;
        console.log("Saving PDF as:", fileName);
        doc.save(fileName);
      });

      console.log("PDF export completed successfully!");
      showToast(
        `${filteredData.length} invoice(s) exported successfully!`,
        "success",
      );
    } catch (error) {
      console.error("Error exporting PDF:", error);
      showToast("Failed to export PDF: " + error.message, "error");
    }
  };

  // Filter handler
  const handleApplyFilter = (category, value) => {
    setFilterCategory(category);
    setFilterValue(value);
    setIsFilterOpen(false);
  };

  // Clear filter
  const handleClearFilter = () => {
    setFilterCategory("");
    setFilterValue("");
    setIsFilterOpen(false);
  };

  // Get filtered invoices
  const getFilteredInvoices = () => {
    return invoices.filter((inv) => {
      // Apply search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const firstService = (inv.services && inv.services[0]) || {};
        const matchesSearch =
          (inv.invoiceNumber || "").toLowerCase().includes(search) ||
          (inv.clientName || "").toLowerCase().includes(search) ||
          (inv.clientPhone || "").toLowerCase().includes(search) ||
          (inv.clientAddress || "").toLowerCase().includes(search) ||
          (firstService.description || "").toLowerCase().includes(search);
        if (!matchesSearch) return false;
      }

      // Apply category filter
      if (!filterCategory || !filterValue) return true;

      const firstService = (inv.services && inv.services[0]) || {};

      switch (filterCategory) {
        case "status":
          return inv.status === filterValue;
        case "client":
          return inv.clientName === filterValue;
        case "product":
          return firstService.description === filterValue;
        case "phases":
          if (filterValue === "has-phases") {
            return (
              Array.isArray(inv.phases) &&
              inv.phases.some((p) => Number(p.price) > 0)
            );
          } else if (filterValue === "no-phases") {
            return (
              !Array.isArray(inv.phases) ||
              !inv.phases.some((p) => Number(p.price) > 0)
            );
          }
          return true;
        case "financials":
          const total = Number(inv.total) || 0;
          if (filterValue === "low") return total < 10000;
          if (filterValue === "medium") return total >= 10000 && total < 50000;
          if (filterValue === "high") return total >= 50000;
          return true;
        default:
          return true;
      }
    });
  };

  // Export by Status Function
  const handleExportByStatus = (status) => {
    try {
      console.log("=== EXPORT DEBUG START ===");
      console.log("1. Export status:", status);
      console.log("2. Total invoices:", invoices.length);
      console.log("3. Invoices data:", invoices);

      let dataToExport = getFilteredInvoices();
      console.log("4. Filtered invoices:", dataToExport.length);
      console.log("5. Filtered data:", dataToExport);

      // Filter by status if specific status is selected
      if (status !== "all") {
        dataToExport = dataToExport.filter((inv) => inv.status === status);
        console.log("6. After status filter:", dataToExport.length);
      }

      if (!dataToExport || dataToExport.length === 0) {
        console.log("7. NO DATA TO EXPORT!");
        showToast(
          `No ${status === "all" ? "" : status} invoices to export!`,
          "error",
        );
        return;
      }

      console.log("8. Creating PDF...");
      const doc = new jsPDF();
      console.log("9. jsPDF created successfully");
      let yPos = 15;

      // ==================== HEADER ====================
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 40, "F");

      doc.setFontSize(24);
      doc.setFont(undefined, "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("SUH TECH PRIVATE LIMITED", 105, yPos, { align: "center" });

      yPos += 8;
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text(
        "D-8, 4th Floor, Habitech Crystal Mall, Knowledge Park III, Greater Noida, UP - 201310",
        105,
        yPos,
        { align: "center" },
      );
      yPos += 4;
      doc.text(
        "Email: info@suhtech.top | Phone: +91 9211056355 | Tel: +91 1204086567",
        105,
        yPos,
        { align: "center" },
      );

      yPos = 50;

      // Report Title
      doc.setFontSize(18);
      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);
      const reportTitle =
        status === "all"
          ? "ALL INVOICES REPORT"
          : `${status.toUpperCase()} INVOICES REPORT`;
      doc.text(reportTitle, 105, yPos, { align: "center" });

      yPos += 8;
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text(
        "Generated on: " + new Date().toLocaleDateString("en-IN"),
        105,
        yPos,
        { align: "center" },
      );

      yPos += 12;

      // ==================== SUMMARY STATISTICS ====================
      const totalAmount = dataToExport.reduce(
        (sum, inv) => sum + (Number(inv.total) || 0),
        0,
      );
      const sentCount = dataToExport.filter(
        (inv) => inv.status === "Sent",
      ).length;
      const draftCount = dataToExport.filter(
        (inv) => inv.status === "Draft",
      ).length;
      const overdueCount = dataToExport.filter(
        (inv) => inv.status === "Overdue",
      ).length;

      // Draw summary box
      doc.setFillColor(245, 247, 250);
      doc.setDrawColor(200, 200, 200);
      doc.rect(14, yPos, 182, 28, "FD");

      yPos += 7;
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.setTextColor(0, 0, 0);
      doc.text("SUMMARY", 18, yPos);

      yPos += 7;
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text("Total Invoices: " + dataToExport.length, 18, yPos);
      doc.text(
        "Total Amount: Rs. " +
          totalAmount.toLocaleString("en-IN", { minimumFractionDigits: 2 }),
        120,
        yPos,
      );

      yPos += 6;
      doc.setTextColor(34, 197, 94);
      doc.text("Sent: " + sentCount, 14, yPos);
      doc.setTextColor(234, 179, 8);
      doc.text("Draft: " + draftCount, 60, yPos);
      doc.setTextColor(239, 68, 68);
      doc.text("Overdue: " + overdueCount, 106, yPos);
      doc.setTextColor(0, 0, 0);

      // Move past the summary box
      yPos += 15;

      // ==================== INVOICES TABLE ====================
      doc.setFontSize(11);
      doc.setFont(undefined, "bold");
      doc.text("INVOICE DETAILS", 14, yPos);
      yPos += 8;

      // Prepare table data
      const tableData = dataToExport.map((inv) => [
        inv.invoiceNumber || inv._id?.substring(0, 8) || "N/A",
        inv.clientName || "N/A",
        formatDate(inv.invoiceDate || inv.date) || "N/A",
        inv.status || "Draft",
        "Rs. " +
          (Number(inv.total) || 0).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
          }),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [["Invoice #", "Client", "Date", "Status", "Amount"]],
        body: tableData,
        theme: "grid",
        styles: {
          fontSize: 8,
          cellPadding: 3,
          overflow: "linebreak",
          halign: "left",
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: [255, 255, 255],
          fontSize: 9,
          fontStyle: "bold",
          halign: "left",
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [0, 0, 0],
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
        },
        columnStyles: {
          0: { cellWidth: 30, overflow: "linebreak" },
          1: { cellWidth: 55, overflow: "linebreak" },
          2: { cellWidth: 28, overflow: "linebreak" },
          3: { cellWidth: 22, halign: "center", overflow: "linebreak" },
          4: { cellWidth: 47, halign: "right", overflow: "linebreak" },
        },
        margin: { left: 14, right: 14 },
        tableWidth: 182,
        didParseCell: function (data) {
          if (data.section === "body" && data.column.index === 3) {
            const status = data.cell.raw;
            if (status === "Sent") {
              data.cell.styles.textColor = [34, 197, 94];
              data.cell.styles.fontStyle = "bold";
            } else if (status === "Draft") {
              data.cell.styles.textColor = [234, 179, 8];
              data.cell.styles.fontStyle = "bold";
            } else if (status === "Overdue") {
              data.cell.styles.textColor = [239, 68, 68];
              data.cell.styles.fontStyle = "bold";
            }
          }
        },
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text("Page " + i + " of " + pageCount, 105, 285, {
          align: "center",
        });
        doc.text("SUH TECH PRIVATE LIMITED - Confidential", 105, 290, {
          align: "center",
        });
      }

      // Save PDF
      const fileName =
        status === "all"
          ? `All_Invoices_Report_${new Date().toISOString().split("T")[0]}.pdf`
          : `${status}_Invoices_Report_${new Date().toISOString().split("T")[0]}.pdf`;

      doc.save(fileName);
      setIsExportOpen(false);

      console.log("PDF exported successfully:", fileName);
    } catch (error) {
      console.error("=== EXPORT ERROR ===");
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      console.error("Full error:", error);
      showToast("Failed to export PDF: " + error.message, "error");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Invoices</h1>
          <p className="text-gray-600 text-sm">
            Manage draft and past invoices
          </p>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Upload button */}
            <button
              onClick={() => fileInputRef.current.click()}
              className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm flex-1 md:flex-none cursor-pointer"
            >
              <Upload size={20} />
              <span>Upload Invoice</span>
            </button>
          </>

          <button
            onClick={() => {
              setEditingInvoice(null);
              setNewInvoice((prev) => ({
                ...prev,
                status: "Draft",
              }));
              setIsAddModalOpen(true);
            }}
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
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {/* Filter Dropdown */}
          <div className="relative flex-1 md:flex-none">
            <button
              data-filter-button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer relative"
            >
              <Filter size={18} />
              Filter
              {filterCategory && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full text-white text-xs flex items-center justify-center">
                  1
                </span>
              )}
            </button>

            {/* Filter Dropdown Menu */}
            {isFilterOpen && (
              <div
                data-filter-content
                className="absolute top-full mt-2 right-0 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2 max-h-96 overflow-y-auto"
              >
                {/* Clear Filter */}
                {filterCategory && (
                  <div className="px-3 py-2 border-b border-gray-100">
                    <button
                      onClick={handleClearFilter}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      ✕ Clear Filter
                    </button>
                  </div>
                )}

                {/* Status Filter */}
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Status
                  </p>
                  {["Sent", "Draft", "Overdue"].map((status) => (
                    <button
                      key={status}
                      onClick={() => handleApplyFilter("status", status)}
                      className={`block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 ${
                        filterCategory === "status" && filterValue === status
                          ? "bg-blue-50 text-blue-600 font-medium"
                          : "text-gray-700"
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>

                {/* Client Filter */}
                <div className="px-3 py-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Client
                  </p>
                  {[...new Set(invoices.map((inv) => inv.clientName))]
                    .filter(Boolean)
                    .slice(0, 5)
                    .map((client) => (
                      <button
                        key={client}
                        onClick={() => handleApplyFilter("client", client)}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 truncate ${
                          filterCategory === "client" && filterValue === client
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {client}
                      </button>
                    ))}
                </div>

                {/* Product Filter */}
                <div className="px-3 py-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Product
                  </p>
                  {[
                    ...new Set(
                      invoices.map(
                        (inv) => (inv.services && inv.services[0])?.description,
                      ),
                    ),
                  ]
                    .filter(Boolean)
                    .slice(0, 5)
                    .map((product) => (
                      <button
                        key={product}
                        onClick={() => handleApplyFilter("product", product)}
                        className={`block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 truncate ${
                          filterCategory === "product" &&
                          filterValue === product
                            ? "bg-blue-50 text-blue-600 font-medium"
                            : "text-gray-700"
                        }`}
                      >
                        {product}
                      </button>
                    ))}
                </div>

                {/* Phases Filter */}
                <div className="px-3 py-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Phases
                  </p>
                  <button
                    onClick={() => handleApplyFilter("phases", "has-phases")}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 ${
                      filterCategory === "phases" &&
                      filterValue === "has-phases"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    Has Phases
                  </button>
                  <button
                    onClick={() => handleApplyFilter("phases", "no-phases")}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 ${
                      filterCategory === "phases" && filterValue === "no-phases"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    No Phases
                  </button>
                </div>

                {/* Financials Filter */}
                <div className="px-3 py-2 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Financials
                  </p>
                  <button
                    onClick={() => handleApplyFilter("financials", "low")}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 ${
                      filterCategory === "financials" && filterValue === "low"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    &lt; ₹10,000
                  </button>
                  <button
                    onClick={() => handleApplyFilter("financials", "medium")}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 ${
                      filterCategory === "financials" &&
                      filterValue === "medium"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    ₹10,000 - ₹50,000
                  </button>
                  <button
                    onClick={() => handleApplyFilter("financials", "high")}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 ${
                      filterCategory === "financials" && filterValue === "high"
                        ? "bg-blue-50 text-blue-600 font-medium"
                        : "text-gray-700"
                    }`}
                  >
                    &gt; ₹50,000
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Export Dropdown */}
          <div className="relative flex-1 md:flex-none">
            <button
              data-export-button
              onClick={() => setIsExportOpen(!isExportOpen)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              <Download size={18} />
              Export
            </button>

            {/* Export Dropdown Menu */}
            {isExportOpen && (
              <div
                data-export-content
                className="absolute top-full mt-2 right-0 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20 py-2"
              >
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                    Export Invoices
                  </p>
                  <button
                    onClick={() => handleExportByStatus("all")}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 text-gray-700"
                  >
                    All Invoices
                  </button>
                  <button
                    onClick={() => handleExportByStatus("Sent")}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 text-green-600"
                  >
                    Sent Only
                  </button>
                  <button
                    onClick={() => handleExportByStatus("Draft")}
                    className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                    Draft Only
                  </button>
                  <button
                    onClick={() => handleExportByStatus("Overdue")}
                    className="block w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-50 text-red-600"
                  >
                    Overdue Only
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto overflow-y-visible scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Invoice ID
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Date
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Client Name
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Contact
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Location
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Product{" "}
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Phases
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Amount
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm">
                  Status
                </th>
                <th className="p-4 font-semibold text-gray-600 text-sm text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="10" className="p-8 text-center text-gray-500">
                    Loading invoices...
                  </td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-500">
                    No invoices found. Create your first invoice!
                  </td>
                </tr>
              ) : (
                getFilteredInvoices().map((inv) => {
                  const firstService = (inv.services && inv.services[0]) || {};
                  return (
                    <React.Fragment key={inv._id}>
                      <tr
                        key={inv._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4">
                          <span className="font-semibold text-gray-900">
                            {inv.invoiceNumber || inv._id}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="text-sm text-gray-600">
                            {formatDate(inv.invoiceDate || inv.date)}
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="font-medium text-gray-800">
                            {inv.clientName}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Phone size={12} />
                            {inv.clientPhone || inv.contact}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <MapPin size={12} />
                            {inv.clientAddress || inv.address}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-gray-800">
                              {firstService.description || "Service"}
                            </span>
                          </div>
                        </td>

                        {/* PHASE COLUMN */}

                        <td className="p-4">
                          {Array.isArray(inv.phases) &&
                          inv.phases.some((p) => Number(p.price) > 0) ? (
                            <>
                              <span className="text-sm text-gray-700">
                                Total Phases:{" "}
                                {
                                  inv.phases.filter((p) => Number(p.price) > 0)
                                    .length
                                }
                              </span>

                              <button
                                onClick={() =>
                                  setExpandedInvoiceId(
                                    expandedInvoiceId === inv._id
                                      ? null
                                      : inv._id,
                                  )
                                }
                                className="block mt-1 text-sm text-blue-600 hover:underline"
                              >
                                View Phase Details
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                setExpandedInvoiceId(
                                  expandedInvoiceId === inv._id
                                    ? null
                                    : inv._id,
                                )
                              }
                              className="text-sm text-blue-600 hover:underline"
                            >
                              View Phases
                            </button>
                          )}
                        </td>

                        <td className="p-4">
                          <span className="font-bold text-gray-800">
                            {formatAmount(inv.total)}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              inv.status,
                            )}`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="relative">
                            <button
                              data-menu-button
                              onClick={() =>
                                setActiveMenuId(
                                  activeMenuId === inv._id ? null : inv._id,
                                )
                              }
                              className="p-2 hover:bg-gray-200 rounded-full text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
                            >
                              <MoreVertical size={18} />
                            </button>
                            {activeMenuId === inv._id && (
                              <div
                                data-menu-content
                                className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-10 py-1"
                              >
                                <button
                                  onClick={() => handleEditInvoice(inv)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                >
                                  <FileText size={16} />
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDownloadInvoice(inv)}
                                  className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                                >
                                  <Download size={16} />
                                  Download
                                </button>
                                <button
                                  onClick={() => handleDeleteInvoice(inv._id)}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <X size={16} />
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Phase Details Modal */}
      {expandedInvoiceId &&
        (() => {
          const invoice = invoices.find((i) => i._id === expandedInvoiceId);
          if (!invoice) return null;

          const validPhases =
            invoice.phases?.filter((p) => Number(p.price) > 0) || [];

          return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Phase Details
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Invoice: {invoice.invoiceNumber} - {invoice.clientName}
                    </p>
                  </div>
                  <button
                    onClick={() => setExpandedInvoiceId(null)}
                    className="p-2 hover:bg-white rounded-lg transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="flex-1 overflow-y-auto p-6">
                  {validPhases.length > 0 ? (
                    <div className="space-y-4">
                      {validPhases.map((phase) => {
                        const isDeliverable = phase.serviceType
                          ?.toLowerCase()
                          .includes("deliver");

                        return (
                          <div
                            key={phase.id}
                            className="bg-gradient-to-br from-blue-50/50 to-purple-50/50 border border-blue-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                          >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-lg font-bold text-gray-900">
                                Phase {phase.id}
                              </h4>

                              {/* PHASE STATUS */}
                              <span
                                className={`px-3 py-1 text-xs rounded-full font-semibold ${
                                  phase.serviceType
                                    ?.toLowerCase()
                                    .includes("deliver")
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
                                {phase.serviceType
                                  ?.toLowerCase()
                                  .includes("deliver")
                                  ? "Deliverable"
                                  : "Not Deliverable"}
                              </span>
                            </div>

                            {/* Remarks */}
                            <p className="text-sm text-gray-700 mb-4 bg-white p-3 rounded-lg">
                              {phase.remarks || "No description"}
                            </p>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">
                                  Type
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {phase.serviceType || "N/A"}
                                </p>
                              </div>
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">
                                  Category
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {phase.serviceCategory || "N/A"}
                                </p>
                              </div>
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">
                                  Price
                                </p>
                                <p className="text-sm font-bold text-blue-600">
                                  {formatAmount(phase.price)}
                                </p>
                              </div>
                              <div className="bg-white p-3 rounded-lg">
                                <p className="text-xs text-gray-500 mb-1">
                                  Duration
                                </p>
                                <p className="text-sm font-semibold text-gray-900">
                                  {phase.startDate &&
                                    formatDate(phase.startDate)}{" "}
                                  → {phase.endDate && formatDate(phase.endDate)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-12 text-center">
                      <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <FileText className="text-gray-400" size={32} />
                      </div>
                      <p className="text-gray-500 font-medium">
                        No phases available for this invoice.
                      </p>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                  <button
                    onClick={() => setExpandedInvoiceId(null)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

      {/* Add Invoice Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl mx-4 rounded-xl shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold">
                {editingInvoice ? "Edit Invoice" : "Manual Invoice Creation"}
              </h2>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingInvoice(null);
                  setNewInvoice({
                    clientName: "",
                    clientEmail: "",
                    clientPhone: "",
                    clientAddress: "",
                    serviceDescription: "",
                    phaseWork: "",
                    phases: [
                      {
                        id: 1,
                        remarks: "",
                        serviceType: "",
                        serviceCategory: "",
                        startDate: "",
                        endDate: "",
                        price: "",
                      },
                      {
                        id: 2,
                        remarks: "",
                        serviceType: "",
                        serviceCategory: "",
                        startDate: "",
                        endDate: "",
                        price: "",
                      },
                      {
                        id: 3,
                        remarks: "",
                        serviceType: "",
                        serviceCategory: "",
                        startDate: "",
                        endDate: "",
                        price: "",
                      },
                      {
                        id: 4,
                        remarks: "",
                        serviceType: "",
                        serviceCategory: "",
                        startDate: "",
                        endDate: "",
                        price: "",
                      },
                    ],
                    startDate: "",
                    endDate: "",
                    price: "",
                    taxRate: 18,
                    discount: 0,
                    dueDate: "",
                    status: "Draft",
                    invoiceDate: new Date().toISOString().split("T")[0],
                  });
                }}
                className="p-2 hover:bg-gray-100 rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              <form
                onSubmit={handleAddInvoice}
                className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    name="clientName"
                    value={newInvoice.clientName}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Client Email
                  </label>
                  <input
                    type="email"
                    name="clientEmail"
                    value={newInvoice.clientEmail}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact (Phone)
                  </label>
                  <input
                    type="tel"
                    name="clientPhone"
                    value={newInvoice.clientPhone}
                    onChange={handleInputChange}
                    onInput={(e) => {
                      // Remove any non-numeric characters
                      e.target.value = e.target.value.replace(/[^0-9]/g, "");
                      // Limit to 10 digits
                      if (e.target.value.length > 10) {
                        e.target.value = e.target.value.slice(0, 10);
                      }
                    }}
                    required
                    pattern="[0-9]{10}"
                    maxLength="10"
                    placeholder="10-digit phone number"
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    title="Please enter exactly 10 digits"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="clientAddress"
                    value={newInvoice.clientAddress}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Service Description
                  </label>
                  <input
                    type="text"
                    name="serviceDescription"
                    value={newInvoice.serviceDescription}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Phase Work
                  </label>

                  {Array.isArray(newInvoice.phases) &&
                    newInvoice.phases.map((phase) => (
                      <div key={phase.id} className="mb-3">
                        {/* Phase Header */}
                        <div
                          onClick={() =>
                            setOpenPhaseId(
                              openPhaseId === phase.id ? null : phase.id,
                            )
                          }
                          className="flex items-center justify-between  px-4 py-3 border bg-white border-gray-200 rounded-lg  shadow-sm cursor-pointer hover:bg-gray-50 transition-all duration-200"
                        >
                          <span className="text-sm font-semibold text-gray-700">
                            Phase {phase.id}
                          </span>
                          <span className="text-lg text-gray-500">
                            {openPhaseId === phase.id ? "−" : "+"}
                          </span>
                        </div>

                        {/* Phase Body */}
                        {openPhaseId === phase.id && (
                          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4 bg-white">
                            <div className="md:col-span-2">
                              <label className="text-sm font-medium">
                                Remarks / Content
                              </label>
                              <textarea
                                className="w-full p-2 border border-gray-300 rounded-lg 
                                    text-gray-700 placeholder-gray-400 
                                    focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                value={phase.remarks}
                                onChange={(e) =>
                                  handlePhaseChange(
                                    phase.id,
                                    "remarks",
                                    e.target.value,
                                  )
                                }
                              ></textarea>
                            </div>

                            <div>
                              <label className="text-sm font-medium">
                                Service Type
                              </label>
                              <select
                                className="w-full p-2 border border-gray-300 rounded-lg 
                               text-gray-700 bg-white
                               focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                value={phase.serviceType}
                                onChange={(e) =>
                                  handlePhaseChange(
                                    phase.id,
                                    "serviceType",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="">Select</option>
                                {SERVICE_TYPES.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-sm font-medium">
                                Service Category
                              </label>
                              <select
                                className="w-full p-2 border border-gray-300 rounded-lg 
                               text-gray-700 bg-white
                               focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                value={phase.serviceCategory}
                                onChange={(e) =>
                                  handlePhaseChange(
                                    phase.id,
                                    "serviceCategory",
                                    e.target.value,
                                  )
                                }
                              >
                                <option value="">Select</option>
                                {SERVICE_CATEGORIES.map((cat) => (
                                  <option key={cat} value={cat}>
                                    {cat}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="text-sm font-medium">
                                Price
                              </label>
                              <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded-lg 
                                text-gray-700
                                focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                value={phase.price}
                                onChange={(e) =>
                                  handlePhaseChange(
                                    phase.id,
                                    "price",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium">
                                Start Date
                              </label>
                              <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded-lg 
                             text-gray-700
                              focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                value={phase.startDate}
                                onChange={(e) =>
                                  handlePhaseChange(
                                    phase.id,
                                    "startDate",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>

                            <div>
                              <label className="text-sm font-medium">
                                End Date
                              </label>
                              <input
                                type="date"
                                className="w-full p-2 border border-gray-300 rounded-lg 
                         text-gray-700
                          focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                                min={phase.startDate}
                                value={phase.endDate}
                                onChange={(e) =>
                                  handlePhaseChange(
                                    phase.id,
                                    "endDate",
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <input
                    type="text"
                    name="price"
                    value={newInvoice.price}
                    onChange={handleInputChange}
                    required
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={newInvoice.startDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={newInvoice.endDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    name="taxRate"
                    value={newInvoice.taxRate}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={newInvoice.discount}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maintenance Due Date
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    value={newInvoice.dueDate}
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
                    value={newInvoice.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    required
                  >
                    <option value="Sent">Sent</option>
                    <option value="Draft">Draft</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                <div className="md:col-span-2 mt-4 pt-4 border-t">
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    {editingInvoice ? "Update Invoice" : "Create Invoice"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <X size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Delete Invoice
                </h3>
                <p className="text-sm text-gray-600">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this invoice? All associated data
              will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() =>
                  setConfirmModal({ isOpen: false, invoiceId: null })
                }
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default Invoices;
