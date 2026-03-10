import { useEffect, useMemo, useState } from "react";
// import { PropertyEventService } from "./propertyEvents";
import { ContractName, PropertyEvent, PropertyEventService } from "@/services/events/PropertyEvents";
import { IdentityProviderContract, PropertyTokenContract, RenToOwnAddress } from "@/constants/contract-address";
import { RentToOwnABI } from "@/abi/RentToOwn";
import { PropertyTokenABI } from "@/abi/PropertyToken";
import { IdentityRegistryABI } from "@/abi/IdentityRegistery";
import { ethers } from "ethers";
import { formatRentData } from "@/utils/formatter";

export const eventService = new PropertyEventService(
  RenToOwnAddress,
  RentToOwnABI,
  PropertyTokenContract,
  PropertyTokenABI,
  IdentityProviderContract,
  IdentityRegistryABI
);

export type FormattedRentData = {
    month: string;
    monthName: string;
    year: number;
    collected: number;
    expected: number;
  };

/* ------------------------- */
/* CORE HOOKS               */
/* ------------------------- */

// useContractEvents
// Purpose: Generic event fetcher for any contract/event
// Best for: Custom event queries with pagination
export function useContractEvents(
    contractName: ContractName,
    eventName: string,
    filters = {},
    pageSize = 10
) {
    const [page, setPage] = useState(1);
    const [data, setData] = useState<{ events: PropertyEvent[]; total: number }>({
        events: [],
        total: 0,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
        setLoading(true);
        const result = await eventService.getEvents(
            contractName,
            eventName,
            filters,
            0,
            "latest",
            pageSize,
            page
        );
        setData(result);
        setLoading(false);
        };
        fetch();
    }, [contractName, eventName, JSON.stringify(filters), page, pageSize]);

    return { ...data, loading, page, setPage };
}

// Purpose: Real-time event listening
// Best for: Notifications, live updates
export function useLiveEvents(
    contractName: ContractName,
    eventName: string,
    filters = {}
) {
    const [events, setEvents] = useState<PropertyEvent[]>([]);

    useEffect(() => {
        const unsubscribe = eventService.onEvent(
        contractName,
        eventName,
        (event) => {
            setEvents((prev) => [event, ...prev.slice(0, 49)]);
        },
        filters
        );

        return unsubscribe;
    }, [contractName, eventName, JSON.stringify(filters)]);

    return events;
}

/* ------------------------- */
/* RENT TO OWN HOOKS        */
/* ------------------------- */

// Purpose: List all properties owned by a landlord
// Best for: Landlord portfolio view
export function useLandlordProperties(landlordAddress?: string) {
    const [properties, setProperties] = useState<PropertyEvent[]>([]);
    const [loading, setLoading] = useState(true);
  
    useEffect(() => {
      if (!landlordAddress) {
        setLoading(false);
        return;
      }
  
      const fetchProperties = async () => {
        setLoading(true);
        try {
          // First get ALL properties without filtering
          const { events: allProperties } = await eventService.getEvents(
            "RentToOwn",
            "PropertyCreated",
            {}, // No filters here
            0,
            "latest",
            1000 // High limit to get all
          );
  
          // Then filter client-side
          const landlordProps = allProperties.filter(
            p => p.args.landlord.toLowerCase() === landlordAddress.toLowerCase()
          );
  
          setProperties(landlordProps);
        } catch (error) {
          console.error("Failed to fetch properties:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchProperties();
  
      // Real-time listener for new properties
      const unsubscribe = eventService.onEvent(
        "RentToOwn",
        "PropertyCreated",
        (event) => {
          if (event.args.landlord.toLowerCase() === landlordAddress.toLowerCase()) {
            setProperties(prev => [event, ...prev]);
          }
        }
      );
  
      return unsubscribe;
    }, [landlordAddress]);
  
    return { properties, loading };
  }

// Purpose: Show tenant assignments per property
// Best for: Landlord tenant management
export function useTenantAssignment(landlordAddress: string) {
    const [assignments, setAssignments] = useState<{propertyId: number, tenants: string[]}[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const data = await eventService.getTenantAssignments(landlordAddress);
            setAssignments(data);
            setLoading(false);
        };
        load();
    }, [landlordAddress]);

    return { assignments, loading };
}

// Purpose: Monthly rent collection vs expected
// Best for: Revenue dashboards
export function useRentAnalysis(landlordAddress?: string, year?: number) {
    const [rawData, setRawData] = useState<{month: string, collected: number, expected: number}[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
    // Formatted version of the data
    const formattedData = useMemo(() => {
      return formatRentData(rawData);
    }, [rawData]);
  
    useEffect(() => {
      const fetchData = async () => {
        if (!landlordAddress) {
          setError("Connect your wallet to view data");
          return;
        }
  
        setLoading(true);
        try {
          const analysis = await eventService.getRentAnalysis(
            landlordAddress, 
            year || new Date().getFullYear()
          );
          setRawData(analysis);
        } catch (e) {
          setError("Failed to load rent data");
        } finally {
          setLoading(false);
        }
      };
  
      fetchData();
    }, [landlordAddress, year]);
  
    return { 
      data: formattedData, 
      rawData, // Keep original if needed
      loading, 
      error 
    };
}

/* ------------------------- */
/* PROPERTY TOKEN HOOKS     */
/* ------------------------- */

// Purpose: List token holders for a property
// Best for: Ownership breakdown
export function useTokenHolders(tokenId?: number) {
    const [holders, setHolders] = useState<{address: string, amount: number}[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!tokenId) return;
        const load = async () => {
            setLoading(true);
            const data = await eventService.getTokenHolders(tokenId);
            setHolders(data);
            setLoading(false);
        };
        load();
    }, [tokenId]);

    return { holders, loading };
}

