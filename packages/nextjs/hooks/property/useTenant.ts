import { PropertyEvent } from "@/services/events/PropertyEvents";
import { CalendarMonth } from "@/types/tenant-tpes";
import { isCurrentMonth } from "@/utils/dashboardUpdates";
import { getEquityTier } from "@/utils/equityCalculation";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import { eventService } from "./usePropertyEvents";

function calculateNextPayment(payments: PropertyEvent[], property: PropertyEvent) {
    const duration = property.args.duration;
    if (payments.length >= duration) return undefined;

    const lastPayment = payments[0]?.timestamp 
        ? new Date(payments[0].timestamp * 1000)
        : new Date();

    return {
        dueDate: new Date(lastPayment.setMonth(lastPayment.getMonth() + 1)),
        amount: Number(ethers.formatUnits(property.args.value, 18)) / 12
    };
}

// Equity vesting logic
export function usePaymentCalendar(tenantAddress: string, propertyId: number) {
  const [calendar, setCalendar] = useState<CalendarMonth[]>([]);

  useEffect(() => {
    const loadCalendar = async () => {
      try {
        // 1. Get property with timestamp validation
        const { events } = await eventService.getEvents(
          "RentToOwn",
          "PropertyCreated",
          { propertyId },
          0,
          "latest",
          1
        );
        const property = events[0];
        if (!property || !property.timestamp) {
          console.error("Property missing timestamp");
          return;
        }
        const propertyDate = new Date(property.timestamp * 1000);

        // 2. Get payments with safe access
        const payments = await eventService.getTenantPaymentHistory(tenantAddress, propertyId);
        
        // 3. Generate calendar with safe date handling
        const duration = property.args.duration;
        const calendarData = Array.from({ length: duration }, (_, i) => {
          const monthDate = new Date(propertyDate);
          monthDate.setMonth(propertyDate.getMonth() + i);
          
          const payment = payments.find(p => {
            const paymentDate = p.timestamp ? new Date(p.timestamp * 1000) : null;
            return paymentDate && 
                   paymentDate.getFullYear() === monthDate.getFullYear() && 
                   paymentDate.getMonth() === monthDate.getMonth();
          });

          return {
            month: monthDate.toLocaleString('default', { month: 'long' }),
            dueDate: new Date(monthDate.setDate(15)),
            status: payment ? 'paid' : 
                    monthDate < new Date() ? 'due' : 'future',
            txHash: payment?.txHash
          };
        });

        setCalendar(calendarData);
      } catch (error) {
        console.error("Failed to generate calendar:", error);
      }
    };

    loadCalendar();
  }, [tenantAddress, propertyId]);

  return calendar;
}


export function usePropertyEvent(propertyId?: number) {
  const [data, setData] = useState<PropertyEvent>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!propertyId) return;

    const fetchProperty = async () => {
      try {
        setLoading(true);
        setError(null);
        const { events } = await eventService.getEvents(
          "RentToOwn",
          "PropertyCreated",
          { propertyId },
          0,
          "latest",
          1
        );
        const propertyEvent = events?.[0];
        if (!propertyEvent || !propertyEvent.timestamp) {
          throw new Error("Property missing or invalid");
        }
        setData(propertyEvent);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [propertyId]);

  return { data, loading, error };
}

export function useTenantPayments(address?: string, propertyId?: number) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address || !propertyId) return;

    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const history = await eventService.getTenantPaymentHistory(address, propertyId);
        const mapped = history.map((p) => {
          const date = p.timestamp ? new Date(p.timestamp * 1000) : null;
          return {
            date,
            amount: Number(ethers.formatUnits(p.args.amount, 18)),
            txHash: p.txHash,
            equityEarned: 0,
            propertyId: p.args.propertyId,
            sourceEvent: p,
          };
        });
        setData(mapped);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [address, propertyId]);

  return { data, loading, error };
}

export function useTenantEquity(address?: string, propertyId?: number) {
  const [data, setData] = useState({
    current: 0,
    tier: getEquityTier(0),
  });
  const [loading, setLoading] = useState(false); // Optional: simulate equity load
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!address || !propertyId) return;

    setLoading(true);
    try {
      const unsub = eventService.onEvent("RentToOwn", "EquityUpdated", (event) => {
        if (event.args.tenant === address && event.args.propertyId === propertyId) {
          const current = Number(event.args.equity);
          setData({ current, tier: getEquityTier(current) });
        }
      });

      setError(null);
      setLoading(false);
      return () => unsub();
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  }, [address, propertyId]);

  return { data, loading, error };
}

export function useTenantRentStatus(payments: any[], property?: any) {
  const loading = !property || !payments;
  const error = null; // No async error here

  const data = loading
    ? undefined
    : {
        nextPayment: calculateNextPayment(payments, property),
        paidThisMonth: payments.some((p) => p.date && isCurrentMonth(p.date)),
      };

  return { data, loading, error };
}