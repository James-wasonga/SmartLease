import React from "react";

export default function StatusBadge({ status }: { status: string }) {
  const color =
    {
      Active: "bg-green-500",
      Pending: "bg-yellow-500",
      "Fully Owned": "bg-purple-600",
    }[status] || "bg-gray-400";

  return (
    <span className={`text-white text-xs px-2 py-1 rounded-full ${color}`}>
      {status}
    </span>
  );
}
