import { Pencil, SquareArrowOutUpRight } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"
import { Button } from "../ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"
import { Routes } from "@/app/routes"

type LandlordPropertyCardProps = {
    name: string,
    address: string,
    tenant_address: string,
    price: string,
    duration: string,
    is_occupied: boolean
    start_date: string,
    explorer_url: string,
    token_id: number,
    property_image_url: string,
    currency: string,
    lease_end: string,
    flexible_payment: boolean,
    proprtyId: number
}

const LandlordPropertyCard = ({
    address,
    duration,
    explorer_url,
    is_occupied,
    name,
    price,
    start_date,
    tenant_address,
    token_id,
    property_image_url,
    currency,
    lease_end,
    flexible_payment,
    proprtyId
}:LandlordPropertyCardProps) => {
    return (
        <>
            <div className="">
                <Card
                    key={token_id}
                    className="grid grid-rows-[auto_auto_1fr_auto] pt-0"
                >

                <div className="aspect-16/9 w-full  relative">
                    <Badge className={cn("absolute right-4 top-4 p-1 bg-green-500 hover:bg-green-500", {"bg-gray-400 hover:bg-gray-400": !is_occupied})}>
                        {is_occupied ? "Occupied" : "Unocupied"}
                    </Badge>
                    <img
                        src={property_image_url}
                        alt={"property img"}
                        className="h-44 w-full object-cover object-center"
                    />
                </div>

                <CardHeader className="">
                    <div className="flex flow-row justify-between">
                        <h3 className="hover:underline w-max">
                            <p className="text-slate-800 font-semibold text-lg">{name}</p>
                            <p className="text-gray-600">{address}</p>
                        </h3>

                        <div className="flex items-center space-x-2">
                            <Link href={""} className="w-max">
                                <SquareArrowOutUpRight size={18} className="text-primary"/>
                            </Link>
                            { is_occupied &&
                                <Pencil size={18} className="cursor-pointer text-gray-500"/>
                            }
                        </div>
                    </div>
                </CardHeader>
                
                <CardContent className="text-sm">
                    <div className="border-t border-b py-2 flex justify-between items-center">
                        <span className="text-gray-500">Token ID<span className="text-slate-700 font-medium"> #{token_id}</span></span>

                        <div className="">
                            <p className="text-slate-500">Price</p>
                            <span className="font-bold">{currency} <span className="">{price}</span></span>
                        </div>
                    </div>

                    <div className="flex items-end justify-between mt-3">
                        {/* <div className="flex items-center space-x-2">
                            <Avatar>
                                <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"/>
                            </Avatar>

                            <div className="flex flex-col">
                                <p className="text-blue-800">{tenant_address}</p>
                                <p className="text-gray-600 text-xs">Tenant since {start_date}</p>
                            </div>
                        </div> */}
                        <p className="text-sm">Lease ends: {lease_end}</p>
                        <span className="text-gray-400">Is payment flexible: <span className={cn("text-green-500 font-medium", {"text-red-500": !flexible_payment})}>{flexible_payment ? "Yes" : "No"}</span></span>
                    </div>
                </CardContent>

                <CardFooter>
                    <Link href={`${Routes.LANDLORD_PROPERTIES}/${proprtyId}?tokenId=${token_id}`}>
                        <Button className="">View Details</Button>
                    </Link>
                </CardFooter>
                </Card>
            </div>
        </>
    )
}

export default LandlordPropertyCard