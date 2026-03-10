"use client";

import React from "react";

interface DropdownFilterProps {
  label: string;
  options: string[];
}

export default function DropdownFilter({
  label,
  options,
}: DropdownFilterProps) {
  return (
    <div>
      <label className="text-sm text-gray-600">{label}</label>
      <select className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
        {options.map((opt) => (
          <option key={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
