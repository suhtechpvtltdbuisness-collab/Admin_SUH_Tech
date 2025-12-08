import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Briefcase, Folder, FileText, Mail, Settings, LogOut, Newspaper, DollarSign, ChevronDown, ChevronRight, X } from "lucide-react";

function Item({ icon: Icon, label, path, active, hasSubmenu, isOpen, onClick, onClose }) {
  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    if (!hasSubmenu && onClose) {
      onClose();
    }
  };

  if (hasSubmenu) {
    return (
      <div
        onClick={handleClick}
        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition select-none ${active ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100 text-gray-700"}`}
      >
        <div className="flex items-center gap-3">
          <Icon size={18} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>
    )
  }

  return (
    <Link
      to={path}
      onClick={handleClick}
      className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${active ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-700"}`}
    >
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function Sidebar({ className = "", onClose }) {
  const location = useLocation();
  const [expensesOpen, setExpensesOpen] = useState(false);

  // Helper to determine if a path is active
  const isActive = (path) => location.pathname === path;
  // Helper to determine if the expenses section should be highlighted
  const isExpensesActive = location.pathname.startsWith('/expenses');

  // Auto-expand if on an expenses page
  React.useEffect(() => {
    if (isExpensesActive) {
      setExpensesOpen(true);
    }
  }, [isExpensesActive]);

  return (
    <aside className={`w-64 bg-white border-r border-gray-200 p-6 flex flex-col h-screen overflow-y-auto ${className}`}>
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <span className="w-3 h-5 bg-blue-600 rounded-sm"></span>
          Admin Panel
        </h1>
        <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
      </div>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div>
          <p className="font-semibold">Alex Hartman</p>
          <p className="text-xs text-gray-500">Administrator</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        <Item icon={Home} label="Dashboard" path="/" active={isActive("/")} onClose={onClose} />
        <Item icon={Briefcase} label="Jobs" path="/jobs" active={isActive("/jobs")} onClose={onClose} />
        <Item icon={Folder} label="Projects" path="/projects" active={isActive("/projects")} onClose={onClose} />
        <Item icon={FileText} label="Blog" path="/blog" active={isActive("/blog")} onClose={onClose} />
        <Item icon={Newspaper} label="Newsletter" path="/newsletter" active={isActive("/newsletter")} onClose={onClose} />
        <Item icon={Mail} label="Messages" path="/messages" active={isActive("/messages")} onClose={onClose} />

        {/* Expenses Dropdown */}
        <div className="mb-1">
          <Item
            icon={DollarSign}
            label="Expenses"
            hasSubmenu
            isOpen={expensesOpen}
            active={isExpensesActive}
            onClick={() => setExpensesOpen(!expensesOpen)}
            onClose={onClose}
          />

          <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expensesOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
            <div className="ml-9 border-l-2 border-gray-100 pl-2 space-y-1 mt-1 mb-2">
              <Link
                to="/expenses/salary"
                onClick={onClose}
                className={`block px-3 py-2 rounded-lg text-sm transition ${isActive("/expenses/salary") ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                Employee Salary
              </Link>
              <Link
                to="/expenses/sales"
                onClick={onClose}
                className={`block px-3 py-2 rounded-lg text-sm transition ${isActive("/expenses/sales") ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                Company Sales
              </Link>
              <Link
                to="/expenses/company-expenses"
                onClick={onClose}
                className={`block px-3 py-2 rounded-lg text-sm transition ${isActive("/expenses/company-expenses") ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                Company Expenses
              </Link>
              <Link
                to="/expenses/invoices"
                onClick={onClose}
                className={`block px-3 py-2 rounded-lg text-sm transition ${isActive("/expenses/invoices") ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"}`}
              >
                Invoices
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="space-y-2 pt-10 border-t mt-4">
        <Item icon={Settings} label="Settings" path="/settings" active={isActive("/settings")} onClose={onClose} />
        <Item icon={LogOut} label="Logout" path="/logout" onClose={onClose} />
      </div>
    </aside>
  );
}
