import React from "react";

const messages = [
  { initials: "CG", name: "Candice Wu", preview: "Hey, I had a question about...", time: "1h ago" },
  { initials: "DM", name: "Demi Wilkinson", preview: "Project proposal attached", time: "3h ago" },
  { initials: "NB", name: "Natali Craig", preview: "Re: Follow-up on our meeting", time: "5h ago" },
];

export default function MessageList() {
  return (
    <div>
      {messages.map((m, i) => (
        <div key={i} className="flex items-center justify-between py-3 border-b last:border-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold text-gray-700">
              {m.initials}
            </div>
            <div>
              <p className="font-medium text-gray-800">{m.name}</p>
              <p className="text-sm text-gray-500 truncate w-40">{m.preview}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">{m.time}</p>
        </div>
      ))}
    </div>
  );
}
