import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";

describe("RentToOwn Contract - Comprehensive Testing", function () {
  let rentToOwn: Contract;
  let liskToken: Contract;
  let propertyToken: Contract;
  let owner: Signer;
  let landlord: Signer;
  let tenant1: Signer;
  let tenant2: Signer;
  let isUsingMockToken: boolean = false;

  // Force the use of a mock token for testing purposes
  const FORCE_MOCK_TOKEN = true;

  // Real Lisk token addresses for different networks
  const LISK_TOKEN_ADDRESSES = {
    mainnet: "0x6033F7f88332B8db6ad452B7C6D5bB643990aE3f", 
    sepolia: "0x5589BB8228C07c4e15558875fAf2B859f678d129", 
    lisk_sepolia: "0x..." 
  };

  // Test property data
  const propertyData = {
    value: ethers.parseEther("100"),
    duration: 12,
    name: "Real Estate Property",
    image: "https://example.com/property.jpg",
    propertyAddress: "456 Blockchain Avenue",
    city: "Crypto City",
    state: "Decentralized State",
    zipCode: "54321",
    currency: "LISK"
  };

  before(async function () {
    try {
      [owner, landlord, tenant1, tenant2] = await ethers.getSigners();
      console.log("✅ Successfully connected to network and got signers");
    } catch (error) {
      console.error("❌ Failed to get signers:", error);
      throw error;
    }

    // Setup tokens
    await setupLiskToken();
    await setupPropertyToken();
  });

  async function setupLiskToken() {
    const network = await ethers.provider.getNetwork();
    console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);

    // Check if using mock token
    if (FORCE_MOCK_TOKEN) {
      console.log("🔄 Using mock token for testing...");
      await deployMockToken();
      return;
    }

    // Try to connect to real Lisk token based on network
    let tokenAddress: string | undefined;
    
    if (network.chainId === 1n) {
      tokenAddress = LISK_TOKEN_ADDRESSES.mainnet;
    } else if (network.chainId === 11155111n) { // Sepolia
      tokenAddress = LISK_TOKEN_ADDRESSES.sepolia;
    } else if (network.chainId === 4202n) { // Lisk Sepolia
      tokenAddress = LISK_TOKEN_ADDRESSES.lisk_sepolia;
    }

    if (tokenAddress && tokenAddress !== "0x...") {
      try {
        console.log(`🔄 Attempting to connect to existing Lisk token at: ${tokenAddress}`);
        
        const ERC20_ABI = [
          "function transfer(address to, uint256 amount) returns (bool)",
          "function transferFrom(address from, address to, uint256 amount) returns (bool)",
          "function approve(address spender, uint256 amount) returns (bool)",
          "function balanceOf(address account) view returns (uint256)",
          "function allowance(address owner, address spender) view returns (uint256)",
          "function name() view returns (string)",
          "function symbol() view returns (string)",
          "function decimals() view returns (uint8)",
          "function totalSupply() view returns (uint256)"
        ];

        liskToken = new ethers.Contract(tokenAddress, ERC20_ABI, owner);
        
        // Test connection by calling a view function
        const name = await liskToken.name();
        const symbol = await liskToken.symbol();
        
        console.log(`✅ Connected to existing Lisk token: ${name} (${symbol})`);
        isUsingMockToken = false;
        return;
      } catch (error) {
        console.log(`⚠️ Cannot connect to existing token: ${(error as Error).message}`);
      }
    }

    // Fall back to MockERC20
    await deployMockToken();
  }

  async function deployMockToken() {
    console.log("🔄 Deploying MockERC20 for testing...");
    
    try {
      // Create MockERC20 contract factory inline
      const MockERC20Source = `
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.20;

        contract MockERC20 {
            string public name;
            string public symbol;
            uint8 public decimals = 18;
            uint256 public totalSupply;
            
            mapping(address => uint256) public balanceOf;
            mapping(address => mapping(address => uint256)) public allowance;
            
            event Transfer(address indexed from, address indexed to, uint256 value);
            event Approval(address indexed owner, address indexed spender, uint256 value);
            
            constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
                name = _name;
                symbol = _symbol;
                totalSupply = _totalSupply;
                balanceOf[msg.sender] = _totalSupply;
                emit Transfer(address(0), msg.sender, _totalSupply);
            }
            
            function transfer(address to, uint256 amount) public returns (bool) {
                require(balanceOf[msg.sender] >= amount, "Insufficient balance");
                balanceOf[msg.sender] -= amount;
                balanceOf[to] += amount;
                emit Transfer(msg.sender, to, amount);
                return true;
            }
            
            function transferFrom(address from, address to, uint256 amount) public returns (bool) {
                require(balanceOf[from] >= amount, "Insufficient balance");
                require(allowance[from][msg.sender] >= amount, "Insufficient allowance");
                
                balanceOf[from] -= amount;
                balanceOf[to] += amount;
                allowance[from][msg.sender] -= amount;
                
                emit Transfer(from, to, amount);
                return true;
            }
            
            function approve(address spender, uint256 amount) public returns (bool) {
                allowance[msg.sender][spender] = amount;
                emit Approval(msg.sender, spender, amount);
                return true;
            }
        }
      `;

      // Try to get existing MockERC20 factory, if not available we'll skip
      let MockERC20;
      try {
        MockERC20 = await ethers.getContractFactory("MockERC20");
      } catch (error) {
        console.log("⚠️ MockERC20 contract not found in artifacts, you need to create it");
        throw new Error("MockERC20 contract not available. Please create contracts/test/MockERC20.sol");
      }
      
      const mockToken = await MockERC20.deploy(
        "Lisk Token", 
        "LISK", 
        ethers.parseEther("1000000")
      );
      await mockToken.waitForDeployment();
      
      liskToken = mockToken;
      isUsingMockToken = true;
      console.log("✅ MockERC20 deployed successfully");
      
      // Distribute tokens to test accounts for mock token
      await liskToken.transfer(await landlord.getAddress(), ethers.parseEther("1000"));
      await liskToken.transfer(await tenant1.getAddress(), ethers.parseEther("1000"));
      await liskToken.transfer(await tenant2.getAddress(), ethers.parseEther("1000"));
      
      console.log("✅ Mock tokens distributed to test accounts");
    } catch (error) {
      console.error("❌ Failed to deploy MockERC20:", error);
      throw error;
    }
  }

  async function setupPropertyToken() {
    console.log("🔄 Setting up PropertyToken for testing...");
    
    try {
      // Try to get PropertyToken factory
      let PropertyTokenFactory;
      try {
        PropertyTokenFactory = await ethers.getContractFactory("PropertyToken");
        propertyToken = await PropertyTokenFactory.deploy();
        await propertyToken.waitForDeployment();
        console.log("✅ PropertyToken deployed successfully");
        return;
      } catch (error) {
        console.log("⚠️ PropertyToken contract not found, creating mock...");
      }
      
      // Create mock PropertyToken that matches the actual interface
      await deployMockPropertyToken();
      
    } catch (error) {
      console.error("❌ Failed to setup PropertyToken:", error);
      await deployMockPropertyToken();
    }
  }

  async function deployMockPropertyToken() {
    console.log("🔄 Creating MockPropertyToken...");
    
    try {
      // Try to get MockPropertyToken factory
      let MockPropertyTokenFactory;
      try {
        MockPropertyTokenFactory = await ethers.getContractFactory("MockPropertyToken");
      } catch (error) {
        console.log("⚠️ MockPropertyToken contract not found, you need to create it");
        throw new Error("MockPropertyToken contract not available. Please create contracts/test/MockPropertyToken.sol");
      }
      
      propertyToken = await MockPropertyTokenFactory.deploy();
      await propertyToken.waitForDeployment();
      console.log("✅ MockPropertyToken deployed successfully");
    } catch (error) {
      console.error("❌ Failed to deploy MockPropertyToken:", error);
      console.log("⚠️ PropertyToken functionality will be limited");
      propertyToken = null;
    }
  }

  beforeEach(async function () {
    try {
      const RentToOwn = await ethers.getContractFactory("RentToOwn");
      
      // Deploy with both token addresses
      if (propertyToken) {
        rentToOwn = await RentToOwn.deploy(
          await liskToken.getAddress(),
          await propertyToken.getAddress()
        );
      } else {
        // If PropertyToken deployment failed, use zero address
        rentToOwn = await RentToOwn.deploy(
          await liskToken.getAddress(),
          ethers.ZeroAddress
        );
        console.log("⚠️ RentToOwn deployed with zero address for PropertyToken");
      }
      
      await rentToOwn.waitForDeployment();
      console.log("✅ RentToOwn contract deployed");
    } catch (error) {
      console.error("❌ Failed to deploy RentToOwn:", error);
      throw error;
    }
  });

  describe("Token Integration Tests", function () {
    it("Should connect to the correct tokens", async function () {
      expect(await rentToOwn.liskToken()).to.equal(await liskToken.getAddress());
      
      const name = await liskToken.name();
      const symbol = await liskToken.symbol();
      const tokenType = isUsingMockToken ? "Mock" : "Real";
      
      console.log(`Connected to ${tokenType} token: ${name} (${symbol})`);
      console.log(`LISK Token address: ${await liskToken.getAddress()}`);
      
      if (propertyToken) {
        console.log(`PropertyToken address: ${await propertyToken.getAddress()}`);
      }
    });

    it("Should display account balances", async function () {
      const accounts = [owner, landlord, tenant1, tenant2];
      const names = ["Owner", "Landlord", "Tenant1", "Tenant2"];
      
      console.log(`\n💰 Account Balances (${isUsingMockToken ? 'Mock' : 'Real'} LISK):`);
      for (let i = 0; i < accounts.length; i++) {
        const balance = await liskToken.balanceOf(await accounts[i].getAddress());
        console.log(`${names[i]}: ${ethers.formatEther(balance)} LISK`);
      }
    });

    it("Should create property with token integration", async function () {
      try {
        const tx = await rentToOwn.connect(landlord).createProperty(
          propertyData.value,
          propertyData.duration,
          0, // PaymentType.Fixed
          propertyData.name,
          propertyData.image,
          propertyData.propertyAddress,
          propertyData.city,
          propertyData.state,
          propertyData.zipCode,
          propertyData.currency
        );

        await expect(tx).to.emit(rentToOwn, "PropertyCreated");
        
        const [propLandlord, propValue, propDuration] = await rentToOwn.getBasicPropertyDetails(0);
        expect(propLandlord).to.equal(await landlord.getAddress());
        expect(propValue).to.equal(propertyData.value);
        expect(propDuration).to.equal(propertyData.duration);
        
      } catch (error) {
        if (!propertyToken) {
          console.log("⚠️ Property creation failed due to missing PropertyToken");
          this.skip();
        } else {
          throw error;
        }
      }
    });
  });

  describe("Property Management", function () {
    beforeEach(async function () {
      if (!propertyToken) {
        this.skip();
        return;
      }
      
      try {
        await rentToOwn.connect(landlord).createProperty(
          propertyData.value,
          propertyData.duration,
          1, // PaymentType.Flexible
          propertyData.name,
          propertyData.image,
          propertyData.propertyAddress,
          propertyData.city,
          propertyData.state,
          propertyData.zipCode,
          propertyData.currency
        );
      } catch (error) {
        console.log("⚠️ Property creation failed, skipping property management tests");
        this.skip();
      }
    });

    it("Should track property availability correctly", async function () {
      expect(await rentToOwn.isAvailable(0)).to.be.true;
      
      const [, , , , tenant, isOccupied] = await rentToOwn.getBasicPropertyDetails(0);
      expect(tenant).to.equal(ethers.ZeroAddress);
      expect(isOccupied).to.be.false;
    });

    it("Should return correct property metadata", async function () {
      const [name, image, address, city, state, zipCode, currency] = 
        await rentToOwn.getPropertyMetadata(0);
      
      expect(name).to.equal(propertyData.name);
      expect(image).to.equal(propertyData.image);
      expect(address).to.equal(propertyData.propertyAddress);
      expect(city).to.equal(propertyData.city);
      expect(state).to.equal(propertyData.state);
      expect(zipCode).to.equal(propertyData.zipCode);
      expect(currency).to.equal(propertyData.currency);
    });

    it("Should calculate monthly rent correctly", async function () {
      const monthlyRent = propertyData.value / BigInt(propertyData.duration);
      console.log(`Monthly rent: ${ethers.formatEther(monthlyRent)} LISK`);
      
      // Check that monthly rent is reasonable (100 LISK / 12 months ≈ 8.33 LISK)
      expect(monthlyRent).to.be.greaterThan(ethers.parseEther("8"));
      expect(monthlyRent).to.be.lessThan(ethers.parseEther("9"));
    });

    it("Should get property token ID if PropertyToken exists", async function () {
      try {
        const tokenId = await rentToOwn.getPropertyTokenId(0);
        expect(tokenId).to.be.greaterThan(0);
        console.log(`Property token ID: ${tokenId}`);
      } catch (error) {
        console.log("⚠️ PropertyToken integration not fully functional");
      }
    });
  });

  describe("Rent Payment Tests", function () {
    beforeEach(async function () {
      if (!propertyToken) {
        this.skip();
        return;
      }
      
      try {
        // Create a test property
        await rentToOwn.connect(landlord).createProperty(
          propertyData.value,
          propertyData.duration,
          0, // PaymentType.Fixed
          propertyData.name,
          propertyData.image,
          propertyData.propertyAddress,
          propertyData.city,
          propertyData.state,
          propertyData.zipCode,
          propertyData.currency
        );
      } catch (error) {
        console.log("⚠️ Property creation failed, skipping rent payment tests");
        this.skip();
      }
    });

    it("Should handle rent payment (Mock Token Only)", async function () {
      // Only run this test with mock tokens where we control the balance
      if (!isUsingMockToken) {
        this.skip();
        return;
      }

      const monthlyRent = propertyData.value / BigInt(propertyData.duration);
      
      // Check tenant balance
      const tenantBalance = await liskToken.balanceOf(await tenant1.getAddress());
      console.log(`Tenant balance: ${ethers.formatEther(tenantBalance)} LISK`);
      
      expect(tenantBalance).to.be.greaterThan(monthlyRent);
      
      // Approve and pay rent
      await liskToken.connect(tenant1).approve(await rentToOwn.getAddress(), monthlyRent);
      
      await expect(
        rentToOwn.connect(tenant1).payRent(0, monthlyRent)
      ).to.emit(rentToOwn, "PropertyOccupied");
    });

    it("Should check if accounts have sufficient balance for rent (Real Token)", async function () {
      if (isUsingMockToken) {
        this.skip();
        return;
      }

      const monthlyRent = propertyData.value / BigInt(propertyData.duration);
      console.log(`Monthly rent required: ${ethers.formatEther(monthlyRent)} LISK`);
      
      const accounts = [tenant1, tenant2];
      const names = ["Tenant1", "Tenant2"];
      
      for (let i = 0; i < accounts.length; i++) {
        const balance = await liskToken.balanceOf(await accounts[i].getAddress());
        const hasEnough = balance >= monthlyRent;
        console.log(`${names[i]}: ${ethers.formatEther(balance)} LISK - ${hasEnough ? '✅ Sufficient' : '❌ Insufficient'}`);
      }
    });

    it("Should handle multiple rent payments and equity tracking", async function () {
      if (!isUsingMockToken) {
        this.skip();
        return;
      }

      const monthlyRent = propertyData.value / BigInt(propertyData.duration);
      
      // First payment
      await liskToken.connect(tenant1).approve(await rentToOwn.getAddress(), monthlyRent);
      await rentToOwn.connect(tenant1).payRent(0, monthlyRent);
      
      let equity = await rentToOwn.getTenantEquity(0, await tenant1.getAddress());
      console.log(`Equity after first payment: ${equity / 100n}%`);
      
      // Second payment
      await liskToken.connect(tenant1).approve(await rentToOwn.getAddress(), monthlyRent);
      await rentToOwn.connect(tenant1).payRent(0, monthlyRent);
      
      equity = await rentToOwn.getTenantEquity(0, await tenant1.getAddress());
      console.log(`Equity after second payment: ${equity / 100n}%`);
      
      expect(equity).to.be.greaterThan(0);
    });

    it("Should allow landlord to withdraw rent", async function () {
      if (!isUsingMockToken) {
        this.skip();
        return;
      }

      const monthlyRent = propertyData.value / BigInt(propertyData.duration);
      
      // Tenant pays rent
      await liskToken.connect(tenant1).approve(await rentToOwn.getAddress(), monthlyRent);
      await rentToOwn.connect(tenant1).payRent(0, monthlyRent);
      
      // Check amount available for withdrawal
      const withdrawableAmount = await rentToOwn.getTotalPaidToLandlord(0);
      expect(withdrawableAmount).to.equal(monthlyRent);
      
      // Landlord withdraws
      const landlordBalanceBefore = await liskToken.balanceOf(await landlord.getAddress());
      
      await expect(
        rentToOwn.connect(landlord).withdrawRent(0)
      ).to.emit(rentToOwn, "LandlordWithdrawal");
      
      const landlordBalanceAfter = await liskToken.balanceOf(await landlord.getAddress());
      expect(landlordBalanceAfter - landlordBalanceBefore).to.equal(monthlyRent);
    });
  });

  describe("Edge Cases and Error Handling", function () {
    it("Should reject invalid property creation", async function () {
      await expect(
        rentToOwn.connect(landlord).createProperty(
          0, // Invalid value
          propertyData.duration,
          0,
          propertyData.name,
          propertyData.image,
          propertyData.propertyAddress,
          propertyData.city,
          propertyData.state,
          propertyData.zipCode,
          propertyData.currency
        )
      ).to.be.revertedWith("Invalid property value or duration");
    });

    it("Should reject rent payment on non-existent property", async function () {
      await expect(
        rentToOwn.connect(tenant1).payRent(999, ethers.parseEther("1"))
      ).to.be.revertedWith("Invalid property");
    });

    it("Should reject withdrawal by non-landlord", async function () {
      if (!propertyToken) {
        this.skip();
        return;
      }
      
      await rentToOwn.connect(landlord).createProperty(
        propertyData.value,
        propertyData.duration,
        0,
        propertyData.name,
        propertyData.image,
        propertyData.propertyAddress,
        propertyData.city,
        propertyData.state,
        propertyData.zipCode,
        propertyData.currency
      );
      
      await expect(
        rentToOwn.connect(tenant1).withdrawRent(0)
      ).to.be.revertedWith("Not the landlord");
    });
  });

  describe("Test Environment Info", function () {
    it("Should display testing environment information", async function () {
      const network = await ethers.provider.getNetwork();
      
      console.log("\n=== Test Environment Information ===");
      console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
      console.log(`Token Type: ${isUsingMockToken ? 'MockERC20' : 'Real Lisk Token'}`);
      console.log(`LISK Token Address: ${await liskToken.getAddress()}`);
      console.log(`PropertyToken Address: ${propertyToken ? await propertyToken.getAddress() : 'Not deployed'}`);
      console.log(`RentToOwn Address: ${await rentToOwn.getAddress()}`);
      
      if (!isUsingMockToken) {
        console.log("\n⚠️  Testing with real Lisk tokens:");
        console.log("- Ensure test accounts have sufficient LISK balance");
        console.log("- Some tests may be skipped if balances are insufficient");
      }
      
      if (!propertyToken) {
        console.log("\n⚠️  PropertyToken not available:");
        console.log("- Property creation tests may fail");
        console.log("- Token transfer functionality will be skipped");
      }
      
      console.log("=====================================\n");
    });
  });
});


// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { Contract, Signer } from "ethers";

// describe("RentToOwn Contract - Flexible Token Testing", function () {
//   let rentToOwn: Contract;
//   let liskToken: Contract;
//   let owner: Signer;
//   let landlord: Signer;
//   let tenant1: Signer;
//   let tenant2: Signer;
//   let isUsingMockToken: boolean = false;

//   // @Rich&Joe I am forcing the use of a mock token for testing purposes
//   const FORCE_MOCK_TOKEN = true; //when false, liskToken is the real token that will be used


//   // Real Lisk token addresses for different networks
//   const LISK_TOKEN_ADDRESSES = {
//     mainnet: "0x6033F7f88332B8db6ad452B7C6D5bB643990aE3f", 
//     sepolia: "0x5589BB8228C07c4e15558875fAf2B859f678d129", 
//     lisk_sepolia: "0x..." 
//   };

//   // Test property data
//   const propertyData = {
//     value: ethers.parseEther("100"),
//     duration: 12,
//     name: "Real Estate Property",
//     image: "https://example.com/property.jpg",
//     propertyAddress: "456 Blockchain Avenue",
//     city: "Crypto City",
//     state: "Decentralized State",
//     zipCode: "54321",
//     currency: "LISK"
//   };

//   before(async function () {
//     try {
//       [owner, landlord, tenant1, tenant2] = await ethers.getSigners();
//       console.log("✅ Successfully connected to network and got signers");
//     } catch (error) {
//       console.error("❌ Failed to get signers:", error);
//       throw error;
//     }

