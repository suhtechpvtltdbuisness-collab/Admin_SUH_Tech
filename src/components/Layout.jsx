import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-50">
            {/* Mobile Sidebar Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
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
                <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsMobileOpen(true)} className="text-gray-700">
                            <Menu size={24} />
                        </button>
                        <h1 className="font-bold text-lg text-gray-800">Admin Panel</h1>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-blue-100 border border-blue-200" />
                </div>

                <div className="flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
