'use client'

import FilterBar from "@/components/FilterBar";
import TransactionTable from "@/components/TransactionTable";
import { Transaction } from "@/types/transaction";

const mockTransactions: Transaction[] = [
  {
    id: "1",
    date: "2023-05-30",
    time: "16:23:15 UTC",
    type: "Mint",
    account: "Main Account",
    amount: "0.25 ETH",
    status: "Success",
    txHash: "8x67c1abc92b",
  },
  {
    id: "2",
    date: "2023-05-29",
    time: "07:21:47 UTC",
    type: "Rent",
    account: "Rental Account",
    amount: "0.50 ETH",
    status: "Success",
    txHash: "8x9c3f5f1cf",
  },
  {
    id: "3",
    date: "2023-05-28",
    time: "14:02:53 UTC",
    type: "Equity",
    account: "Investment Account",
    amount: "+2.5%",
    status: "Success",
    txHash: "8x64f12a3ff",
  },
  {
    id: "4",
    date: "2023-05-28",
    time: "10:45:03 UTC",
    type: "Transfer",
    account: "Main Account",
    amount: "0.75 ETH",
    status: "Pending",
    txHash: "8x69ff21ddf",
  },
  {
    id: "5",
    date: "2023-05-27",
    time: "22:18:55 UTC",
    type: "Swap",
    account: "Main Account",
    amount: "1.2 ETH → 2400 USDC",
    status: "Success",
    txHash: "8x94b63f1de",
  },
  {
    id: "6",
    date: "2023-05-27",
    time: "16:02:13 UTC",
    type: "Rent",
    account: "Rental Account",
    amount: "0.30 ETH",
    status: "Failed",
    txHash: "8x76c7a42b",
  },
];

export default function TransactionsPage() {
  return (
    <div className="px-6 py-10 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-1">Transaction Logs</h1>
      <p className="text-gray-500 mb-6 text-sm">
        View and filter your smart contract interactions, rent payments, equity
        updates, and wallet actions.
      </p>

      <FilterBar />
      <TransactionTable transactions={mockTransactions} />
    </div>
  );
}