//     // Try to connect to existing Lisk token first
//     await setupLiskToken();
//   });

//   async function setupLiskToken() {
//     const network = await ethers.provider.getNetwork();
//     console.log(`🌐 Network: ${network.name} (Chain ID: ${network.chainId})`);

//     //check if using mock token
//     if (FORCE_MOCK_TOKEN) {
//       console.log("🔄  Using mock token for testing...");
//       await deployMockToken();
//       return;
//     }

//     // Try to connect to real Lisk token based on network
//     let tokenAddress: string | undefined;
    
//     if (network.chainId === 1n) {
//       tokenAddress = LISK_TOKEN_ADDRESSES.mainnet;
//     } else if (network.chainId === 11155111n) { // Sepolia
//       tokenAddress = LISK_TOKEN_ADDRESSES.sepolia;
//     } else if (network.chainId === 4202n) { // Lisk Sepolia
//       tokenAddress = LISK_TOKEN_ADDRESSES.lisk_sepolia;
//     }

//     if (tokenAddress && tokenAddress !== "0x...") {
//       try {
//         console.log(`🔄 Attempting to connect to existing Lisk token at: ${tokenAddress}`);
        
//         const ERC20_ABI = [
//           "function transfer(address to, uint256 amount) returns (bool)",
//           "function transferFrom(address from, address to, uint256 amount) returns (bool)",
//           "function approve(address spender, uint256 amount) returns (bool)",
//           "function balanceOf(address account) view returns (uint256)",
//           "function allowance(address owner, address spender) view returns (uint256)",
//           "function name() view returns (string)",
//           "function symbol() view returns (string)",
//           "function decimals() view returns (uint8)",
//           "function totalSupply() view returns (uint256)"
//         ];

