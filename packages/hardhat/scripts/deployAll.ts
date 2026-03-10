import { ethers } from "hardhat";
import { Contract } from "ethers";
import { IdentityRegistry, RentToOwn, RentPaymaster, PropertyToken } from "../typechain-types";

// You can use a minimal ERC20 ABI for the existing Lisk token
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address) view returns (uint)",
  "function transfer(address to, uint amount) returns (bool)",
];

async function main(): Promise<void> { 
  const [deployer] = await ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await ethers.provider.getBalance(deployerAddress);

  console.log("👤 Deployer address:", deployerAddress);
  console.log("💰 Deployer balance (ETH):", ethers.formatEther(balance));

  const entryPointAddress: string = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789"; // ERC-4337 EntryPoint
  const useExistingToken: boolean = true;
  const existingLiskTokenAddress: string = "0x5589BB8228C07c4e15558875fAf2B859f678d129"; // Lisk Sepolia

  let liskToken: Contract;

  // Step 1: Handle LiskToken (existing or deploy new)
  if (useExistingToken) {
    liskToken = new ethers.Contract(existingLiskTokenAddress, ERC20_ABI, deployer);
    console.log("🪙 Using existing LiskToken at:", existingLiskTokenAddress);
  } else {
    const LiskTokenFactory = await ethers.getContractFactory("LiskToken");
    liskToken = await LiskTokenFactory.deploy();
    await liskToken.waitForDeployment();
    console.log("✅ LiskToken deployed to:", await liskToken.getAddress());
  }

  // Step 2: Deploy IdentityRegistry (no dependencies)
  console.log("\n📋 Deploying IdentityRegistry...");
  const IdentityRegistryFactory = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry: IdentityRegistry = await IdentityRegistryFactory.deploy();
  await identityRegistry.waitForDeployment();
  const identityRegistryAddress = await identityRegistry.getAddress();
  console.log("✅ IdentityRegistry deployed to:", identityRegistryAddress);

  // Step 3: Deploy PropertyToken (depends on IdentityRegistry)
  console.log("\n🏠 Deploying PropertyToken...");
  const PropertyTokenFactory = await ethers.getContractFactory("PropertyToken");
  const propertyToken: PropertyToken = await PropertyTokenFactory.deploy(identityRegistryAddress);
  await propertyToken.waitForDeployment();
  const propertyTokenAddress = await propertyToken.getAddress();
  console.log("✅ PropertyToken deployed to:", propertyTokenAddress);

  // Step 4: Deploy RentToOwn (depends on LiskToken and PropertyToken)
  console.log("\n🏘️ Deploying RentToOwn...");
  const RentToOwnFactory = await ethers.getContractFactory("RentToOwn");
  const rentToOwn: RentToOwn = await RentToOwnFactory.deploy(
    await liskToken.getAddress(),
    propertyTokenAddress
  );
  await rentToOwn.waitForDeployment();
  const rentToOwnAddress = await rentToOwn.getAddress();
  console.log("✅ RentToOwn deployed to:", rentToOwnAddress);

  // Step 5: Deploy RentPaymaster (depends on RentToOwn and IdentityRegistry)
  // console.log("\n💳 Deploying RentPaymaster...");
  // const RentPaymasterFactory = await ethers.getContractFactory("RentPaymaster");
  // const paymaster: RentPaymaster = await RentPaymasterFactory.deploy(
  //   entryPointAddress,
  //   rentToOwnAddress,
  //   identityRegistryAddress
  // );
  // await paymaster.waitForDeployment();
  // const paymasterAddress = await paymaster.getAddress();
  // console.log("✅ RentPaymaster deployed to:", paymasterAddress);

  // Step 6: Set up contract permissions and relationships
  console.log("\n⚙️ Setting up contract permissions...");
  
  // Authorize RentToOwn contract in PropertyToken
  const authorizeTx = await propertyToken.setAuthorizedContract(rentToOwnAddress, true);
  await authorizeTx.wait();
  console.log("✅ RentToOwn authorized in PropertyToken");

  // Optional: Fund the paymaster with some ETH for gas sponsorship
  console.log("\n💰 Funding RentPaymaster...");
  const fundAmount = ethers.parseEther("0.1"); // 0.1 ETH
  // const fundTx = await paymaster.fund({ value: fundAmount });
  // await fundTx.wait();
  // console.log(`✅ RentPaymaster funded with ${ethers.formatEther(fundAmount)} ETH`);

  // Summary
  console.log("\n🎉 Deployment Summary:");
  console.log("====================");
  console.log("LiskToken:        ", await liskToken.getAddress());
  console.log("IdentityRegistry: ", identityRegistryAddress);
  console.log("PropertyToken:    ", propertyTokenAddress);
  console.log("RentToOwn:        ", rentToOwnAddress);
  // console.log("RentPaymaster:    ", paymasterAddress);
  
  console.log("\n📝 Next Steps:");
  console.log("- Users need to call IdentityRegistry.setUserRole() to set their role as Tenant or Landlord");
  console.log("- Landlords can create properties using RentToOwn.createProperty()");
  console.log("- Tenants can pay rent using RentToOwn.payRent() (with gasless transactions via RentPaymaster)");
  console.log("- Property tokens will be automatically transferred to tenants as they build equity");
}

