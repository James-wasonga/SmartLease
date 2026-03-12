import { Contract, ContractName, contracts } from '@/utils/scaffold-eth/contract';
import { Address } from 'viem';

const targetNetwork = 4202;
type DeployedContractNameTypes = "RentToOwn" | "RentToOwnContract" | "IdentityRegistry" | "PropertyToken";

/** Use targetNetwork if it has contracts, otherwise 31337 so we never read .address of undefined. */
const chainId =
  contracts?.[targetNetwork]?.IdentityRegistry != null ? targetNetwork : 31337;

/** Rent contract may be named RentToOwn (localhost) or RentToOwnContract (e.g. Lisk). */
const rentContract = (
  contracts?.[chainId]?.["RentToOwnContract" as ContractName] ??
  contracts?.[chainId]?.["RentToOwn" as ContractName]
) as Contract<DeployedContractNameTypes>;
const identityContract = contracts?.[chainId]?.["IdentityRegistry" as ContractName] as Contract<DeployedContractNameTypes>;
const propertyContract = contracts?.[chainId]?.["PropertyToken" as ContractName] as Contract<DeployedContractNameTypes>;

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000" as Address;
const EMPTY_ABI = [] as const;

if (!rentContract?.address || !identityContract?.address || !propertyContract?.address) {
  console.warn(
    "[generic.ts] No deployed contracts for chain",
    chainId,
    "- Add this chain and addresses to deployedContracts.ts"
  );
}

export const genericContractRequestRentToOwn = {
  address: (rentContract?.address ?? ZERO_ADDRESS) as Address,
  abi: rentContract?.abi ?? EMPTY_ABI,
} as const;

export const genericContractRequestIdentityProvider = {
  address: (identityContract?.address ?? ZERO_ADDRESS) as Address,
  abi: identityContract?.abi ?? EMPTY_ABI,
} as const;

export const genericContractRequestPropertyToken = {
  address: (propertyContract?.address ?? ZERO_ADDRESS) as Address,
  abi: propertyContract?.abi ?? EMPTY_ABI,
} as const;