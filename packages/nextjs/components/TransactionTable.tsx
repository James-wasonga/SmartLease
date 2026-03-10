import TransactionRow from "./TransactionRow";
import { Transaction } from "@/types/transaction";
import React from "react";

export default function TransactionTable({
  transactions,
}: {
  transactions: Transaction[];
}) {
  return (
    <div className="overflow-x-auto mt-6 bg-white rounded-lg shadow-sm">
      <table className="min-w-full table-auto">
        <thead className="text-xs uppercase bg-gray-50 text-gray-500">
          <tr>
            <th className="px-6 py-3 text-left">Date</th>
            <th className="px-6 py-3 text-left">Type</th>
            <th className="px-6 py-3 text-left">Smart Account</th>
            <th className="px-6 py-3 text-left">Amount</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">TX Hash</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody className="text-sm text-gray-700">
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} transaction={tx} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
