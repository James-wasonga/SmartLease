"use client";

import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { Routes } from "@/app/routes";
import LandlordPropertyCard from "@/components/landlord/property-card";
import { Button } from "@/components/ui/button";
import { useLandlordProperties } from "@/hooks/property/usePropertyEvents";
import { useAccount } from "wagmi";
import PropertyCardSkeleton from "@/components/shared/property-skeleton";
import { formatDurationFromMonths } from "@/utils/formatter";

const LandlordPropertiesPage = () => {
  const { address } = useAccount();

  const { loading, properties } = useLandlordProperties(address);

  console.log("All properties", properties);

  if (!address) {
    return (
      <div className="text-center py-60 p-8">
        <p className="text-muted-foreground mb-4">
          Please connect your wallet to view your landlord dashboard.
        </p>
      </div>
    );
  }

  return (
    <main className="bg-gray-100 min-h-[90vh]">
      <div className="mt-16 app-container">
        {loading ? (
          <div className="grid grid-cols-1 mini:grid-cols-4 gap-6 mt-16">
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <p className="font-semibold text-2xl text-slate-700">
                My Properties
              </p>

              <Link href={Routes.LANDLORD_CREATE} className="">
                <Button className="p-6">
                  <PlusIcon className="" />
                  <p className="font-medium">Create New Property</p>
                </Button>
              </Link>
            </div>

            <div className="flex items-center space-x-2 mt-2">
              <p className="text-green-500">{properties.length} properties</p>
            </div>

            {properties.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-gray-500 text-lg mb-4">
                  You have no properties yet.
                </p>
                <Link href={Routes.LANDLORD_CREATE}>
                  <Button className="p-6">
                    <PlusIcon />
                    <p className="font-medium">Create Your First Property</p>
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-7 mt-8">
                {properties.map((p) => {
                  // Safely coerce bigint/string values
                  const value = Number(p.args.value);
                  const duration = Number(p.args.duration);
                  const tokenId = Number(p.args.tokenId);
                  const propertyId = Number(p.args.propertyId);

                  // timestamp is in seconds from the chain — multiply by 1000 for JS Date
                  const startDate = p.timestamp
                    ? new Date(Number(p.timestamp) * 1000).toLocaleDateString()
                    : "N/A";

                  return (
                    <LandlordPropertyCard
                      key={p.txHash}
                      address={p.args.propertyAddress ?? ""}
                      duration={formatDurationFromMonths(duration)}
                      explorer_url={`https://sepolia-blockscout.lisk.com/tx/${p.txHash}`}
                      is_occupied={false}
                      name={p.args.name ?? ""}
                      price={`${value}`}
                      currency={p.args.currency ?? ""}
                      property_image_url={p.args.image ?? ""}
                      start_date={startDate}
                      tenant_address=""
                      token_id={tokenId}
                      lease_end={formatDurationFromMonths(duration)}
                      flexible_payment={false}
                      proprtyId={propertyId}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default LandlordPropertiesPage;