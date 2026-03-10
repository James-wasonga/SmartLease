"use client";

import { Routes } from "@/app/routes";
import { Button } from "@/components/ui/button";
import { useGetTotalPaidToLandlord, useWithrawRent } from "@/services/request/contract/contract-request";
import { getParsedError } from "@/utils/scaffold-eth";
import { Loader } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
//this is page allows the landlord to withdraw funds from the wallet
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount, useWaitForTransaction } from "wagmi";

export default function WithdrawFundsClientPage() {
  const params = useSearchParams()
  const propertyId = params.get("id")

  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  
  const [lastUpdated, setLastUpdated] = useState("Today at 09:45 AM");
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const {address} = useAccount()
  const router = useRouter()

  const {
    data: lndlordBalance, 
    isSuccess: isSuccess,
    isLoading: loading,
    error
  } = useGetTotalPaidToLandlord(Number(propertyId))
  // propertyId
  const {writeAsync: createProperty, isLoading: isLoading} = useWithrawRent()
  const [wLoading, setWLoading] = useState(false)

    useEffect(() => {
      if (isSuccess && lndlordBalance !== undefined) {
        console.log(lndlordBalance)
        //@ts-ignore
        setBalance(Number(lndlordBalance));
      }
      if (error) {
        toast.error(error.message);
      }
    }, [isSuccess, lndlordBalance, error]);


    const withdrawFunds = async () => {
      setWLoading(true)
      try {
          const tx = await createProperty({args: [propertyId]})
          setTxHash(tx.hash);
      }catch (err) {'['
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
          toast.success(`Withdrawl successful. Tnx  hash ${txHash}`)
          router.push(Routes.LANDLORD)
        // navigate or update UI here
      },
      onError(error) {
        console.error("Tx failed to confirm", error);
        setWLoading(false)
      },
  });
  


  return (
      <div className="bg-gray-100 mt-3 min-h-[90vh]">
        <div className="max-w-lg mx-auto w-full mt-20 p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-2">Withdraw Funds</h2>

          <p className="text-2xl font-bold text-gray-800">{balance}</p>
          <p className="text-sm text-gray-500 mb-4">Last updated: {lastUpdated}</p>

          {/* <label className="block text-sm font-medium text-gray-700 mb-1">
            Withdrawal Amount
          </label>
          <input
            type="number"
            placeholder="$ 0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-2 mb-4 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          /> */}

          <label className="block text-base font-medium text-gray-700 mb-1">
              Withdrawal Method
          </label>
          <select
            className="w-full px-4 py-2 mb-6 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
          >
            <option>Smart Wallet {address}</option>
            {/* More options to be added later */}
          </select>

          <Button
            onClick={withdrawFunds}
            // disabled={balance < 1}
            className="w-full bg-blue-600 disabled:bg-gray-200 text-white py-7 rounded-md hover:bg-blue-700 font-semibold"
          >
              { wLoading ?
              <div className="">
                <Loader/> 
              </div>
                :
                <p className="">Withdraw Funds</p>
              }
          </Button>

          <p className="text-xs text-center text-gray-400 mt-2">
            Secured by smart contract
          </p>
        </div>
      </div>
  );
}
