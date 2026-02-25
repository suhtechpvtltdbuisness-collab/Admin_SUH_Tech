import { Bell, Menu, Sparkles, User, LogOut } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { authService, userService } from '../../services';
import Sidebar from './Sidebar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [invoices, setInvoices] = useState([]);
    const [userProfile, setUserProfile] = useState({ firstName: '', lastName: '', role: '' });
    const navigate = useNavigate();

    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    useEffect(() => {
        loadInvoices();
        loadUserProfile();
    }, []);

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                setIsProfileOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const loadInvoices = async () => {
        try {
            // Fetch invoices from localStorage for now
            const cached = localStorage.getItem('invoices');
            setInvoices(cached ? JSON.parse(cached) : []);
        } catch (error) {
            console.error('Error loading invoices:', error);
        }
    };

    const loadUserProfile = async () => {
        try {
            const res = await userService.getProfile();
            if (res.user) {
                setUserProfile(res.user);
            }
        } catch (error) {
            console.error('Error loading user profile:', error);
        }
    };

    // Listen for profile updates from Settings page
    useEffect(() => {
        const handleProfileUpdate = (event) => {
            if (event.detail?.user) {
                setUserProfile(event.detail.user);
            }
        };

        window.addEventListener('profileUpdated', handleProfileUpdate);
        return () => {
            window.removeEventListener('profileUpdated', handleProfileUpdate);
        };
    }, []);

    // Helper function to get initials from name
    const getInitials = (firstName, lastName) => {
        const first = firstName?.charAt(0)?.toUpperCase() || '';
        const last = lastName?.charAt(0)?.toUpperCase() || '';
        return `${first}${last}` || 'NA';
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
            {/* Sidebar Overlay - Mobile Only */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Always visible on desktop, slide-in on mobile */}
            <div className={`fixed md:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
            </div>

            <main className="flex-1 flex flex-col h-full overflow-hidden">
                {/* Header - All Devices */}
                <div className="bg-white/90 backdrop-blur-md border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-30 shadow-sm flex-shrink-0">
                    <div className="flex items-center gap-3">
                        {/* Hamburger Menu - Mobile Only */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                        >
                            <Menu size={24} />
                        </button>

                        {/* Dashboard Title & Welcome */}
                        <div>
                            <h2 className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                                Dashboard
                            </h2>
                            <p className="text-gray-600 text-sm flex items-center gap-2 font-semibold mt-1">
                                <Sparkles size={16} className="text-blue-500" />
                                Welcome back! Here's what's happening today
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Notification Bell */}
                        <div className="relative" ref={notificationRef}>
                            <button
                                onClick={() => {
                                    setIsNotificationOpen(!isNotificationOpen);
                                    setIsProfileOpen(false); // Close profile when opening notifications
                                }}
                                className="relative p-2 rounded-xl hover:bg-gray-100 transition-all duration-200 group"
                            >
                                <Bell size={20} className="text-gray-700 group-hover:text-blue-600 transition-colors" />
                                {invoices.filter(inv => {
                                    const dueDate = new Date(inv.dueDate);
                                    const today = new Date();
                                    return dueDate < today && inv.status !== 'Paid';
                                }).length > 0 && (
                                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                                    )}
                            </button>

                            {/* Notification Dropdown */}
                            {isNotificationOpen && (
                                <div className="absolute right-0 mt-2 w-96 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 max-h-[500px] overflow-hidden flex flex-col">
                                    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
                                        <h3 className="font-bold text-gray-900">Notifications</h3>
                                    </div>

                                    <div className="overflow-y-auto flex-1">
                                        {(() => {
                                            const today = new Date();
                                            const overdueInvoices = invoices.filter(inv => {
                                                const dueDate = new Date(inv.dueDate);
                                                return dueDate < today && inv.status !== 'Paid';
                                            });

                                            const pendingInvoices = invoices.filter(inv => inv.status === 'Pending');
                                            const sentInvoices = invoices.filter(inv => inv.status === 'Sent');
                                            const recentInvoices = invoices.slice(0, 5);

                                            // Show "No notifications" only if there are NO invoices at all
                                            if (invoices.length === 0) {
                                                return (
                                                    <div className="p-8 text-center">
                                                        <Bell className="mx-auto text-gray-300 mb-3" size={48} />
                                                        <p className="text-gray-500 text-sm">No notifications</p>
                                                        <p className="text-gray-400 text-xs mt-1">All invoices are up to date!</p>
                                                    </div>
                                                );
                                            }

                                            return (
                                                <>
                                                    {/* Overdue Invoices */}
                                                    {overdueInvoices.length > 0 && (
                                                        <div className="border-b border-gray-100">
                                                            <div className="px-4 py-2 bg-red-50">
                                                                <p className="text-xs font-semibold text-red-700">⚠️ Overdue ({overdueInvoices.length})</p>
                                                            </div>
                                                            {overdueInvoices.slice(0, 3).map(inv => (
                                                                <div
                                                                    key={inv._id}
                                                                    onClick={() => {
                                                                        setIsNotificationOpen(false);
                                                                        navigate('/expenses/invoices');
                                                                    }}
                                                                    className="p-4 hover:bg-red-50 cursor-pointer border-b border-gray-50 transition-colors"
                                                                >
                                                                    <p className="text-sm font-medium text-gray-900">{inv.clientName}</p>
                                                                    <p className="text-xs text-gray-600 mt-1">Invoice #{inv.invoiceNumber}</p>
                                                                    <p className="text-xs text-red-600 mt-1 font-medium">
                                                                        Overdue by {Math.floor((today - new Date(inv.dueDate)) / (1000 * 60 * 60 * 24))} days
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Pending Invoices */}
                                                    {pendingInvoices.length > 0 && (
                                                        <div className="border-b border-gray-100">
                                                            <div className="px-4 py-2 bg-yellow-50">
                                                                <p className="text-xs font-semibold text-yellow-700">⏳ Pending ({pendingInvoices.length})</p>
                                                            </div>
                                                            {pendingInvoices.slice(0, 3).map(inv => (
                                                                <div
                                                                    key={inv._id}
                                                                    onClick={() => {
                                                                        setIsNotificationOpen(false);
                                                                        navigate('/expenses/invoices');
                                                                    }}
                                                                    className="p-4 hover:bg-yellow-50 cursor-pointer border-b border-gray-50 transition-colors"
                                                                >
                                                                    <p className="text-sm font-medium text-gray-900">{inv.clientName}</p>
                                                                    <p className="text-xs text-gray-600 mt-1">Invoice #{inv.invoiceNumber}</p>
                                                                    <p className="text-xs text-yellow-600 mt-1">₹{(inv.total || 0).toLocaleString('en-IN')}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Sent Invoices */}
                                                    {sentInvoices.length > 0 && (
                                                        <div className="border-b border-gray-100">
                                                            <div className="px-4 py-2 bg-green-50">
                                                                <p className="text-xs font-semibold text-green-700">📤 Sent ({sentInvoices.length})</p>
                                                            </div>
                                                            {sentInvoices.slice(0, 3).map(inv => (
                                                                <div
                                                                    key={inv._id}
                                                                    onClick={() => {
                                                                        setIsNotificationOpen(false);
                                                                        navigate('/expenses/invoices');
                                                                    }}
                                                                    className="p-4 hover:bg-green-50 cursor-pointer border-b border-gray-50 transition-colors"
                                                                >
                                                                    <p className="text-sm font-medium text-gray-900">{inv.clientName}</p>
                                                                    <p className="text-xs text-gray-600 mt-1">Invoice #{inv.invoiceNumber}</p>
                                                                    <p className="text-xs text-green-600 mt-1">₹{(inv.total || 0).toLocaleString('en-IN')}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Recent Activity */}
                                                    {recentInvoices.length > 0 && (
                                                        <div>
                                                            <div className="px-4 py-2 bg-blue-50">
                                                                <p className="text-xs font-semibold text-blue-700">📋 Recent Activity</p>
                                                            </div>
                                                            {recentInvoices.map(inv => (
                                                                <div
                                                                    key={inv._id}
                                                                    onClick={() => {
                                                                        setIsNotificationOpen(false);
                                                                        navigate('/expenses/invoices');
                                                                    }}
                                                                    className="p-4 hover:bg-blue-50 cursor-pointer border-b border-gray-50 transition-colors"
                                                                >
                                                                    <p className="text-sm font-medium text-gray-900">{inv.clientName}</p>
                                                                    <p className="text-xs text-gray-600 mt-1">
                                                                        Created {new Date(inv.invoiceDate || inv.createdAt).toLocaleDateString('en-IN')}
                                                                    </p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </>
                                            );
                                        })()}
                                    </div>

                                    <div className="p-3 border-t border-gray-200 bg-gray-50">
                                        <button
                                            onClick={() => {
                                                setIsNotificationOpen(false);
                                                navigate('/expenses/invoices');
                                            }}
                                            className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            View All Invoices
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Profile Avatar with Dropdown */}
                        <div className="relative" ref={profileRef}>
                            <button
                                onClick={() => {
                                    setIsProfileOpen(!isProfileOpen);
                                    setIsNotificationOpen(false); // Close notifications when opening profile
                                }}
                                className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-md flex items-center justify-center hover:shadow-lg transition-all duration-200"
                            >
                                <span className="text-white font-semibold text-xs">{getInitials(userProfile.firstName, userProfile.lastName)}</span>
                            </button>

                            {/* Profile Dropdown */}
                            {isProfileOpen && (
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                                    {/* User Info Header */}
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                <span className="text-white font-bold text-sm">{getInitials(userProfile.firstName, userProfile.lastName)}</span>
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">{userProfile.firstName} {userProfile.lastName}</p>
                                                <p className="text-xs text-gray-600">{userProfile.role || 'User'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Menu Items */}
                                    <div className="py-2">
                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                navigate('/settings');
                                            }}
                                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-blue-50 transition-colors text-left"
                                        >
                                            <User size={18} className="text-gray-600" />
                                            <span className="text-sm text-gray-700 font-medium">My Profile</span>
                                        </button>

                                        <div className="border-t border-gray-100 my-1"></div>


                                        <button
                                            onClick={() => {
                                                setIsProfileOpen(false);
                                                authService.logout();
                                                navigate('/login');
                                            }}
                                            className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-50 transition-colors text-left"
                                        >
                                            <LogOut size={18} className="text-red-600" />
                                            <span className="text-sm text-red-600 font-medium">Logout</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-0">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default Layout;
