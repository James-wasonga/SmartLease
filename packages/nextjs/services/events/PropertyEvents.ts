import {
    Contract,
    ethers,
    EventLog,
    JsonRpcProvider,
    InterfaceAbi,
    WebSocketProvider,
  } from "ethers";
  
  export type ContractName = "RentToOwn" | "PropertyToken" | "IdentityProvider";
  
  export type PropertyEvent = {
    type: string;
    contract: ContractName;
    blockNumber: number;
    txHash: string;
    timestamp?: number;
    args: Record<string, any>;
  };
  
  const PROVIDER = new JsonRpcProvider(`https://rpc.sepolia-api.lisk.com`);
  
  // ─────────────────────────────────────────────────────────────────────────────
  // CRITICAL: Set this to the block your contracts were deployed on.
  // Without this the code scans millions of blocks → 429 Too Many Requests.
  //
  // How to find it (takes 30 seconds):
  //   1. Open https://sepolia-blockscout.lisk.com
  //   2. Search: 0xc3CFC8b21B2fbC5e2769b2B531cc35b237c1Eb68
  //   3. Click "Contract Creation" transaction → note the Block number
  //   4. Replace the number below with that block number
  // ─────────────────────────────────────────────────────────────────────────────
  const CONTRACT_DEPLOYMENT_BLOCK = 33917945; // ← REPLACE THIS with your real deployment block
  
  // Keep chunks large enough to cover your entire contract history in 1-2 calls
  const MAX_BLOCK_RANGE = 100_000;
  
  // ─── CACHES ──────────────────────────────────────────────────────────────────
  // Event cache: avoids re-fetching on every component re-render
  const eventCache = new Map<string, { events: PropertyEvent[]; cachedAt: number }>();
  const EVENT_CACHE_TTL = 60_000; // 60 seconds
  
  // Block timestamp cache: avoids one RPC call per event log (the #1 cause of 429s)
  const blockTimestampCache = new Map<number, number>();
  // ─────────────────────────────────────────────────────────────────────────────
  
  export class PropertyEventService {
    private readonly rentToOwnAddress: string;
    private readonly rentToOwnAbi: InterfaceAbi;
    private readonly propertyTokenAddress: string;
    private readonly propertyTokenAbi: InterfaceAbi;
    private readonly identityProviderAddress: string;
    private readonly identityProviderAbi: InterfaceAbi;
  
    private contracts: Record<ContractName, Contract>;
    private wsProvider: WebSocketProvider | null = null;
    private wsContracts: Record<ContractName, Contract> | null = null;
    private latestBlockCache: { block: number; fetchedAt: number } | null = null;
  
    constructor(
      rentToOwnAddress: string,
      rentToOwnAbi: InterfaceAbi,
      propertyTokenAddress: string,
      propertyTokenAbi: InterfaceAbi,
      identityProviderAddress: string,
      identityProviderAbi: InterfaceAbi
    ) {
      this.rentToOwnAddress = rentToOwnAddress;
      this.rentToOwnAbi = rentToOwnAbi;
      this.propertyTokenAddress = propertyTokenAddress;
      this.propertyTokenAbi = propertyTokenAbi;
      this.identityProviderAddress = identityProviderAddress;
      this.identityProviderAbi = identityProviderAbi;
  
      this.contracts = {
        RentToOwn: new Contract(rentToOwnAddress, rentToOwnAbi, PROVIDER),
        PropertyToken: new Contract(propertyTokenAddress, propertyTokenAbi, PROVIDER),
        IdentityProvider: new Contract(identityProviderAddress, identityProviderAbi, PROVIDER),
      };
    }
  
    // ─── WEBSOCKET ─────────────────────────────────────────────────────────────
  
    private initializeWebSocket() {
      if (typeof window === "undefined") return; // SSR guard
      try {
        if (!this.wsProvider) {
          this.wsProvider = new WebSocketProvider(`wss://rpc.sepolia-api.lisk.com`);
          this.wsProvider.websocket.addEventListener("error", () => {
            // Silently clean up on WS error — live updates are non-critical
            this.wsProvider = null;
            this.wsContracts = null;
          });
        }
        if (!this.wsContracts && this.wsProvider) {
          this.wsContracts = {
            RentToOwn: new Contract(this.rentToOwnAddress, this.rentToOwnAbi, this.wsProvider),
            PropertyToken: new Contract(this.propertyTokenAddress, this.propertyTokenAbi, this.wsProvider),
            IdentityProvider: new Contract(this.identityProviderAddress, this.identityProviderAbi, this.wsProvider),
          };
        }
      } catch {
        // WebSocket unavailable — fall back to polling gracefully
        this.wsProvider = null;
        this.wsContracts = null;
      }
    }
  
    private getWsContracts(): Record<ContractName, Contract> | null {
      this.initializeWebSocket();
      return this.wsContracts;
    }
  
    private async getLatestBlock(): Promise<number> {
      const now = Date.now();
      if (this.latestBlockCache && now - this.latestBlockCache.fetchedAt < 30_000) {
        return this.latestBlockCache.block;
      }
      const block = await PROVIDER.getBlockNumber();
      this.latestBlockCache = { block, fetchedAt: now };
      return block;
    }
  
    // ─── CORE: getEvents ───────────────────────────────────────────────────────
  
    async getEvents(
      contractName: ContractName,
      eventName: string,
      filters: Record<string, any> = {},
      fromBlock: number = CONTRACT_DEPLOYMENT_BLOCK,
      toBlock: number | string = "latest",
      pageSize = 50,
      page = 1
    ): Promise<{ events: PropertyEvent[]; total: number }> {
      try {
        const contract = this.contracts[contractName];
        const cacheKey = `${contractName}:${eventName}`;
  
        let validEvents: PropertyEvent[];
        const cached = eventCache.get(cacheKey);
        const now = Date.now();
  
        if (cached && now - cached.cachedAt < EVENT_CACHE_TTL) {
          validEvents = cached.events;
        } else {
          // Always fetch with no filter args — filter client-side to avoid
          // indexed param ordering issues on Lisk Sepolia RPC
          const eventFilter = contract.filters[eventName]();
          const resolvedTo = toBlock === "latest" ? await this.getLatestBlock() : Number(toBlock);
  
          // Fetch all logs in chunks
          const allLogs: EventLog[] = [];
          for (let start = fromBlock; start <= resolvedTo; start += MAX_BLOCK_RANGE) {
            const end = Math.min(start + MAX_BLOCK_RANGE - 1, resolvedTo);
            try {
              const chunk = (await contract.queryFilter(eventFilter, start, end)) as EventLog[];
              allLogs.push(...chunk);
            } catch (err) {
              console.warn(`Chunk [${start}-${end}] failed, retrying once...`);
              // Single retry after 1 second
              await new Promise((r) => setTimeout(r, 1000));
              try {
                const chunk = (await contract.queryFilter(eventFilter, start, end)) as EventLog[];
                allLogs.push(...chunk);
              } catch (retryErr) {
                console.error(`Chunk [${start}-${end}] failed after retry:`, retryErr);
              }
            }
          }
  
          // Batch-fetch timestamps: collect unique block numbers first,
          // then fetch them all in parallel — NOT one-per-log.
          // This is the fix for the 429 flood: instead of N RPC calls for N events,
          // we make at most M calls for M unique blocks (M << N).
          const uniqueBlocks = [...new Set(allLogs.map((l) => l.blockNumber))].filter(
            (b) => !blockTimestampCache.has(b)
          );
  
          if (uniqueBlocks.length > 0) {
            // Fetch in batches of 10 to stay under rate limits
            const BATCH_SIZE = 10;
            for (let i = 0; i < uniqueBlocks.length; i += BATCH_SIZE) {
              const batch = uniqueBlocks.slice(i, i + BATCH_SIZE);
              await Promise.all(
                batch.map(async (blockNum) => {
                  try {
                    const block = await PROVIDER.getBlock(blockNum);
                    if (block?.timestamp) {
                      blockTimestampCache.set(blockNum, block.timestamp);
                    }
                  } catch {
                    blockTimestampCache.set(blockNum, 0);
                  }
                })
              );
              // Small pause between batches to avoid 429
              if (i + BATCH_SIZE < uniqueBlocks.length) {
                await new Promise((r) => setTimeout(r, 200));
              }
            }
          }
  
          // Parse all logs using the cached timestamps
          const parsed = allLogs
            .map((log) => this.parseEventSync(contractName, log, eventName))
            .filter(Boolean) as PropertyEvent[];
  
          validEvents = parsed;
          eventCache.set(cacheKey, { events: validEvents, cachedAt: now });
        }
  
        // Client-side filter
        const filtered =
          Object.keys(filters).length > 0
            ? validEvents.filter((event) =>
                Object.entries(filters).every(([key, value]) => {
                  const eventVal = event.args[key];
                  if (eventVal === undefined) return false;
                  return String(eventVal).toLowerCase() === String(value).toLowerCase();
                })
              )
            : validEvents;
  
        // Sort newest first
        const sorted = [...filtered].sort((a, b) => b.blockNumber - a.blockNumber);
        const total = sorted.length;
        const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);
  
        return { events: paginated, total };
      } catch (error) {
        console.error(`getEvents failed [${contractName}::${eventName}]:`, error);
        return { events: [], total: 0 };
      }
    }
  
    // ─── CORE: onEvent (live listener) ─────────────────────────────────────────
  
    onEvent(
      contractName: ContractName,
      eventName: string,
      callback: (event: PropertyEvent) => void,
      filters: Record<string, any> = {}
    ): () => void {
      const wsContracts = this.getWsContracts();
  
      // If WebSocket is unavailable, return a no-op (non-fatal)
      if (!wsContracts) {
        console.warn(`Live events unavailable for ${contractName}::${eventName} — WebSocket failed`);
        return () => {};
      }
  
      try {
        const filter = wsContracts[contractName].filters[eventName]();
  
        const listener = async (...args: any[]) => {
          const log = args[args.length - 1] as EventLog;
          const parsed = this.parseEventSync(contractName, log, eventName);
          if (!parsed) return;
  
          // Invalidate cache so next getEvents re-fetches
          eventCache.delete(`${contractName}:${eventName}`);
  
          if (
            Object.keys(filters).length === 0 ||
            Object.entries(filters).every(
              ([key, value]) =>
                String(parsed.args[key]).toLowerCase() === String(value).toLowerCase()
            )
          ) {
            callback(parsed);
          }
        };
  
        wsContracts[contractName].on(filter, listener);
        return () => {
          try { wsContracts[contractName].off(filter, listener); } catch (_) {}
        };
      } catch (error) {
        console.error(`onEvent setup failed [${contractName}::${eventName}]:`, error);
        return () => {};
      }
    }
  
    // ─── PARSE (synchronous — uses cached timestamps) ──────────────────────────
  
    private parseEventSync(
      contractName: ContractName,
      log: EventLog,
      eventName: string
    ): PropertyEvent | null {
      try {
        const rawArgs = log.args ?? {};
        const namedArgs: Record<string, any> = {};
  
        if (log.fragment?.inputs) {
          log.fragment.inputs.forEach((input, i) => {
            const val =
              (rawArgs as any)[input.name] !== undefined
                ? (rawArgs as any)[input.name]
                : (rawArgs as any)[i];
            namedArgs[input.name] = val;
          });
        } else {
          Object.keys(rawArgs).forEach((key) => {
            namedArgs[key] = (rawArgs as any)[key];
          });
        }
  
        return {
          type: eventName,
          contract: contractName,
          blockNumber: log.blockNumber,
          txHash: log.transactionHash,
          // Use cached timestamp — no extra RPC call
          timestamp: blockTimestampCache.get(log.blockNumber) ?? 0,
          args: namedArgs,
        };
      } catch (error) {
        console.error("Error parsing event:", error);
        return null;
      }
    }
  
    /** Call this after creating a property to bust the cache */
    clearCache() {
      eventCache.clear();
    }
  
    cleanup() {
      if (this.wsProvider) {
        this.wsProvider.destroy();
        this.wsProvider = null;
        this.wsContracts = null;
      }
    }
  
    // ─── RENT TO OWN ───────────────────────────────────────────────────────────
  
    async getLandlordProperties(landlordAddress: string): Promise<PropertyEvent[]> {
      const { events } = await this.getEvents(
        "RentToOwn", "PropertyCreated", { landlord: landlordAddress },
        CONTRACT_DEPLOYMENT_BLOCK, "latest", 1000
      );
      return events;
    }
  
    async getTenantAssignments(landlordAddress: string): Promise<{ propertyId: number; tenants: string[] }[]> {
      const createdEvents = await this.getLandlordProperties(landlordAddress);
      const { events: occupiedEvents } = await this.getEvents(
        "RentToOwn", "PropertyOccupied", {}, CONTRACT_DEPLOYMENT_BLOCK, "latest", 1000
      );
      return createdEvents.map((propEvent) => {
        const propertyId = propEvent.args.propertyId;
        const tenants = occupiedEvents
          .filter((e) => String(e.args.propertyId) === String(propertyId))
          .map((e) => e.args.tenant);
        return { propertyId, tenants: [...new Set(tenants)] as string[] };
      });
    }
  
    async getRentPaymentHistory(filters: {
      landlord?: string; propertyId?: number; tenant?: string;
      fromBlock?: number; toBlock?: number | string;
    } = {}): Promise<PropertyEvent[]> {
      const eventFilters: Record<string, any> = {};
      if (filters.propertyId !== undefined) eventFilters.propertyId = filters.propertyId;
      if (filters.tenant) eventFilters.tenant = filters.tenant;
  
      const { events } = await this.getEvents(
        "RentToOwn", "RentPaid", eventFilters,
        filters.fromBlock || CONTRACT_DEPLOYMENT_BLOCK,
        filters.toBlock || "latest", 10000
      );
  
      if (filters.landlord) {
        const landlordProperties = await this.getLandlordProperties(filters.landlord);
        const propertyIds = landlordProperties.map((p) => String(p.args.propertyId));
        return events.filter((event) => propertyIds.includes(String(event.args.propertyId)));
      }
      return events;
    }
  
    async getRentAnalysis(landlordAddress: string, year?: number): Promise<{ month: string; collected: number; expected: number }[]> {
      const currentYear = year || new Date().getFullYear();
      const properties = await this.getLandlordProperties(landlordAddress);
      const { events: allRentEvents } = await this.getEvents(
        "RentToOwn", "RentPaid", {}, CONTRACT_DEPLOYMENT_BLOCK, "latest", 10000
      );
  
      const monthlyData = Array(12).fill(0).map((_, i) => ({
        month: `${currentYear}-${String(i + 1).padStart(2, "0")}`,
        collected: 0,
        expected: 0,
      }));
  
      allRentEvents.forEach((event) => {
        const date = new Date((event.timestamp || 0) * 1000);
        if (date.getFullYear() === currentYear) {
          monthlyData[date.getMonth()].collected += Number(ethers.formatUnits(event.args.amount, 18));
        }
      });
      properties.forEach((property) => {
        const startDate = new Date((property.timestamp || 0) * 1000);
        const monthlyRent = Number(ethers.formatUnits(property.args.value, 18)) / 12;
        for (let month = 0; month < 12; month++) {
          if (startDate.getFullYear() <= currentYear) monthlyData[month].expected += monthlyRent;
        }
      });
      return monthlyData;
    }
  
    // ─── PROPERTY TOKEN ────────────────────────────────────────────────────────
  
    async getTokenHolders(tokenId: number): Promise<{ address: string; amount: number }[]> {
      const { events } = await this.getEvents(
        "PropertyToken", "PropertyTokenTransferred", { tokenId },
        CONTRACT_DEPLOYMENT_BLOCK, "latest", 1000
      );
      const holders = new Map<string, number>();
      events.forEach((event) => {
        const from = String(event.args.from).toLowerCase();
        const to = String(event.args.to).toLowerCase();
        const amount = Number(event.args.amount);
        if (from !== ethers.ZeroAddress.toLowerCase()) holders.set(from, (holders.get(from) || 0) - amount);
        holders.set(to, (holders.get(to) || 0) + amount);
      });
      return Array.from(holders.entries()).filter(([, a]) => a > 0).map(([address, amount]) => ({ address, amount }));
    }
  
    async getTokenDistribution(tokenId: number): Promise<{ holder: string; percentage: number }[]> {
      const holders = await this.getTokenHolders(tokenId);
      const total = holders.reduce((sum, h) => sum + h.amount, 0);
      return holders.map((h) => ({ holder: h.address, percentage: total > 0 ? (h.amount / total) * 100 : 0 }));
    }
  
    // ─── IDENTITY PROVIDER ─────────────────────────────────────────────────────
  
    async getUserRoles(userAddress: string): Promise<string[]> {
      const { events } = await this.getEvents(
        "IdentityProvider", "RoleAssigned", { user: userAddress },
        CONTRACT_DEPLOYMENT_BLOCK, "latest", 1000
      );
      return events.map((e) => {
        switch (e.args.role) {
          case 0: return "Admin";
          case 1: return "Landlord";
          case 2: return "Tenant";
          default: return "Unknown";
        }
      });
    }
  
    // ─── CROSS-CONTRACT ────────────────────────────────────────────────────────
  
    async getPropertyTimeline(propertyId: number, fromBlock = CONTRACT_DEPLOYMENT_BLOCK, toBlock: number | string = "latest"): Promise<PropertyEvent[]> {
      const queries = [
        this.getEvents("RentToOwn", "PropertyCreated", { propertyId }, fromBlock, toBlock).then((r) => r.events),
        this.getEvents("RentToOwn", "RentPaid", { propertyId }, fromBlock, toBlock).then((r) => r.events),
        this.getEvents("RentToOwn", "EquityUpdated", { propertyId }, fromBlock, toBlock).then((r) => r.events),
        this.getEvents("RentToOwn", "PropertyOccupied", { propertyId }, fromBlock, toBlock).then((r) => r.events),
        this.getEvents("PropertyToken", "PropertyTokenMinted", {}, fromBlock, toBlock).then((r) =>
          r.events.filter((e) => String(e.args.tokenId) === String(propertyId))
        ),
        this.getEvents("PropertyToken", "PropertyTokenTransferred", {}, fromBlock, toBlock).then((r) =>
          r.events.filter((e) => String(e.args.tokenId) === String(propertyId))
        ),
      ];
      const results = await Promise.all(queries);
      return results.flat().sort((a, b) => b.blockNumber - a.blockNumber);
    }
  
    async getEquityDistribution(propertyId: number, year = new Date().getFullYear()): Promise<{ month: string; equity: number }[]> {
      const { events } = await this.getEvents(
        "RentToOwn", "EquityUpdated", { propertyId }, CONTRACT_DEPLOYMENT_BLOCK, "latest", 1000
      );
      const filtered = events.filter((e) => new Date((e.timestamp || 0) * 1000).getFullYear() === year);
      return Array.from({ length: 12 }, (_, i) => {
        const monthKey = `${year}-${String(i + 1).padStart(2, "0")}`;
        const monthEvents = filtered.filter((e) => new Date((e.timestamp || 0) * 1000).getMonth() === i);
        return { month: monthKey, equity: monthEvents.reduce((sum, e) => sum + Number(e.args.newEquity), 0) };
      });
    }
  
    // ─── TENANT ────────────────────────────────────────────────────────────────
  
    async getTenantEquityUpdates(tenantAddress: string, propertyId?: number): Promise<PropertyEvent[]> {
      const filters: Record<string, any> = { tenant: tenantAddress };
      if (propertyId !== undefined) filters.propertyId = propertyId;
      const { events } = await this.getEvents("RentToOwn", "EquityUpdated", filters, CONTRACT_DEPLOYMENT_BLOCK, "latest", 1000);
      return events.sort((a, b) => b.blockNumber - a.blockNumber);
    }
  
    async getTenantPaymentHistory(tenantAddress: string, propertyId?: number): Promise<PropertyEvent[]> {
      const filters: Record<string, any> = { tenant: tenantAddress };
      if (propertyId !== undefined) filters.propertyId = propertyId;
      const { events } = await this.getEvents("RentToOwn", "RentPaid", filters, CONTRACT_DEPLOYMENT_BLOCK, "latest", 1000);
      return events.filter((e) => e.timestamp !== undefined);
    }
  
    calculateVestingSchedule(property: PropertyEvent, payments: PropertyEvent[]): {
      currentEquity: number; nextVestingDate: Date | null; fullOwnershipDate: Date | null;
    } {
      const duration = Number(property.args.duration);
      const paymentCount = payments.length;
      const currentEquity = Math.min(100, (paymentCount / duration) * 100);
      const lastPayment = payments[0]?.timestamp ? new Date(payments[0].timestamp * 1000) : new Date();
      return {
        currentEquity,
        nextVestingDate: paymentCount >= duration ? null : new Date(lastPayment.setMonth(lastPayment.getMonth() + 1)),
        fullOwnershipDate: paymentCount >= duration
          ? new Date(lastPayment.setMonth(lastPayment.getMonth() + (duration - paymentCount))) : null,
      };
    }
  
    private parseArgs(fragment: ethers.EventFragment, args: any): Record<string, any> {
      const result: Record<string, any> = {};
      fragment.inputs.forEach((input, index) => { result[input.name] = args[index]; });
      return result;
    }
  }