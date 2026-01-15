import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
            <div className="max-w-xl w-full text-center space-y-8 animate-in fade-in duration-700">
                <div className="space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest border border-blue-100 mb-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                        Internal Management
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-tight">
                        SUH Tech <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Admin Hub</span>
                    </h1>
                    <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-md mx-auto">
                        Centralized platform to manage clients, employees, finance, and operations with precision.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to="/"
                        className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all hover:-translate-y-1 active:scale-95 text-center"
                    >
                        Go to Dashboard
                    </Link>
                    <Link
                        to="/profile"
                        className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all hover:border-gray-300 text-center"
                    >
                        My Profile
                    </Link>
                </div>

                <div className="pt-8 border-t border-gray-100 grid grid-cols-3 gap-4">
                    {[
                        { label: "Secure", detail: "AES-256" },
                        { label: "Real-time", detail: "WebSockets" },
                        { label: "Responsive", detail: "Mobile First" }
                    ].map((item, i) => (
                        <div key={i} className="text-center">
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-tighter mb-1">{item.label}</p>
                            <p className="text-sm font-bold text-gray-900">{item.detail}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
