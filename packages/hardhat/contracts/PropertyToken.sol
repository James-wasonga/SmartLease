// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IIdentityRegistry {
    function getUserRole(address user) external view returns (uint8);
    // 0: Unset, 1: Tenant, 2: Landlord
}

contract PropertyToken is ERC1155, Ownable {
    uint256 private nextTokenId;
    mapping(uint256 => address) public landlordOf;
    mapping(uint256 => string) private tokenURIs;
    /// NEW
    mapping(address => bool) public authorizedContracts; // Allow RentToOwn contract to call functions

    uint256 public constant TOKEN_SUPPLY_PER_PROPERTY = 100;

    event PropertyTokenMinted(uint256 indexed tokenId, address indexed landlord, uint256 amount, string uri);
    event PropertyTokenTransferred(uint256 indexed tokenId, address indexed from, address indexed to, uint256 amount);

    IIdentityRegistry public identityRegistry;

    modifier onlyLandlord() {
        require(identityRegistry.getUserRole(msg.sender) == 2, "Not a landlord");
        _;
    }

    /// NEW
    modifier onlyAuthorized() {
        require(authorizedContracts[msg.sender] || owner() == msg.sender, "Not authorized");
        _;
    }

    constructor(address _identityRegistry) ERC1155("") Ownable(msg.sender){
        identityRegistry = IIdentityRegistry(_identityRegistry);
    }

    /// NEW FUNCTION:
    // Allow owner to authorize contracts (like RentToOwn)
    function setAuthorizedContract(address contractAddr, bool authorized) external onlyOwner {
        authorizedContracts[contractAddr] = authorized;
    }

    function mintPropertyToken(string memory uri) external onlyLandlord returns (uint256) {
        uint256 tokenId = nextTokenId;
        landlordOf[tokenId] = msg.sender;
        tokenURIs[tokenId] = uri;

        _mint(msg.sender, tokenId, TOKEN_SUPPLY_PER_PROPERTY, "");
        emit PropertyTokenMinted(tokenId, msg.sender, TOKEN_SUPPLY_PER_PROPERTY, uri);

        nextTokenId++;
        return tokenId;
    }
    
    /// NEW FUNCTION:
    // Function specifically for RentToOwn contract to mint tokens
    function mintToLandlord(address landlord, string memory uri) external onlyAuthorized returns (uint256) {
        uint256 tokenId = nextTokenId;
        landlordOf[tokenId] = landlord;
        tokenURIs[tokenId] = uri; // Can be set later

        _mint(landlord, tokenId, TOKEN_SUPPLY_PER_PROPERTY, "");
        emit PropertyTokenMinted(tokenId, landlord, TOKEN_SUPPLY_PER_PROPERTY, "");

        nextTokenId++;
        return tokenId;
    }


    function getPropertyMetadataUri(uint256 tokenId) public view returns (string memory) {
        return tokenURIs[tokenId];
    }

    function isLandlordOf(address user, uint256 tokenId) public view returns (bool) {
        return landlordOf[tokenId] == user;
    }

    /// NEW FUNCTION:
    function transferFraction(address to, uint256 tokenId, uint256 amount) external {
        require(balanceOf(msg.sender, tokenId) >= amount, "Insufficient balance");
        _safeTransferFrom(msg.sender, to, tokenId, amount, "");
        emit PropertyTokenTransferred(tokenId, msg.sender, to, amount);
    }

    /// NEW UPDATES
    // Updated function signature to match RentToOwn contract expectations
    function transferFraction(address from, address to, uint256 tokenId, uint256 amount) external onlyAuthorized {
        require(balanceOf(from, tokenId) >= amount, "Insufficient balance");
        _safeTransferFrom(from, to, tokenId, amount, "");
        emit PropertyTokenTransferred(tokenId, from, to, amount);
    }

}
