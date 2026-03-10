'use client'
import {
  Bell,
  Wallet,
  Moon,
  Gift,
  PieChart,
  Gem,
  Lock,
  Ribbon,
  Medal,
  CalendarRange,
  EllipsisVertical,
} from "lucide-react";
import Image from "next/image";
import { ProgressDemo } from "~~/components/tenants/ProgressDemo";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~~/components/ui/card";
import { Switch } from "~~/components/ui/switch";


export default function TenantDashboard() {
  return (
    <div className="bg-gray-100">
      <div className="app-container mt-16 pb-20">
        <header className="flex justify-between mb-5 border-b">
          <h1 className="text-black font-semibold text-3xl">Tenant Dashboard</h1>
        </header>

        <main className="space-y-6">
          <div className="grid grid-cols-[2fr_1fr] gap-5">
            <Card className="">
              <CardHeader className="flex flex-row justify-between">
                <div>
                  <CardTitle className="mb-1 text-xl">Property Summary</CardTitle>
                  <CardDescription className="text-[0.8rem]">
                    Token ID: #1234
                  </CardDescription>
                </div>
                <Badge className="border rounded-3xl text-base py-1 bg-blue-500 px-7">
                  Active
                </Badge>
              </CardHeader>
              <CardContent className="flex gap-5 ">
                <Image
                  src="/building.png"
                  alt="Building"
                  className="w-fit border rounded-xl"
                  width={150}
                  height={100}
                />
                <div className="flex flex-col gap-10 w-full">
                  <div className="grid grid-cols-2  gap-20">
                    <div className="space-y-4">
                      <p className="text-gray text-base ">
                        Address <br />
                        <span className="text-dark text-lg">
                          123 Main Street, Apt 4B <br /> San Francisco CA 94105
                        </span>
                      </p>
                      <p className="text-gray text-lg">
                        Equity Earned <br />{" "}
                        <span className="text-emerald-500  font-semibold">
                          12.5%
                        </span>
                      </p>
                    </div>
                    <div className="space-y-8">
                      <p className="text-gray">
                        Monthly Rent <br />{" "}
                        <span className="text-dark text-xl">$2,400</span>
                      </p>
                      <p className="text-gray">
                        Next Vesting Date <br />{" "}
                        <span className="text-dark text-xl">May 1, 2023</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between ">
                      <p className="text-gray text-base">Vesting Progress</p>
                      <p className="text-dark">12.5% of 100%</p>
                    </div>

                    <ProgressDemo value={12.5} className="progress-green-fill" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="flex flex-col items-center ">
              <CardHeader>
                <CardTitle className="text-lg">Equity Progress</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <div className="relative ">
                  <div
                    className="radial-progress absolute left-1/2 top-1/2 -translate-x-1/2 
                    text-blue-50 "
                    style={
                      {
                        "--value": 100,
                        "--size": "9rem",
                        "--thickness": "0.8rem",
                      } as React.CSSProperties
                    }
                  ></div>
                  <div
                    className="radial-progress text-emerald-500 absolute -translate-x-1/2 left-1/2 top-1/2 flex flex-col items-center"
                    style={
                      {
                        "--value": 12.5,
                        "--size": "9rem",
                        "--thickness": "0.8rem",
                      } as React.CSSProperties
                    }
                  >
                    <h1 className="text-darkColor font-bold text-xl leading-none">
                      {" "}
                      12.5%
                    </h1>
                    <p className="text-gray leading-none">Equity Earned</p>
                  </div>
                </div>
                <div className="mt-[9.5rem] space-y-4">
                  <p className="text-gray text-lg">
                    Next Unlock <br />
                    <span className="text-dark">+1.5% on May 1, 2023</span>
                  </p>
                  <p className="text-grayColor text-sm">
                    Full ownership projected by <br />
                    <span className="text-blue-500 text-small font-semibold">
                      January 2031
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-5">
            <Card className="!p-0">
              <CardHeader className="space-y-3 !pb-3 ">
                <CardTitle className="text-xl">Rent Payment</CardTitle>
                <CardDescription className="flex gap-2 items-center text-sm text-red-500 border-0 rounded-sm p-3 font-bold bg-red-300/20">
                  <CalendarRange className="w-3" />
                  <div className=" space-y-1">
                    <p className="leading-none">Rent Due</p>
                    <p className="leading-none">May 1, 2023 (5 days)</p>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="">
                <p className="text-gray">Amount Due</p>
                <p className="text-dark mb-2">$2,400.00</p>
                <div className="flex justify-between">
                  <div
                    className="flex items-center mb-3
                  "
                  >
                    <span className="text-gray">Gasless Transactions</span>
                    <Switch checked={true} className="scale-75" />
                  </div>
                  <div
                    className="flex items-center
                  "
                  >
                    <span className="text-gray">AutoPay</span>
                    <Switch checked={true} className="scale-75" />
                  </div>
                </div>

                <Button className="w-full text-xs">Pay Now</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="space-y-3 !pb-3 ">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Rewards & Badges</CardTitle>
                  <p className="text-blue-500 text-sm">View All</p>
                </div>
                <CardDescription className="border-0 rounded-sm bg-blue-300/20 flex p-3 gap-2 items-center ">
                  <Medal
                    className="border-none rounded-full p-2 bg-blue-300/30 w-9 h-9 text-gray-100"
                    fill="rgb(20, 130, 199)"
                  />
                  <div>
                    <p className="text-dark">On-time Payment Streak</p>
                    <p className="text-blue-500 font-bold text-[1rem]">
                      12 <span className="text-gray font-normal">months</span>
                    </p>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <Card className="mini-card">
                    <Ribbon className="mini-card-icon bg-rd-green" />
                    <p className="mini-card-p ">Punctual Payer</p>
                  </Card>
                  <Card className="mini-card">
                    <Gem
                      className="mini-card-icon bg-purple-400/25 text-gray-300"
                      fill="rgb(132, 50, 220)"
                    />
                    <p className="mini-card-p">Equity Builder</p>
                  </Card>
                  <Card className="mini-card">
                    <Lock className="mini-card-icon bg-rd-gray" />
                    <p className=" text-gray-400 mt-1">Locked</p>
                  </Card>
                </div>
                <div className="text-center">
                  <p className="text-gray">Next reward in 16 days</p>
                  <p className="text-xs text-blue-500">
                    Complete 3 more on-time payments
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Notifications</CardTitle>
                  <EllipsisVertical className="w-4 text-gray-500" />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <ul className="nofti-ul">
                  <Bell className="notfi-icon bg-rd-red" />
                  <li>
                    <p className="text-dark">Rent due Reminder</p>
                    <p className="text-gray nofti-p">
                      Your rent of $2,400 is due in 5 days <br />
                      <span className="font-normal">2 hours ago</span>
                    </p>
                  </li>
                </ul>
                <ul className="nofti-ul">
                  <PieChart className="notfi-icon bg-rd-green " />
                  <li>
                    <p className="text-dark">Equity Update</p>
                    <p className=" text-gray nofti-p ">
                      You've earned 1.5% more equity this month <br />
                      <span className="nofti-span">2 days ago</span>
                    </p>
                  </li>
                </ul>
                <ul className="nofti-ul">
                  <Wallet className="notfi-icon bg-rd-blue" />
                  <li>
                    <p className="text-dark">Wallet Connected</p>
                    <p className=" text-gray nofti-p ">
                      Your smart wallet was successfully connected <br />
                      <span className="nofti-span">5 days ago</span>
                    </p>
                  </li>
                </ul>
                <ul className="nofti-ul ">
                  <Gift className="notfi-icon bg-rd-purple" />
                  <li>
                    <p className="text-dark">Reward Earned</p>
                    <p className=" text-gray nofti-p ">
                      You've earned the "Punctual Payer" badge
                      <br />
                      <span className="nofti-span">1 week ago</span>
                    </p>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}
