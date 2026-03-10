import { PropertyEvent } from "@/services/events/PropertyEvents";

export interface DashboardState {
    property?: PropertyEvent;
    equity: {
      current: number;
      nextVesting?: Date;
      fullOwnership?: Date;
      tier: EquityTier;
    };
    rent: {
      nextPayment?: {
        dueDate: Date;
        amount: number;
      };
      paidThisMonth: boolean;
    };
    paymentHistory?: PaymentRecord[];
}

export interface PaymentRecord {
    date: Date;
    amount: number;
    txHash: string;
    equityEarned: number;
    propertyId: number;
    // sourceEvent: PropertyEvent;
}
  
interface EquityTier {
    name: string;
    color: string;
    progress: number;
}

export interface CalendarMonth {
  month: string; // e.g., "January"
  dueDate: Date;
  // status: 'paid' | 'due' | 'future';
  status: string;
  txHash?: string; // Transaction hash if paid
}


