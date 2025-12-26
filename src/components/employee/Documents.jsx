import React, { useState } from "react";
import { SectionCard, FileUploadField } from "./EmployeeShared";

export default function Documents({ isEditing, documents = {}, onDocumentChange }) {
    const [aadharCard, setAadharCard] = useState(documents.aadharCard || null);
    const [panCard, setPanCard] = useState(documents.panCard || null);
    const [profilePhoto, setProfilePhoto] = useState(documents.profilePhoto || null);

    const handleAadharChange = (file) => {
        setAadharCard(file);
        if (onDocumentChange) onDocumentChange('aadharCard', file);
    };

    const handlePanChange = (file) => {
        setPanCard(file);
        if (onDocumentChange) onDocumentChange('panCard', file);
    };

    const handleProfilePhotoChange = (file) => {
        setProfilePhoto(file);
        if (onDocumentChange) onDocumentChange('profilePhoto', file);
    };

    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            <SectionCard title="Employee Documents">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <FileUploadField 
                        label="Aadhar Card" 
                        isEditing={isEditing} 
                        value={aadharCard}
                        onChange={handleAadharChange}
                    />
                    <FileUploadField 
                        label="Pan Card" 
                        isEditing={isEditing} 
                        value={panCard}
                        onChange={handlePanChange}
                    />
                    <FileUploadField 
                        label="Profile Photo" 
                        isEditing={isEditing} 
                        value={profilePhoto}
                        onChange={handleProfilePhotoChange}
                    />
                </div>
            </SectionCard>
        </div>
    );
}