// Run
main().catch((error: Error) => {
  console.error(error);
  process.exitCode = 1;
});



// import { ethers } from "hardhat";
// import { Contract } from "ethers";
// import { IdentityRegistry, RentToOwn, RentPaymaster } from "../typechain-types";

// // You can use a minimal ERC20 ABI for the existing Lisk token
// const ERC20_ABI = [
//   "function name() view returns (string)",
//   "function symbol() view returns (string)",
//   "function decimals() view returns (uint8)",
//   "function balanceOf(address) view returns (uint)",
//   "function transfer(address to, uint amount) returns (bool)",
// ];

// async function main(): Promise<void> { 
//   const [deployer] = await ethers.getSigners();
// const deployerAddress = await deployer.getAddress();
// const balance = await ethers.provider.getBalance(deployerAddress);

// console.log("👤 Deployer address:", deployerAddress);
// console.log("💰 Deployer balance (ETH):", ethers.formatEther(balance));


//   const entryPointAddress: string = "0x43089951470a387a94631b9a810da6a72c308a08"; // ERC-4337 EntryPoint
//   const useExistingToken: boolean = true;
//   const code = await ethers.provider.getCode("0x0576a174D229E3cFA37253523E645A78A0C91B57");
// console.log(code);

//   const existingLiskTokenAddress: string = "0x5589BB8228C07c4e15558875fAf2B859f678d129"; // Lisk Sepolia

//   let liskToken: Contract;

//   // Use existing token
//   if (useExistingToken) {
//     liskToken = new ethers.Contract(existingLiskTokenAddress, ERC20_ABI, (await ethers.getSigners())[0]);
//     console.log(` Using existing LiskToken at: ${existingLiskTokenAddress}`);
//   } else {
//     const LiskTokenFactory = await ethers.getContractFactory("LiskToken");
//     liskToken = await LiskTokenFactory.deploy();
//     await liskToken.waitForDeployment();
//     console.log("✅ LiskToken deployed to:", await liskToken.getAddress());
//   }

//   // Deploy IdentityRegistry
//   const IdentityRegistryFactory = await ethers.getContractFactory("IdentityRegistry");
//   const identityRegistry = await IdentityRegistryFactory.deploy();
//   await identityRegistry.waitForDeployment();
//   const identityRegistryAddress = await identityRegistry.getAddress();
//   console.log("✅ IdentityRegistry deployed to:", identityRegistryAddress);

//   // Deploy RentToOwn
//   const RentToOwnFactory = await ethers.getContractFactory("RentToOwn");
//   const rentToOwn = await RentToOwnFactory.deploy(await liskToken.getAddress());
//   await rentToOwn.waitForDeployment();
//   const rentToOwnAddress = await rentToOwn.getAddress();
//   console.log("✅ RentToOwn deployed to:", rentToOwnAddress);

//   // Deploy RentPaymaster
//   const RentPaymasterFactory = await ethers.getContractFactory("RentPaymaster");
//   const paymaster = await RentPaymasterFactory.deploy(
//     entryPointAddress,
//     rentToOwnAddress,
//     identityRegistryAddress
//   );
//   await paymaster.waitForDeployment();
//   const paymasterAddress = await paymaster.getAddress();
//   console.log("✅ RentPaymaster deployed to:", paymasterAddress);

//   // Summary
//   console.log("\n🔗 Deployment Summary:");
//   console.log("LiskToken:        ", await liskToken.getAddress());
//   console.log("IdentityRegistry: ", identityRegistryAddress);
//   console.log("RentToOwn:        ", rentToOwnAddress);
//   console.log("RentPaymaster:    ", paymasterAddress);
// }

// // Run
// main().catch((error: Error) => {
//   console.error(error);
//   process.exitCode = 1;
// });




// import { ethers } from "hardhat";
// import { Contract } from "ethers";
// import { LiskToken, IdentityRegistry, RentToOwn, RentPaymaster } from "../typechain-types";

// async function main(): Promise<void> {
//   // 1. CONFIGURE BEFORE DEPLOYMENT
//   const entryPointAddress: string = "0x0576a174D229E3cFA37253523E645A78A0C91B57"; // ERC-4337 EntryPoint
//   const useExistingToken: boolean = true;
//   const existingLiskTokenAddress: string = "0x5589BB8228C07c4e15558875fAf2B859f678d129"; // Lisk Sepolia

//   let liskToken: LiskToken;

//   // 2. USE EXISTING OR DEPLOY NEW LiskToken
//   if (useExistingToken) {
//     liskToken = await ethers.getContractAt("LiskToken", existingLiskTokenAddress) as LiskToken;
//     console.log(`✅ Using existing LiskToken at: ${existingLiskTokenAddress}`);
//   } else {
//     const LiskTokenFactory = await ethers.getContractFactory("LiskToken");
//     liskToken = await LiskTokenFactory.deploy() as LiskToken;
//     await liskToken.waitForDeployment();
//     console.log("✅ LiskToken deployed to:", await liskToken.getAddress());
//   }

