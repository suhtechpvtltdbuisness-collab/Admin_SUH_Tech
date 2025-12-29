import { Field, SectionCard } from "./EmployeeShared";

export default function JobInformation({ isEditing, data, onChange }) {
    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            {/* EMPLOYMENT DETAILS */}
            <SectionCard title="Employment Details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field label="Job Title" value={data?.designation || ""} isEditing={isEditing} onChange={(val) => onChange('designation', val)} />
                    <Field label="Department" value={data?.department || ""} isEditing={isEditing} onChange={(val) => onChange('department', val)} />
                    <Field label="Reporting Manager" value={data?.reportingManager || ""} isEditing={isEditing} onChange={(val) => onChange('reportingManager', val)} />

                    <Field label="Date of Joining" value={data?.joiningDate?.split('T')[0] || ""} isEditing={isEditing} type="date" onChange={(val) => onChange('joiningDate', val)} />
                    {/* Employment Status */}
                    <div className="w-full">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Employment Status
                        </label>
                        <select
                            value={data?.status || ""}
                            disabled={!isEditing}
                            onChange={(e) => onChange("status", e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all outline-none border
                            ${
                                isEditing
                                    ? "bg-white border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-gray-900"
                                    : "bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed"
                            }`}
                        >
                            <option value="">Select Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="On Leave">On Leave</option>
                        </select>
                    </div>

                    <Field label="Contract Duration" value={data?.contractDuration || ""} isEditing={isEditing} onChange={(val) => onChange('contractDuration', val)} />
                    
                    {/* work mode */}
                    <div className="w-full">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Work Mode
                        </label>
                        <select
                            value={data?.workMode || ""}
                            disabled={!isEditing}
                            onChange={(e) => onChange("workMode", e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all outline-none border
                            ${
                                isEditing
                                    ? "bg-white border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-gray-900"
                                    : "bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed"
                            }`}
                        >
                            <option value="">Select Work Mode</option>
                            <option value="On-site">On-site</option>
                            <option value="Off-site">Off-site</option>
                            <option value="Hybrid">Hybrid</option>
                        </select>
                    </div>

                    <Field label="Employee Type" value={data?.employeeType || ""} isEditing={isEditing} onChange={(val) => onChange('employeeType', val)} />
                    <Field label="Salary" value={data?.salary || ""} isEditing={isEditing} type="number" onChange={(val) => onChange('salary', val)} />
                </div>
            </SectionCard>
        </div>
    );
}
