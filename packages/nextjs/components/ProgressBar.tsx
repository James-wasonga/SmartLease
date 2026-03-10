import React from "react";

export default function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-full bg-gray-200 h-2 rounded-full mt-1">
      <div
        className="h-2 bg-blue-600 rounded-full"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
