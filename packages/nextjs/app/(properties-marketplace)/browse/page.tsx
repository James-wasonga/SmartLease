"use client";

import DropdownFilter from "@/components/DropdownFilter";
import PropertyCard, { PropertyType } from "@/components/PropertyCard";
import EmptyContent from "@/components/shared/empty-content";
import TablePagination from "@/components/shared/pagination-custom";
import PropertyCardSkeleton from "@/components/shared/property-skeleton";
import { useAvailableProperties } from "@/hooks/property/usePropertyEvents";
import { usePayRent } from "@/services/request/contract/contract-request";
import { getParsedError } from "@/utils/scaffold-eth";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAccount, useWaitForTransaction } from "wagmi";


// propertyId, amt
export default function BrowsePropertiesPage() {
  const {isConnected} = useAccount()

  const {
    properties,
    loading,
    page,
    setPage,
    totalPages,
    totalProperties
  } = useAvailableProperties({
    itemsPerPage: 12,
    liveUpdates: true
  });

  const [wLoading, setWLoading] = useState(false)
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const {writeAsync: payRent, isLoading: isLoading} = usePayRent()
  // propertyId, amt

    const withdrawFunds = async (propertyId: number, amount: number) => {
      setWLoading(true)
      try {
          if (!isConnected) {
            toast.error("Please connect wallet to payRent")
            return
          }
          const tx = await payRent({args: [propertyId, Math.floor(amount)]})
          setTxHash(tx.hash);
      }catch (err) {
          const error = getParsedError(err)
          toast.error(error)
      } finally {
        setWLoading(false)
      }
  }

  useWaitForTransaction({
      hash: txHash,
      confirmations: 1,
      enabled: !!txHash,
      onSuccess() {
          setWLoading(false)
          toast.success(`Payment successful. You are now a tenant Transaction hash ${txHash}`)
        // navigate or update UI here
      },
      onError(error) {
        console.error("Tx failed to confirm", error);
        setWLoading(false)
      },
  });

  console.log(properties)
  
  return (
    <div className="bg-gray-100">
      <div className="app-container min-h-[90vh]">
        <div className="flex justify-between items-center mb-6 mt-20">
          <div>
            <h1 className="text-3xl font-bold">Properties</h1>
            <p className="text-green-600 text-lg">
              Available Properties found ({totalProperties})
            </p>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          <DropdownFilter
            label="Filter"
            options={["All Properties", "Active", "Pending", "Owned"]}
          />
          <DropdownFilter
            label="Sort by"
            options={["Highest Equity", "Lowest Rent"]}
          />
        </div>

        <div className="mb-10">
          {/* {mockProperties.map((property) => (
            <PropertyCard
              key={property.id}
              {...property}
              status={toStatus(property.status)}
            />
          ))} */}

      {loading ? (
          <div className="grid grid-cols-1 mini:grid-cols-4 gap-6">
            <PropertyCardSkeleton/>
            <PropertyCardSkeleton/>
            <PropertyCardSkeleton/>
            <PropertyCardSkeleton/>
          </div>
      ) : (
        <>
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {properties.map(property => (
                <PropertyCard 
                  key={`${property.args.propertyId}-${property.blockNumber}`}
                  data={property.args as PropertyType}
                  payRent={withdrawFunds}
                />
              ))}
            </div>
              
            <div className="flex justify-between items-center mt-10">
              <TablePagination
                  currentPage={page}
                  itemsPerpage={12}
                  setpage={setPage}
                  total={totalPages}
              />
            </div>
          </>
          
          {properties.length === 0 && (
            <EmptyContent 
              className=""
            />
          )}
        </>
      )}
        </div>
      </div>
    </div>
  );
}