// Purpose: Percentage ownership visualization
// Best for: Pie charts
export function useTokenDistribution(tokenId?: number) {
    const [distribution, setDistribution] = useState<{holder: string, percentage: number}[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!tokenId) return;
        const load = async () => {
            setLoading(true);
            const data = await eventService.getTokenDistribution(tokenId);
            setDistribution(data);
            setLoading(false);
        };
        load();
    }, [tokenId]);

    return { distribution, loading };
}

/* ------------------------- */
/* IDENTITY PROVIDER HOOKS  */
/* ------------------------- */

// Purpose: Check user permissions
// Best for: Role-based UI
export function useUserRoles(userAddress?: string) {
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!userAddress) return;
        const load = async () => {
            setLoading(true);
            const data = await eventService.getUserRoles(userAddress);
            setRoles(data);
            setLoading(false);
        };
        load();
    }, [userAddress]);

    return { roles, loading };
}

/* ------------------------- */
/* CROSS-CONTRACT HOOKS     */
/* ------------------------- */

// Purpose: All stats for a single property
// Best for: Property detail pages
export function usePropertyTimeline(propertyId?: number) {
    const [timeline, setTimeline] = useState<PropertyEvent[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!propertyId) return;
        const load = async () => {
            setLoading(true);
            const data = await eventService.getPropertyTimeline(propertyId);
            setTimeline(data);
            setLoading(false);
        };
        load();
    }, [propertyId]);

    return { timeline, loading };
}

// Purpose: Monthly equity growth tracking
// Best for: Tenant equity progress
export function useEquityDistribution(propertyId?: number, year: number = new Date().getFullYear()) {
  const [data, setData] = useState<{ month: string, equity: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
      if (!propertyId) return;

      const load = async () => {
          try {
              setLoading(true);
              setError(null);
              const distribution = await eventService.getEquityDistribution(propertyId, year);
              setData(distribution);
          } catch (err) {
              setError(err as Error);
          } finally {
              setLoading(false);
          }
      };

      load();
  }, [propertyId, year]);

  return { data, loading, error };
}

// Generic Hooks
// Purpose: Fetch events from any contract with pagination controls
// Best For:
// Large event lists (transaction histories, activity feeds)
// Tables with server-side style pagination
// Memory-efficient data loading
export function usePaginatedEvents(
    contractName: ContractName,
    eventName: string,
    filters = {},
    pageSize = 10
) {
    const [page, setPage] = useState(1);
    const [data, setData] = useState<{ events: PropertyEvent[]; total: number }>({
        events: [],
        total: 0,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            setLoading(true);
            const result = await eventService.getEvents(
                contractName,
                eventName,
                filters,
                0,
                "latest",
                pageSize,
                page
            );
            setData(result);
            setLoading(false);
        };
        fetch();
    }, [contractName, eventName, JSON.stringify(filters), page, pageSize]);

    return { ...data, loading, page, setPage };
}
// Purpose: All stats for a single property
// Best for: Property detail pages
export function usePropertyStats(propertyId?: number) {
    const { timeline } = usePropertyTimeline(propertyId);
    const { data: equityData } = useEquityDistribution(propertyId);
    const { holders } = useTokenHolders(propertyId);
    
    // Get property creation details
    const createdEvent = timeline.find(e => 
        e.type === "PropertyCreated" && e.contract === "RentToOwn"
    );
    
    // Filter relevant events
    const rentPayments = timeline.filter(e => 
        e.type === "RentPaid" && e.contract === "RentToOwn"
    );
    const equityUpdates = timeline.filter(e => 
        e.type === "EquityUpdated" && e.contract === "RentToOwn"
    );
    const tokenTransfers = timeline.filter(e => 
        e.type === "PropertyTokenTransferred" && e.contract === "PropertyToken"
    );
    
    // Calculate statistics
    const totalRent = rentPayments.reduce(
        (sum, e) => sum + BigInt(e.args.amount || 0), 
        0n
    );
    
    const lastEquity = equityUpdates.at(-1)?.args.newEquity || 0;
    const totalTokens = holders.reduce(
        (sum, h) => sum + h.amount, 
        0
    );

    return {
        propertyDetails: createdEvent?.args,
        totalRent: Number(ethers.formatUnits(totalRent, 18)),
        currentEquity: lastEquity,
        totalTokens,
        paymentHistory: rentPayments,
        equityHistory: equityUpdates,
        equityDistribution: equityData,
        tokenDistribution: holders.map(h => ({
            holder: h.address,
            percentage: (h.amount / totalTokens) * 100
        })),
        occupancyHistory: timeline.filter(e => 
            e.type === "PropertyOccupied" && e.contract === "RentToOwn"
        ),
        tokenTransfers
    };
}

