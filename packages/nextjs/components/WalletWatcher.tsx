'use client';

import { useCallback, useEffect, useState } from 'react';
import { Address, useAccount, useWaitForTransaction } from 'wagmi';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  setUserRole,
  getUserRole,
  clearUserRole,
} from '@/lib/cookies';
import { checkUserExistsAndRole, registerUserRole} from '@/services/request/user-request';
import { RoleEnum, useGetUserRole, useSetUserRole } from '@/services/request/contract/contract-request';
import { toast } from 'sonner';
import { Loader } from 'lucide-react';
import { getParsedError } from '@/utils/scaffold-eth';

export function WalletWatcher() {
  const { isConnected, address } = useAccount();
  const router = useRouter();

  const [showRoleModal, setShowRoleModal] = useState(false);
  const [hasHandled, setHasHandled] = useState(false);
  const role = typeof window !== 'undefined' ? getUserRole() : undefined;
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const { writeAsync: setRole , isLoading: isLoading } = useSetUserRole();

  useEffect(() => {
    toast("Hello")
  }, [])

  const {
    data: userRole, 
    isSuccess: getRoleSuccess
  } = useGetUserRole(address as Address)

  useEffect(() => {
    if (!isConnected || !address || hasHandled) return;

    const onboard = async () => {
      const cookieRole = typeof window !== 'undefined' ? getUserRole() : undefined;
      if (cookieRole) {
        // commented out, cause i want the user to remain on any page they are, but the dashboard button takes them where they want to
        router.push(`/${cookieRole}`);
        setHasHandled(true);
        return;
      }

      const data = userRole;
      if (getRoleSuccess && userRole !== undefined && userRole !== 0) {
        setUserRole(roleEnumToString(data as RoleEnum));
        // router.push(`/${result.role}`);
      } else {
        setShowRoleModal(true);
      }

      setHasHandled(true);
    };

    onboard();
  }, [isConnected, address, hasHandled, router]);

  const roleStringToEnum = (role: string | undefined) => {
    if (role === undefined || role === null) return RoleEnum.None
    if (role === "tenant") return RoleEnum.Tenant
    if (role === "landlord") return RoleEnum.Landlord
    return RoleEnum.None
  }

  const roleEnumToString = (role: RoleEnum) => {
    if (role === RoleEnum.Tenant) return "tenant"
    else return "landlord" 
  }

  useEffect(() => {
    if (!isConnected && hasHandled) {
      clearUserRole();
      setHasHandled(false);
      setShowRoleModal(false);
      router.replace("/")
    }
  }, [isConnected, hasHandled, router]);

  const handleSelectRole = async (role: 'tenant' | 'landlord') => {
   
    if (!address) return;
    
    try {
        const tx = await setRole({ args: [roleStringToEnum(role)] }); // <== pass args here
        setTxHash(tx.hash); // wait for this tx
        setUserRole(role)
    } catch (err) {
      const error = getParsedError(err)
      toast.error(error)
    }
  };

  useWaitForTransaction({
    hash: txHash,
    confirmations: 1,
    enabled: !!txHash,
    onSuccess() {
      // console.log("Transaction confirmed!");
      
      toast.success("User role set successfully. You can proceed to your dashboard")
      setShowRoleModal(false);
      // navigate or update UI here
    },
    onError(error) {
      console.error("Tx failed to confirm", error);
    },
  });

  const renderDasboardHeader = useCallback(() => {
    return (
      <>
        { (role !== undefined && isConnected) &&
            <div  className="">
                <Button onClick={() => { router.push(`/${role}`)}} className="bg-white border-primary border text-primary rounded-lg py-6 hover:bg-white px-4 shadow-none">Dashbboard</Button>
            </div>
        }
        { (role === undefined && isConnected) &&
            <div className="">
                <Button onClick={() => {setShowRoleModal(true)}} className="bg-white border-primary border text-primary rounded-lg py-6 hover:bg-white px-4 shadow-none">Select Role</Button>
            </div>
        }
      </>
    )
  }, [role, isConnected, router])


  return (
    <>
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className='text-xl mb-3'>Please select your role to proceed</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className='w-1/2 border relative flex flex-col items-center gap-y-2 border-gray-300 hover:border-primary cursor-pointer rounded-lg py-5'  onClick={() => handleSelectRole('landlord')}>
                  <img width="96" height="96" src="https://img.icons8.com/color/96/equal-housing-opportunity.png" alt="equal-housing-opportunity"/>

                  <p className="font-medium text-blue-600">
                    Landlord
                  </p>

                  { isLoading &&
                    <div className='absolute top-0 left-0 w-full h-full bg-black/10'>
                        <Loader className='h10 w-10'/>
                    </div> 
                  }
              </div>

              <div className='w-1/2 border flex flex-col relative items-center gap-y-2 border-gray-300 hover:border-primary cursor-pointer rounded-lg py-5'  onClick={() => handleSelectRole('tenant')}>
                  <img width="96" height="96" src="/tenant.png" alt="equal-housing-opportunity"/>

                  <p className="font-medium text-blue-600">
                    Tenant
                  </p>

                  { isLoading &&
                    <div className='absolute top-0 left-0 w-full h-full bg-black/10'>
                        <Loader className='h10 w-10'/>
                    </div> 
                  }
              </div>             
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {renderDasboardHeader()}
    </>
  );
}