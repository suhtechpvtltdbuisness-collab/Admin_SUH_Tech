import React, { useState } from "react";
import { ChevronDown, ChevronUp, Upload, X, Ban } from "lucide-react";

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

export const Field = ({ label, value, isEditing, multiline, type = "text", className = "", onChange, placeholder }) => {
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

export const FileUploadField = ({ label, isEditing, className = "", value, onChange }) => {
    const [file, setFile] = useState(value || null);
    const [preview, setPreview] = useState(null);
    const fileInputRef = React.useRef(null);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);

        if (selectedFile.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(selectedFile);
        } else {
            setPreview(null);
        }

        onChange?.(selectedFile);
    };

    const handleRemove = () => {
        setFile(null);
        setPreview(null);
        onChange?.(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleViewDocument = () => {
        if (!file) return;
        const url = file instanceof File ? URL.createObjectURL(file) : file;
        window.open(url, "_blank");
    };

    return (
        <div className={`w-full ${className}`}>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                {label}
            </label>

            {/* Hidden input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                disabled={!isEditing}
            />

            {/* ================= VIEW MODE ================= */}
            {!isEditing && !file && (
                <div className="relative flex items-center gap-3 p-3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg cursor-not-allowed group">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                        <Ban size={18} className="text-red-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-400">
                            No document uploaded
                        </p>
                        <p className="text-xs text-gray-300">
                            Edit profile to upload
                        </p>
                    </div>
                </div>
            )}

            {/* ================= EDIT MODE EMPTY ================= */}
            {isEditing && !file && (
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition-all group"
                >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                        <Upload size={18} className="text-gray-400 group-hover:text-blue-500" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-600 group-hover:text-blue-600">
                            Click to upload document
                        </p>
                        <p className="text-xs text-gray-400">PNG, JPG or PDF</p>
                    </div>
                </div>
            )}

            {/* ================= FILE PRESENT ================= */}
            {file && (
                <div className="relative flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    
                    {/* REMOVE BUTTON (EDIT MODE ONLY) */}
                    {isEditing && (
                        <button
                            onClick={handleRemove}
                            className="absolute top-1.5 right-1.5 bg-white border border-gray-200 rounded-full p-1 text-gray-500 hover:text-red-600 hover:border-red-300 transition"
                        >
                            <X size={14} />
                        </button>
                    )}

                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {preview ? (
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                            <Upload size={18} className="text-gray-500" />
                        )}
                    </div>

                    <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-700">
                            {file?.name || "document.pdf"}
                        </p>
                        <p
                            onClick={handleViewDocument}
                            className="text-xs text-blue-600 font-medium cursor-pointer hover:underline"
                        >
                            View Document
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

