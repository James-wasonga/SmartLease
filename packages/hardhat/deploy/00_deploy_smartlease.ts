import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "ethers";

const deploySmartLease: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // 1. Deploy MockERC20 to act as liskToken
  const mockERC20 = await deploy("MockERC20", {
    from: deployer,
    args: ["Test Lisk", "LSK", hre.ethers.parseEther("1000000")],
    log: true,
    autoMine: true,
  });

  // 2. Deploy IdentityRegistry
  const identityRegistry = await deploy("IdentityRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // 3. Deploy PropertyToken
  const propertyToken = await deploy("PropertyToken", {
    from: deployer,
    args: [identityRegistry.address],
    log: true,
    autoMine: true,
  });

  // 4. Deploy RentToOwn
  const rentToOwn = await deploy("RentToOwn", {
    from: deployer,
    args: [mockERC20.address, propertyToken.address],
    log: true,
    autoMine: true,
  });

  // 5. Deploy EntryPoint (required by RentPaymaster for local testing)
  const entryPoint = await deploy("EntryPoint", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });

  // 6. Deploy RentPaymaster
  await deploy("RentPaymaster", {
    from: deployer,
    args: [entryPoint.address, rentToOwn.address, identityRegistry.address],
    log: true,
    autoMine: true,
    gasLimit: 3000000,
  });
};

export default deploySmartLease;
deploySmartLease.tags = ["SmartLease"];
