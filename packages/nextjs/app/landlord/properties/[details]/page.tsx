'use client'

import { Routes } from "@/app/routes";
import { PropertyEquityChart } from "@/components/landlord/property-equity-chart";
import PropertyPaymentHistoryTable from "@/components/landlord/rent-pament-history";
import PropertyCardSkeleton from "@/components/shared/property-skeleton";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useEquityDistribution, usePropertyTimeline, useTokenHolders } from "@/hooks/property/usePropertyEvents";
import { formatDurationFromMonths, priceFormatter } from "@/utils/formatter";
import { LucideCoins, SquarePen } from "lucide-react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";


const LandlordPropertiesDetailPage = () => {
    const params = useSearchParams()
    const tokenId = params.get("tokenId")
    const path = usePathname()
    const propertyId = path.split("/")[3]

    const {holders, loading} = useTokenHolders(+(tokenId as string))
    const {loading: timelineLoading, timeline} = usePropertyTimeline(+propertyId)

    console.log(timeline)

    return (
        <>
            <main className="min-h-dvh bg-gray-100">
                <div className="app-container mt-16 mb-4">
                        <Link href={`${Routes.LANDLORD_WITHDRAW}?id=${timeline[0]?.args.propertyId}`} className="">
                            <Button className="py-6 px-7 rounded-lg flex items-center space-x-2">
                                <LucideCoins size={27}/>
                                <p className="">Withdraw</p>
                            </Button>
                        </Link>
                </div>

                <div className="grid grid-cols-12 gap-x-10 app-container">

                    <div className="col-span-8">
                        <div className="bg-white rounded-lg p-5">
                            <div className="flex justify-between items-center">
                                <p className="text-slate-600 font-semibold text-2xl">Property Metadata</p>
                                <div className="flex items-center space-x-3">
                                    <div className="bg-green-500 rounded-full px-3 py-1 text-sm text-white">Occupied</div>
                                    <div className=" p-1 rounded-md">
                                        <SquarePen size={18} className="cursor-pointer text-green-500"/>
                                    </div>
                                </div>
                            </div>

                            <div className="gap-y-3 grid grid-cols-3 gap-6 mt-7">
                                <div className="min-h-36 border flex flex-col gap-y-2 justify-center border-gray-300 rounded-lg p-3 px-5">
                                    <p className="text-gray-500">Monthly Rent</p>
                                    <p className="font-semibold text-xl text-slate-700">$23,400</p>
                                </div>

                                <div className="min-h-36 border flex flex-col gap-y-1 justify-center border-gray-300 rounded-lg p-3 px-5">
                                    <p className="text-gray-500">Equity Rate</p>
                                    <span className="font-semibold text-xl text-slate-700">2.5% <span className="text-base font-normal text-green-500">per month</span></span>
                                </div>

                                <div className="min-h-36 border flex flex-col gap-y-1 justify-center border-gray-300 rounded-lg p-3 px-5">
                                    <p className="text-gray-500">Tenant</p>

                                    <div className="flex items-center space-x-4">
                                        <Avatar>
                                            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn"/>
                                        </Avatar>
                                        <div className="">
                                            <p className="">0x8AE82...</p>
                                            <p className="text-gray-500">Tenant since 23 May</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-lg mt-16">
                            
                            <PropertyEquityChart/>

                            <div className="mt-5 grid grid-cols-4 gap-x-4">
                                <div className="min-h-16 border flex flex-col gap-y-1 justify-center border-gray-300 rounded-lg p-3 px-5 bg-gradient-to-r from-pink-500 via-pink-400 to-pink-300">
                                    <p className="text-white">Current Equity</p>
                                    <span className=" text-lg text-white">15% </span>
                                </div>

                                <div className="min-h-16 border flex flex-col gap-y-1 justify-center border-gray-300 rounded-lg p-3 px-5 bg-gradient-to-r from-green-500 via-green-400 to-green-300">
                                    <p className="text-white">Vested Token</p>
                                    <span className=" text-lg text-slate-600">150/1000 </span>
                                </div>

                                <div className="min-h-16 border flex flex-col gap-y-1 justify-center border-gray-300 rounded-lg p-3 px-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300">
                                    <p className="text-white ">Est Value</p>
                                    <span className=" text-lg text-slate-600">$67,500</span>
                                </div>

                                <div className="min-h-16 border flex flex-col gap-y-1 justify-center border-gray-300 rounded-lg p-3 px-5 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300">
                                    <p className="text-gray-500">Next Unlock</p>
                                    <span className=" text-lg text-slate-600">Jun 15, 2023</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    
                    { timelineLoading ?
                        <div className="col-span-4">
                            <PropertyCardSkeleton/> 
                        </div>
                        :
                        <div className="col-span-4">
                            <div className='bg-[#18181B] rounded-lg font-circular shadow-md min-h-52 h-max mb-20 p-8 relative'>
                                <p className='font-poppins text-white font-bold text-lg'>
                                    Extra
                                </p>

                                <div className="py-8 text-primary flex flex-col gap-y-2">
                                    <div className="flex space-x-2">
                                        <p className=" text-white min-w-32">Name:</p>
                                        <p className="text-lg">{timeline[0]?.args.name}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <p className="text-white min-w-32">Address:</p>
                                        <p className="text-lg">{timeline[0]?.args.propertyAddress}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <p className="text-white min-w-32">Current Price:</p>
                                        <p className="text-lg">{timeline[0]?.args.currency} {priceFormatter(Number(timeline[0]?.args.value), 5)} {}</p>
                                    </div>
                                    <div className="flex space-x-2">
                                        <p className="text-white min-w-28">Payment Duration:</p>
                                        <p className="">{formatDurationFromMonths(Number(timeline[0]?.args.duration))}</p>
                                    </div>

                                    <div className="flex space-x-2">
                                        <p className="text-white min-w-32">Flexible Payment:</p>
                                        <p className="">No</p>
                                    </div>
                                </div>

                                <p  className=' font-circular text-base text-[#F4F4F5] mt-3'>
                                    Continue to view property payment history on explorer
                                </p>

                                <Link target="_blank" href={`https://sepolia-blockscout.lisk.com/tx/${timeline[0]?.txHash}`}>
                                    <Button className='flex items-center space-x-2 text-white bg-[#545756] mt-6'>
                                        <p className=''>View on Explorer</p>
                                        <svg
                                            className='scale-90'
                                            width='24'
                                            height='24'
                                            viewBox='0 0 24 24'
                                            fill='none'
                                            xmlns='http://www.w3.org/2000/svg'
                                        >
                                            <path
                                            d='M16.5 7.5L6 18'
                                            stroke='white'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            />
                                            <path
                                            d='M8 6.18791C8 6.18791 16.0479 5.50949 17.2692 6.73079C18.4906 7.95209 17.812 16 17.812 16'
                                            stroke='white'
                                            strokeWidth='1.5'
                                            strokeLinecap='round'
                                            strokeLinejoin='round'
                                            />
                                        </svg>
                                    </Button>                                
                                </Link>

                                <div className='absolute bottom-0 right-0'>
                                    <svg
                                        width='72'
                                        height='72'
                                        viewBox='0 0 72 72'
                                        fill='none'
                                        xmlns='http://www.w3.org/2000/svg'
                                    >
                                        <path
                                        d='M23.0405 26.1139C23.1074 25.3881 23.3539 24.639 23.9965 23.9964C24.6391 23.3538 25.3881 23.1073 26.114 23.0404C26.6855 22.9876 27.4435 23.0512 28.0271 23.1003C31.812 23.4154 35.5891 24.688 38.5745 27.6733L40.8744 29.9732C41.9077 31.0065 42.293 31.3646 42.609 31.5342L42.6131 31.5365C42.7251 31.5965 43.03 31.6508 43.7526 31.54C45.0767 31.2453 47.4999 30.706 49.3813 32.5874C50.2268 33.4329 50.9546 34.5104 51.0002 35.8316C51.0469 37.191 50.3581 38.2934 49.5156 39.1359L39.1359 49.5156C38.2934 50.3581 37.191 51.0469 35.8318 51.0001C34.5105 50.9544 33.433 50.2267 32.5875 49.3812C30.7061 47.4998 31.2454 45.0766 31.54 43.7525C31.6509 43.0299 31.5967 42.7249 31.5366 42.6131L31.5343 42.6089C31.3646 42.2929 31.0065 41.9077 29.9733 40.8744L27.6734 38.5745C24.688 35.5891 23.4155 31.812 23.1004 28.0271C23.0513 27.4434 22.9877 26.6854 23.0405 26.1139Z'
                                        fill='url(#paint0_linear_230_660)'
                                        />
                                        <path
                                        fillRule='evenodd'
                                        clipRule='evenodd'
                                        d='M35.3833 64.3965C33.3949 61.1257 33.658 56.7622 36.5726 53.8476C37.5267 52.8935 39.052 52.8718 39.9795 53.7994C40.9071 54.7269 40.8855 56.2522 39.9313 57.2063C38.6035 58.5342 38.4894 60.9471 40.1389 62.5966L41.8182 64.276L40.0906 66.0036C38.7628 67.3315 38.6487 69.7444 40.2983 71.3941C41.9478 73.0436 44.3608 72.9294 45.6886 71.6016C46.6428 70.6475 48.1681 70.6258 49.0956 71.5534C50.0231 72.4809 50.0015 74.0062 49.0474 74.9604C45.6046 78.4031 40.1402 78.1463 36.8432 74.8493C34.0628 72.0689 33.4443 67.7472 35.3833 64.3965ZM53.8003 39.9786C52.8727 39.0511 52.8943 37.5259 53.8485 36.5716C56.7631 33.6571 61.1266 33.3941 64.3973 35.3824C67.7481 33.4434 72.0698 34.0619 74.8501 36.8423C78.1472 40.1393 78.4041 45.6037 74.9612 49.0466C74.0071 50.0006 72.4819 50.0222 71.5543 49.0947C70.6268 48.1671 70.6483 46.6419 71.6024 45.6878C72.9303 44.3599 73.0445 41.9469 71.395 40.2974C69.7454 38.6477 67.3324 38.7619 66.0044 40.0898C65.0503 41.0439 63.5251 41.0655 62.5976 40.1379C60.9481 38.4884 58.5351 38.6026 57.2073 39.9304C56.2531 40.8846 54.7278 40.9062 53.8003 39.9786ZM43.4348 50.3441C44.3889 49.3901 45.9141 49.3685 46.8416 50.296L55.2385 58.6929C56.1661 59.6205 56.1445 61.1457 55.1905 62.0998C54.2362 63.054 52.7109 63.0756 51.7834 62.1481L43.3865 53.7512C42.459 52.8236 42.4806 51.2983 43.4348 50.3441ZM50.345 43.4339C51.2992 42.4797 52.8245 42.4581 53.752 43.3857L57.1108 46.7444C58.0383 47.672 58.0168 49.1972 57.0625 50.1514C56.1085 51.1055 54.5832 51.1271 53.6557 50.1995L50.2969 46.8408C49.3694 45.9132 49.3909 44.388 50.345 43.4339Z'
                                        fill='url(#paint1_linear_230_660)'
                                        />
                                        <defs>
                                        <linearGradient
                                            id='paint0_linear_230_660'
                                            x1='23.9965'
                                            y1='23.9964'
                                            x2='44.3258'
                                            y2='44.3257'
                                            gradientUnits='userSpaceOnUse'
                                        >
                                            <stop stopColor='#8C57E8' />
                                            <stop offset='1' stopColor='#F146C0' />
                                        </linearGradient>
                                        <linearGradient
                                            id='paint1_linear_230_660'
                                            x1='33.8084'
                                            y1='33.8075'
                                            x2='62.0043'
                                            y2='62.0034'
                                            gradientUnits='userSpaceOnUse'
                                        >
                                            <stop stopColor='#8C57E8' />
                                            <stop offset='0.250784' stopColor='#F146C0' />
                                            <stop offset='1' stopColor='#FFC755' />
                                        </linearGradient>
                                        </defs>
                                    </svg>
                                </div>
                            </div>
                            
                            <img
                                src={timeline[0]?.args.image}
                                alt="violin"
                                // height={100}
                                // width={100}
                                className="w-full rounded-lg max-h-52"
                            />
                        </div>
                    }
                </div>

                <div className="app-container">
                    <div className="bg-white p-5 rounded-lg mt-16 mb-16 py-8">
                        <p className="text-slate-600 font-semibold text-2xl mb-5">Rent Payment History</p>
                        <PropertyPaymentHistoryTable/>
                    </div>
                </div>
            </main>
        </>
    )
}


export default LandlordPropertiesDetailPage