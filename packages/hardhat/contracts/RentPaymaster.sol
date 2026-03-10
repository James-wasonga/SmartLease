//SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
import "@account-abstraction/contracts/core/BasePaymaster.sol";
import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
import "@account-abstraction/contracts/core/UserOperationLib.sol";

using UserOperationLib for PackedUserOperation;

interface IIdentityRegistry {
    function isVerified(address user) external view returns (bool);
    function isTenant(address user) external view returns (bool);
    function isLandlord(address user) external view returns (bool);
}

contract RentPaymaster is BasePaymaster {
    address public rentToOwnContract;
    IIdentityRegistry public identityRegistry;

    mapping(bytes4 => bool) public allowedFunctions;

    event Withdrawn(address indexed to, uint256 amount);

    constructor(
        IEntryPoint _entryPoint,
        address _rentToOwn,
        address _identityRegistry
    ) BasePaymaster(_entryPoint) Ownable(msg.sender){
        rentToOwnContract = _rentToOwn;
        identityRegistry = IIdentityRegistry(_identityRegistry);

        // Allow rent payment function
        allowedFunctions[getSelector("payRent(uint256,uint256)")] = true;
        
        // Allow role setting function (if needed)
        allowedFunctions[getSelector("setUserRole(uint8)")] = true; // uint8 for enum
        
        // Add other functions as needed
        // allowedFunctions[getSelector("withdrawRent()")] = true;
    }

    receive() external payable {}

    function getSelector(string memory signature) public pure returns (bytes4) {
        return bytes4(keccak256(bytes(signature)));
    }

    function _validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32,
        uint256
    )
        internal
        override
        returns (bytes memory context, uint256 validationData)
    {
        require(userOp.callData.length >= 4, "Invalid callData");
        bytes4 selector = bytes4(userOp.callData);

        require(userOp.sender != address(0), "Invalid sender");
        require(allowedFunctions[selector], "Function not allowed");
        
        // Check if user has any role in the identity registry
        require(identityRegistry.isVerified(userOp.sender), "User not verified");
        
        // Additional check: for rent payments, ensure user is a tenant
        if (selector == getSelector("payRent(uint256,uint256)")) {
            require(identityRegistry.isTenant(userOp.sender), "Only tenants can pay rent");
        }

        context = abi.encode(userOp.sender);
        validationData = 0;
    }

    function postOp(
        IPaymaster.PostOpMode mode,
        bytes calldata context,
        uint256 actualGasCost
    ) external {
        (address sender) = abi.decode(context, (address));
        // No additional logic needed — entry point handles fees
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid recipient");
        require(address(this).balance >= amount, "Insufficient balance");
        payable(to).transfer(amount);
        emit Withdrawn(to, amount);
    }

    function fund() external payable {
        require(msg.value > 0, "Must send some ETH");
    }
    
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}



// pragma solidity ^0.8.17;

// import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
// import "@account-abstraction/contracts/core/BasePaymaster.sol";
// import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";
// import "@account-abstraction/contracts/core/UserOperationLib.sol";

// using UserOperationLib for PackedUserOperation;

// interface IIdentityRegistry {
//     function isVerified(address user) external view returns (bool);
// }

// contract RentPaymaster is BasePaymaster {
//     address public rentToOwnContract;
//     IIdentityRegistry public identityRegistry;

//     mapping(bytes4 => bool) public allowedFunctions;

//     event Withdrawn(address indexed to, uint256 amount);//optional, needed when we will be emitting the transaction off-chain

//     constructor(
//         IEntryPoint _entryPoint,
//         address _rentToOwn,
//         address _identityRegistry
//     ) BasePaymaster(_entryPoint) {
//         rentToOwnContract = _rentToOwn;
//         identityRegistry = IIdentityRegistry(_identityRegistry);

//         allowedFunctions[getSelector("payRent(uint256,uint256)")] = true;
//         // allowedFunctions[getSelector("setUserRole(address,string)")] = true; // Optional
//     }

//     receive() external payable {}