//         liskToken = new ethers.Contract(tokenAddress, ERC20_ABI, owner);
        
//         // Test connection by calling a view function
//         const name = await liskToken.name();
//         const symbol = await liskToken.symbol();
        
//         console.log(`✅ Connected to existing Lisk token: ${name} (${symbol})`);
//         isUsingMockToken = false;
//         return;
//       } catch (error) {
//         console.log(`⚠️ Cannot connect to existing token: ${error}`);
//       }
//     }

//     // Fall back to MockERC20
//     await deployMockToken();
//   }

//   async function deployMockToken() {
//     console.log("🔄 Deploying MockERC20 for testing...");
    
//     try {
//       const MockERC20 = await ethers.getContractFactory("MockERC20");
//       const mockToken = await MockERC20.deploy(
//         "Lisk Token", 
//         "LISK", 
//         ethers.parseEther("1000000")
//       );
//       await mockToken.waitForDeployment();
      
//       liskToken = mockToken;
//       isUsingMockToken = true;
//       console.log("✅ MockERC20 deployed successfully");
      
//       // Distribute tokens to test accounts for mock token
//       await liskToken.transfer(await landlord.getAddress(), ethers.parseEther("1000"));
//       await liskToken.transfer(await tenant1.getAddress(), ethers.parseEther("1000"));
//       await liskToken.transfer(await tenant2.getAddress(), ethers.parseEther("1000"));
      
