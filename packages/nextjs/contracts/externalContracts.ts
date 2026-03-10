import { IdentityRegistryABI } from "@/abi/IdentityRegistery";
import { GenericContractsDeclaration } from "@/utils/scaffold-eth/contract";

/**
 * @example
 * const externalContracts = {
 *   1: {
 *     DAI: {
 *       address: "0x...",
 *       abi: [...],
 *     },
 *   },
 * } as const;
 */
const externalContracts = {
    // 33234: {
    //     IdentityRegisteryContract: {
    //         address: "",
    //         abi: IdentityRegistryABI,
    //         inheritedFunctions: {},
    //     },
    // }
} as const;

export default externalContracts satisfies GenericContractsDeclaration;
