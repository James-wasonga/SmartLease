'use client'
import {
  Bell,
  PieChart,
  Database,
  DollarSign,
  CalendarCheck,
  Home,
  Lock,
  LockOpen,
  Wallet,
  Eye,
  HelpCircle,
  Settings,
  Copy,
  History,
  Shield,
} from "lucide-react";
import ChartDemo from "~~/components/tenants/ChartDemo";
import MilestoneProgress from "~~/components/tenants/MilestoneDemo";
import { ProgressDemo } from "~~/components/tenants/ProgressDemo";
import { Avatar, AvatarFallback, AvatarImage } from "~~/components/ui/avatar";
import { Badge } from "~~/components/ui/badge";
import { Button } from "~~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~~/components/ui/card";

const milestones = [
  {
    tier: "Bronze Tier",
    goal: "Reached 10% ownership (100 tokens)",
    unlocked: "Priority maintenance requests",
    progress: 0,
  },
  {
    tier: "Silver Tier",
    goal: "Reached 20% ownership (200 tokens)",
    unlocked: "Property improvement voting rights",
    progress: 0,
  },
  {
    tier: "Gold Tier",
    goal: "Reached 30% ownership (300 tokens)",
    unlocked: "Reduced monthly payments",
    progress: 24.8,
  },
  {
    tier: "Platinum Tier",
    goal: "Reach 50% ownership (500 tokens)",
    unlocked: "Property modification rights",
    progress: 0,
  },
];
const currentMilestone = 2;

export default function EquityGrowthPage() {
  return (
    <div className="pt-4 app-container">/
      <header className="flex-jb-ic border-b pb-8">
        <div className="flex gap-2 items-center">
          <Home className="notfi-icon !rounded-sm bg-emerald-400 text-white" />
          <p className="equity-hd text-2xl">Equity Growth</p>
        </div>
      </header>

      <main className=" mt-10 space-y-6">
        <section className="grid grid-cols-4 gap-7">
          <Card>
            <CardHeader className="card-hdr">
              <CardTitle className="text-gray card-titl">
                Current Ownership
                <PieChart className="notfi-icon bg-rd-green" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="value ">24.8%</p>
              <p className="text-gray">+1.2% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="card-hdr">
              <CardTitle className="text-gray card-titl">
                Tokens Held
                <Database className="notfi-icon bg-rd-blue" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="value ">248</p>
              <p className="text-gray">of 1,00 total tokens</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="card-hdr">
              <CardTitle className="text-gray card-titl">
                Projected Full Ownership
                <CalendarCheck className="notfi-icon bg-rd-purple" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="value ">2029</p>
              <p className="text-gray">Est.June 2029 (5.2 years)</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="card-hdr">
              <CardTitle className="text-gray card-titl">
                Current Value
                <DollarSign className="notfi-icon bg-rd-green" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="value ">$74,400</p>
              <p className="text-gray">Based on current market value</p>
            </CardContent>
          </Card>
        </section>
        <section>
          <Card>
            <CardHeader className="flex-jb-ic flex-row j!py-3">
              <CardTitle className="equity-hd">Equity Chart</CardTitle>
              <div className="space-x-2">
                <Button className="timeBtn-On timeBtn-styl">Monthly</Button>
                <Button className="timeBtn-Off timeBtn-styl">Quaterly</Button>
                <Button className="timeBtn-Off timeBtn-styl">Yearly</Button>
              </div>
            </CardHeader>
            <CardContent>
              <ChartDemo />
            </CardContent>
          </Card>
        </section>
        <section className="space-y-4">
          <p className="equity-hd">Equity Vesting Status</p>
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader className="vest-stat-hd !pb-0">
                <CardTitle className="text-dark">Unlocked Equity</CardTitle>
                <LockOpen className="notfi-icon bg-rd-green" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="value flex items-center gap-2">
                  186 <span className="text-gray">tokens (18.6%)</span>
                </p>
                <ProgressDemo value={75} className="progress-green-fill" />
                <div className="flex-jb-ic">
                  <p className=" text-xs">Last unlocked: May 15, 2023</p>
                  <p className="text-xs text-emerald-400">
                    75% of your holdings
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="vest-stat-hd !pb-0">
                <CardTitle className="text-dark">Locked Equity</CardTitle>
                <Lock className="notfi-icon bg-rd-red" />
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="value flex items-center gap-2">
                  62 <span className="text-gray">tokens (6.2%)</span>
                </p>
                <ProgressDemo value={25} className="progress-red-fill" />
                <div className="flex-jb-ic">
                  <p className=" text-xs">Next unlock: June 15, 2023</p>
                  <p className="text-xs text-emerald-400">
                    25% of your holdings
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Ownership Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <MilestoneProgress
                milestones={milestones}
                currentMilestone={currentMilestone}
              />
            </CardContent>
          </Card>
        </section>
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="equity-hd">Wallet Details</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-7">
              <Card className="bg-purple-200/10">
                <CardHeader
                  className="
                !pb-1 flex-jb-ic flex-row "
                >
                  <CardTitle className="">ERC1155 Token Balance</CardTitle>
                  <Wallet className="bg-rd-purple notfi-icon" />
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-gray">Token ID</p>
                    <p className="text-dark">#1092847</p>
                  </div>

                  <div>
                    <p className="text-gray">Smart Contract Address</p>
                    <p className="text-dark flex gap-2">
                      0x8a7b...e42f
                      <Copy className="w-3 text-purple-500" />
                    </p>
                  </div>
                  <Button className="text-xs bg-purple-500">
                    <Eye />
                    View on Etherscan
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-purple-200/10">
                <CardHeader
                  className="
                !pb-1 flex-jb-ic flex-row "
                >
                  <CardTitle className="">Transaction History</CardTitle>
                  <History className="bg-rd-blue notfi-icon" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex-jb-ic">
                    <div>
                      <p className="text-dark">12 tokens</p>
                      <p className="text-gray">May 15, 2023</p>
                    </div>
                    <Badge variant={"customGreen"}>Verified</Badge>
                  </div>

                  <div className="flex-jb-ic">
                    <div>
                      <p className="text-dark">12 tokens</p>
                      <p className="text-gray flex gap-2">Apr 15, 2023</p>
                    </div>
                    <Badge variant={"customGreen"}>Verified</Badge>
                  </div>
                  <div className="flex-jb-ic">
                    <div>
                      <p className="text-dark">12 tokens</p>
                      <p className="text-gray flex gap-2">Mar 15, 2023</p>
                    </div>
                    <Badge variant={"customGreen"}>Verified</Badge>
                  </div>
                  <Button
                    variant={"outline"}
                    className="text-xs w-full border-gray-300"
                  >
                    View All Transactions
                  </Button>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