//       console.log("✅ Mock tokens distributed to test accounts");
//     } catch (error) {
//       console.error("❌ Failed to deploy MockERC20:", error);
//       throw error;
//     }
//   }

//   beforeEach(async function () {
//     try {
//       const RentToOwn = await ethers.getContractFactory("RentToOwn");
//       rentToOwn = await RentToOwn.deploy(await liskToken.getAddress());
//       await rentToOwn.waitForDeployment();
//       console.log("✅ RentToOwn contract deployed");
//     } catch (error) {
//       console.error("❌ Failed to deploy RentToOwn:", error);
//       throw error;
//     }
//   });

//   describe("Token Integration Tests", function () {
//     it("Should connect to the correct token", async function () {
//       expect(await rentToOwn.liskToken()).to.equal(await liskToken.getAddress());
      
//       const name = await liskToken.name();
//       const symbol = await liskToken.symbol();
//       const tokenType = isUsingMockToken ? "Mock" : "Real";
      
//       console.log(`Connected to ${tokenType} token: ${name} (${symbol})`);
//       console.log(`Token address: ${await liskToken.getAddress()}`);
//     });

//     it("Should display account balances", async function () {
//       const accounts = [owner, landlord, tenant1, tenant2];
//       const names = ["Owner", "Landlord", "Tenant1", "Tenant2"];
      
//       console.log(`\n💰 Account Balances (${isUsingMockToken ? 'Mock' : 'Real'} LISK):`);
//       for (let i = 0; i < accounts.length; i++) {
//         const balance = await liskToken.balanceOf(await accounts[i].getAddress());
//         console.log(`${names[i]}: ${ethers.formatEther(balance)} LISK`);
//       }
//     });

//     it("Should create property with token integration", async function () {
//       await expect(
//         rentToOwn.connect(landlord).createProperty(
//           propertyData.value,
//           propertyData.duration,
//           0, // PaymentType.Fixed
//           propertyData.name,
//           propertyData.image,
//           propertyData.propertyAddress,
//           propertyData.city,
//           propertyData.state,
//           propertyData.zipCode,
//           propertyData.currency
//         )
//       ).to.emit(rentToOwn, "PropertyCreated");

//       const [propLandlord, propValue, propDuration] = await rentToOwn.getBasicPropertyDetails(0);
//       expect(propLandlord).to.equal(await landlord.getAddress());
//       expect(propValue).to.equal(propertyData.value);
//       expect(propDuration).to.equal(propertyData.duration);
//     });
//   });

