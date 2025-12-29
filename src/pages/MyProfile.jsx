import { Calendar, Clock, Key, Mail, MapPin, Phone, Save, User } from 'lucide-react';
import { useState } from 'react';
import Toast from '../components/Toast';

const MyProfile = () => {
    const [activeTab, setActiveTab] = useState('personal');
    const [toast, setToast] = useState(null);
    const [isEditing, setIsEditing] = useState(false);

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

    const handleSaveProfile = (e) => {
        e.preventDefault();
        // API call would go here
        showToast('Profile updated successfully!', 'success');
        setIsEditing(false);
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showToast('Passwords do not match!', 'error');
            return;
        }
        if (passwordData.newPassword.length < 6) {
            showToast('Password must be at least 6 characters!', 'error');
            return;
        }
        // API call would go here
        showToast('Password reset successfully!', 'success');
        setPasswordData({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
        });
    };

    const handleAddHoliday = (e) => {
        e.preventDefault();
        if (!newHoliday.name || !newHoliday.date) {
            showToast('Please fill all holiday fields!', 'error');
            return;
        }
        const holiday = {
            id: holidays.length + 1,
            ...newHoliday
        };
        setHolidays([...holidays, holiday]);
        setNewHoliday({ name: '', date: '', type: 'Public' });
        showToast('Holiday added successfully!', 'success');
    };

    const handleDeleteHoliday = (id) => {
        setHolidays(holidays.filter(h => h.id !== id));
        showToast('Holiday deleted successfully!', 'success');
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

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>
                <p className="text-gray-500 text-sm">Manage your personal information and preferences</p>
            </div>

            {/* Profile Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                        <span className="text-white font-bold text-3xl">AH</span>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">{profileData.firstName} {profileData.lastName}</h2>
                        <p className="text-gray-600">{profileData.role}</p>
                        <p className="text-gray-500 text-sm">{profileData.email}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="border-b border-gray-200">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${
                                activeTab === 'personal'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Personal Information
                        </button>
                        <button
                            onClick={() => setActiveTab('preferences')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${
                                activeTab === 'preferences'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Preferences
                        </button>
                        <button
                            onClick={() => setActiveTab('security')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${
                                activeTab === 'security'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Security
                        </button>
                        <button
                            onClick={() => setActiveTab('holidays')}
                            className={`px-6 py-4 font-medium text-sm transition-colors ${
                                activeTab === 'holidays'
                                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            Holiday Calendar
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Personal Information Tab */}
                    {activeTab === 'personal' && (
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
                                        disabled
                                        className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50"
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
                                        onClick={() => setIsEditing(true)}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Edit Profile
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            type="submit"
                                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                        >
                                            <Save size={18} />
                                            Save Changes
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setIsEditing(false)}
                                            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </>
                                )}
                            </div>
                        </form>
                    )}

                    {/* Preferences Tab */}
                    {activeTab === 'preferences' && (
                        <div>
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
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        <Calendar size={16} className="inline mr-2" />
                                        Date Format
                                    </label>
                                    <select
                                        name="dateFormat"
                                        value={profileData.dateFormat}
                                        onChange={handleProfileChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                    </select>
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
                                onClick={() => showToast('Preferences saved successfully!', 'success')}
                                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                            >
                                <Save size={18} />
                                Save Preferences
                            </button>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div>
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
                                    className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                                >
                                    <Key size={18} />
                                    Reset Password
                                </button>
                            </form>
                        </div>
                    )}

                    {/* Holiday Calendar Tab */}
                    {activeTab === 'holidays' && (
                        <div>
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
                                        onChange={(e) => setNewHoliday({...newHoliday, name: e.target.value})}
                                        className="p-2 border border-gray-300 rounded-lg"
                                    />
                                    <input
                                        type="date"
                                        value={newHoliday.date}
                                        onChange={(e) => setNewHoliday({...newHoliday, date: e.target.value})}
                                        className="p-2 border border-gray-300 rounded-lg"
                                    />
                                    <select
                                        value={newHoliday.type}
                                        onChange={(e) => setNewHoliday({...newHoliday, type: e.target.value})}
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
                                    <div key={holiday.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
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
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                                holiday.type === 'Public' ? 'bg-green-100 text-green-700' :
                                                holiday.type === 'Company' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {holiday.type}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteHoliday(holiday.id)}
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

export default MyProfile;
