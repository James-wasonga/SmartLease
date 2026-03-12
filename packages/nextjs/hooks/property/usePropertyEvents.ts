import { useCallback, useEffect, useMemo, useState } from "react";
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

// ─── CRITICAL: Do NOT pass fromBlock: 0 anywhere. ────────────────────────────
// All event fetches use the default CONTRACT_DEPLOYMENT_BLOCK defined inside
// PropertyEventService. Passing 0 forces a full chain scan → 429 errors.
// ─────────────────────────────────────────────────────────────────────────────

/* ------------------------- */
/* CORE HOOKS               */
/* ------------------------- */

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
            // ✅ No fromBlock arg — uses CONTRACT_DEPLOYMENT_BLOCK default
            const result = await eventService.getEvents(
                contractName,
                eventName,
                filters,
                undefined, // ← default to CONTRACT_DEPLOYMENT_BLOCK
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

export function useLandlordProperties(landlordAddress?: string) {
    const [properties, setProperties] = useState<PropertyEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProperties = useCallback(async () => {
        if (!landlordAddress) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // ✅ No fromBlock: 0 — uses CONTRACT_DEPLOYMENT_BLOCK default
            const { events: allProperties } = await eventService.getEvents(
                "RentToOwn",
                "PropertyCreated",
                {},
                undefined, // ← CONTRACT_DEPLOYMENT_BLOCK
                "latest",
                1000
            );

            const landlordProps = allProperties.filter(
                p => p.args.landlord?.toLowerCase() === landlordAddress.toLowerCase()
            );

            setProperties(landlordProps);
        } catch (error) {
            console.error("Failed to fetch properties:", error);
        } finally {
            setLoading(false);
        }
    }, [landlordAddress]);

    useEffect(() => {
        fetchProperties();

        // Real-time listener
        const unsubscribe = eventService.onEvent(
            "RentToOwn",
            "PropertyCreated",
            (event) => {
                if (event.args.landlord?.toLowerCase() === landlordAddress?.toLowerCase()) {
                    setProperties(prev => {
                        // Deduplicate by txHash
                        if (prev.some(p => p.txHash === event.txHash)) return prev;
                        return [event, ...prev];
                    });
                }
            }
        );

        return unsubscribe;
    }, [landlordAddress, fetchProperties]);

    return { properties, loading, refresh: fetchProperties };
}

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

export function useRentAnalysis(landlordAddress?: string, year?: number) {
    const [rawData, setRawData] = useState<{month: string, collected: number, expected: number}[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formattedData = useMemo(() => formatRentData(rawData), [rawData]);

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

    return { data: formattedData, rawData, loading, error };
}

/* ------------------------- */
/* PROPERTY TOKEN HOOKS     */
/* ------------------------- */

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
            // ✅ No fromBlock: 0
            const result = await eventService.getEvents(
                contractName,
                eventName,
                filters,
                undefined, // ← CONTRACT_DEPLOYMENT_BLOCK
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

export function usePropertyStats(propertyId?: number) {
    const { timeline } = usePropertyTimeline(propertyId);
    const { data: equityData } = useEquityDistribution(propertyId);
    const { holders } = useTokenHolders(propertyId);

    const createdEvent = timeline.find(e =>
        e.type === "PropertyCreated" && e.contract === "RentToOwn"
    );
    const rentPayments = timeline.filter(e => e.type === "RentPaid" && e.contract === "RentToOwn");
    const equityUpdates = timeline.filter(e => e.type === "EquityUpdated" && e.contract === "RentToOwn");
    const tokenTransfers = timeline.filter(e => e.type === "PropertyTokenTransferred" && e.contract === "PropertyToken");

    const totalRent = rentPayments.reduce((sum, e) => sum + BigInt(e.args.amount || 0), 0n);
    const lastEquity = equityUpdates.at(-1)?.args.newEquity || 0;
    const totalTokens = holders.reduce((sum, h) => sum + h.amount, 0);

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
            percentage: totalTokens > 0 ? (h.amount / totalTokens) * 100 : 0
        })),
        occupancyHistory: timeline.filter(e => e.type === "PropertyOccupied" && e.contract === "RentToOwn"),
        tokenTransfers
    };
}