/* ------------------------- */
/* COMPOSITE DASHBOARD HOOKS */
/* ------------------------- */
// Purpose: All landlord-facing data
// Best for: Main landlord view
export function useLandlordDashboard(landlordAddress?: string) {
    const { properties, loading: propertiesLoading } = useLandlordProperties(landlordAddress);
    const [stats, setStats] = useState({
      totalRentCollected: 0,
      totalTenants: 0,
      loading: true
    });
  
    useEffect(() => {
      if (!landlordAddress || propertiesLoading || properties.length === 0) {
        setStats(prev => ({ ...prev, loading: propertiesLoading }));
        return;
      }
  
      const calculateStats = async () => {
        try {
          // Get ALL events first (like verifyLandlordProperties)
          const [{ events: allOccupancies }, { events: allPayments }] = await Promise.all([
            eventService.getEvents("RentToOwn", "PropertyOccupied", {}, 0, "latest", 1000),
            eventService.getEvents("RentToOwn", "RentPaid", {}, 0, "latest", 1000)
          ]);
  
          const propertyIds = properties.map(p => p.args.propertyId);
          const currentMonth = new Date().toISOString().slice(0, 7);
  
          // Calculate tenants
          const tenants = new Set(
            allOccupancies
              .filter(o => propertyIds.includes(o.args.propertyId))
              .map(o => o.args.tenant)
          );
  
          // Calculate current month rent
          const monthlyRent = allPayments
            .filter(p => 
              propertyIds.includes(p.args.propertyId) &&
              //@ts-ignore
              new Date(p.timestamp * 1000).toISOString().slice(0, 7) === currentMonth
            )
            .reduce((sum, p) => sum + Number(ethers.formatUnits(p.args.amount, 18)), 0);
  
          setStats({
            totalRentCollected: monthlyRent,
            totalTenants: tenants.size,
            loading: false
          });
  
        } catch (error) {
          console.error("Failed to calculate stats:", error);
          setStats(prev => ({ ...prev, loading: false }));
        }
      };
  
      calculateStats();
  
      // Real-time listeners
      const unsubscribes = [
        eventService.onEvent("RentToOwn", "RentPaid", (event) => {
            //@ts-ignore
          const eventMonth = new Date(event.timestamp * 1000).toISOString().slice(0, 7);
          const currentMonth = new Date().toISOString().slice(0, 7);
          if (eventMonth === currentMonth && properties.some(p => p.args.propertyId === event.args.propertyId)) {
            setStats(prev => ({
              ...prev,
              totalRentCollected: prev.totalRentCollected + Number(ethers.formatUnits(event.args.amount, 18))
            }));
          }
        }),
        eventService.onEvent("RentToOwn", "PropertyOccupied", (event) => {
          if (properties.some(p => p.args.propertyId === event.args.propertyId)) {
            setStats(prev => ({
              ...prev,
              totalTenants: prev.totalTenants + 1
            }));
          }
        })
      ];
  
      return () => unsubscribes.forEach(unsub => unsub());
    }, [landlordAddress, properties, propertiesLoading]);
  
    return {
      totalProperties: properties.length,
      recentProperties: properties.slice(0, 3),
      ...stats,
      loading: propertiesLoading || stats.loading
    };
  }
// Purpose: All tenant-facing data
// Best for: Tenant portal
export function useTenantDashboard(tenantAddress: string) {
    const { events: rentedProperties } = useContractEvents(
        "RentToOwn",
        "PropertyOccupied",
        { tenant: tenantAddress }
    );
    
    const { events: rentPayments } = useContractEvents(
        "RentToOwn",
        "RentPaid",
        { tenant: tenantAddress }
    );
    
    const { events: equityUpdates } = useContractEvents(
        "RentToOwn",
        "EquityUpdated",
        { tenant: tenantAddress }
    );
    
    const { roles } = useUserRoles(tenantAddress);

    return {
        roles,
        rentedProperties: rentedProperties.map(e => e.args.propertyId),
        rentPayments,
        equityUpdates,
        totalRentPaid: rentPayments.reduce(
            (sum, e) => sum + Number(ethers.formatUnits(e.args.amount, 18)),
            0
        ),
        currentEquity: equityUpdates.at(-1)?.args.newEquity || 0
    };
}

