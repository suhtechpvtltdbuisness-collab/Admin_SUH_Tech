import { X } from "lucide-react";

export default function ConfirmationModal({
    open,
    title,
    description,
    confirmText = "OK",
    cancelText = "Cancel",
    confirmColor = "bg-red-600",
    onConfirm,
    onCancel,
    loading = false,
}) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative animate-fadeIn">

                {/* Close */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X size={18} />
                </button>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                    {description}
                </p>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600
                        hover:bg-gray-50 text-sm font-semibold disabled:opacity-50"
                    >
                        {cancelText}
                    </button>

                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg text-white text-sm font-semibold
                        hover:opacity-90 disabled:opacity-50 ${confirmColor}`}
                    >
                        {loading ? "Processing..." : confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
