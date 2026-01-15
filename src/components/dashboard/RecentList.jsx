import React from "react";

const applications = [
    { name: "Phoenix", role: "Software Engineer", status: "In Review", color: "text-blue-600 bg-blue-50" },
    { name: "Lana Steiner", role: "Product Designer", status: "Interview", color: "text-purple-600 bg-purple-50" },
    { name: "Demi Wilkinson", role: "Frontend Dev", status: "Hired", color: "text-green-600 bg-green-50" },
];

export default function RecentList() {
    return (
        <div className="space-y-4">
            {applications.map((app, i) => (
                <div key={i} className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-gray-800">{app.name}</p>
                        <p className="text-sm text-gray-500">{app.role}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${app.color}`}>
                        {app.status}
                    </span>
                </div>
            ))}
        </div>
    );
}
