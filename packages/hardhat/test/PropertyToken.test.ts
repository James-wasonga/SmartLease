import { ethers } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";
import { PropertyToken as PropertyTokenContract } from "../typechain-types/contracts/PropertyToken.sol";

describe("PropertyToken", () => {
  let propertyToken: PropertyTokenContract;
  let identityRegistry: Contract;
  let landlord: any;
  let tenant: any;
  let other: any;

  beforeEach(async () => {
    [landlord, tenant, other] = await ethers.getSigners();

    // Mock IdentityRegistry
    const IdentityRegistryMock = await ethers.getContractFactory("IdentityRegistryMock");
    identityRegistry = (await IdentityRegistryMock.deploy()) as Contract;
    await identityRegistry.setUserRole(landlord.address, 2); // landlord role
    await identityRegistry.setUserRole(tenant.address, 1); // tenant role

    const PropertyToken = await ethers.getContractFactory("PropertyToken");
    propertyToken = (await PropertyToken.deploy(identityRegistry.address())) as PropertyTokenContract;
  });

  it("should allow landlord to mint property token", async () => {
    const uri = "ipfs://sample-property-uri";
    const tx = await (propertyToken as PropertyTokenContract).connect(landlord).mintPropertyToken(uri);
    const receipt = await tx.wait();

    if (!receipt) {
      throw new Error("Receipt not found");
    }

    const tokenId = 0; // first minted
    const supply = await propertyToken.balanceOf(landlord.address, tokenId);
    const storedUri = await propertyToken.getPropertyMetadataUri(tokenId);

    expect(supply).to.equal(100);
    expect(storedUri).to.equal(uri);

    const event = receipt.logs.find((log: any) => log.event === "PropertyTokenMinted");
    if (event && "args" in event) {
      expect(event.args.landlord).to.equal(landlord.address);
      expect(event.args.tokenId).to.equal(tokenId);
    }
  });

  it("should not allow tenant to mint", async () => {
    const uri = "ipfs://unauthorized-property";
    await expect(propertyToken.connect(tenant).mintPropertyToken(uri)).to.be.revertedWith("Not a landlord");
  });

  it("should transfer fraction of token", async () => {
    const uri = "ipfs://property-token";
    await propertyToken.connect(landlord).mintPropertyToken(uri);

    const tokenId = 0;
    await propertyToken.connect(landlord).transferFraction(tenant.address, tokenId, 10);

    const landlordBalance = await propertyToken.balanceOf(landlord.address, tokenId);
    const tenantBalance = await propertyToken.balanceOf(tenant.address, tokenId);

    expect(landlordBalance).to.equal(90);
    expect(tenantBalance).to.equal(10);
  });

  it("should revert transfer if balance is insufficient", async () => {
    await expect(propertyToken.connect(tenant).transferFraction(other.address, 0, 5)).to.be.revertedWith(
      "Insufficient balance",
    );
  });

  it("should correctly report landlord ownership", async () => {
    const uri = "ipfs://property-metadata";
    await propertyToken.connect(landlord).mintPropertyToken(uri);
    const isLandlord = await propertyToken.isLandlordOf(landlord.address, 0);
    expect(isLandlord).to.eq(true);
  });
});
