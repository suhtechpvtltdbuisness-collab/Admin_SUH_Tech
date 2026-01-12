import {
  Briefcase,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  DollarSign,
  FileText,
  Folder,
  Home,
  LogOut,
  Mail,
  Newspaper,
  Receipt,
  Settings,
  User2,
  Users,
  X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from '../config/api';

/* SIDEBAR ITEM */
function Item({
  icon: Icon,
  label,
  path,
  active,
  hasSubmenu,
  isOpen,
  onClick,
  onClose
}) {
  const handleClick = (e) => {
    if (onClick) onClick(e);
    if (!hasSubmenu && onClose) onClose();
  };

  // Submenu parent
  if (hasSubmenu) {
    return (
      <div
        onClick={handleClick}
        className={`flex items-center justify-between px-3 py-3.5 rounded-xl cursor-pointer transition-all duration-200 select-none
          ${active ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm" : "hover:bg-gray-50 text-gray-700"}`}
      >
        <div className="flex items-center gap-3">
          <Icon size={19} strokeWidth={2.2} />
          <span className="text-sm font-medium leading-6">{label}</span>
        </div>
        {isOpen ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
      </div>
    );
  }

  // Normal navigation item //
  return (
    <Link
      to={path}
      onClick={handleClick}
      className={`flex items-center gap-3 px-3 py-3.5 rounded-xl cursor-pointer transition-all duration-200
      ${active ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm font-semibold" : "hover:bg-gray-50 text-gray-700"}`}
    >
      <Icon size={19} strokeWidth={active ? 2.5 : 2} />
      <span className="text-sm font-medium leading-6">{label}</span>
    </Link>
  );
}

/*  MAIN SIDEBAR  */
export default function Sidebar({ className = "", onClose }) {
  const location = useLocation();
  const [expensesOpen, setExpensesOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [userProfile, setUserProfile] = useState({ firstName: '', lastName: '', role: '' });

  // Helper functions //
  const isActive = (path) => location.pathname === path;
  const isExpensesActive = location.pathname.startsWith("/expenses") && !location.pathname.startsWith("/expenses/invoices");
  const isProjectsActive = location.pathname.startsWith("/projects") || isActive("/clients");

  // Helper function to get initials from name
  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || 'NA';
  };

  // Auto-open submenus when inside their sections //
  useEffect(() => {
    if (isExpensesActive) setExpensesOpen(true);
  }, [isExpensesActive]);

  useEffect(() => {
    if (isProjectsActive) setProjectsOpen(true);
  }, [isProjectsActive]);

  // Load user profile
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const res = await api.getUserProfile();
        if (res.user) {
          setUserProfile(res.user);
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };
    loadUserProfile();
  }, []);

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

  return (
    <aside
      className={`w-64 bg-white border-r border-gray-200 p-6 flex flex-col h-screen overflow-y-auto shadow-sm ${className}`}
    >
      {/* TOP HEADER */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <img
            src="/SUH_TECH_WEBHeader_LOGO (12).svg"
            alt="SUH Tech Logo"
            className="h-8 w-auto max-w-[140px] object-contain"
          />
        </div>

        {/* Mobile Close */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-1.5 rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        )}
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1">
        <Item icon={Home} label="Dashboard" path="/" active={isActive("/")} onClose={onClose} onClick={() => { setExpensesOpen(false); setProjectsOpen(false); }} />

        <Item icon={User2} label="Employees" path="/employees" active={isActive("/employees")} onClose={onClose} onClick={() => { setExpensesOpen(false); setProjectsOpen(false); }} />

        <Item icon={CalendarCheck} label="Attendance" path="/employee-attendance" active={isActive("/employee-attendance")} onClose={onClose} onClick={() => { setExpensesOpen(false); setProjectsOpen(false); }} />

        <Item icon={Briefcase} label="Jobs" path="/jobs" active={isActive("/jobs")} onClose={onClose} onClick={() => { setExpensesOpen(false); setProjectsOpen(false); }} />

        {/* ================= PROJECTS DROPDOWN ================= */}
        <div>
          <Item
            icon={Folder}
            label="Projects"
            hasSubmenu
            isOpen={projectsOpen}
            active={location.pathname.startsWith("/projects") || isActive("/clients")}
            onClick={() => setProjectsOpen(!projectsOpen)}
            onClose={onClose}
          />

          {/* Dropdown content */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${projectsOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="ml-9 pl-2 space-y-1 mt-1 mb-2">
              <Link
                to="/projects"
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={`block px-3 py-2 rounded-lg text-sm transition
                ${isActive("/projects")
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                All Projects
              </Link>


              <Link
                to="/clients"
                onClick={() => {
                  if (onClose) onClose();
                }}
                className={`block px-3 py-2 rounded-lg text-sm transition
                ${isActive("/clients")
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Clients
              </Link>
            </div>
          </div>
        </div>

        <Item icon={FileText} label="Blog" path="/blog" active={isActive("/blog")} onClose={onClose} onClick={() => { setExpensesOpen(false); setProjectsOpen(false); }} />

        <Item icon={Newspaper} label="Newsletter" path="/newsletter" active={isActive("/newsletter")} onClose={onClose} onClick={() => { setExpensesOpen(false); setProjectsOpen(false); }} />

        <Item icon={Mail} label="Messages" path="/messages" active={isActive("/messages")} onClose={onClose} onClick={() => { setExpensesOpen(false); setProjectsOpen(false); }} />

        <Item icon={Receipt} label="Invoices" path="/expenses/invoices" active={isActive("/expenses/invoices")} onClose={onClose} onClick={() => { setExpensesOpen(false); setProjectsOpen(false); }} />

        {/* ================= EXPENSES DROPDOWN ================= */}
        <div>
          <Item
            icon={DollarSign}
            label="Expenses"
            hasSubmenu
            isOpen={expensesOpen}
            active={isExpensesActive}
            onClick={() => setExpensesOpen(!expensesOpen)}
            onClose={onClose}
          />

          {/* Dropdown content */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${expensesOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
              }`}
          >
            <div className="ml-9 pl-2 space-y-1 mt-1 mb-2">
              <Link
                to="/expenses/salary"
                onClick={() => {
                  setExpensesOpen(false);
                  if (onClose) onClose();
                }}
                className={`block px-3 py-2 rounded-lg text-sm transition
                ${isActive("/expenses/salary")
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Employee Salary
              </Link>

              <Link
                to="/expenses/sales"
                onClick={() => {
                  setExpensesOpen(false);
                  if (onClose) onClose();
                }}
                className={`block px-3 py-2 rounded-lg text-sm transition
                ${isActive("/expenses/sales")
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Company Sales
              </Link>

              <Link
                to="/expenses/company-expenses"
                onClick={() => {
                  setExpensesOpen(false);
                  if (onClose) onClose();
                }}
                className={`block px-3 py-2 rounded-lg text-sm transition
                ${isActive("/expenses/company-expenses")
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  }`}
              >
                Company Expenses
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* FOOTER LINKS */}
      <div className="space-y-1 pt-4">
        <Item icon={Settings} label="Settings" path="/settings" active={isActive("/settings")} onClose={onClose} />
        <Item icon={LogOut} label="Logout" path="/login" onClose={onClose} />
      </div>

      {/* USER CARD */}
      <div className="flex items-center gap-3 mt-4 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">{getInitials(userProfile.firstName, userProfile.lastName)}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm whitespace-nowrap overflow-hidden text-ellipsis">{userProfile.firstName} {userProfile.lastName}</p>
          <p className="text-xs text-gray-600">{userProfile.role || 'User'}</p>
        </div>
      </div>
    </aside>
  );
}