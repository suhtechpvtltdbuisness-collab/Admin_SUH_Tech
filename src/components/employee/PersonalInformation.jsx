import React, { useState } from "react";
import { SectionCard, Field } from "./EmployeeShared";

export default function PersonalInformation({ isEditing, data, onChange }) {
    const genderOptions = [
        { label: "Male", value: "Male" },
        { label: "Female", value: "Female" },
        { label: "Other", value: "Other" }
    ];

    const bloodGroupOptions = [
        { label: "A+", value: "A+" },
        { label: "A-", value: "A-" },
        { label: "B+", value: "B+" },
        { label: "B-", value: "B-" },
        { label: "AB+", value: "AB+" },
        { label: "AB-", value: "AB-" },
        { label: "O+", value: "O+" },
        { label: "O-", value: "O-" }
    ];

    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            {/* BASIC DETAILS */}
            <SectionCard title="Basic Details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field
                        label="Gender"
                        value={data?.gender || "Male"}
                        isEditing={isEditing}
                        type="select"
                        options={genderOptions}
                        onChange={(val) => onChange('gender', val)}
                    />
                    <Field
                        label="Date of Birth"
                        value={data?.dob || "1995-08-25"}
                        isEditing={isEditing}
                        type="date"
                        onChange={(val) => onChange('dob', val)}
                    />
                    <Field
                        label="Blood Group"
                        value={data?.bloodGroup || "B+"}
                        isEditing={isEditing}
                        type="select"
                        options={bloodGroupOptions}
                        onChange={(val) => onChange('bloodGroup', val)}
                    />
                    <Field
                        label="Nationality"
                        value={data?.nationality || "Indian"}
                        isEditing={isEditing}
                        onChange={(val) => onChange('nationality', val)}
                    />
                    <Field
                        label="Address"
                        value={data?.currentAddress || "A-123, Rosewood App, Andheri West, Mumbai"}
                        isEditing={isEditing}
                        className="md:col-span-2"
                        onChange={(val) => onChange('currentAddress', val)}
                    />
                </div>
            </SectionCard>

            {/* EMERGENCY CONTACT */}
            <SectionCard title="Emergency Contact">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field
                        label="Contact Name"
                        value={data?.emergencyName || "Anil Patil"}
                        isEditing={isEditing}
                        onChange={(val) => onChange('emergencyName', val)}
                    />
                    <Field
                        label="Relation"
                        value={data?.emergencyRelation || "Father"}
                        isEditing={isEditing}
                        onChange={(val) => onChange('emergencyRelation', val)}
                    />
                    <Field
                        label="Contact Number"
                        value={data?.emergencyPhone || "8945752314"}
                        isEditing={isEditing}
                        onChange={(val) => onChange('emergencyPhone', val)}
                    />
                </div>
            </SectionCard>

            {/* IDENTIFICATION */}
            <SectionCard title="Identification">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field
                        label="Aadhar Number"
                        value={data?.aadhar || "2880 xxxx xxxx"}
                        isEditing={isEditing}
                        onChange={(val) => onChange('aadhar', val)}
                    />
                    <Field
                        label="Pan Number"
                        value={data?.pan || "CXPIXXXXX"}
                        isEditing={isEditing}
                        onChange={(val) => onChange('pan', val)}
                    />
                </div>
            </SectionCard>
        </div>
    );
}

/* ------------------ SUB COMPONENTS ------------------ */


