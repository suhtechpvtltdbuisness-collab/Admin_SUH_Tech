import React, { useState } from "react";
import { SectionCard, Field } from "./EmployeeShared";

export default function PersonalInformation({ isEditing, data }) {
    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            {/* BASIC DETAILS */}
            <SectionCard title="Basic Details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field label="Gender" value={data?.gender || "Male"} isEditing={isEditing} />
                    <Field label="Date of Birth" value={data?.dob || "25 Aug 1995"} isEditing={isEditing} />
                    <Field label="Blood Group" value={data?.bloodGroup || "B+"} isEditing={isEditing} />
                    <Field label="Nationality" value={data?.nationality || "Indian"} isEditing={isEditing} />
                    <Field
                        label="Address"
                        value={data?.currentAddress || "A-123, Rosewood App, Andheri West, Mumbai"}
                        isEditing={isEditing}
                        className="md:col-span-2"
                    />
                </div>
            </SectionCard>

            {/* EMERGENCY CONTACT */}
            <SectionCard title="Emergency Contact">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field label="Contact Name" value={data?.emergencyName || "Anil Patil"} isEditing={isEditing} />
                    <Field label="Relation" value={data?.emergencyRelation || "Father"} isEditing={isEditing} />
                    <Field label="Contact Number" value={data?.emergencyPhone || "8945752314"} isEditing={isEditing} />
                </div>
            </SectionCard>

            {/* IDENTIFICATION */}
            <SectionCard title="Identification">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field label="Aadhar Number" value={data?.aadhar || "2880 xxxx xxxx"} isEditing={isEditing} />
                    <Field label="Pan Number" value={data?.pan || "CXPIXXXXX"} isEditing={isEditing} />
                </div>
            </SectionCard>
        </div>
    );
}

/* ------------------ SUB COMPONENTS ------------------ */


