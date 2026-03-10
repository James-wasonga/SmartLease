/* eslint-disable @typescript-eslint/no-unused-vars */
import { expect } from "chai";
// import { ethers } from "hardhat";
//@ts-expect-error Importing ethers from @ethersproject/ethers instead of hardhat
import { ethers } from "@ethersproject/ethers";
import { IdentityRegistry } from "../typechain-types/IdentityRegistry";
import type { ContractTransaction } from "@ethersproject/contracts";

describe("IdentityRegistry", function () {
  let identityRegistry: IdentityRegistry & { deploymentTransaction(): ContractTransaction };
  let owner: ethers.Signer;
  let tenant: ethers.Signer;
  let landlord: ethers.Signer;

  beforeEach(async function () {
    [owner, tenant, landlord] = await ethers.getSigners();
    const IdentityRegistryFactory = await ethers.getContractFactory("IdentityRegistry");
    identityRegistry = (await IdentityRegistryFactory.deploy()) as IdentityRegistry & {
      deploymentTransaction(): ContractTransaction;
    };
  });

  it("should assign a role to a user", async function () {
    await identityRegistry.connect(tenant).setUserRole(1); // 1 is the enum value for Tenant
    expect(await identityRegistry.getUserRole(tenant.address)).to.equal(1);
  });

  it("should not assign a role if already set", async function () {
    await identityRegistry.connect(tenant).setUserRole(1);
    await expect(identityRegistry.connect(tenant).setUserRole(1)).to.be.revertedWith("Role already set");
  });

  it("should return true if user is a Tenant", async function () {
    await identityRegistry.connect(tenant).setUserRole(1);
    await expect(identityRegistry.isTenant(tenant.address)).to.be.true;
  });

  it("should return false if user is not a Tenant", async function () {
    await expect(identityRegistry.isTenant(tenant.address)).to.be.false;
  });

  it("should return true if user is a Landlord", async function () {
    await identityRegistry.connect(landlord).setUserRole(2); // 2 is the enum value for Landlord
    await expect(identityRegistry.isLandlord(landlord.address)).to.be.true;
  });

  it("should return false if user is not a Landlord", async function () {
    await expect(identityRegistry.isLandlord(landlord.address)).to.be.false;
  });
});