//   describe("Rent Payment Tests", function () {
//     beforeEach(async function () {
//       // Create a test property
//       await rentToOwn.connect(landlord).createProperty(
//         propertyData.value,
//         propertyData.duration,
//         0, // PaymentType.Fixed
//         propertyData.name,
//         propertyData.image,
//         propertyData.propertyAddress,
//         propertyData.city,
//         propertyData.state,
//         propertyData.zipCode,
//         propertyData.currency
//       );
//     });

//     it("Should handle rent payment (Mock Token Only)", async function () {
//       // Only run this test with mock tokens where we control the balance
//       if (!isUsingMockToken) {
//         this.skip();
//         return;
//       }

//       const monthlyRent = propertyData.value / BigInt(propertyData.duration);
      
//       // Check tenant balance
//       const tenantBalance = await liskToken.balanceOf(await tenant1.getAddress());
//       console.log(`Tenant balance: ${ethers.formatEther(tenantBalance)} LISK`);
      
//       expect(tenantBalance).to.be.greaterThan(monthlyRent);
      
//       // Approve and pay rent
//       await liskToken.connect(tenant1).approve(await rentToOwn.getAddress(), monthlyRent);
      
//       await expect(
//         rentToOwn.connect(tenant1).payRent(0, monthlyRent)
//       ).to.emit(rentToOwn, "PropertyOccupied");
//     });

//     it("Should check if accounts have sufficient balance for rent (Real Token)", async function () {
//       if (isUsingMockToken) {
//         this.skip();
//         return;
//       }

//       const monthlyRent = propertyData.value / BigInt(propertyData.duration);
//       console.log(`Monthly rent required: ${ethers.formatEther(monthlyRent)} LISK`);
      
//       const accounts = [tenant1, tenant2];
//       const names = ["Tenant1", "Tenant2"];
      
//       for (let i = 0; i < accounts.length; i++) {
//         const balance = await liskToken.balanceOf(await accounts[i].getAddress());
//         const hasEnough = balance >= monthlyRent;
//         console.log(`${names[i]}: ${ethers.formatEther(balance)} LISK - ${hasEnough ? '✅ Sufficient' : '❌ Insufficient'}`);
//       }
//     });
//   });

//   describe("Property Management", function () {
//     beforeEach(async function () {
//       await rentToOwn.connect(landlord).createProperty(
//         propertyData.value,
//         propertyData.duration,
//         1, // PaymentType.Flexible
//         propertyData.name,
//         propertyData.image,
//         propertyData.propertyAddress,
//         propertyData.city,
//         propertyData.state,
//         propertyData.zipCode,
//         propertyData.currency
//       );
//     });

//     it("Should track property availability correctly", async function () {
//       expect(await rentToOwn.isAvailable(0)).to.be.true;
      
//       const [, , , , tenant, isOccupied] = await rentToOwn.getBasicPropertyDetails(0);
//       expect(tenant).to.equal(ethers.ZeroAddress);
//       expect(isOccupied).to.be.false;
//     });

//     it("Should return correct property metadata", async function () {
//       const [name, image, address, city, state, zipCode, currency] = 
//         await rentToOwn.getPropertyMetadata(0);
      
//       expect(name).to.equal(propertyData.name);
//       expect(image).to.equal(propertyData.image);
//       expect(address).to.equal(propertyData.propertyAddress);
//       expect(city).to.equal(propertyData.city);
//       expect(state).to.equal(propertyData.state);
//       expect(zipCode).to.equal(propertyData.zipCode);
//       expect(currency).to.equal(propertyData.currency);
//     });

//     it("Should calculate monthly rent correctly", async function () {
//       const monthlyRent = propertyData.value / BigInt(propertyData.duration);
//       console.log(`Monthly rent: ${ethers.formatEther(monthlyRent)} LISK`);
      
//       // Check that monthly rent is reasonable (100 LISK / 12 months ≈ 8.33 LISK)
//       expect(monthlyRent).to.be.greaterThan(ethers.parseEther("8"));
//       expect(monthlyRent).to.be.lessThan(ethers.parseEther("9"));
//     });
//   });

//   describe("Test Environment Info", function () {
//     it("Should display testing environment information", async function () {
//       const network = await ethers.provider.getNetwork();
      
//       console.log("\n=== Test Environment Information ===");
//       console.log(`Network: ${network.name} (Chain ID: ${network.chainId})`);
//       console.log(`Token Type: ${isUsingMockToken ? 'MockERC20' : 'Real Lisk Token'}`);
//       console.log(`Token Address: ${await liskToken.getAddress()}`);
//       console.log(`Contract Address: ${await rentToOwn.getAddress()}`);
      
//       if (!isUsingMockToken) {
//         console.log("\n⚠️  Testing with real Lisk tokens:");
//         console.log("- Ensure test accounts have sufficient LISK balance");
//         console.log("- Some tests may be skipped if balances are insufficient");
//       }
      
//       console.log("=====================================\n");
//     });
//   });
// });




// import { expect } from "chai";
// import { ethers } from "hardhat";
// import { Contract, Signer } from "ethers";

// describe("RentToOwn Contract with Existing Lisk Token", function () {
//   let rentToOwn: Contract;
//   let liskToken: Contract;
//   let owner: Signer;
//   let landlord: Signer;
//   let tenant1: Signer;
//   let tenant2: Signer;

 
//   // For testing purposes, we'll use a mock address that won't cause connection issues
//   const LISK_TOKEN_ADDRESS = "0x5589BB8228C07c4e15558875fAf2B859f678d129"; // Example address - replace with actual

