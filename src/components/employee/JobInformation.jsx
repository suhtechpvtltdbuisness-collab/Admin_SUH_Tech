import React from "react";
import { SectionCard, Field } from "./EmployeeShared";

export default function JobInformation({ isEditing, data }) {
    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            {/* EMPLOYMENT DETAILS */}
            <SectionCard title="Employment Details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field label="Job Title" value={data?.jobTitle || "Software Engineer"} isEditing={isEditing} />
                    <Field label="Department" value={data?.department || "Engineering"} isEditing={isEditing} />
                    <Field label="Reporting Manager" value={data?.reportingManager || "Amit Patel"} isEditing={isEditing} />

                    <Field label="Date of Joining" value={data?.dateOfJoining || "15 Jan 2023"} isEditing={isEditing} />
                    <Field label="Employment Status" value={data?.employmentStatus || "Active"} isEditing={isEditing} />
                    <Field label="Contract Duration" value={data?.contractDuration || "Full Time"} isEditing={isEditing} />

                    <Field label="Work Mode" value={data?.workMode || "Hybrid"} isEditing={isEditing} />
                </div>
            </SectionCard>
        </div>
    );
}
