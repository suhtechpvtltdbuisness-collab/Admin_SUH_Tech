import React from "react";

export default function StatCard({ title, value }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <p className="text-grey-500 text-sm">{title}</p>
      <p className="text-3xl font-semibold mt-2">{value}</p>
    </div>
  );
}
