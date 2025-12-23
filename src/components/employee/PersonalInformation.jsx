import { Field, SectionCard } from "./EmployeeShared";

export default function PersonalInformation({ isEditing, data, onChange, onNestedChange }) {
    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            {/* BASIC DETAILS */}
            <SectionCard title="Basic Details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field label="First Name" value={data?.firstName || ""} isEditing={isEditing} onChange={(val) => onChange('firstName', val)} />
                    <Field label="Last Name" value={data?.lastName || ""} isEditing={isEditing} onChange={(val) => onChange('lastName', val)} />
                    <Field label="Email" value={data?.email || ""} isEditing={isEditing} type="email" onChange={(val) => onChange('email', val)} />
                    <Field label="Gender" value={data?.gender || ""} isEditing={isEditing} onChange={(val) => onChange('gender', val)} />
                    <Field label="Date of Birth" value={data?.dateOfBirth?.split('T')[0] || ""} isEditing={isEditing} type="date" onChange={(val) => onChange('dateOfBirth', val)} />
                    <Field label="Blood Group" value={data?.bloodGroup || ""} isEditing={isEditing} onChange={(val) => onChange('bloodGroup', val)} />
                    <Field label="Nationality" value={data?.nationality || ""} isEditing={isEditing} onChange={(val) => onChange('nationality', val)} />
                    <Field
                        label="Address"
                        value={data?.currentAddress || ""}
                        isEditing={isEditing}
                        className="md:col-span-2"
                        onChange={(val) => onChange('currentAddress', val)}
                    />
                    <Field label="City" value={data?.city || ""} isEditing={isEditing} onChange={(val) => onChange('city', val)} />
                    <Field label="State" value={data?.state || ""} isEditing={isEditing} onChange={(val) => onChange('state', val)} />
                    <Field label="Zip Code" value={data?.zipCode || ""} isEditing={isEditing} onChange={(val) => onChange('zipCode', val)} />
                </div>
            </SectionCard>

            {/* EMERGENCY CONTACT */}
            <SectionCard title="Emergency Contact">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field label="Contact Name" value={data?.emergencyContact?.name || ""} isEditing={isEditing} onChange={(val) => onNestedChange('emergencyContact', 'name', val)} />
                    <Field label="Relation" value={data?.emergencyContact?.relation || ""} isEditing={isEditing} onChange={(val) => onNestedChange('emergencyContact', 'relation', val)} />
                    <Field label="Contact Number" value={data?.emergencyContact?.phone || ""} isEditing={isEditing} onChange={(val) => onNestedChange('emergencyContact', 'phone', val)} />
                </div>
            </SectionCard>

            {/* IDENTIFICATION */}
            <SectionCard title="Identification">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field label="Aadhar Number" value={data?.aadharNumber || ""} isEditing={isEditing} onChange={(val) => onChange('aadharNumber', val)} />
                    <Field label="PAN Number" value={data?.panNumber || ""} isEditing={isEditing} onChange={(val) => onChange('panNumber', val)} />
                </div>
            </SectionCard>
        </div>
    );
}

/* ------------------ SUB COMPONENTS ------------------ */
