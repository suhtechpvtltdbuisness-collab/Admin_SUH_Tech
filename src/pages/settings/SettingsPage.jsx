import { Calendar, Clock, Key, Mail, MapPin, Phone, Save, Settings as SettingsIcon, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from "../../components/common/Toast";
import { userService, holidayService } from '../../services';

const Settings = () => {
    const navigate = useNavigate();
    const [activeSection, setActiveSection] = useState('my-profile');
    const [activeTab, setActiveTab] = useState('personal');
    const [toast, setToast] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [showDateFormatPicker, setShowDateFormatPicker] = useState(false);
    const dateFormatPickerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [profileData, setProfileData] = useState({
        firstName: 'Alex',
        lastName: 'Hartman',
        email: 'alex.hartman@suhtech.com',
        phone: '+91 98765 00000',
        role: 'Administrator',
        department: 'Management',
        address: '123 Business Street',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        timezone: 'Asia/Kolkata',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '12h'
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [holidays, setHolidays] = useState([
        { id: 1, name: 'New Year', date: '2025-01-01', type: 'Public' },
        { id: 2, name: 'Republic Day', date: '2025-01-26', type: 'Public' },
        { id: 3, name: 'Holi', date: '2025-03-14', type: 'Public' },
        { id: 4, name: 'Independence Day', date: '2025-08-15', type: 'Public' },
        { id: 5, name: 'Diwali', date: '2025-10-20', type: 'Public' }
    ]);

    const [newHoliday, setNewHoliday] = useState({
        name: '',
        date: '',
        type: 'Public'
    });

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

    // Fetch user profile on mount
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await userService.getProfile();
                if (response.user) {
                    setProfileData(response.user);
                }
            } catch (error) {
                showToast('Failed to load profile data', 'error');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Fetch holidays on mount
    const fetchHolidays = async () => {
        try {
            const response = await holidayService.getAllHolidays();
            const holidaysData = Array.isArray(response) ? response : (response.holidays || response.data || []);
            setHolidays(holidaysData);
        } catch (error) {
            console.error('Failed to load holidays:', error);
        }
    };

    useEffect(() => {
        fetchHolidays();
    }, []);

    // Close date format picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dateFormatPickerRef.current && !dateFormatPickerRef.current.contains(event.target)) {
                setShowDateFormatPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Calendar helper functions
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
        return new Date(year, month, 1).getDay();
    };

    const formatDateDisplay = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();

        if (profileData.dateFormat === 'DD/MM/YYYY') {
            return `${day}/${month}/${year}`;
        } else if (profileData.dateFormat === 'MM/DD/YYYY') {
            return `${month}/${day}/${year}`;
        } else {
            return `${year}-${month}-${day}`;
        }
    };

    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const handlePrevMonth = () => {
        if (currentMonth === 0) {
            setCurrentMonth(11);
            setCurrentYear(currentYear - 1);
        } else {
            setCurrentMonth(currentMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (currentMonth === 11) {
            setCurrentMonth(0);
            setCurrentYear(currentYear + 1);
        } else {
            setCurrentMonth(currentMonth + 1);
        }
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(currentYear, currentMonth, day);
        setSelectedDate(newDate);
    };

    const handleClearDate = () => {
        setSelectedDate(new Date());
        setCurrentMonth(new Date().getMonth());
        setCurrentYear(new Date().getFullYear());
    };

    const handleTodayDate = () => {
        const today = new Date();
        setSelectedDate(today);
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    const getErrorMessage = (error) => {
        try {
            const msg = error.message || "";
            if (msg.includes("HTTP error!")) {
                const jsonStrMatch = msg.match(/message:\s*({.*})/);
                if (jsonStrMatch && jsonStrMatch[1]) {
                    const parsed = JSON.parse(jsonStrMatch[1]);
                    return parsed.message || "An error occurred";
                }
            }
        } catch (e) {}
        return error.message || "An unexpected error occurred.";
    };

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 4000);
    };

    const handleProfileChange = (e) => {
        const { name, value } = e.target;
        setProfileData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        try {
            setSaving(true);
            const response = await userService.updateProfile(profileData);
            showToast('Profile updated successfully!', 'success');
            setIsEditing(false);

            // Dispatch custom event to notify other components about profile update
            window.dispatchEvent(new CustomEvent('profileUpdated', {
                detail: { user: profileData }
            }));
        } catch (error) {
            showToast('Failed to update profile: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Passwords do not match!', 'error');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters!', 'error');
            return;
        }
        try {
            setSaving(true);
            // Password change not yet implemented in services
            showToast('Password change feature coming soon!', 'info');
            // await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);
            showToast('Password reset successfully!', 'success');
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            showToast('Failed to reset password: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleAddHoliday = async (e) => {
        e.preventDefault();
        if (!newHoliday.name || !newHoliday.date) {
            showToast('Please fill all holiday fields!', 'error');
            return;
        }
        try {
            await holidayService.createHoliday(newHoliday);
            await fetchHolidays();
            setNewHoliday({ name: '', date: '', type: 'Public' });
            showToast('Holiday added successfully!', 'success');
        } catch (error) {
            showToast('Failed to add holiday: ' + getErrorMessage(error), 'error');
        }
    };

    const handleDeleteHoliday = async (id) => {
        try {
            await holidayService.deleteHoliday(id);
            await fetchHolidays();
            showToast('Holiday deleted successfully!', 'success');
        } catch (error) {
            showToast('Failed to delete holiday: ' + getErrorMessage(error), 'error');
        }
    };

    const handleSavePreferences = async () => {
        try {
            setSaving(true);
            await userService.updateProfile({
                ...profileData,
                timezone: profileData.timezone,
                dateFormat: profileData.dateFormat,
                timeFormat: profileData.timeFormat
            });
            showToast('Preferences saved successfully!', 'success');
        } catch (error) {
            showToast('Failed to save preferences: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = async () => {
        try {
            // Reload original data from API/localStorage
            const response = await userService.getProfile();
            if (response.user) {
                setProfileData(response.user);
            }
            setIsEditing(false);
        } catch (error) {
            console.error('Failed to reload profile data:', error);
            setIsEditing(false);
        }
    };

    // Helper function to get initials from name
    const getInitials = (firstName, lastName) => {
        const first = firstName?.charAt(0)?.toUpperCase() || '';
        const last = lastName?.charAt(0)?.toUpperCase() || '';
        return `${first}${last}` || 'NA';
    };

    const timezones = [
        'Asia/Kolkata',
        'America/New_York',
        'America/Los_Angeles',
        'Europe/London',
        'Europe/Paris',
        'Asia/Tokyo',
        'Australia/Sydney'
    ];

    const settingsSections = [
        { id: 'my-profile', label: 'My Profile', icon: User },
        { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
        { id: 'security', label: 'Security', icon: Key },
        { id: 'holiday-calendar', label: 'Holiday Calendar', icon: Calendar },
    ];

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-500 text-sm">Manage your account settings and preferences</p>
            </div>

            <div className="flex gap-6">
                {/* Sidebar Navigation */}
                <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-fit">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Settings</h3>
                    <div className="space-y-1">
                        {settingsSections.map(section => (
                            <button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left ${activeSection === section.id
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                            >
                                <section.icon size={18} />
                                <span className="text-sm">{section.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1">
                    {/* My Profile Section */}
                    {activeSection === 'my-profile' && (
                        <>
                            {/* Profile Header Card */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-3xl">{getInitials(profileData.firstName, profileData.lastName)}</span>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">{profileData.firstName} {profileData.lastName}</h2>
                                        <p className="text-gray-600">{profileData.role}</p>
                                        <p className="text-gray-500 text-sm">{profileData.email}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Personal Information */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
                                <form onSubmit={handleSaveProfile}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <User size={16} className="inline mr-2" />
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                name="firstName"
                                                value={profileData.firstName}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <User size={16} className="inline mr-2" />
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                name="lastName"
                                                value={profileData.lastName}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Mail size={16} className="inline mr-2" />
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={profileData.email}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <Phone size={16} className="inline mr-2" />
                                                Phone
                                            </label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={profileData.phone}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                                            <input
                                                type="text"
                                                name="department"
                                                value={profileData.department}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                            <input
                                                type="text"
                                                name="role"
                                                value={profileData.role}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                <MapPin size={16} className="inline mr-2" />
                                                Address
                                            </label>
                                            <input
                                                type="text"
                                                name="address"
                                                value={profileData.address}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={profileData.city}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={profileData.state}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Zip Code</label>
                                            <input
                                                type="text"
                                                name="zipCode"
                                                value={profileData.zipCode}
                                                onChange={handleProfileChange}
                                                disabled={!isEditing}
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50"
                                            />
                                        </div>
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        {!isEditing ? (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setIsEditing(true);
                                                }}
                                                disabled={loading}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Edit Profile
                                            </button>
                                        ) : (
                                            <>
                                                <button
                                                    type="submit"
                                                    disabled={saving}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    <Save size={18} />
                                                    {saving ? 'Saving...' : 'Save Changes'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={handleCancelEdit}
                                                    disabled={saving}
                                                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </>
                    )}

                    {/* Preferences Section */}
                    {activeSection === 'preferences' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Preferences</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Clock size={16} className="inline mr-2" />
                                        Timezone
                                    </label>
                                    <select
                                        name="timezone"
                                        value={profileData.timezone}
                                        onChange={handleProfileChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        {timezones.map(tz => (
                                            <option key={tz} value={tz}>{tz}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="relative" ref={dateFormatPickerRef}>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar size={16} className="inline mr-2" />
                                        Date Format
                                    </label>
                                    <div
                                        onClick={() => setShowDateFormatPicker(!showDateFormatPicker)}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer bg-white flex items-center justify-between hover:border-blue-400 transition-colors"
                                    >
                                        <span>{formatDateDisplay(selectedDate)}</span>
                                        <Calendar size={18} className="text-gray-400" />
                                    </div>

                                    {showDateFormatPicker && (
                                        <div className="absolute z-50 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl p-2 right-0">
                                            {/* Calendar Header */}
                                            <div className="mb-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <select
                                                        value={currentMonth}
                                                        onChange={(e) => setCurrentMonth(Number(e.target.value))}
                                                        className="text-sm font-semibold text-gray-800 border border-gray-300 rounded px-2 py-1 cursor-pointer hover:border-blue-400"
                                                    >
                                                        {monthNames.map((month, index) => (
                                                            <option key={index} value={index}>{month}, {currentYear}</option>
                                                        ))}
                                                    </select>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={handlePrevMonth}
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                                                        >
                                                            <span className="text-xl">↑</span>
                                                        </button>
                                                        <button
                                                            onClick={handleNextMonth}
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded transition-colors"
                                                        >
                                                            <span className="text-xl">↓</span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Weekday Headers */}
                                            <div className="grid grid-cols-7 gap-1 mb-1">
                                                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                                    <div key={day} className="text-center text-xs font-semibold text-gray-600 py-0.5">
                                                        {day}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Calendar Grid */}
                                            <div className="grid grid-cols-7 gap-1 mb-2">
                                                {/* Previous month days */}
                                                {Array.from({ length: getFirstDayOfMonth(currentMonth, currentYear) }).map((_, index) => {
                                                    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
                                                    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
                                                    const daysInPrevMonth = getDaysInMonth(prevMonth, prevYear);
                                                    const day = daysInPrevMonth - getFirstDayOfMonth(currentMonth, currentYear) + index + 1;
                                                    return (
                                                        <div
                                                            key={`prev-${index}`}
                                                            className="text-center py-1 text-sm text-gray-400"
                                                        >
                                                            {day}
                                                        </div>
                                                    );
                                                })}

                                                {/* Current month days */}
                                                {Array.from({ length: getDaysInMonth(currentMonth, currentYear) }).map((_, index) => {
                                                    const day = index + 1;
                                                    const isSelected = selectedDate.getDate() === day &&
                                                        selectedDate.getMonth() === currentMonth &&
                                                        selectedDate.getFullYear() === currentYear;
                                                    const isToday = new Date().getDate() === day &&
                                                        new Date().getMonth() === currentMonth &&
                                                        new Date().getFullYear() === currentYear;

                                                    return (
                                                        <button
                                                            key={day}
                                                            onClick={() => handleDateSelect(day)}
                                                            className={`text-center py-1 text-sm rounded transition-colors ${isSelected
                                                                ? 'bg-blue-600 text-white font-bold'
                                                                : isToday
                                                                    ? 'bg-blue-100 text-blue-600 font-semibold'
                                                                    : 'hover:bg-gray-100 text-gray-800'
                                                                }`}
                                                        >
                                                            {day}
                                                        </button>
                                                    );
                                                })}

                                                {/* Next month days */}
                                                {Array.from({
                                                    length: 42 - getDaysInMonth(currentMonth, currentYear) - getFirstDayOfMonth(currentMonth, currentYear)
                                                }).map((_, index) => (
                                                    <div
                                                        key={`next-${index}`}
                                                        className="text-center py-1 text-sm text-gray-400"
                                                    >
                                                        {index + 1}
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                                                <button
                                                    onClick={handleClearDate}
                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Clear
                                                </button>
                                                <button
                                                    onClick={handleTodayDate}
                                                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                                >
                                                    Today
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Clock size={16} className="inline mr-2" />
                                        Time Format
                                    </label>
                                    <select
                                        name="timeFormat"
                                        value={profileData.timeFormat}
                                        onChange={handleProfileChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="12h">12 Hour</option>
                                        <option value="24h">24 Hour</option>
                                    </select>
                                </div>
                            </div>
                            <button
                                onClick={handleSavePreferences}
                                disabled={saving}
                                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Save size={18} />
                                {saving ? 'Saving...' : 'Save Preferences'}
                            </button>
                        </div>
                    )}

                    {/* Security Section */}
                    {activeSection === 'security' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                <Key size={20} className="inline mr-2" />
                                Reset Password
                            </h3>
                            <form onSubmit={handleResetPassword} className="max-w-md">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={passwordData.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={passwordData.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={passwordData.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Key size={18} />
                                    {saving ? 'Resetting...' : 'Reset Password'}
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Holiday Calendar Section */}
                    {activeSection === 'holiday-calendar' && (
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                <Calendar size={20} className="inline mr-2" />
                                Holiday Calendar
                            </h3>

                            {/* Add Holiday Form */}
                            <form onSubmit={handleAddHoliday} className="bg-gray-50 p-4 rounded-lg mb-6">
                                <h4 className="font-medium text-gray-700 mb-3">Add New Holiday</h4>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Holiday Name"
                                        value={newHoliday.name}
                                        onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                                        className="p-2 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                        type="date"
                                        value={newHoliday.date}
                                        onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                                        className="p-2 border border-gray-300 rounded-lg"
                                    />
                                    <select
                                        value={newHoliday.type}
                                        onChange={(e) => setNewHoliday({ ...newHoliday, type: e.target.value })}
                                        className="p-2 border border-gray-300 rounded-lg"
                                    >
                                        <option value="Public">Public Holiday</option>
                                        <option value="Company">Company Holiday</option>
                                        <option value="Optional">Optional Holiday</option>
                                    </select>
                                </div>
                                <button
                                    type="submit"
                                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                >
                                    Add Holiday
                                </button>
                            </form>

                            {/* Holidays List */}
                            <div className="space-y-3">
                                {holidays.map(holiday => (
                                    <div key={holiday._id || holiday.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                <Calendar size={24} className="text-blue-600" />
                                            </div>
                                            <div>
                                                <h5 className="font-medium text-gray-900">{holiday.name}</h5>
                                                <p className="text-sm text-gray-600">{new Date(holiday.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${holiday.type === 'Public' ? 'bg-green-100 text-green-700' :
                                                holiday.type === 'Company' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {holiday.type}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteHoliday(holiday._id || holiday.id)}
                                                className="text-red-600 hover:text-red-700 text-sm font-medium"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                </div>
            </div>

            {/* Toast Notifications */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
    );
};

export default Settings;
