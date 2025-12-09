import React from "react";
import { SectionCard, FileUploadField } from "./EmployeeShared";

export default function Documents({ isEditing }) {
    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            <SectionCard title="Employee Documents">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <FileUploadField label="Aadhar Card" isEditing={isEditing} />
                    <FileUploadField label="Pan Card" isEditing={isEditing} />
                    <FileUploadField label="Profile Photo" isEditing={isEditing} />
                </div>
            </SectionCard>
        </div>
    );
}
