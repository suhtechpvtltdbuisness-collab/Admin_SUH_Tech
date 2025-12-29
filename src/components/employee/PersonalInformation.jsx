import { Field, SectionCard } from "./EmployeeShared";

export default function PersonalInformation({ isEditing, data, onChange, onNestedChange }) {
    return (
        <div className="flex flex-col gap-6 animate-fadeIn">
            {/* BASIC DETAILS */}
            <SectionCard title="Basic Details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field
                        label="First Name"
                        value={data?.firstName || ""}
                        isEditing={isEditing}
                        onChange={(val) => onChange("firstName", val)}
                    />

                    <Field
                        label="Last Name"
                        value={data?.lastName || ""}
                        isEditing={isEditing}
                        onChange={(val) => onChange("lastName", val)}
                    />

                    <Field
                        label="Email"
                        value={data?.email || ""}
                        isEditing={isEditing}
                        type="email"
                        onChange={(val) => onChange("email", val)}
                    />

                    {/* GENDER DROPDOWN */}
                    <div className="w-full">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Gender
                        </label>
                        <select
                            value={data?.gender || ""}
                            disabled={!isEditing}
                            onChange={(e) => onChange("gender", e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all outline-none border
                            ${
                                isEditing
                                    ? "bg-white border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-gray-900"
                                    : "bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed"
                            }`}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <Field
                        label="Date of Birth"
                        value={data?.dateOfBirth?.split("T")[0] || ""}
                        isEditing={isEditing}
                        type="date"
                        onChange={(val) => onChange("dateOfBirth", val)}
                    />

                    {/* BLOOD GROUP DROPDOWN */}
                    <div className="w-full">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            Blood Group
                        </label>
                        <select
                            value={data?.bloodGroup || ""}
                            disabled={!isEditing}
                            onChange={(e) => onChange("bloodGroup", e.target.value)}
                            className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium transition-all outline-none border
                            ${
                                isEditing
                                    ? "bg-white border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 text-gray-900"
                                    : "bg-gray-50 border-gray-200 text-gray-700 cursor-not-allowed"
                            }`}
                        >
                            <option value="">Select Blood Group</option>
                            <option value="A+">A+</option>
                            <option value="A-">A-</option>
                            <option value="B+">B+</option>
                            <option value="B-">B-</option>
                            <option value="O+">O+</option>
                            <option value="O-">O-</option>
                            <option value="AB+">AB+</option>
                            <option value="AB-">AB-</option>
                        </select>
                    </div>

                    <Field
                        label="Nationality"
                        value={data?.nationality || ""}
                        isEditing={isEditing}
                        onChange={(val) => onChange("nationality", val)}
                    />

                    <Field
                        label="Address"
                        value={data?.currentAddress || ""}
                        isEditing={isEditing}
                        className="md:col-span-2"
                        onChange={(val) => onChange("currentAddress", val)}
                    />

                    <Field
                        label="City"
                        value={data?.city || ""}
                        isEditing={isEditing}
                        onChange={(val) => onChange("city", val)}
                    />

                    <Field
                        label="State"
                        value={data?.state || ""}
                        isEditing={isEditing}
                        onChange={(val) => onChange("state", val)}
                    />

                    <Field
                        label="Zip Code"
                        value={data?.zipCode || ""}
                        isEditing={isEditing}
                        onChange={(val) => onChange("zipCode", val)}
                    />
                </div>
            </SectionCard>

            {/* EMERGENCY CONTACT */}
            <SectionCard title="Emergency Contact">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field
                        label="Contact Name"
                        value={data?.emergencyContact?.name || ""}
                        isEditing={isEditing}
                        onChange={(val) =>
                            onNestedChange("emergencyContact", "name", val)
                        }
                    />
                    <Field
                        label="Relation"
                        value={data?.emergencyContact?.relation || ""}
                        isEditing={isEditing}
                        onChange={(val) =>
                            onNestedChange("emergencyContact", "relation", val)
                        }
                    />
                    <Field
                        label="Contact Number"
                        value={data?.emergencyContact?.phone || ""}
                        isEditing={isEditing}
                        onChange={(val) =>
                            onNestedChange("emergencyContact", "phone", val)
                        }
                    />
                </div>
            </SectionCard>

            {/* IDENTIFICATION */}
            <SectionCard title="Identification">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                    <Field
                        label="Aadhar Number"
                        value={data?.aadharNumber || ""}
                        isEditing={isEditing}
                        onChange={(val) => onChange("aadharNumber", val)}
                    />
                    <Field
                        label="PAN Number"
                        value={data?.panNumber || ""}
                        isEditing={isEditing}
                        onChange={(val) => onChange("panNumber", val)}
                    />
                </div>
            </SectionCard>
        </div>
    );
}
