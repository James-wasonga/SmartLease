"use client";

import React from "react";

export default function FilterBar() {
  return (
    <div className="bg-white shadow-sm rounded-lg p-4 flex flex-wrap gap-4 items-end">
      {["Transaction Type", "Date Range", "Status", "Smart Account"].map(
        (label, i) => (
          <div key={i}>
            <label className="block text-sm font-medium text-gray-700">
              {label}
            </label>
            <select className="mt-1 block w-40 border border-gray-300 rounded-md shadow-sm p-2 text-sm">
              <option>All</option>
            </select>
          </div>
        )
      )}
      <button className="bg-blue-600 text-white px-4 py-2 rounded-md ml-auto">
        Apply Filters
      </button>
    </div>
  );
}
