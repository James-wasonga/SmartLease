import {
  genericContractRequestIdentityProvider,
  genericContractRequestPropertyToken,
  genericContractRequestRentToOwn,
} from "./generic";
import { RentToOwnABI } from "@/abi/RentToOwn";
import { RenToOwnAddress } from "@/constants/contract-address";
import { Address, useAccount, useContractRead, useContractWrite } from "wagmi";

export enum RoleEnum {
  None = 0,
  Tenant = 1,
  Landlord = 2,
}

export enum PaymentType {
  Fixed = 0,
  Flexible = 1,
}

// create property
export function useCreateProperty(
    // value: number,
    // duration: number,
    // paymentType: PaymentType,
    // name: string,
    // image: string,
    // propertyAddr: string,
    // city: string,
    // state: string,
    // zipCode: string,
    // currency: string
) { 
    return useContractWrite({
        ...genericContractRequestRentToOwn,
        functionName: "createProperty",
        // args: [
     
        // ]
    })
}

// User pays rent
export function usePayRent() {
  return useContractWrite({
    ...genericContractRequestRentToOwn,
    functionName: "payRent",
    // args: [],
  });
}

// User pays rent
export function useWithrawRent() {
  return useContractWrite({
    ...genericContractRequestRentToOwn,
    functionName: "withdrawRent",
    // args: [],
  });
}

// getEscrow Balance
export function useGetEscrowBalance(propertyId: number) {
  return useContractRead({
    ...genericContractRequestRentToOwn,
    functionName: "getEscrowBalance",
    args: [propertyId],
  });
}

// total paid to landlord
export function useGetTotalPaidToLandlord(propertyId: number) {
  return useContractRead({
    ...genericContractRequestRentToOwn,
    functionName: "getTotalPaidToLandlord",
    args: [propertyId],
    // watch: true,
  });
}

// get property token id
export function useGetPropertyTokenId(propertyId: number) {
  return useContractRead({
    ...genericContractRequestRentToOwn,
    functionName: "getPropertyTokenId",
    args: [propertyId],
    watch: true,
  });
}

// Is property available
export function useIsPropertyAvailable(propertyId: number) {
  return useContractRead({
    ...genericContractRequestRentToOwn,
    functionName: "isAvailable",
    args: [propertyId],
    watch: true,
  });
}

// total paid by tenant
export function useTotalPaidByTenant(propertyId: number, tenantAddr: Address) {
  return useContractRead({
    ...genericContractRequestRentToOwn,
    functionName: "getTenantTotalPaid",
    args: [propertyId, tenantAddr],
    watch: true,
  });
}

// return tennant equity
export function useGetTenantEquity(propertyId: number, tenantAddr: Address) {
  return useContractRead({
    ...genericContractRequestRentToOwn,
    functionName: "getTenantEquity",
    args: [propertyId, tenantAddr],
    watch: true,
  });
}

//returns details about the property
export function useGetPropertyMetadata(propertyid: number) {
  return useContractRead({
    ...genericContractRequestRentToOwn,
    functionName: " getPropertyMetadata",
    args: [propertyid],
    watch: true,
  });
}

// PROPERTY TOKEN CONTRACT
// Get a property metadata

export function useGetPropertyMetadataUri(tokenId: number) {
  return useContractRead({
    ...genericContractRequestPropertyToken,
    functionName: "getPropertyMetadataUri",
    args: [tokenId],
    watch: true,
  });
}

// IDENTITY PROVIDER CONTRACT
export function useSetUserRole(
    // role: number,
) { 
    // console.log(role)
    return useContractWrite({
        ...genericContractRequestIdentityProvider,
        functionName: "setUserRole",
    })
}

/** Chain ID where IdentityRegistry is deployed (e.g. localhost). Only call getUserRole on this chain to avoid reverts on others. */
const IDENTITY_REGISTRY_CHAIN_ID = 31337;

export function useGetUserRole(user: Address) {
  const { chain } = useAccount();
  const isCorrectChain = chain?.id === IDENTITY_REGISTRY_CHAIN_ID;

  return useContractRead({
    ...genericContractRequestIdentityProvider,
    functionName: "getUserRole",
    args: [user],
    enabled: !!user && !!isCorrectChain,
  });
}

export function useIsTenant(user: Address) {
  return useContractRead({
    ...genericContractRequestPropertyToken,
    functionName: "isTenant",
    args: [user],
    enabled: !!user,
  });
}

export function useIsLandlord(user: Address) {
  return useContractRead({
    ...genericContractRequestPropertyToken,
    functionName: "isLandlord",
    args: [user],
    enabled: !!user,
  });
}