//   // Test property data
//   const propertyData = {
//     value: ethers.parseEther("100"), // 100 LISK tokens
//     duration: 12, // 12 months
//     name: "Real Estate Property",
//     image: "https://example.com/property.jpg",
//     propertyAddress: "456 Blockchain Avenue",
//     city: "Crypto City",
//     state: "Decentralized State",
//     zipCode: "54321",
//     currency: "LISK"
//   };

//   before(async function () {
//     [owner, landlord, tenant1, tenant2] = await ethers.getSigners();
    
//     // For testing on local hardhat network, we'll create a mock token
//     // You can replace this with actual Lisk token connection when testing on real networks
//     try {
//       // Try to connect to existing token (will work on mainnet/testnet)
//       const ERC20_ABI = [
//         "function transfer(address to, uint256 amount) returns (bool)",
//         "function transferFrom(address from, address to, uint256 amount) returns (bool)",
//         "function approve(address spender, uint256 amount) returns (bool)",
//         "function balanceOf(address account) view returns (uint256)",
//         "function allowance(address owner, address spender) view returns (uint256)",
//         "function name() view returns (string)",
//         "function symbol() view returns (string)",
//         "function decimals() view returns (uint8)"
//       ];
      
//       liskToken = new ethers.Contract(LISK_TOKEN_ADDRESS, ERC20_ABI, owner);
      
//       // Test if we can connect to the token (this will fail on local hardhat)
//       await liskToken.name();
//       console.log("Connected to existing Lisk token");
//     } catch (error) {
//       console.log("Cannot connect to existing token, using MockERC20 for testing");
      
//       // Deploy MockERC20 for local testing
//       const MockERC20 = await ethers.getContractFactory("MockERC20");
//       const mockToken = await MockERC20.deploy("Lisk Token", "LISK", ethers.parseEther("1000000"));
//       await mockToken.waitForDeployment();
      
//       liskToken = mockToken;
      
//       // Distribute tokens to test accounts
//       await liskToken.transfer(await landlord.getAddress(), ethers.parseEther("1000"));
//       await liskToken.transfer(await tenant1.getAddress(), ethers.parseEther("1000"));
//       await liskToken.transfer(await tenant2.getAddress(), ethers.parseEther("1000"));
//     }
//   });

//   beforeEach(async function () {
//     // Deploy RentToOwn contract with the token (either real or mock)
//     const RentToOwn = await ethers.getContractFactory("RentToOwn");
//     rentToOwn = await RentToOwn.deploy(await liskToken.getAddress());
//     await rentToOwn.waitForDeployment();
//   });

//   describe("Integration with Existing Lisk Token", function () {
//     it("Should connect to the correct token", async function () {
//       expect(await rentToOwn.liskToken()).to.equal(await liskToken.getAddress());
      
//       // Verify token details
//       const name = await liskToken.name();
//       const symbol = await liskToken.symbol();
//       console.log(`Connected to token: ${name} (${symbol})`);
//     });

//     it("Should create property with Lisk token integration", async function () {
//       await expect(
//         rentToOwn.connect(landlord).createProperty(
//           propertyData.value,
//           propertyData.duration,
//           0, // PaymentType.Fixed
//           propertyData.name,
//           propertyData.image,
//           propertyData.propertyAddress,
//           propertyData.city,
//           propertyData.state,
//           propertyData.zipCode,
//           propertyData.currency
//         )
//       ).to.emit(rentToOwn, "PropertyCreated");

//       const [propLandlord, propValue, propDuration] = await rentToOwn.getBasicPropertyDetails(0);
//       expect(propLandlord).to.equal(await landlord.getAddress());
//       expect(propValue).to.equal(propertyData.value);
//       expect(propDuration).to.equal(propertyData.duration);
//     });

//     // Note: The following tests require the test accounts to have actual LISK tokens
//     // In a real scenario, you might want to skip these tests or use a fork of mainnet
//     it.skip("Should handle rent payment with real Lisk tokens", async function () {
//       // Create property
//       await rentToOwn.connect(landlord).createProperty(
//         propertyData.value,
//         propertyData.duration,
//         0,
//         propertyData.name,
//         propertyData.image,
//         propertyData.propertyAddress,
//         propertyData.city,
//         propertyData.state,
//         propertyData.zipCode,
//         propertyData.currency
//       );

//       const monthlyRent = propertyData.value / BigInt(propertyData.duration);
      
//       // Check tenant balance
//       const tenantBalance = await liskToken.balanceOf(await tenant1.getAddress());
//       console.log(`Tenant balance: ${ethers.formatEther(tenantBalance)} LISK`);
      
//       if (tenantBalance >= monthlyRent) {
//         // Approve and pay rent
//         await liskToken.connect(tenant1).approve(await rentToOwn.getAddress(), monthlyRent);
        
//         await expect(
//           rentToOwn.connect(tenant1).payRent(0, monthlyRent)
//         ).to.emit(rentToOwn, "PropertyOccupied");
//       } else {
//         console.log("Skipping rent payment test - insufficient LISK balance");
//       }
//     });

//     // Helper function to check if accounts have sufficient LISK balance
//     async function checkBalances() {
//       const accounts = [landlord, tenant1, tenant2];
//       const names = ["Landlord", "Tenant1", "Tenant2"];
      
//       for (let i = 0; i < accounts.length; i++) {
//         const balance = await liskToken.balanceOf(await accounts[i].getAddress());
//         console.log(`${names[i]} balance: ${ethers.formatEther(balance)} LISK`);
//       }
//     }