/* ------------------------- */
/* COMPOSITE DASHBOARD HOOKS */
/* ------------------------- */

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
                // ✅ No fromBlock: 0
                const [{ events: allOccupancies }, { events: allPayments }] = await Promise.all([
                    eventService.getEvents("RentToOwn", "PropertyOccupied", {}, undefined, "latest", 1000),
                    eventService.getEvents("RentToOwn", "RentPaid", {}, undefined, "latest", 1000)
                ]);

                const propertyIds = properties.map(p => String(p.args.propertyId));
                const currentMonth = new Date().toISOString().slice(0, 7);

                const tenants = new Set(
                    allOccupancies
                        .filter(o => propertyIds.includes(String(o.args.propertyId)))
                        .map(o => o.args.tenant)
                );

                const monthlyRent = allPayments
                    .filter(p =>
                        propertyIds.includes(String(p.args.propertyId)) &&
                        p.timestamp &&
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

        const unsubscribes = [
            eventService.onEvent("RentToOwn", "RentPaid", (event) => {
                const eventMonth = event.timestamp
                    ? new Date(event.timestamp * 1000).toISOString().slice(0, 7)
                    : "";
                const currentMonth = new Date().toISOString().slice(0, 7);
                if (eventMonth === currentMonth && properties.some(p => String(p.args.propertyId) === String(event.args.propertyId))) {
                    setStats(prev => ({
                        ...prev,
                        totalRentCollected: prev.totalRentCollected + Number(ethers.formatUnits(event.args.amount, 18))
                    }));
                }
            }),
            eventService.onEvent("RentToOwn", "PropertyOccupied", (event) => {
                if (properties.some(p => String(p.args.propertyId) === String(event.args.propertyId))) {
                    setStats(prev => ({ ...prev, totalTenants: prev.totalTenants + 1 }));
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

export function useTenantDashboard(tenantAddress: string) {
    const { events: rentedProperties } = useContractEvents("RentToOwn", "PropertyOccupied", { tenant: tenantAddress });
    const { events: rentPayments } = useContractEvents("RentToOwn", "RentPaid", { tenant: tenantAddress });
    const { events: equityUpdates } = useContractEvents("RentToOwn", "EquityUpdated", { tenant: tenantAddress });
    const { roles } = useUserRoles(tenantAddress);

    return {
        roles,
        rentedProperties: rentedProperties.map(e => e.args.propertyId),
        rentPayments,
        equityUpdates,
        totalRentPaid: rentPayments.reduce(
            (sum, e) => sum + Number(ethers.formatUnits(e.args.amount, 18)), 0
        ),
        currentEquity: equityUpdates.at(-1)?.args.newEquity || 0
    };
}

export function useAvailableProperties({
    itemsPerPage = 12,
    liveUpdates = true
}: {
    itemsPerPage?: number;
    liveUpdates?: boolean;
} = {}) {
    const [page, setPage] = useState(1);
    const [allProperties, setAllProperties] = useState<PropertyEvent[]>([]);
    const [occupiedIds, setOccupiedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                // ✅ No fromBlock: 0
                const [{ events: properties }, { events: occupied }] = await Promise.all([
                    eventService.getEvents("RentToOwn", "PropertyCreated", {}, undefined, "latest", 5000),
                    eventService.getEvents("RentToOwn", "PropertyOccupied", {}, undefined, "latest", 5000),
                ]);

                setAllProperties(properties);
                // ✅ Use Set<string> to avoid bigint comparison issues
                setOccupiedIds(new Set(occupied.map(e => String(e.args.propertyId))));
            } catch (error) {
                console.error("Initial load failed:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!liveUpdates) return;

        const unsubscribeCreated = eventService.onEvent("RentToOwn", "PropertyCreated", (event) => {
            setAllProperties(prev => {
                if (prev.some(p => p.txHash === event.txHash)) return prev;
                return [...prev, event];
            });
        });

        const unsubscribeOccupied = eventService.onEvent("RentToOwn", "PropertyOccupied", (event) => {
            setOccupiedIds(prev => new Set([...prev, String(event.args.propertyId)]));
        });

        return () => {
            unsubscribeCreated();
            unsubscribeOccupied();
        };
    }, [liveUpdates]);

    const availableProperties = useMemo(() => {
        return allProperties.filter(
            property => !occupiedIds.has(String(property.args.propertyId))
        );
    }, [allProperties, occupiedIds]);

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
        refresh: () => setPage(1)
    };
}

export async function verifyLandlordProperties(landlordAddress: string) {
    try {
        // ✅ No fromBlock: 0
        const { events: allProperties } = await eventService.getEvents(
            "RentToOwn", "PropertyCreated", {}, undefined, "latest", 1000
        );

        console.log("Total PropertyCreated events on chain:", allProperties.length);

        const landlordProps = allProperties.filter(
            p => p.args.landlord?.toLowerCase() === landlordAddress.toLowerCase()
        );

        console.log("Properties for landlord:", landlordProps.length);

        const { events: allOccupancies } = await eventService.getEvents(
            "RentToOwn", "PropertyOccupied", {}, undefined, "latest", 1000
        );

        const relevantOccupancies = allOccupancies.filter(o =>
            landlordProps.some(p => String(p.args.propertyId) === String(o.args.propertyId))
        );

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

export function useRentPayments(filters: {
    landlord?: string;
    propertyId?: number;
    tenant?: string;
} = {}) {
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
    }, [JSON.stringify(filters)]);

    return { payments, loading };
}