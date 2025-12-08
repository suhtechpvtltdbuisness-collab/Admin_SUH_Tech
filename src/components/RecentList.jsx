import React from "react";

const data = [
  { name: "Olivia Rhye", role: "UX/UI Designer", time: "2 days ago" },
  { name: "Phoenix Baker", role: "Frontend Developer", time: "3 days ago" },
  { name: "Lana Steiner", role: "Product Manager", time: "4 days ago" },
];

export default function RecentList() {
  return (
    <div>
      {data.map((d, i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b border-grey-200 last:border-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200" />
            <div>
              <p className="font-medium text-grey-800">{d.name}</p>
              <p className="text-sm text-gray-500">{d.role}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">{d.time}</p>
        </div>
      ))}
    </div>
  );
}
