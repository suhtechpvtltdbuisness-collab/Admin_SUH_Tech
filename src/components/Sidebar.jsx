import {
    Briefcase,
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
    X
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

/* ----------------------------- SIDEBAR ITEM ----------------------------- */
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
        className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 select-none
          ${active ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm" : "hover:bg-gray-50 text-gray-700"}`}
      >
        <div className="flex items-center gap-3">
          <Icon size={19} strokeWidth={2.2} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {isOpen ? <ChevronDown size={17} /> : <ChevronRight size={17} />}
      </div>
    );
  }

  // Normal navigation item
  return (
    <Link
      to={path}
      onClick={handleClick}
      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
      ${active ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 shadow-sm font-semibold" : "hover:bg-gray-50 text-gray-700"}`}
    >
      <Icon size={19} strokeWidth={active ? 2.5 : 2} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

/* ----------------------------- MAIN SIDEBAR ----------------------------- */
export default function Sidebar({ className = "", onClose }) {
  const location = useLocation();
  const [expensesOpen, setExpensesOpen] = useState(false);

  // Helper functions
  const isActive = (path) => location.pathname === path;
  const isExpensesActive = location.pathname.startsWith("/expenses");

  // Auto-open expenses submenu when inside expenses section
  useEffect(() => {
    if (isExpensesActive) setExpensesOpen(true);
  }, [isExpensesActive]);

  return (
    <aside
      className={`w-64 bg-white border-r border-gray-200 p-6 flex flex-col h-screen overflow-y-auto shadow-sm ${className}`}
    >
      {/* TOP HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <div className="w-3 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-md"></div>
          <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Admin Panel
          </span>
        </h1>

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

      {/* USER CARD */}
      <div className="flex items-center gap-3 mb-8 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
          <span className="text-white font-bold text-sm">AH</span>
        </div>
        <div>
          <p className="font-semibold text-gray-900">Alex Hartman</p>
          <p className="text-xs text-gray-600">Administrator</p>
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="flex-1 space-y-1">
        <Item icon={Home} label="Dashboard" path="/" active={isActive("/")} onClose={onClose} />

        <Item icon={User2} label="Employees" path="/employees" active={isActive("/employees")} onClose={onClose} />

        <Item icon={Briefcase} label="Jobs" path="/jobs" active={isActive("/jobs")} onClose={onClose} />

        <Item icon={Folder} label="Projects" path="/projects" active={isActive("/projects")} onClose={onClose} />

        <Item icon={FileText} label="Blog" path="/blog" active={isActive("/blog")} onClose={onClose} />

        <Item icon={Newspaper} label="Newsletter" path="/newsletter" active={isActive("/newsletter")} onClose={onClose} />

        <Item icon={Mail} label="Messages" path="/messages" active={isActive("/messages")} onClose={onClose} />

        <Item icon={Receipt} label="Invoices" path="/expenses/invoices" active={isActive("/expenses/invoices")} onClose={onClose} />

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
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expensesOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
            }`}
          >
            <div className="ml-9 border-l-2 border-gray-100 pl-2 space-y-1 mt-1 mb-2">
              <Link
                to="/expenses/salary"
                onClick={onClose}
                className={`block px-3 py-2 rounded-lg text-sm transition
                ${
                  isActive("/expenses/salary")
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Employee Salary
              </Link>

              <Link
                to="/expenses/sales"
                onClick={onClose}
                className={`block px-3 py-2 rounded-lg text-sm transition
                ${
                  isActive("/expenses/sales")
                    ? "bg-blue-50 text-blue-600 font-medium"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                Company Sales
              </Link>

              <Link
                to="/expenses/company-expenses"
                onClick={onClose}
                className={`block px-3 py-2 rounded-lg text-sm transition
                ${
                  isActive("/expenses/company-expenses")
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
      <div className="space-y-2 pt-6 border-t border-gray-200 mt-4">
        <Item icon={Settings} label="Settings" path="/settings" active={isActive("/settings")} onClose={onClose} />
        <Item icon={LogOut} label="Logout" path="/login" onClose={onClose} />
      </div>
    </aside>
  );
}