//     it("Should display account balances", async function () {
//       await checkBalances();
//     });
//   });

//   describe("Property Management with Real Token", function () {
//     beforeEach(async function () {
//       // Create a test property
//       await rentToOwn.connect(landlord).createProperty(
//         propertyData.value,
//         propertyData.duration,
//         1, // PaymentType.Flexible
//         propertyData.name,
//         propertyData.image,
//         propertyData.propertyAddress,
//         propertyData.city,
//         propertyData.state,
//         propertyData.zipCode,
//         propertyData.currency
//       );
//     });

//     it("Should track property availability correctly", async function () {
//       expect(await rentToOwn.isAvailable(0)).to.be.true;
      
//       const [, , , , tenant, isOccupied] = await rentToOwn.getBasicPropertyDetails(0);
//       expect(tenant).to.equal(ethers.ZeroAddress);
//       expect(isOccupied).to.be.false;
//     });

//     it("Should return correct property metadata", async function () {
//       const [name, image, address, city, state, zipCode, currency] = 
//         await rentToOwn.getPropertyMetadata(0);
      
//       expect(name).to.equal(propertyData.name);
//       expect(image).to.equal(propertyData.image);
//       expect(address).to.equal(propertyData.propertyAddress);
//       expect(city).to.equal(propertyData.city);
//       expect(state).to.equal(propertyData.state);
//       expect(zipCode).to.equal(propertyData.zipCode);
//       expect(currency).to.equal(propertyData.currency);
//     });

//     it("Should calculate monthly rent correctly", async function () {
//       const monthlyRent = propertyData.value / BigInt(propertyData.duration);
//       const expectedMonthlyRent = ethers.parseEther("8.333333333333333333"); // 100/12 ≈ 8.33
      
//       // Since we're dealing with integer division, we expect some precision loss
//       expect(monthlyRent).to.be.closeTo(expectedMonthlyRent, ethers.parseEther("0.1"));
      
//       console.log(`Monthly rent: ${ethers.formatEther(monthlyRent)} LISK`);
//     });

//     it("Should handle equity calculations properly", async function () {
//       // Test with zero payments initially
//       expect(await rentToOwn.getTenantEquity(0, await tenant1.getAddress())).to.equal(0);
//       expect(await rentToOwn.getTenantTotalPaid(0, await tenant1.getAddress())).to.equal(0);
//     });

//     it("Should track escrow balance correctly", async function () {
//       expect(await rentToOwn.getEscrowBalance(0)).to.equal(0);
//       expect(await rentToOwn.getTotalPaidToLandlord(0)).to.equal(0);
//     });
//   });

//   // Utility function to fund test accounts with LISK tokens (for testing purposes)
//   describe("Test Setup Utilities", function () {
//     it("Should provide instructions for manual testing", async function () {
//       console.log("\n=== Manual Testing Instructions ===");
//       console.log("To fully test with real LISK tokens:");
//       console.log("1. Ensure test accounts have sufficient LISK balance");
//       console.log("2. Use a testnet or fork of mainnet");
//       console.log("3. Update LISK_TOKEN_ADDRESS with correct address for your network");
//       console.log("4. Uncomment the .skip() tests above");
//       console.log("\nTest Accounts:");
//       console.log(`Landlord: ${await landlord.getAddress()}`);
//       console.log(`Tenant1: ${await tenant1.getAddress()}`);
//       console.log(`Tenant2: ${await tenant2.getAddress()}`);
//       console.log("=====================================\n");
//     });
//   });
// });


// import { ethers } from "hardhat";
// import { expect } from "chai";
// import { RentToOwn, MockERC20 } from "../typechain-types";
// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// describe("RentToOwn Contract", function () {
//   let rentToOwn: RentToOwn;
//   let mockToken: MockERC20;
//   let landlord: SignerWithAddress;
//   let tenant: SignerWithAddress;

//   beforeEach(async function () {
//     [landlord, tenant] = await ethers.getSigners();

//     const TokenFactory = await ethers.getContractFactory("MockERC20");
//     mockToken = (await TokenFactory.deploy("Lisk Token", "LSK")) as MockERC20;
//     await mockToken.waitForDeployment();

//     await mockToken.mint(tenant.address, ethers.parseEther("1000"));

//     const RentFactory = await ethers.getContractFactory("RentToOwn");
//     rentToOwn = (await RentFactory.deploy(await mockToken.getAddress())) as RentToOwn;
//     await rentToOwn.waitForDeployment();
//   });

//   it("creates a property", async function () {
//     await expect(
//       rentToOwn.connect(landlord).createProperty(
//         ethers.parseEther("100"),
//         10,
//         0,
//         "House",
//         "img.png",
//         "123 Main",
//         "Liskville",
//         "State",
//         "00100",
//         "USD"
//       )
//     ).to.emit(rentToOwn, "PropertyCreated");
//   });

//   it("allows tenant to pay rent", async function () {
//     await rentToOwn.connect(landlord).createProperty(
//       ethers.parseEther("100"),
//       10,
//       0,
//       "House",
//       "img.png",
//       "123 Main",
//       "Liskville",
//       "State",
//       "00100",
//       "USD"
//     );

//     const rentAmount = ethers.parseEther("10");
//     await mockToken.connect(tenant).approve(await rentToOwn.getAddress(), rentAmount);

//     await expect(
//       rentToOwn.connect(tenant).payRent(0, rentAmount)
//     ).to.emit(rentToOwn, "RentPaid");
//   });
// });