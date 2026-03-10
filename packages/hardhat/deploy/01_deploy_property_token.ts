import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying PropertyToken contract with account:", deployer.address);

  // Replace with actual IdentityRegistry contract address after deploying that
  const identityRegistryAddress = "0xYourIdentityRegistryAddress";

  const PropertyToken = await ethers.getContractFactory("PropertyToken");
  const propertyToken = await PropertyToken.deploy(identityRegistryAddress);

  console.log(`✅ PropertyToken deployed at: ${await propertyToken.getAddress()}`);
}

main().catch(error => {
  console.error("Deployment failed:", error);
  process.exit(1);
});