//     function getSelector(string memory signature) public pure returns (bytes4) {
//         return bytes4(keccak256(bytes(signature)));
//     }

//     function _validatePaymasterUserOp(
//         PackedUserOperation calldata userOp,
//         bytes32,
//         uint256
//     )
//         internal
//         override
//         returns (bytes memory context, uint256 validationData)
//     {
//         require(userOp.callData.length >= 4, "Invalid callData");
//         bytes4 selector = bytes4(userOp.callData);

//         require(userOp.sender != address(0), "Invalid sender");
//         require(allowedFunctions[selector], "Function not allowed");
//         require(identityRegistry.isVerified(userOp.sender), "Tenant not verified");

//         context = abi.encode(userOp.sender);
//         validationData = 0;
//     }

//     function postOp(
//         IPaymaster.PostOpMode mode,
//         bytes calldata context,
//         uint256 actualGasCost
//     ) external {
//         (address sender) = abi.decode(context, (address));
//         // No additional logic needed — entry point handles fees
//     }

//     function withdraw(address to, uint256 amount) external onlyOwner {
//         require(to != address(0), "Invalid recipient");
//         payable(to).transfer(amount);
//         emit Withdrawn(to, amount);
//     }

//     function fund() external payable {
//         require(msg.value > 0, "Must send some ETH");
//     }
// }


// import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";
// import "@account-abstraction/contracts/interfaces/IPaymaster.sol";
// import "@account-abstraction/contracts/core/BasePaymaster.sol";
// import "@account-abstraction/contracts/core/UserOperationLib.sol";
// import "@account-abstraction/contracts/interfaces/PackedUserOperation.sol";

// interface IIdentityRegistry {
//     function isVerified(address user) external view returns (bool);
// }

// contract RentPaymaster is BasePaymaster {
//     address public rentToOwnContract;
//     IIdentityRegistry public identityRegistry;

//     mapping(address => bool) public allowedFunctions;

//     constructor(IEntryPoint _entryPoint, address _rentToOwn, address _identityRegistry) {
//         entryPoint = _entryPoint;
//         rentToOwnContract = _rentToOwn;
//         identityRegistry = IIdentityRegistry(_identityRegistry);

//         // Allow specific function selectors
//         allowedFunctions[getSelector("payRent(uint256,uint256)")] = true;
//         allowedFunctions[getSelector("setUserRole(address,string)")] = true; // Optional
//     }

//     receive() external payable{}

//     function getSelector(string memory signature) public pure returns (bytes4) {
//         return bytes4(keccak256(bytes(signature)));
//     }

//     function validatePaymasterUserOp(
//         // UserOperation calldata userOp,
//         PackedUserOperation calldata userOp,
//         bytes32,
//         uint256 maxCost
//     )
//         external
//         override
//         returns(bytes memory context, uint256 validationData)
//     {
//         require(userOp.callData.length >= 4, "Invalid callData");
//         bytes4 selector = bytes4(userOp.callData);


//         require(userOp.sender != address(0), "Invalid sender");
//         require(allowedFunctions[selector], "Function not allowed");

//         require(identityRegistry.isVerified(userOp.sender), "Tenant not verified");

//         //Simple gas sponsorship 

//         context = abi.encode(userOp.sender);
//         validationData = 0; //means valid forever

//     }

//     function postOp(
//         // PostOpMode mode,
//         IPaymaster.PostOpMode mode,
//         bytes calldata context,
//         uint256 actualGasCost
        
//     )
//         external
//         override
//     {
//         (address sender) = abi.decode(context, (address));
//         // Pay gas fee here if necessary from contract balance
//         // This is covered automatically via the EntryPoint
//     }

//     /// Admin function to withdraw leftover ETH

//     function withdraw(address to, uint256 amount) external onlyOwner {
//         require(to != address(0), "Invalid recipient");
//         payable(to).transfer(amount);
//     }

//     /// Fund this contract with ETH to sponsor userOps
//     function fund() external payable{
//         require(msg.value > 0, "Must send some ETH"); // empty function 
//     }
// }
