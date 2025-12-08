import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Pencil, ChevronDown } from "lucide-react";
import Sidebar from "../components/Sidebar";

export default function EmployeeViewPage() {
    const { id } = useParams();

    // Mock Data
    const [profileData, setProfileData] = useState({
        Email: "rahul.sharma@example.com",
        "Mobile Phone": "+91 98765 43210",
        Nationality: "Indian",
        Gender: "Male",
        Age: "28",
        Status: "Active",
        "Type of Hire": "Full Time In House",
        "Joining Date": "2023-01-15"
    });

    const handleInputChange = (label, value) => {
        setProfileData(prev => ({ ...prev, [label]: value }));
    };

    return (
        <div className="flex h-screen bg-gray-50">
            <Sidebar />

            <main className="flex-1 p-8 md:p-10 overflow-y-auto w-full">
                {/* Back Navigation */}
                <div className="mb-6">
                    <Link to="/employees" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors">
                        <ArrowLeft size={16} className="mr-2" /> Back to Employee List
                    </Link>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 items-start">

                    {/* LEFT PROFILE CARD */}
                    <div className="w-full xl:w-[350px] bg-white border border-gray-200 rounded-3xl p-6 shadow-sm flex-shrink-0">
                        <div className="relative mx-auto w-fit">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden mx-auto border-4 border-gray-50">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${"Rahul Sharma"}&background=0D8ABC&color=fff`}
                                    className="w-full h-full object-cover"
                                    alt="Profile"
                                />
                            </div>
                            <button className="absolute bottom-0 right-0 bg-blue-600 p-2 rounded-full border-2 border-white cursor-pointer hover:bg-blue-700 transition shadow-lg">
                                <Pencil className="w-3.5 h-3.5 text-white" />
                            </button>
                        </div>

                        <h2 className="text-lg font-bold text-center mt-4 text-gray-900">Rahul Sharma</h2>
                        <p className="text-gray-500 text-center text-sm">Software Engineer</p>
                        <div className="flex justify-center mt-2">
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium">{id}</span>
                        </div>

                        <h3 className="font-semibold text-gray-900 mt-8 mb-4">Basic Information</h3>

                        {/* Inputs */}
                        <div className="space-y-4">
                            {Object.entries(profileData).map(([label, value]) => (
                                <div key={label}>
                                    <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">{label}</p>
                                    <div className="relative">
                                        {label === "Status" ? (
                                            <div className="w-full py-2.5 px-3.5 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center justify-between">
                                                {value} <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                            </div>
                                        ) : (
                                            <input
                                                type={label === "Joining Date" ? "date" : "text"}
                                                value={value}
                                                placeholder={label}
                                                onChange={(e) => handleInputChange(label, e.target.value)}
                                                className="w-full py-2.5 px-3.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 font-medium text-sm focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT INFO CARD */}
                    <div className="flex-1 w-full">
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">
                            <div className="space-y-4">
                                {/* Header Tabs */}
                                <div className="flex gap-6 border-b border-gray-100 pb-4 mb-6 overflow-x-auto">
                                    <button className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-1 whitespace-nowrap">Personal Information</button>
                                    <button className="text-sm font-medium text-gray-500 hover:text-gray-900 pb-1 whitespace-nowrap">Job Information</button>
                                    <button className="text-sm font-medium text-gray-500 hover:text-gray-900 pb-1 whitespace-nowrap">Documents</button>
                                </div>

                                <PersonalInformation />
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

// Sub-components
function PersonalInformation() {
    return (
        <div className="space-y-4">
            {/* BASIC DETAILS */}
            <Accordion title="Basic Details">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-5 pb-5">
                    <Input label="Gender" defaultValue="Male" />
                    <Input label="Date of Birth" defaultValue="25 Aug 1995" />
                    <Input label="Blood Group" defaultValue="B+" />
                    <Input label="Marital Status" defaultValue="Single" />
                    <Input label="Nationality" defaultValue="Indian" />
                    <Input label="Religion" defaultValue="Hindu" />
                </div>
            </Accordion>

            {/* ADDRESS */}
            <Accordion title="Address Details">
                <div className="grid grid-cols-1 gap-6 px-5 pb-5">
                    <Input label="Current Address" defaultValue="A-123, Rosewood App, Andheri West, Mumbai" />
                    <Input label="Permanent Address" defaultValue="Same as current" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Input label="City" defaultValue="Mumbai" />
                        <Input label="State" defaultValue="Maharashtra" />
                        <Input label="Postal Code" defaultValue="400053" />
                    </div>
                </div>
            </Accordion>

            {/* EMERGENCY CONTACT */}
            <Accordion title="Emergency Contact">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-5 pb-5">
                    <Input label="Contact Name" defaultValue="Anil Patil" />
                    <Input label="Relation" defaultValue="Father" />
                    <Input label="Contact Number" defaultValue="8945752314" />
                </div>
            </Accordion>

            {/* IDENTIFICATION */}
            <Accordion title="Identification">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-5 pb-5">
                    <Input label="Aadhar Number" defaultValue="XXX-XXXX-1234" />
                    <Input label="PAN Number" defaultValue="ABCDE1234F" />
                    <Input label="Driving License" defaultValue="MH-02-20202020" />
                </div>
            </Accordion>
        </div>
    );
}

const Accordion = ({ title, children }) => {
    const [open, setOpen] = useState(true);

    return (
        <div className={`rounded-xl border overflow-hidden transition-all duration-300 
      ${open ? "bg-white border-gray-200 shadow-sm ring-1 ring-black/5" : "bg-gray-50 border-gray-200"}`}>
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
            >
                <span className="text-base font-semibold text-gray-800">{title}</span>
                <ChevronDown
                    size={20}
                    className={`text-gray-500 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`}
                />
            </button>

            {open && <div className="mt-2 text-gray-600 animate-slideDown">{children}</div>}
        </div>
    );
};

const Input = ({ label, defaultValue, className }) => {
    const [value, setValue] = useState(defaultValue);

    return (
        <div className={className}>
            <p className="text-sm text-gray-500 mb-1.5 font-medium">{label}</p>
            <input
                type="text"
                value={value}
                placeholder={label}
                onChange={(e) => setValue(e.target.value)}
                className="w-full py-2.5 px-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-700 text-sm font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none transition-all"
            />
        </div>
    );
};
