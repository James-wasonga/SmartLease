'use client'
import DashboardpropertyTable, { NewProperty } from "@/components/landlord/dashboard-properties-table"
import LandlordDashboardCard from "@/components/landlord/propertyy-card"
import { RentAnalysisChart } from "@/components/landlord/rent-analysis-chart"
import DashboardSkeleton from "@/components/shared/dashboar-skeleton"
import { Button } from "@/components/ui/button"
import { useLandlordDashboard } from "@/hooks/property/usePropertyEvents"
import { PlusIcon } from "lucide-react"
import Link from "next/link"
import { useAccount } from "wagmi"
import { Routes } from "../routes"

const LandlordPage = () => {
    const {address} = useAccount()

    const {
        loading,
        recentProperties,
        totalProperties,
        totalRentCollected,
        totalTenants
      } = useLandlordDashboard(address)

      if (!address) {
          return (
          <div className="text-center py-60 p-8">
            <p className="text-muted-foreground mb-4">
              To view your landlord dashboard
            </p>
          </div>
        );} 
        

    return (
        <>
            <div className="bg-gray-100">
                <main className="min-h-[80vh] app-container mt-10 ">

                    { loading ?
                        <DashboardSkeleton/> :

                        <div className="">
                            <div className="grid grid-cols-3 gap-8">
                                <LandlordDashboardCard
                                    amount={totalRentCollected}
                                    title="Total Rent Collected"
                                    extraText="this month"
                                />

                                <LandlordDashboardCard
                                    amount={totalProperties}
                                    title="Properties Managed"
                                    extraText="active properties"
                                />

                                <LandlordDashboardCard
                                    amount={totalTenants}
                                    title="Active tenants"
                                    extraText="tenants"
                                />
                            </div>

                            <div className="flex mt-16 justify-between items-center">
                                <p className="text-xl font-semibold">Properties</p>

                                <Link href={Routes.LANDLORD_CREATE} className="">
                                    <Button className="p-6">
                                        <PlusIcon className=""/>
                                        <p className="font-medium">Create New Property</p>
                                    </Button>
                                </Link>
                            </div>

                            <div className="">
                                <DashboardpropertyTable 
                                    //@ts-ignore
                                    allData={recentProperties as NewProperty}/>
                            </div>

                        </div>
                    }

                    <div className="mt-16">
                        <div className="bg-white p-6 rounded-md">
                            <div className="p-5">
                                <p className="text-xl font-semibold text-gray-600">Rent Collection Analysis</p>
                            </div>
                            <div className="border border-gray-300 p-4 rounded-md">
                                <RentAnalysisChart/>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </>
    )
}


export default LandlordPage