//   // 3. DEPLOY IdentityRegistry
//   const IdentityRegistryFactory = await ethers.getContractFactory("IdentityRegistry");
//   const identityRegistry = await IdentityRegistryFactory.deploy() as IdentityRegistry;
//   await identityRegistry.waitForDeployment();
//   const identityRegistryAddress = await identityRegistry.getAddress();
//   console.log("✅ IdentityRegistry deployed to:", identityRegistryAddress);

//   // 4. DEPLOY RentToOwn
//   const RentToOwnFactory = await ethers.getContractFactory("RentToOwn");
//   const rentToOwn = await RentToOwnFactory.deploy(await liskToken.getAddress()) as RentToOwn;
//   await rentToOwn.waitForDeployment();
//   const rentToOwnAddress = await rentToOwn.getAddress();
//   console.log("✅ RentToOwn deployed to:", rentToOwnAddress);

//   // 5. DEPLOY RentPaymaster
//   const RentPaymasterFactory = await ethers.getContractFactory("RentPaymaster");
//   const paymaster = await RentPaymasterFactory.deploy(
//     entryPointAddress,
//     rentToOwnAddress,
//     identityRegistryAddress
//   ) as RentPaymaster;
//   await paymaster.waitForDeployment();
//   const paymasterAddress = await paymaster.getAddress();
//   console.log("✅ RentPaymaster deployed to:", paymasterAddress);

//   // 6. DEPLOYMENT SUMMARY
//   console.log("\n🔗 Deployment Summary:");
//   console.log("LiskToken:        ", await liskToken.getAddress());
//   console.log("IdentityRegistry: ", identityRegistryAddress);
//   console.log("RentToOwn:        ", rentToOwnAddress);
//   console.log("RentPaymaster:    ", paymasterAddress);
// }

// // Run the main function
// main().catch((error: Error) => {
//   console.error(error);
//   process.exitCode = 1;
// });




// const hre = require("hardhat");

// async function main() {
//   // 1. CONFIGURE THESE BEFORE DEPLOYMENT
//   const entryPointAddress = "0x0576a174D229E3cFA37253523E645A78A0C91B57"; // ERC-4337 EntryPoint address
//   const useExistingToken = true; // Set to false if you want to deploy a new LiskToken
//   const existingLiskTokenAddress = "0x5589BB8228C07c4e15558875fAf2B859f678d129"; // Lisk token address on Lisk Sepolia

//   let liskToken;

//   // 2. USE EXISTING OR DEPLOY NEW LiskToken
//   if (useExistingToken) {
//     liskToken = await hre.ethers.getContractAt("LiskToken", existingLiskTokenAddress);
//     console.log(`✅ Using existing LiskToken at: ${existingLiskTokenAddress}`);
//   } else {
//     const LiskToken = await hre.ethers.getContractFactory("LiskToken");
//     liskToken = await LiskToken.deploy();
//     await liskToken.waitForDeployment();
//     console.log("✅ LiskToken deployed to:", await liskToken.getAddress());
//   }

//   // 3. DEPLOY IdentityRegistry
//   const IdentityRegistry = await hre.ethers.getContractFactory("IdentityRegistry");
//   const identityRegistry = await IdentityRegistry.deploy();
//   await identityRegistry.waitForDeployment();
//   const identityRegistryAddress = await identityRegistry.getAddress();
//   console.log("✅ IdentityRegistry deployed to:", identityRegistryAddress);

//   // 4. DEPLOY RentToOwn (with LiskToken address)
//   const RentToOwn = await hre.ethers.getContractFactory("RentToOwn");
//   const rentToOwn = await RentToOwn.deploy(await liskToken.getAddress());
//   await rentToOwn.waitForDeployment();
//   const rentToOwnAddress = await rentToOwn.getAddress();
//   console.log("✅ RentToOwn deployed to:", rentToOwnAddress);

//   // 5. DEPLOY Paymaster (with EntryPoint and IdentityRegistry address)
//   const Paymaster = await hre.ethers.getContractFactory("Paymaster");
//   const paymaster = await Paymaster.deploy(entryPointAddress, identityRegistryAddress);
//   await paymaster.waitForDeployment();
//   const paymasterAddress = await paymaster.getAddress();
//   console.log("✅ Paymaster deployed to:", paymasterAddress);

//   // 6. SUMMARY LOG
//   console.log("\n🔗 Deployment Summary:");
//   console.log("LiskToken:         ", await liskToken.getAddress());
//   console.log("IdentityRegistry:  ", identityRegistryAddress);
//   console.log("RentToOwn:         ", rentToOwnAddress);
//   console.log("Paymaster:         ", paymasterAddress);
//   console.log("\n✅ All contracts deployed successfully!");
// }

// main().catch((error) => {
//   console.error("❌ Deployment failed:", error);
//   process.exitCode = 1;
// });
