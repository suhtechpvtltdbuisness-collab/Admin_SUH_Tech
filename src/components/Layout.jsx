import { Menu } from 'lucide-react';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar - Desktop */}
            <div className="hidden md:block flex-shrink-0">
                <Sidebar />
            </div>

            {/* Sidebar - Mobile */}
            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onClose={() => setIsMobileOpen(false)} />
            </div>

            <main className="flex-1 overflow-y-auto flex flex-col h-full">
                {/* Mobile Header */}
                <div className="md:hidden bg-white/90 backdrop-blur-md border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsMobileOpen(true)}
                            className="text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Admin Panel
                        </h1>
                    </div>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">AH</span>
                    </div>
                </div>

                <div className="flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
