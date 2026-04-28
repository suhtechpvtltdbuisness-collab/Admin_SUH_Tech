import React, { useEffect, useState } from "react";
import { messageService } from "../../services";

export default function MessageList() {
    const [messages, setMessages] = useState([
        // Initial fallbacks while loading
        { initials: "CG", name: "Candice Wu", preview: "Loading messages...", time: "" }
    ]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await messageService.getAllMessages();
                const msgs = Array.isArray(res) ? res : (res.data || res.messages || []);
                
                if (msgs && msgs.length > 0) {
                    // Map real messages to dashboard format
                    // Taking the last 3 messages received
                    const formatted = msgs.slice(-3).reverse().map(m => {
                        let initials = "?";
                        if (m.name) {
                            initials = m.name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase();
                        }
                        
                        return {
                            initials,
                            name: m.name || "Unknown",
                            preview: m.message || "",
                            time: m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "Recent"
                        };
                    });
                    setMessages(formatted);
                } else {
                    // Fallback static data if no api messages
                    setMessages([
                        { initials: "CG", name: "Candice Wu", preview: "Hey, I had a question about...", time: "1h ago" },
                        { initials: "DM", name: "Demi Wilkinson", preview: "Project proposal attached", time: "3h ago" },
                        { initials: "NB", name: "Natali Craig", preview: "Re: Follow-up on our meeting", time: "5h ago" },
                    ]);
                }
            } catch (error) {
                console.error("Error loading messages for dashboard:", error);
                setMessages([
                    { initials: "CG", name: "Candice Wu", preview: "Hey, I had a question about...", time: "1h ago" },
                    { initials: "DM", name: "Demi Wilkinson", preview: "Project proposal attached", time: "3h ago" },
                    { initials: "NB", name: "Natali Craig", preview: "Re: Follow-up on our meeting", time: "5h ago" },
                ]);
            }
        };
        fetchMessages();
    }, []);

    return (
        <div>
            {messages.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-3 last:border-0 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-semibold border border-blue-100 shrink-0">
                            {m.initials}
                        </div>
                        <div className="overflow-hidden">
                            <p className="font-medium text-gray-800 truncate w-32 md:w-auto">{m.name}</p>
                            <p className="text-sm text-gray-500 truncate w-32 sm:w-40 md:w-48">{m.preview}</p>
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 font-medium whitespace-nowrap pl-2">{m.time}</p>
                </div>
            ))}
        </div>
    );
}
