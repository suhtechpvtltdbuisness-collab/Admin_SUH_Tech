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
                    <Field label="Employment Status" value={data?.status || ""} isEditing={isEditing} onChange={(val) => onChange('status', val)} />
                    <Field label="Contract Duration" value={data?.contractDuration || ""} isEditing={isEditing} onChange={(val) => onChange('contractDuration', val)} />

                    <Field label="Work Mode" value={data?.workMode || ""} isEditing={isEditing} onChange={(val) => onChange('workMode', val)} />
                    <Field label="Employee Type" value={data?.employeeType || ""} isEditing={isEditing} onChange={(val) => onChange('employeeType', val)} />
                    <Field label="Salary" value={data?.salary || ""} isEditing={isEditing} type="number" onChange={(val) => onChange('salary', val)} />
                </div>
            </SectionCard>
        </div>
    );
}
