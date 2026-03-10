import ProgressBar from "./ProgressBar";
import StatusBadge from "./StatusBadge";
import React, { useEffect } from "react";
import { Badge } from "./ui/badge";
import { currencyPairFormatter, formatDurationFromMonths, priceFormatter } from "@/utils/formatter";

interface PropertyProps {
  id?: string;
  title?: string;
  address?: string;
  rent?: number;
  equity?: number;
  imageUrl?: string;
  status?: "Active" | "Pending" | "Fully Owned";
  property?: Record<string, any>
}

export type PropertyType = {
    city: string
    currency: string
    duration:BigInt
    image:string
    landlord:string
    name:string
    propertyAddress:string
    propertyId:BigInt
    state:string
    tokenId:BigInt
    value:BigInt
    zipCode:string
}


export default function PropertyCard({
  data,
  payRent
}: {data :PropertyType, payRent: (propertyId: number, amount: number) => Promise<void>}) {

  return (
    <div className="bg-white shadow rounded-xl overflow-hidden">
      <div className="relative h-48 w-full">
        <img
          src={data.image}
          alt={data.name}
          className="w-full h-full object-cover"
        />
        {/* <div className="absolute top-2 right-2">
          <StatusBadge status={status} />
        </div> */}
      </div>
      <div className="p-4">
        <h2 className="font-semibold text-lg">{data.name}</h2>
        <p className="text-sm text-gray-500">{data.propertyAddress}</p>
        <Badge className="text-sm hover:bg-amber-300/40 bg-amber-300/40 text-gray-400 mt-1">Token ID: #{Number(data.tokenId)}</Badge>
        <div className="mt-3 flex items-center space-x-2">
          <p className="text-sm text-gray-700">Current Rent</p>
          <p className="text-blue-600 font-semibold text-lg">
            {data.currency} {priceFormatter((Number(data.value)/Number(data.duration)), 5)}
          </p>
        </div>
        <div className="mt-1 flex space-x-1">
          <p className="">Duration</p>
          <p className="">{formatDurationFromMonths(Number(data.duration))}</p>
        </div>
        <button onClick={() => {payRent(Number(data.propertyId), (Number(data.value)/Number(data.duration)))}} className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          Pay Rent
        </button>
      </div>
    </div>
  );
}
