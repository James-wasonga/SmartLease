export type TransactionStatus = "Success" | "Pending" | "Failed";

export interface Transaction {
  id: string;
  date: string;
  time: string;
  type: string;
  account: string;
  amount: string;
  status: TransactionStatus;
  txHash: string;
}
