import React from "react";
import { Home, Briefcase, Folder, FileText, Mail, Settings, LogOut,  Newspaper } from "lucide-react";

function Item({ icon: Icon, label, active }) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition ${active ? "bg-blue-100 text-blue-600" : "hover:bg-gray-100"}`}>
      <Icon size={18} />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-6 flex flex-col">
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
        <Item icon={Home} label="Dashboard" active />
        <Item icon={Briefcase} label="Jobs" />
        <Item icon={Folder} label="Projects" />
        <Item icon={FileText} label="Blog" />
         <Item icon={Newspaper} label="Newsletter" />
        <Item icon={Mail} label="Messages" />
      </nav>

      <div className="space-y-2 pt-10">
        <Item icon={Settings} label="Settings" />
        <Item icon={LogOut} label="Logout" />
      </div>
    </aside>
  );
}
