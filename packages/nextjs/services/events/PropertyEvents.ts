import { Contract, ethers, EventLog, JsonRpcProvider, InterfaceAbi, WebSocketProvider } from "ethers";

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

    constructor(
        rentToOwnAddress: string,
        rentToOwnAbi: InterfaceAbi,
        propertyTokenAddress: string,
        propertyTokenAbi: InterfaceAbi,
        identityProviderAddress: string,
        identityProviderAbi: InterfaceAbi
    ) {
        // Initialize properties
        this.rentToOwnAddress = rentToOwnAddress;
        this.rentToOwnAbi = rentToOwnAbi;
        this.propertyTokenAddress = propertyTokenAddress;
        this.propertyTokenAbi = propertyTokenAbi;
        this.identityProviderAddress = identityProviderAddress;
        this.identityProviderAbi = identityProviderAbi;

        // Initialize regular HTTP providers
        this.contracts = {
            RentToOwn: new Contract(rentToOwnAddress, rentToOwnAbi, PROVIDER),
            PropertyToken: new Contract(propertyTokenAddress, propertyTokenAbi, PROVIDER),
            IdentityProvider: new Contract(identityProviderAddress, identityProviderAbi, PROVIDER)
        };
    }

    private initializeWebSocket() {
        if (typeof window === 'undefined') {
            throw new Error("WebSocketProvider cannot be used in server-side environment");
        }

        if (!this.wsProvider) {
            this.wsProvider = new WebSocketProvider(`wss://rpc.sepolia-api.lisk.com`);
        }

        if (!this.wsContracts && this.wsProvider) {
            this.wsContracts = {
                RentToOwn: new Contract(this.rentToOwnAddress, this.rentToOwnAbi, this.wsProvider),
                PropertyToken: new Contract(this.propertyTokenAddress, this.propertyTokenAbi, this.wsProvider),
                IdentityProvider: new Contract(this.identityProviderAddress, this.identityProviderAbi, this.wsProvider)
            };
        }
    }

    private getWsContracts(): Record<ContractName, Contract> {
        this.initializeWebSocket();
        if (!this.wsContracts) {
            throw new Error("WebSocket contracts not initialized");
        }
        return this.wsContracts;
    }


  /* ------------------------- */
  /* CORE EVENT METHODS        */
  /* ------------------------- */

  