// Browse public properties
export function useAvailableProperties({
    itemsPerPage = 12,
    liveUpdates = true
}: {
    itemsPerPage?: number;
    liveUpdates?: boolean;
} = {}) {
    const [page, setPage] = useState(1);
    const [allProperties, setAllProperties] = useState<PropertyEvent[]>([]);
    const [occupiedIds, setOccupiedIds] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    // Fetch initial data
    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
        
        try {
            const [{ events: properties }, { events: occupied }] = await Promise.all([
                eventService.getEvents("RentToOwn", "PropertyCreated", {}, 0, "latest", 5000),
                eventService.getEvents("RentToOwn", "PropertyOccupied", {}, 0, "latest", 5000),
            ]);

            setAllProperties(properties);
            setOccupiedIds(new Set(occupied.map(e => e.args.propertyId)));
            setTotal(properties.length);
        } catch (error) {
            console.error("Initial load failed:", error);
        } finally {
            setLoading(false);
        }
    };

    fetchInitialData();
    }, []);

    // Set up live listeners
    useEffect(() => {
        if (!liveUpdates) return;

        const unsubscribeCreated = eventService.onEvent(
            "RentToOwn",
            "PropertyCreated",
            (event) => {
            setAllProperties(prev => [...prev, event]);
            setTotal(prev => prev + 1);
            }
        );
    
        const unsubscribeOccupied = eventService.onEvent(
                "RentToOwn",
                "PropertyOccupied",
                (event) => {
                setOccupiedIds(prev => new Set(prev.add(event.args.propertyId)));
                }
        );

        return () => {
            unsubscribeCreated();
            unsubscribeOccupied();
        };
    }, [liveUpdates]);

    // Calculate available properties
    const availableProperties = useMemo(() => {
        return allProperties.filter(
            property => !occupiedIds.has(property.args.propertyId)
        );
    }, [allProperties, occupiedIds]);

    // Paginate results
    const paginatedResults = useMemo(() => {
        const start = (page - 1) * itemsPerPage;
        return availableProperties.slice(start, start + itemsPerPage);
    }, [availableProperties, page, itemsPerPage]);

    return {
        properties: paginatedResults,
        loading,
        page,
        setPage,
        totalPages: Math.ceil(availableProperties.length / itemsPerPage),
        totalProperties: availableProperties.length,
        refresh: () => setPage(1) // Reset to first page
    };
}

export async function verifyLandlordProperties(landlordAddress: string) {
    try {
      // 1. Get all PropertyCreated events
      const { events: allProperties } = await eventService.getEvents(
        "RentToOwn",
        "PropertyCreated",
        {}, // No filters initially
        0,
        "latest",
        1000
      );
  
      console.log("Total properties on chain:", allProperties.length);
      
      // 2. Filter for this landlord
      const landlordProps = allProperties.filter(
        p => p.args.landlord.toLowerCase() === landlordAddress.toLowerCase()
      );
  
      console.log("Properties for landlord:", landlordProps.length);
      console.log("Property IDs:", landlordProps.map(p => p.args.propertyId));
  
      // 3. Check PropertyOccupied events
      const { events: allOccupancies } = await eventService.getEvents(
        "RentToOwn",
        "PropertyOccupied",
        {},
        0,
        "latest",
        1000
      );
  
      const relevantOccupancies = allOccupancies.filter(o =>
        landlordProps.some(p => p.args.propertyId === o.args.propertyId)
      );
  
      console.log("Relevant occupancies:", relevantOccupancies.length);
  
      return {
        totalProperties: landlordProps.length,
        propertyIds: landlordProps.map(p => p.args.propertyId),
        tenants: [...new Set(relevantOccupancies.map(o => o.args.tenant))]
      };
    } catch (error) {
      console.error("Verification failed:", error);
      return null;
    }
  }
  

  export function useRentPayments(
    filters: {
      landlord?: string;
      propertyId?: number;
      tenant?: string;
    } = {}
  ) {
    const [payments, setPayments] = useState<PropertyEvent[]>([]);
    const [loading, setLoading] = useState(false);
  
    useEffect(() => {
      const fetchPayments = async () => {
        setLoading(true);
        try {
          const payments = await eventService.getRentPaymentHistory(filters);
          setPayments(payments);
        } catch (error) {
          console.error("Failed to fetch payments:", error);
        } finally {
          setLoading(false);
        }
      };
  
      fetchPayments();
    }, [JSON.stringify(filters)]); // Re-run when filters change
  
    return { payments, loading };
  }