import React from "react";
import { SectionCard, Field } from "./EmployeeShared";

export default function JobInformation({ isEditing, data, onChange }) {
    const departmentOptions = [
        { label: "Engineering", value: "Engineering" },
        { label: "Design", value: "Design" },
        { label: "Product", value: "Product" },
        { label: "HR", value: "HR" },
        { label: "Marketing", value: "Marketing" },
        { label: "Sales", value: "Sales" }
    ];

    const managerOptions = [
        { label: "Amit Patel", value: "Amit Patel" },
        { label: "Sarah Jenkins", value: "Sarah Jenkins" },
        { label: "Michael Ross", value: "Michael Ross" },
        { label: "Priya Singh", value: "Priya Singh" }
    ];

    const employmentStatusOptions = [
        { label: "Active", value: "Active" },
        { label: "On Leave", value: "On Leave" },
        { label: "Terminated", value: "Terminated" },
        { label: "Resigned", value: "Resigned" }
    ];

    const workModeOptions = [
        { label: "On-site", value: "On-site" },
        { label: "Hybrid", value: "Hybrid" },
        { label: "Remote", value: "Remote" }
    ];

    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            {/* EMPLOYMENT DETAILS */}
            <SectionCard title="Employment Details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field
                        label="Job Title"
                        value={data?.jobTitle || "Software Engineer"}
                        isEditing={isEditing}
                        onChange={(val) => onChange('jobTitle', val)}
                    />

                    <Field
                        label="Department"
                        value={data?.department || "Engineering"}
                        isEditing={isEditing}
                        type="select"
                        options={departmentOptions}
                        onChange={(val) => onChange('department', val)}
                    />

                    <Field
                        label="Reporting Manager"
                        value={data?.reportingManager || "Amit Patel"}
                        isEditing={isEditing}
                        type="select"
                        options={managerOptions}
                        onChange={(val) => onChange('reportingManager', val)}
                    />

                    <Field
                        label="Date of Joining"
                        value={data?.dateOfJoining || "2023-01-15"}
                        isEditing={isEditing}
                        type="date"
                        onChange={(val) => onChange('dateOfJoining', val)}
                    />

                    <Field
                        label="Employment Status"
                        value={data?.employmentStatus || "Active"}
                        isEditing={isEditing}
                        type="select"
                        options={employmentStatusOptions}
                        onChange={(val) => onChange('employmentStatus', val)}
                    />

                    <Field
                        label="Contract Type"
                        value={data?.contractType || "Full Time"}
                        isEditing={isEditing}
                        onChange={(val) => onChange('contractType', val)}
                    />

                    <Field
                        label="Work Mode"
                        value={data?.workMode || "Hybrid"}
                        isEditing={isEditing}
                        type="select"
                        options={workModeOptions}
                        onChange={(val) => onChange('workMode', val)}
                    />
                </div>
            </SectionCard>
        </div>
    );
}
