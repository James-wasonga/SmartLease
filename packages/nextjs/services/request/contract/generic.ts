import { Contract, ContractName, contracts } from '@/utils/scaffold-eth/contract';
import { Address } from 'viem';

const targetNetwork = 4202
// const targetNetwork = 31337
type DeployedContractNameTypes = "RentToOwnContract" | "IdentityRegisteryContract" | "PropertyTokenContract"

const rentContract = contracts?.[targetNetwork]?.["RentToOwnContract" as ContractName] as Contract<DeployedContractNameTypes>
const identityContract = contracts?.[targetNetwork]?.["IdentityRegisteryContract" as ContractName] as Contract<DeployedContractNameTypes>
const propertyContract = contracts?.[targetNetwork]?.["PropertyTokenContract" as ContractName] as Contract<DeployedContractNameTypes>


export const genericContractRequestRentToOwn = {
    address: rentContract.address as Address,
    abi: rentContract.abi,
} as const;

  export const genericContractRequestIdentityProvider = {
        address: identityContract.address as Address,
        abi: identityContract.abi,
  } as const;

  export const genericContractRequestPropertyToken = {
    address: propertyContract.address as Address,
    abi: propertyContract.abi,
  } as const;