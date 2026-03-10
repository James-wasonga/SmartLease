/* eslint-disable @typescript-eslint/no-unused-vars */
// deploy/deploy_identity_registry.ts
import * as hardhatDeploy from "hardhat-deploy";
import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying IdentityRegistry contract with account:", deployer.address);

  const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
  const identityRegistry = await IdentityRegistry.deploy();

  console.log("IdentityRegistry deployed to:", deployer.address);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
