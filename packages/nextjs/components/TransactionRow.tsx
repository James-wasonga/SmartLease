import { Transaction } from "@/types/transaction";
import React from "react";

export default function TransactionRow({
  transaction,
}: {
  transaction: Transaction;
}) {
  const statusColor = {
    Success: "text-green-600",
    Pending: "text-yellow-600",
    Failed: "text-red-600",
  };

  return (
    <tr className="border-b">
      <td className="px-6 py-4">
        {transaction.date} <br />
        <span className="text-xs text-gray-400">{transaction.time}</span>
      </td>
      <td className="px-6 py-4">{transaction.type}</td>
      <td className="px-6 py-4">{transaction.account}</td>
      <td className="px-6 py-4">{transaction.amount}</td>
      <td
        className={`px-6 py-4 font-medium ${statusColor[transaction.status]}`}
      >
        {transaction.status}
      </td>
      <td className="px-6 py-4">
        {transaction.txHash.slice(0, 6)}...{transaction.txHash.slice(-4)}
      </td>
      <td className="px-6 py-4 flex gap-2">
        <button className="text-blue-500 hover:underline text-sm">Copy</button>
        <button className="text-blue-500 hover:underline text-sm">View</button>
      </td>
    </tr>
  );
}
