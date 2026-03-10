export const IdentityRegistryABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "_liskToken",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "_propertyToken",
          "type": "address"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "OwnableInvalidOwner",
      "type": "error"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "OwnableUnauthorizedAccount",
      "type": "error"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "tenant",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newEquity",
          "type": "uint256"
        }
      ],
      "name": "EquityUpdated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "landlord",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "LandlordWithdrawal",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "landlord",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "duration",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "image",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "propertyAddress",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "city",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "state",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "zipCode",
          "type": "string"
        },
        {
          "indexed": false,
          "internalType": "string",
          "name": "currency",
          "type": "string"
        }
      ],
      "name": "PropertyCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "tenant",
          "type": "address"
        }
      ],
      "name": "PropertyOccupied",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "tenant",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "RentPaid",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "from",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "to",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "TokensTransferred",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "duration",
          "type": "uint256"
        },
        {
          "internalType": "enum RentToOwn.PaymentType",
          "name": "paymentType",
          "type": "uint8"
        },
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "image",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "propertyAddr",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "city",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "state",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "zipCode",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "currency",
          "type": "string"
        }
      ],
      "name": "createProperty",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        }
      ],
      "name": "getBasicPropertyDetails",
      "outputs": [
        {
          "internalType": "address",
          "name": "landlord",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "value",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "duration",
          "type": "uint256"
        },
        {
          "internalType": "enum RentToOwn.PaymentType",
          "name": "paymentType",
          "type": "uint8"
        },
        {
          "internalType": "address",
          "name": "tenant",
          "type": "address"
        },
        {
          "internalType": "bool",
          "name": "isOccupied",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        }
      ],
      "name": "getEscrowBalance",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        }
      ],
      "name": "getPropertyMetadata",
      "outputs": [
        {
          "internalType": "string",
          "name": "name",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "image",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "propertyAddress",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "city",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "state",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "zipCode",
          "type": "string"
        },
        {
          "internalType": "string",
          "name": "currency",
          "type": "string"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        }
      ],
      "name": "getPropertyTokenId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "tenantAddr",
          "type": "address"
        }
      ],
      "name": "getTenantEquity",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "tenantAddr",
          "type": "address"
        }
      ],
      "name": "getTenantTotalPaid",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        }
      ],
      "name": "getTotalPaidToLandlord",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        }
      ],
      "name": "isAvailable",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "liskToken",
      "outputs": [
        {
          "internalType": "contract IERC20",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextPropertyId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "payRent",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "propertyToken",
      "outputs": [
        {
          "internalType": "contract PropertyToken",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "propertyId",
          "type": "uint256"
        }
      ],
      "name": "withdrawRent",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]