async getEvents(
    contractName: ContractName,
    eventName: string, // Add eventName parameter
    filters: Record<string, any> = {},
    fromBlock = 0,
    toBlock: number | string = "latest",
    pageSize = 50,
    page = 1
): Promise<{ events: PropertyEvent[]; total: number }> {
    const filter = this.contracts[contractName].filters[eventName](...Object.values(filters));
    const totalEvents = await this.contracts[contractName].queryFilter(filter, fromBlock, toBlock);
    
    const paginatedEvents = totalEvents.slice(
        (page - 1) * pageSize,
        page * pageSize
    );

    const events = await Promise.all(
        //@ts-ignore
        paginatedEvents.map(log => this.parseEvent(contractName, log, eventName)) // Pass eventName
    );

    return {
        events: events.filter(Boolean) as PropertyEvent[],
        total: totalEvents.length,
    };
}

    onEvent(
        contractName: ContractName,
        eventName: string,
        callback: (event: PropertyEvent) => void,
        filters: Record<string, any> = {}
    ): () => void {
        const wsContracts = this.getWsContracts();
        const filter = wsContracts[contractName].filters[eventName](...Object.values(filters));
        
        const listener = async (log: EventLog) => {
            const parsed = await this.parseEvent(contractName, log, eventName); // Pass eventName here
            if (parsed) callback(parsed);
        };
    
        wsContracts[contractName].on(filter, listener);
        return () => wsContracts[contractName].off(filter, listener);
    }
    

    /* ------------------------- */
    /* RENT TO OWN SPECIFIC      */
    /* ------------------------- */

    async getLandlordProperties(landlordAddress: string): Promise<PropertyEvent[]> {
        const { events } = await this.getEvents(
        "RentToOwn",
        "PropertyCreated",
        { landlord: landlordAddress }
        );
        return events;
    }

    async getTenantAssignments(landlordAddress: string): Promise<{propertyId: number, tenants: string[]}[]> {
        const createdEvents = await this.getLandlordProperties(landlordAddress);
        const { events: occupiedEvents } = await this.getEvents("RentToOwn", "PropertyOccupied");
        
        return createdEvents.map(propEvent => {
        const propertyId = propEvent.args.propertyId;
        const tenants = occupiedEvents
            .filter(e => e.args.propertyId === propertyId)
            .map(e => e.args.tenant);
            
        return {
            propertyId,
            tenants: [...new Set(tenants)]
        };
        });
    }

    async getRentPaymentHistory(
        filters: {
          landlord?: string;
          propertyId?: number;
          tenant?: string;
          fromBlock?: number;
          toBlock?: number | string;
        } = {}
      ): Promise<PropertyEvent[]> {
        const { events } = await this.getEvents(
          "RentToOwn",
          "RentPaid",
          {
            ...(filters.propertyId && { propertyId: filters.propertyId }),
            ...(filters.tenant && { tenant: filters.tenant })
          },
          filters.fromBlock || 0,
          filters.toBlock || "latest",
          10000 // High limit for full history
        );
      
        // Additional landlord filter if needed
        if (filters.landlord) {
          const landlordProperties = await this.getLandlordProperties(filters.landlord);
          const propertyIds = landlordProperties.map(p => p.args.propertyId);
          
          return events.filter(event => 
            propertyIds.includes(event.args.propertyId)
          );
        }
      
        return events;
      }
      

    async getRentAnalysis(landlordAddress: string, year?: number): Promise<{
        month: string;
        collected: number;
        expected: number;
    }[]> {
        const currentYear = year || new Date().getFullYear();
        const properties = await this.getLandlordProperties(landlordAddress);
        
        const { events: allRentEvents } = await this.getEvents(
            "RentToOwn",
            "RentPaid",
            {},
            0,
            "latest",
            10000
        );
        
        const monthlyData = Array(12).fill(0).map((_, i) => {
            const month = String(i + 1).padStart(2, '0');
            return {
                month: `${currentYear}-${month}`,
                collected: 0,
                expected: 0
            };
        });
        
      // Calculate collected rent
        allRentEvents.forEach(event => {
            const date = new Date((event.timestamp || 0) * 1000);
            if (date.getFullYear() === currentYear) {
                const month = date.getMonth();
                monthlyData[month].collected += Number(ethers.formatUnits(event.args.amount, 18));
            }
        });
        
        // Calculate expected rent (from property values)
        properties.forEach(property => {
            const startDate = new Date((property.timestamp || 0) * 1000);
            const monthlyRent = Number(ethers.formatUnits(property.args.value, 18)) / 12;
            
            for (let month = 0; month < 12; month++) {
                if (startDate.getFullYear() <= currentYear) {
                    monthlyData[month].expected += monthlyRent;
                }
            }
        });

        return monthlyData;
    }


    /* ------------------------- */
    /* PROPERTY TOKEN SPECIFIC   */
    /* ------------------------- */

    async getTokenHolders(tokenId: number): Promise<{address: string, amount: number}[]> {
        const { events } = await this.getEvents(
            "PropertyToken",
            "PropertyTokenTransferred",
            { tokenId }
        );
        
        const holders = new Map<string, number>();
        
        events.forEach(event => {
        const from = event.args.from.toLowerCase();
        const to = event.args.to.toLowerCase();
        const amount = Number(ethers.formatUnits(event.args.amount, 18));
        
        // Subtract from sender
        if (from !== ethers.ZeroAddress) {
            holders.set(from, (holders.get(from) || 0) - amount);
        }
        
        // Add to receiver
        holders.set(to, (holders.get(to) || 0) + amount);
        });
        
        return Array.from(holders.entries())
        .filter(([, amount]) => amount > 0)
        .map(([address, amount]) => ({ address, amount }));
    }

    async getTokenDistribution(tokenId: number): Promise<{holder: string, percentage: number}[]> {
        const holders = await this.getTokenHolders(tokenId);
        const total = holders.reduce((sum, h) => sum + h.amount, 0);
        
        return holders.map(h => ({
            holder: h.address,
            percentage: (h.amount / total) * 100
        }));
    }



    /* ------------------------- */
    /* IDENTITY PROVIDER SPECIFIC */
    /* ------------------------- */

    async getUserRoles(userAddress: string): Promise<string[]> {
        const { events } = await this.getEvents(
        "IdentityProvider",
        "RoleAssigned",
        { user: userAddress }
        );
        
        return events.map(e => {
        switch(e.args.role) {
            case 0: return "Admin";
            case 1: return "Landlord";
            case 2: return "Tenant";
            default: return "Unknown";
        }
        });
    }


    /* ------------------------- */
    /* CROSS-CONTRACT METHODS    */
    /* ------------------------- */

    async getPropertyTimeline(
        propertyId: number,
        fromBlock = 0,
        toBlock: number | string = "latest"
    ): Promise<PropertyEvent[]> {
        const eventQueries = [
            this.getEvents("RentToOwn", "PropertyCreated", { propertyId }, fromBlock, toBlock)
                .then(res => res.events),
            this.getEvents("RentToOwn", "RentPaid", { propertyId }, fromBlock, toBlock)
                .then(res => res.events),
            this.getEvents("RentToOwn", "EquityUpdated", { propertyId }, fromBlock, toBlock)
                .then(res => res.events),
            this.getEvents("RentToOwn", "PropertyOccupied", { propertyId }, fromBlock, toBlock)
                .then(res => res.events),
            this.getEvents("PropertyToken", "PropertyTokenMinted", {}, fromBlock, toBlock)
                .then(res => res.events.filter(e => e.args.tokenId === propertyId)),
            this.getEvents("PropertyToken", "PropertyTokenTransferred", {}, fromBlock, toBlock)
                .then(res => res.events.filter(e => e.args.tokenId === propertyId))
        ];
    
        const results = await Promise.all(eventQueries);
        const allEvents = results.flat();
        
        return allEvents.sort((a, b) => b.blockNumber - a.blockNumber);
    }

    async getEquityDistribution(propertyId: number, year = new Date().getFullYear()): Promise<{month: string, equity: number}[]> {
        // Specify "RentToOwn" as the contract name for these events
        const { events } = await this.getEvents(
            "RentToOwn", 
            "EquityUpdated", 
            { propertyId }
        );
        
        // Filter only events within the selected year
        const filteredEvents = events.filter(e => {
            const timestamp = e.timestamp ? e.timestamp * 1000 : 0;
            const eventDate = new Date(timestamp);
            return eventDate.getFullYear() === year;
        });

        // Prepare result for each month from January to December
        const monthlyData = Array.from({ length: 12 }, (_, i) => {
            const monthKey = `${year}-${String(i + 1).padStart(2, "0")}`;
            const monthEvents = filteredEvents.filter(e => {
                const date = new Date((e.timestamp || 0) * 1000);
                return date.getMonth() === i;
            });

            const totalEquity = monthEvents.reduce((sum, e) => sum + Number(e.args.newEquity), 0);

            return {
                month: monthKey,
                equity: totalEquity
            };
        });

        return monthlyData;
    }

  /* ------------------------- */
  /* HELPER METHODS            */
  /* ------------------------- */

  private async parseEvent(
    contractName: ContractName, 
    log: EventLog, 
    eventName: string // Added parameter
): Promise<PropertyEvent | null> {
    try {
        const event = {
            type: eventName, // Use the passed eventName
            contract: contractName,
            blockNumber: log.blockNumber,
            txHash: log.transactionHash,
            timestamp: await this.getBlockTimestamp(log.blockNumber),
            args: log.args || {}
        };
        return event;
    } catch (error) {
        console.error("Error parsing event:", error);
        return null;
    }
}

    private async getBlockTimestamp(blockNumber: number): Promise<number> {
        const block = await PROVIDER.getBlock(blockNumber);
        return block?.timestamp || 0;
    }

    cleanup() {
        if (this.wsProvider) {
            this.wsProvider.destroy();
            this.wsProvider = null;
            this.wsContracts = null;
        }
    }

    private parseArgs(fragment: ethers.EventFragment, args: any): Record<string, any> {
        const result: Record<string, any> = {};
        fragment.inputs.forEach((input, index) => {
        result[input.name] = args[index];
        });
        return result;
    }

    // Tenant 
  
    async getTenantEquityUpdates(
        tenantAddress: string,
        propertyId?: number
    ): Promise<PropertyEvent[]> {
        const filters: { tenant: string; propertyId?: number } = { tenant: tenantAddress };
        if (propertyId) filters.propertyId = propertyId;

        const { events } = await this.getEvents(
            "RentToOwn",
            "EquityUpdated",
            filters,
            0,
            "latest",
            1000
        );

        return events.sort((a, b) => b.blockNumber - a.blockNumber);
    }

    /* ------------------------- */
    /* VESTING CALCULATORS       */
    /* ------------------------- */

    calculateVestingSchedule(
        property: PropertyEvent,
        payments: PropertyEvent[]
    ): {
        currentEquity: number;
        nextVestingDate: Date | null;
        fullOwnershipDate: Date | null;
    } {
        const duration = property.args.duration;
        const paymentCount = payments.length;
        const currentEquity = Math.min(100, (paymentCount / duration) * 100);

        const lastPayment = payments[0]?.timestamp 
            ? new Date(payments[0].timestamp * 1000)
            : new Date();

        return {
            currentEquity,
            nextVestingDate: paymentCount >= duration 
                ? null 
                : new Date(lastPayment.setMonth(lastPayment.getMonth() + 1)),
            fullOwnershipDate: paymentCount >= duration
                ? new Date(lastPayment.setMonth(lastPayment.getMonth() + (duration - paymentCount)))
                : null
        };
    }

    /* ------------------------- */
    /* TIER SYSTEM               */
    /* ------------------------- */

    async getTenantPaymentHistory(
        tenantAddress: string,
        propertyId?: number
      ): Promise<PropertyEvent[]> {
        const filters: { tenant: string; propertyId?: number } = { tenant: tenantAddress };
        if (propertyId !== undefined) filters.propertyId = propertyId;
      
        const { events } = await this.getEvents(
          "RentToOwn",
          "RentPaid",
          filters,
          0,
          "latest",
          1000
        );
      
        return events.filter(e => e.timestamp !== undefined);
      }

}