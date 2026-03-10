import { Contract, ethers, EventLog, JsonRpcProvider, Log } from "ethers"
import { useEffect, useState } from "react"
import { toast } from "sonner"

type EVENTS = 
    "PropertyTokenMinted" | 
    "PropertyTokenTransferred" | 
    "PropertyCreated" |
    "RentPaid" |
    "EquityUpdated" |
    "PropertyOccupied" |
    "LandlordWithdrawal" |
    "TokensTransferred" |
    "RoleAssigned"


type EventProps = {
    address: string,
    abi: ethers.Interface | ethers.InterfaceAbi,
    eventName: EVENTS
}
const PROVIDER = new JsonRpcProvider(`https://rpc.sepolia-api.lisk.com`)

export const readEventLogsFromWagmi = (config: EventProps) => {
    const [eventData, setEventData] = useState<{
        blockNumber: number;
        tnxHash: string;
        index: number;
        args: ethers.Result;
    }[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() =>{
        
        const fetchEvents = async () => {
            setLoading(true)
            try {
                const contract = new Contract(config.address, config.abi, PROVIDER);
                const filter = await contract.getEvent(config.eventName);
            
                const events = await contract.queryFilter(filter, 0, "latest");
                const parsedEvents =  (events as EventLog[]).map(data => (
                    { 
                        blockNumber: data.blockNumber,
                        tnxHash: data.transactionHash,
                        index: data.index,
                        args: data.args
                   }
                ))
                
                // console.log(parsedEvents)
                setEventData(parsedEvents)
            } catch (e) {
                console.log("Failed to fetch data")
            } finally {
                setLoading(false)
            }
        }
        
        fetchEvents()
    }, [])

    return {eventData, loading}
}
