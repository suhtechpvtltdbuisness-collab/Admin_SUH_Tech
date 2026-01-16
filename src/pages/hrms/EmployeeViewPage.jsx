import { ArrowLeft, Ban, Camera, Check, Edit3, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Documents from "../../components/employee/Documents";
import JobInformation from "../../components/employee/JobInformation";
import PersonalInformation from "../../components/employee/PersonalInformation";
import Toast from "../../components/common/Toast";
import { employeeService } from "../../services";
import ConfirmationModal from "../../components/common/ConfirmationModal";

// MOCK DATA matching EmployeePage (5 Items)
const MOCK_DB = {
    "001": {
        id: "001",
        name: "Rahul Sharma",
        designation: "Software Engineer",
        dept: "Engineering",
        joinDate: "2023-01-15",
        contact: "rahul.s@suhtech.com",
        status: "Active",
        avatar: "https://ui-avatars.com/api/?name=Rahul+Sharma&background=0D8ABC&color=fff",
        details: {
            gender: "Male",
            dob: "25 Aug 1995",
            bloodGroup: "B+",
            nationality: "Indian",
            currentAddress: "A-123, Rosewood App, Andheri West, Mumbai",
            city: "Mumbai",
            state: "Maharashtra",
            zip: "400053",
            emergencyName: "Anil Patil",
            emergencyRelation: "Father",
            emergencyPhone: "9876543210",
            aadhar: "XXXX-XXXX-1234",
            pan: "ABCDE1234F",
            // Job Info
            jobTitle: "Software Engineer",
            department: "Engineering",
            reportingManager: "Amit Patel",
            dateOfJoining: "2023-01-15",
            employmentStatus: "Active",
            contractDuration: "Full Time",
            workMode: "Hybrid"
        }
    },
    "002": {
        id: "002",
        name: "Priya Singh",
        designation: "UI/UX Designer",
        dept: "Design",
        joinDate: "2023-02-10",
        contact: "priya.s@suhtech.com",
        status: "Active",
        avatar: "https://ui-avatars.com/api/?name=Priya+Singh&background=D946EF&color=fff",
        details: {
            gender: "Female",
            dob: "12 Dec 1996",
            bloodGroup: "O+",
            nationality: "Indian",
            currentAddress: "B-402, Sunshine Towers, Pune",
            city: "Pune",
            state: "Maharashtra",
            zip: "411001"
        }
    },
    "003": {
        id: "003",
        name: "Amit Patel",
        designation: "Product Manager",
        dept: "Product",
        joinDate: "2022-11-05",
        contact: "amit.p@suhtech.com",
        status: "Active",
        avatar: "https://ui-avatars.com/api/?name=Amit+Patel&background=F59E0B&color=fff",
        details: {
            gender: "Male",
            dob: "10 Mar 1990",
            bloodGroup: "A+",
            nationality: "Indian",
            currentAddress: "C-101, Green Valley, Bangalore",
            city: "Bangalore",
            state: "Karnataka",
            zip: "560001"
        }
    },
    "004": {
        id: "004",
        name: "Sneha Gupta",
        designation: "HR Manager",
        dept: "HR",
        joinDate: "2021-08-20",
        contact: "sneha.g@suhtech.com",
        status: "On Leave",
        avatar: "https://ui-avatars.com/api/?name=Sneha+Gupta&background=10B981&color=fff",
        details: {
            gender: "Female",
            dob: "20 Aug 1992",
            bloodGroup: "AB+",
            nationality: "Indian",
            currentAddress: "D-505, Blue Heights, Delhi",
            city: "Delhi",
            state: "Delhi",
            zip: "110001"
        }
    },
    "005": {
        id: "005",
        name: "Vikram Malhotra",
        designation: "Backend Dev",
        dept: "Engineering",
        joinDate: "2023-03-12",
        contact: "vikram.m@suhtech.com",
        status: "Active",
        avatar: "https://ui-avatars.com/api/?name=Vikram+Malhotra&background=3B82F6&color=fff",
        details: {
            gender: "Male",
            dob: "15 Jan 1994",
            bloodGroup: "B+",
            nationality: "Indian",
            currentAddress: "E-202, Tech City, Hyderabad",
            city: "Hyderabad",
            state: "Telangana",
            zip: "500081"
        }
    }
};

const getEmployeeById = (id) => {
    // Return explicit mock or fallback for others
    if (MOCK_DB[id]) return MOCK_DB[id];

    // Fallback generator for others
    return {
        id: id,
        name: `Employee ${id}`,
        designation: "Role",
        dept: "Dept",
        joinDate: "N/A",
        contact: `employee${id}@suhtech.com`,
        status: "Inactive",
        avatar: `https://ui-avatars.com/api/?name=Emp+${id}&background=random&color=fff`,
        details: {}
    };
};

export default function EmployeeViewPage() {
    const { id } = useParams();
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [employee, setEmployee] = useState(null);
    const [editedEmployee, setEditedEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    useEffect(() => {
        loadEmployee();
    }, [id]);

    // Initialize editedEmployee when employee loads
    useEffect(() => {
        if (employee) {
            setEditedEmployee({ ...employee });
        }
    }, [employee]);

    const loadEmployee = async () => {
        try {
            setLoading(true);
            const response = await employeeService.getEmployee(id);
            if (response.employee) {
                const emp = response.employee;
                // Split name into firstName and lastName if it exists
                if (emp.name && !emp.firstName && !emp.lastName) {
                    const nameParts = emp.name.split(' ');
                    emp.firstName = nameParts[0] || '';
                    emp.lastName = nameParts.slice(1).join(' ') || '';
                }
                emp.joiningDate =
                    emp.joiningDate ||
                    emp.dateOfJoining ||
                    emp.joinDate ||
                    "";
                setEmployee(emp);
            } else {
                showToast('Employee not found', 'error');
            }
        } catch (error) {
            console.error('Error loading employee:', error);
            showToast('Failed to load employee: ' + error.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    // Terminate and Delete Modal
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        type: null, // "terminate" | "delete"
    });

    const getEmployeeFullName = (emp) => {
        if (!emp) return "";

        if (emp.firstName || emp.lastName) {
            return `${emp.firstName || ""} ${emp.lastName || ""}`.trim();
        }

        return emp.name || "";
    };

    const handleFieldChange = (field, value) => {
        setEditedEmployee(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleNestedFieldChange = (parent, field, value) => {
        setEditedEmployee(prev => ({
            ...prev,
            [parent]: {
                ...prev[parent],
                [field]: value
            }
        }));
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            // Combine firstName and lastName into name field for API
            const dataToSave = { ...editedEmployee };
            if (dataToSave.firstName || dataToSave.lastName) {
                dataToSave.name = `${dataToSave.firstName || ''} ${dataToSave.lastName || ''}`.trim();
            }
            await employeeService.updateEmployee(id, dataToSave);
            // Update local employee state with combined name
            const updatedEmployee = { ...dataToSave };
            setEmployee(updatedEmployee);
            setIsEditing(false);
            showToast('Employee updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating employee:', error);
            showToast('Failed to update employee: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };


    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setEditedEmployee((prev) => ({
                ...prev,
                avatar: reader.result, // base64 preview
                avatarFile: file        // future backend use
            }));
        };
        reader.readAsDataURL(file);
    };

    const handleCancel = () => {
        setEditedEmployee({ ...employee });
        setIsEditing(false);
    };

    const toggleEdit = () => {
        if (isEditing) {
            handleCancel();
        } else {
            setIsEditing(true);
        }
    };

    const openTerminateModal = () => {
        setConfirmModal({ open: true, type: "terminate" });
    };

    const openDeleteModal = () => {
        setConfirmModal({ open: true, type: "delete" });
    };
    const handleConfirmAction = async () => {
        try {
            setSaving(true);

            if (confirmModal.type === "terminate") {
                await employeeService.updateEmployee(id, { ...employee, status: "Inactive" });
                showToast("Employee terminated successfully", "success");
                await loadEmployee();
            }

            if (confirmModal.type === "delete") {
                await employeeService.deleteEmployee(id);
                showToast("Employee deleted successfully", "success");
                setTimeout(() => {
                    window.location.href = "/employees";
                }, 1500);
            }
        } catch (error) {
            showToast("Action failed", "error");
        } finally {
            setSaving(false);
            setConfirmModal({ open: false, type: null });
        }
    };


    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Loading employee details...</p>
            </div>
        </div>
    );

    if (!employee) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <p className="text-gray-600 mb-4">Employee not found</p>
                <Link to="/employees" className="text-blue-600 hover:underline">Back to Employees</Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6 lg:p-10">
            <div className="max-w-7xl mx-auto">
                {/* Top Nav */}
                <div className="flex justify-between items-center mb-6">
                    <Link to="/employees" className="inline-flex items-center text-sm text-gray-600 hover:text-blue-600 transition-colors font-semibold">
                        <ArrowLeft size={18} className="mr-2" /> Back to Employee List
                    </Link>

                    {/* Top Action Buttons */}
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={handleCancel} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed">
                                    <X size={14} /> Cancel
                                </button>
                                <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm disabled:opacity-50 disabled:cursor-not-allowed">
                                    <Check size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <button onClick={toggleEdit} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-semibold shadow-sm transition-all hover:border-blue-200 hover:text-blue-600">
                                <Edit3 size={14} /> Edit Profile
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 items-start pb-20">

                    {/* LEFT PROFILE CARD */}
                    <div className="w-full xl:w-[350px] bg-white border border-gray-200 rounded-2xl p-6 flex-shrink-0 relative">

                        {/* Avatar Section */}
                        <div className="flex flex-col items-center">
                            <div className="relative mb-4">
                                <div className="w-28 h-28 rounded-full border-4 border-gray-50 shadow-inner
                                    flex items-center justify-center bg-gray-100 text-center overflow-hidden">

                                    {(
                                        isEditing
                                            ? editedEmployee?.avatar
                                            : employee.avatar
                                    ) ? (
                                        <img
                                            src={isEditing ? editedEmployee?.avatar : employee.avatar}
                                            className="w-full h-full object-cover rounded-full"
                                            alt="Profile"
                                        />
                                    ) : (
                                        <span className="text-3xl font-bold text-gray-600">
                                            {employee.firstName?.[0] || employee.name?.[0] || "U"}
                                        </span>
                                    )}
                                </div>

                                {isEditing && (
                                    <>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            className="hidden"
                                            id="avatarUpload"
                                        />

                                        <label
                                            htmlFor="avatarUpload"
                                            className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full
                                            border-2 border-white text-white shadow-md hover:bg-blue-700
                                            transition cursor-pointer"
                                        >
                                            <Camera size={14} />
                                        </label>
                                    </>
                                )}
                            </div>

                            <span className="mb-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                                {employee.employeeId || employee.empId || `Emp-${id}`}
                            </span>
                            <h2 className="text-xl font-bold text-gray-900">
                                {employee.firstName || employee.lastName
                                    ? `${employee.firstName || ''} ${employee.lastName || ''}`.trim()
                                    : employee.name || 'N/A'}
                            </h2>
                            <p className="text-gray-500 text-sm font-medium">{employee.designation}</p>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">Contact Information</h3>

                            <div className="space-y-5">
                                {/* Email */}
                                <div>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Email</p>
                                    <input
                                        type="text"
                                        value={employee.contact || "mayank@suhtech.top"}
                                        readOnly={!isEditing}
                                        className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all outline-none
                                            ${isEditing ? "bg-white border border-blue-200 focus:ring-4 focus:ring-blue-50" : "bg-transparent border-none text-gray-800 p-0"}`}
                                    />
                                </div>

                                {/* Phone */}
                                <div>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Mobile Phone</p>
                                    <input
                                        type="text"
                                        value={employee.details?.emergencyPhone || "+91 98765 00000"}
                                        readOnly={!isEditing}
                                        className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all outline-none
                                            ${isEditing ? "bg-white border border-blue-200 focus:ring-4 focus:ring-blue-50" : "bg-transparent border-none text-gray-800 p-0"}`}
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">
                                        Status
                                    </p>
                                    {(() => {
                                        const status = isEditing ? editedEmployee?.status : employee.status;

                                        let bgClass = "bg-gray-50 border-gray-200 text-gray-700";
                                        let dotClass = "bg-gray-400";

                                        if (status === "Active") {
                                            bgClass = "bg-green-50 border-green-100 text-green-700";
                                            dotClass = "bg-green-500";
                                        } else if (status === "Inactive") {
                                            bgClass = "bg-yellow-50 border-yellow-200 text-yellow-700";
                                            dotClass = "bg-yellow-500";
                                        } else if (status === "On Leave") {
                                            bgClass = "bg-red-50 border-red-200 text-red-700";
                                            dotClass = "bg-red-500";
                                        }

                                        return (
                                            <div
                                                className={`w-full py-2.5 px-3.5 rounded-lg border text-sm font-medium flex items-center justify-between ${bgClass}`}
                                            >
                                                {status}
                                                <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Join Date */}
                                <div>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">
                                        Joining Date
                                    </p>

                                    {isEditing ? (
                                        <input
                                            type="date"
                                            value={editedEmployee?.joiningDate || ""}
                                            onChange={(e) =>
                                                handleFieldChange("joiningDate", e.target.value)
                                            }
                                            className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-all outline-none
                                            bg-white border border-blue-200 focus:ring-4 focus:ring-blue-50"
                                        />
                                    ) : (
                                        <div className="text-sm font-medium text-gray-800">
                                            {formatDate(employee.joiningDate)}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT INFO CARD */}
                    <div className="flex-1 w-full flex flex-col gap-6">
                        <div className="bg-white border border-gray-200 rounded-2xl p-2 shadow-sm">
                            {/* Tabs */}
                            <div className="flex gap-8 border-b border-gray-100 px-6 pt-4 mb-2 overflow-x-auto">
                                <button
                                    onClick={() => setActiveTab('personal')}
                                    className={`text-sm font-medium pb-3 whitespace-nowrap transition-colors ${activeTab === 'personal' ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-400 hover:text-gray-700'}`}
                                >
                                    Personal Information
                                </button>
                                <button
                                    onClick={() => setActiveTab('job')}
                                    className={`text-sm font-medium pb-3 whitespace-nowrap transition-colors ${activeTab === 'job' ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-400 hover:text-gray-700'}`}
                                >
                                    Job Information
                                </button>
                                <button
                                    onClick={() => setActiveTab('documents')}
                                    className={`text-sm font-medium pb-3 whitespace-nowrap transition-colors ${activeTab === 'documents' ? 'text-blue-600 border-b-2 border-blue-600 font-bold' : 'text-gray-400 hover:text-gray-700'}`}
                                >
                                    Documents
                                </button>
                            </div>

                            <div className="p-4">
                                {activeTab === 'personal' && (
                                    <PersonalInformation
                                        isEditing={isEditing}
                                        data={editedEmployee}
                                        onChange={handleFieldChange}
                                        onNestedChange={handleNestedFieldChange}
                                    />
                                )}
                                {activeTab === 'job' && (
                                    <JobInformation
                                        isEditing={isEditing}
                                        data={editedEmployee}
                                        onChange={handleFieldChange}
                                    />
                                )}
                                {activeTab === 'documents' && <Documents isEditing={isEditing} />}
                            </div>
                        </div>

                        {/* DELETE & TERMINATE ACTIONS */}
                        <div className="bg-white border border-red-100 rounded-xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                            <div>
                                <h4 className="text-sm font-bold text-gray-900">Employee Actions</h4>
                                <p className="text-xs text-gray-500 mt-1">These actions are irreversible. Please be certain.</p>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={openTerminateModal}

                                    disabled={saving}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100/80 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Ban size={16} /> Terminate
                                </button>
                                <button
                                    onClick={openDeleteModal}
                                    disabled={saving}
                                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100/80 text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>

                            </div>
                        </div>

                    </div>
                </div>
            </div>

            <ConfirmationModal
                open={confirmModal.open}
                title={
                    confirmModal.type === "terminate"
                        ? "Terminate Employee"
                        : "Delete Employee"
                }
                description={
                    confirmModal.type === "terminate"
                        ? `Are you sure you want to terminate ${getEmployeeFullName(employee)}? This will change their status to Inactive.`
                        : `Are you sure you want to permanently delete ${getEmployeeFullName(employee)}? This action cannot be undone.`
                }
                confirmText={
                    confirmModal.type === "terminate" ? "Terminate" : "Delete"
                }
                confirmColor="bg-red-600"
                onCancel={() => setConfirmModal({ open: false, type: null })}
                onConfirm={handleConfirmAction}
                loading={saving}
            />

            {/* Toast Notifications */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
}
