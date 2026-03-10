import { PropertyEvent } from "@/services/events/PropertyEvents";
import { DashboardState, PaymentRecord } from "@/types/tenant-tpes";
import { ethers } from "ethers";

// utils/dashboardUpdates.ts
import { 
  calculateFullOwnershipDate, 
  getEquityTier

} from "./equityCalculation";

export function updateDashboardOnEquityUpdate(
  prev: DashboardState | undefined,
  event: PropertyEvent
): DashboardState {
  if (!prev || !prev.property) {
    throw new Error("Dashboard state not properly initialized");
  }

  const newEquity = event.args.newEquity;
  const propertyDuration = prev.property.args.duration;
  
  return {
    ...prev,
    equity: {
      current: newEquity,
      nextVesting: calculateNextVesting(prev.paymentHistory || [], propertyDuration),
      fullOwnership: calculateFullOwnershipDate(prev.paymentHistory || [], propertyDuration),
      tier: getEquityTier(newEquity)
    }
  };
}

export function updateDashboardOnPayment(
  prev: DashboardState | undefined,
  event: PropertyEvent
): DashboardState {
  if (!prev || !prev.property) {
    throw new Error("Dashboard state not properly initialized");
  }

  // Create safe payment record
  const paymentDate = new Date(event.timestamp! * 1000);
  const paymentAmount = Number(ethers.formatUnits(event.args.amount, 18));
  
  const newPayment: PaymentRecord = {
    date: paymentDate,
    amount: paymentAmount,
    txHash: event.txHash,
    equityEarned: calculateEquityForPayment(paymentAmount, prev.property),
    propertyId: event.args.propertyId,
  };

  // Update payment history
  const updatedPayments = [newPayment, ...(prev.paymentHistory || [])];
  
  // Recalculate equity
  const paymentCount = updatedPayments.length;
  const newEquity = Math.min(100, (paymentCount / prev.property.args.duration) * 100);

  return {
    ...prev,
    equity: {
      current: newEquity,
      nextVesting: calculateNextVesting(updatedPayments, prev.property.args.duration),
      fullOwnership: calculateFullOwnershipDate(updatedPayments, prev.property.args.duration),
      tier: getEquityTier(newEquity)
    },
    paymentHistory: updatedPayments,
    rent: {
      ...prev.rent,
      paidThisMonth: isCurrentMonth(paymentDate)
    }
  };
}

/**
 * Calculate equity earned from a single payment
 */
function calculateEquityForPayment(
  amount: number, 
  property: PropertyEvent
): number {
  const propertyValue = Number(ethers.formatUnits(property.args.value, 18));
  return (amount / propertyValue) * 100;
} 

export function isCurrentMonth(date: Date): boolean {
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && 
         date.getMonth() === now.getMonth();
}

function calculateNextVesting(payments: PaymentRecord[], duration: number): Date | undefined {
  if (payments.length >= duration) return undefined;
  const lastPayment = payments[0]?.date || new Date();
  return new Date(lastPayment.setMonth(lastPayment.getMonth() + 1));
}