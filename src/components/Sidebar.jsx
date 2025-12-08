import { Link, useLocation } from "react-router-dom";
import { Home, Briefcase, Folder, FileText, Mail, Settings, LogOut, Newspaper, User2 } from "lucide-react";

function Item({ icon: Icon, label, to }) {
  const location = useLocation();
  const active = location.pathname === to || (to !== "/" && location.pathname.startsWith(to));

  return (
    <Link to={to || "#"} className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${active ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100 text-gray-700"}`}>
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col h-screen sticky top-0">
      <h1 className="text-xl font-semibold mb-10 flex items-center gap-2">
        <span className="w-3 h-5 bg-blue-600 rounded-sm"></span>
        Admin Panel
      </h1>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div>
          <p className="font-semibold">Alex Hartman</p>
          <p className="text-xs text-gray-500">Administrator</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        <Item icon={Home} label="Dashboard" to="/" />
        <Item icon={User2} label="Employees" to="/employees" />
        <Item icon={Briefcase} label="Jobs" to="/jobs" />
        <Item icon={Folder} label="Projects" to="/projects" />
        <Item icon={FileText} label="Blog" to="/blog" />
        <Item icon={Newspaper} label="Newsletter" to="/newsletter" />
        <Item icon={Mail} label="Messages" to="/messages" />
      </nav>

      <div className="space-y-2 pt-10 border-t border-gray-100">
        <Item icon={Settings} label="Settings" to="/settings" />
        <Item icon={LogOut} label="Logout" to="/login" />
      </div>
    </aside>
  );
}
