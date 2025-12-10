import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Edit3, Camera, Check, X, Trash2, Ban } from "lucide-react";

import PersonalInformation from "../../components/employee/PersonalInformation";
import JobInformation from "../../components/employee/JobInformation";
import Documents from "../../components/employee/Documents";

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
            dob: "1995-08-25",
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
            dob: "1996-12-12",
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
            dob: "1990-03-10",
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
            dob: "1992-08-20",
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
            dob: "1994-01-15",
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

    useEffect(() => {
        const data = getEmployeeById(id);
        setEmployee(data);
    }, [id]);

    const toggleEdit = () => setIsEditing(!isEditing);

    const handleInputChange = (field, value, section = 'details') => {
        setEmployee(prev => {
            if (section === 'root') {
                return { ...prev, [field]: value };
            }
            return {
                ...prev,
                details: {
                    ...prev.details,
                    [field]: value
                }
            };
        });
    };

    if (!employee) return <div>Loading...</div>;

    return (
        <div className="flex h-screen bg-gray-50">

            <div className="flex-1 p-8 md:p-10 w-full font-sans text-gray-800">
                {/* Top Nav */}
                <div className="flex justify-between items-center mb-6">
                    <Link to="/employees" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors font-medium">
                        <ArrowLeft size={16} className="mr-2" /> Back to Employee List
                    </Link>

                    {/* Top Action Buttons */}
                    <div className="flex gap-2">
                        {isEditing ? (
                            <>
                                <button onClick={toggleEdit} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 text-sm font-semibold">
                                    <X size={14} /> Cancel
                                </button>
                                <button onClick={toggleEdit} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold shadow-sm">
                                    <Check size={14} /> Save Changes
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
                                <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-50 shadow-inner">
                                    <img
                                        src={employee.avatar}
                                        className="w-full h-full object-cover"
                                        alt="Profile"
                                    />
                                </div>
                                {isEditing && (
                                    <button className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white text-white shadow-md hover:bg-blue-700 transition">
                                        <Camera size={14} />
                                    </button>
                                )}
                            </div>

                            <span className="mb-2 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-full">
                                Emp-{id}
                            </span>
                            <h2 className="text-xl font-bold text-gray-900">{employee.name}</h2>
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
                                        value={employee.contact}
                                        readOnly={!isEditing}
                                        onChange={(e) => handleInputChange('contact', e.target.value, 'root')}
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
                                        onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
                                        className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all outline-none
                                            ${isEditing ? "bg-white border border-blue-200 focus:ring-4 focus:ring-blue-50" : "bg-transparent border-none text-gray-800 p-0"}`}
                                    />
                                </div>

                                {/* Status */}
                                <div>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Status</p>
                                    <div className={`w-full py-2.5 px-3.5 rounded-lg border text-sm font-medium flex items-center justify-between
                                        ${employee.status === 'Active' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-gray-50 border-gray-200 text-gray-700'}`}>
                                        {employee.status} <span className={`w-2 h-2 rounded-full ${employee.status === 'Active' ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                                    </div>
                                </div>

                                {/* Join Date */}
                                <div>
                                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider mb-1.5">Joining Date</p>
                                    <input
                                        type="date"
                                        value={employee.joinDate}
                                        readOnly={!isEditing}
                                        onChange={(e) => handleInputChange('joinDate', e.target.value, 'root')}
                                        className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all outline-none
                                            ${isEditing ? "bg-white border border-blue-200 focus:ring-4 focus:ring-blue-50 text-gray-900" : "bg-transparent border-none text-gray-800 p-0"}`}
                                    />
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
                                {activeTab === 'personal' && <PersonalInformation isEditing={isEditing} data={employee.details} onChange={handleInputChange} />}
                                {activeTab === 'job' && <JobInformation isEditing={isEditing} data={employee.details} onChange={handleInputChange} />}
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
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded-lg hover:bg-red-100/80 text-sm font-semibold transition-colors">
                                    <Ban size={16} /> Terminate
                                </button>
                                <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-white text-gray-600 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200 text-sm font-semibold transition-colors">
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
