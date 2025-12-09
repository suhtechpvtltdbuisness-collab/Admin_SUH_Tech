import React, { useState } from "react";
import { ChevronDown, ChevronUp, Upload } from "lucide-react";

export const SectionCard = ({ title, children, defaultOpen = true }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-6 py-4 bg-gray-50/50 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
            >
                <h4 className="text-sm font-bold text-gray-900 tracking-wide uppercase">{title}</h4>
                {open ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
            </button>

            {open && (
                <div className="p-6 md:p-8">
                    {children}
                </div>
            )}
        </div>
    );
};

export const Field = ({ label, value, isEditing, multiline, type = "text", className = "", onChange, placeholder, options = [] }) => {
    const [currentValue, setCurrentValue] = useState(value);

    // Update local state when prop changes, or handle it via parent if needed.
    // Ideally for a real app, onChange should update parent state. 
    // For now keeping local state to match previous PersonalInformation behavior if no onChange provided.

    const handleChange = (e) => {
        const val = e.target.value;
        setCurrentValue(val);
        if (onChange) onChange(val);
    };

    return (
        <div className={`w-full ${className}`}>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                {label}
            </label>

            {multiline ? (
                <textarea
                    rows={2}
                    value={value !== undefined ? value : currentValue}
                    readOnly={!isEditing}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all outline-none resize-none border
                    ${isEditing
                            ? "bg-white border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-gray-900"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                />
            ) : type === "select" ? (
                <div className="relative">
                    <select
                        value={value !== undefined ? value : currentValue}
                        disabled={!isEditing}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all outline-none border appearance-none
                        ${isEditing
                                ? "bg-white border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-gray-900 cursor-pointer"
                                : "bg-gray-50 border-gray-200 text-gray-700"
                            }`}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown size={16} className={`absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none ${isEditing ? "text-gray-500" : "text-gray-400"}`} />
                </div>
            ) : (
                <input
                    type={type}
                    value={value !== undefined ? value : currentValue}
                    readOnly={!isEditing}
                    onChange={handleChange}
                    placeholder={placeholder}
                    className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all outline-none border
                    ${isEditing
                            ? "bg-white border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-gray-900"
                            : "bg-gray-50 border-gray-200 text-gray-700"
                        }`}
                />
            )}
        </div>
    );
};

export const FileUploadField = ({ label, isEditing, className = "" }) => {
    return (
        <div className={`w-full ${className}`}>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                {label}
            </label>

            {isEditing ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 hover:bg-blue-50 hover:border-blue-300 transition-colors cursor-pointer group">
                    <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                        <Upload size={20} className="text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <p className="text-xs font-semibold text-gray-500 group-hover:text-blue-600">Click to upload or drag & drop</p>
                    <p className="text-[10px] text-gray-400 mt-1">SVG, PNG, JPG or PDF</p>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Upload size={18} className="text-gray-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-700">document_file.pdf</p>
                        <p className="text-xs text-blue-600 font-medium cursor-pointer hover:underline">View Document</p>
                    </div>
                </div>
            )}
        </div>
    )
}
