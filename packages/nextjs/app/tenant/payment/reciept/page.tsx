"use client";

import {
  ReceiptText,
  Check,
  Copy,
  HelpCircle,
  HardDriveDownload,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import QRCode from "qrcode.react";
import { SiEthereum } from "react-icons/si";
import { ProgressDemo } from "~~/components/tenants/ProgressDemo";
import { Button } from "~~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~~/components/ui/card";

const qrData = JSON.stringify({
  id: " 0xabc123...def456",
  amount: 0.05,
  date: "June 2, 2025",
});

const transactions = [
  {
    name: "Abena May",
    address: " 0xA1b2...D3e4",
    id: "#1234",
    loc: "23 Maple Street, Lagos",
    accEquity: 7,
    date: "May 1, 2023",
    amount: 1850,
    status: "completed",
    equityEarned: "+0.25%",
    transaction: "0x71C9...8F3e",
  },
  {
    name: "Abena May",
    address: " 0xA1b2...D3e4",
    id: "#1234",
    loc: "23 Maple Street, Lagos",
    accEquity: 6.75,
    date: "Apr 1, 2023",
    amount: 1850,
    status: "completed",
    equityEarned: "+0.25%",
    transaction: "0x83B2...9D2a",
  },
  {
    name: "Abena May",
    address: " 0xA1b2...D3e4",
    id: "#1234",
    loc: "23 Maple Street, Lagos",
    accEquity: 6.5,
    date: "Mar 1, 2023",
    amount: 1850,
    status: "completed",
    equityEarned: "+0.25%",
    transaction: "0x92F5...7C1b",
  },
  {
    name: "Abena May",
    address: " 0xA1b2...D3e4",
    id: "#1234",
    loc: "23 Maple Street, Lagos",
    accEquity: 6.25,
    date: "Feb 1, 2023",
    amount: 1850,
    status: "completed",
    equityEarned: "+0.25%",
    transaction: "0x45E8...3F9c",
  },
];

interface Props {
  params: { transaction: string };
}

export default function Reciept({ params }: Props) {
  //   const transaction = transactions.find(
  //     (t) => t.transaction === params.transaction
  //   );

  //   if (!transaction) {
  //     return <div>No transaction recorded</div>;
  //   }

  return (
    <div className="flex flex-col">
      <header className="flex-jb-ic px-32 py-5 equity-hd border-b">
        <div className="flex-ic gap-2">
          <ReceiptText className="notfi-icon bg-purple-500 !rounded-sm text-white" />
          Smart Lease
        </div>
        <div>Payment Receipt</div>
      </header>
      <Button className=" mx-4 my-8 w-[10%]">
        <Link href="/tenant/payment">Go back</Link>
      </Button>

      <main className=" self-center w-[40%] ">
        <section className="  flex-ic gap-2 bg-rd-green py-4 px-20 rounded-t-xl">
          <Check className="border rounded-sm p-1 text-white bg-emerald-400" />
          <p className=" text-sm">
            Thank you for your payment! Your equity has been updated
          </p>
        </section>
        <Card className="rounded-t-none space-y-3">
          <CardHeader className="flex-jb-ic flex-row border-b !pb-3">
            <CardTitle>Payment Receipt</CardTitle>
            <CardDescription>Receipt # RTW-23456</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 flex flex-col">
            <section className="space-y-2.5">
              <p className="text-gray-bold">TENANT INFORMATION</p>
              <div className="flex-jb-ic">
                <div>
                  <p className="text-gray">Tenant Name</p>
                  <p className="text-dark">Janet Doe</p>
                </div>
                <div className="w-[40%]">
                  <p className="text-gray">Wallet Address</p>
                  <p className="text-dark flex-ic">
                    0xA1b2...D3e4{" "}
                    <Copy className="notfi-icon !rounded-none text-gray-500" />
                  </p>
                </div>
              </div>
            </section>
            <section className="space-y-2.5">
              <p className="text-gray-bold">PROPERTY INFORMATION</p>
              <div className="flex-jb-ic">
                <div>
                  <p className="text-gray">Property ID</p>
                  <p className="text-dark">#1123</p>
                </div>
                <div className="w-[40%]">
                  <p className="text-gray">Property Address</p>
                  <p className="text-dark flex-ic">23 Maple Street, Lagos</p>
                </div>
              </div>
            </section>
            <section className="space-y-2.5">
              <p className="text-gray-bold">PAYMENT DETAILS</p>
              <div className="flex-jb-ic">
                <div>
                  <p className="text-gray">Payment Date</p>
                  <p className="text-dark">June 2, 2025</p>
                </div>
                <div className="w-[40%]">
                  <p className="text-gray">Payment Amount</p>
                  <p className="text-dark flex-ic gap-2">
                    <SiEthereum /> 0.05 ETH
                  </p>
                </div>
              </div>
            </section>
            <section className="space-y-2.5">
              <p className="text-gray-bold">EQUITY INFORMATION</p>
              <div className="flex-jb-ic">
                <div>
                  <p className="text-gray">Ownership Equity Gained</p>
                  <p className="text-emerald-400 font-semibold">0.5%</p>
                </div>
                <div className="w-[40%]">
                  <p className="text-gray">Cumulative Equity to Date</p>
                  <p className=" font-semibold text-purple-500 flex-ic">4.5%</p>
                </div>
              </div>
            </section>
            <section className="space-y-2.5">
              <p className="text-gray-bold">TRANSACTION INFORMATION</p>
              <div className="">
                <p className="text-gray">Transaction Hash</p>
                <p className="text-dark flex-ic">
                  0xabc123...def456{" "}
                  <Copy className="notfi-icon !rounded-none text-gray-500" />
                </p>
              </div>
            </section>
            <section className="self-center">
              <QRCode value={qrData} size={128} />
            </section>
          </CardContent>
          <CardFooter className="border-t pt-6 gap-3 flex items-center justify-center">
            <Button variant={"outline"} className="text-gray-bold border-2">
              <HardDriveDownload /> Download PDF Receipt
            </Button>
            <Button className="bg-purple-500 text-xs">
              <ExternalLink />
              View on Etherscan
            </Button>
          </CardFooter>
        </Card>
        <Card className="mt-5">
          <CardHeader>
            <CardTitle>Your Ownership Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <ProgressDemo value={4.5} className="progress-purple-fill" />
              <div className="flex-jb-ic text-gray">
                <p>0%</p>
                <p className="text-purple-500 font-semibold">4.5% Complete</p>
                <p>100%</p>
              </div>
            </div>
            <p className="text-gray">
              Keep making your payments on time to increase your ownership
              equity. Your next payment is due on July 2, 2025.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
