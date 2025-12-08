import React from "react";
import { Plus, Eye } from "lucide-react";

export default function ActionButton({ label, primary, onClick }) {
  const Icon = label.includes("View") ? Eye : Plus;

  return (
    <button
      onClick={onClick}  // ⬅️ FIX: Now the click event works!
      className={`flex items-center justify-center gap-2 p-4 rounded-xl border text-sm font-medium cursor-pointer transition 
      ${primary ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-white hover:bg-gray-100"}`}
    >
      <Icon size={18} />
      {label}
    </button>
  );
}
