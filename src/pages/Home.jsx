import React, { useState } from "react";
import StatCard from "../components/StatCard";
import ActionButton from "../components/ActionButton";
import RecentList from "../components/RecentList";
import MessageList from "../components/MessageList";
import JobOpeningModal from "../components/JobOpeningModal";
import { Bell } from "lucide-react";

export default function Home() {
    const [openJobModal, setOpenJobModal] = useState(false);

    return (
        <div className="p-10">
            {/* Top bar */}
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold">Dashboard</h2>
                <div className="flex items-center gap-4">
                    <button className="relative p-2 rounded-full hover:bg-gray-100">
                        <Bell size={22} />
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <div className="w-10 h-10 rounded-full bg-yellow-200 flex items-center justify-center"></div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-6 mb-10">
                <StatCard title="Total Job Openings" value="12" />
                <StatCard title="Total Projects Published" value="34" />
                <StatCard title="Total Blog Posts" value="56" />
                <StatCard title="Unread Contact Messages" value="8" />
            </div>

            {/* Quick Actions */}
            <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-4 gap-4 mb-10">
                <ActionButton
                    primary
                    label="Add Job Opening"
                    onClick={() => setOpenJobModal(true)}  // ⬅️ OPEN MODAL
                />
                <ActionButton label="Add Project" />
                <ActionButton label="Add Blog Post" />
                <ActionButton label="View Messages" />
            </div>

            {/* Bottom two columns */}
            <div className="grid grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-lg">Recent Applications</h4>
                        <button className="text-blue-600 text-sm">View All</button>
                    </div>

                    <RecentList />
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-lg">Recent Contact Messages</h4>
                        <button className="text-blue-600 text-sm">View All</button>
                    </div>

                    <MessageList />
                </div>
            </div>

            {/* MODAL */}
            {openJobModal && (
                <JobOpeningModal onClose={() => setOpenJobModal(false)} />
            )}
        </div>
    );
}
