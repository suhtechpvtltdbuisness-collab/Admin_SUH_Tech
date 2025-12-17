import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { Mail, Users } from "lucide-react";
import api from "../config/api";

export default function MessagesPage() {
  const [activeTab, setActiveTab] = useState("contacts");
  const [contacts, setContacts] = useState([]);
  const [infos, setInfos] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingInfos, setLoadingInfos] = useState(true);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        setLoadingContacts(true);
        const res = await api.getContacts();
        setContacts(res.contacts || []);
      } catch (error) {
        console.error("Error loading contacts:", error);
      } finally {
        setLoadingContacts(false);
      }
    };

    const loadInfos = async () => {
      try {
        setLoadingInfos(true);
        const res = await api.getUserInfos();
        setInfos(res.infos || []);
      } catch (error) {
        console.error("Error loading user infos:", error);
      } finally {
        setLoadingInfos(false);
      }
    };

    loadContacts();
    loadInfos();
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Messages & Inquiries
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              All contact form messages and project interest inquiries from the main website.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab("contacts")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === "contacts"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Mail size={16} /> Contact Form Messages
            </span>
          </button>
          <button
            onClick={() => setActiveTab("infos")}
            className={`px-4 py-2 text-sm font-medium border-b-2 ${
              activeTab === "infos"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span className="inline-flex items-center gap-2">
              <Users size={16} /> Project Interest / FAQ Leads
            </span>
          </button>
        </div>

        {/* Content */}
        {activeTab === "contacts" ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 text-sm md:text-base">
                Contact Form Messages
              </h2>
              <span className="text-xs text-gray-500">
                Total: {contacts.length}
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {loadingContacts ? (
                <p className="p-6 text-gray-500 text-sm">Loading messages...</p>
              ) : contacts.length === 0 ? (
                <p className="p-6 text-gray-500 text-sm">
                  No messages received yet.
                </p>
              ) : (
                contacts.map((c) => (
                  <div
                    key={c._id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-semibold">
                        {c.name?.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {c.name}
                        </p>
                        <p className="text-xs text-gray-500">{c.email}</p>
                        <p className="mt-1 text-sm text-gray-700">
                          {c.message}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 md:text-right">
                      {c.createdAt &&
                        new Date(c.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900 text-sm md:text-base">
                Project Interest / FAQ Leads
              </h2>
              <span className="text-xs text-gray-500">
                Total: {infos.length}
              </span>
            </div>

            <div className="divide-y divide-gray-100">
              {loadingInfos ? (
                <p className="p-6 text-gray-500 text-sm">Loading leads...</p>
              ) : infos.length === 0 ? (
                <p className="p-6 text-gray-500 text-sm">
                  No leads received yet.
                </p>
              ) : (
                infos.map((u) => (
                  <div
                    key={u._id}
                    className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {u.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Interest:{" "}
                        <span className="font-semibold text-gray-700">
                          {u.interest}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Favorite:{" "}
                        <span className="font-semibold text-gray-700">
                          {u.favorite}
                        </span>
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 md:text-right">
                      {u.createdAt &&
                        new Date(u.createdAt).toLocaleString("en-IN", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


