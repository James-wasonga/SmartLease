// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockPropertyToken {
    mapping(uint256 => address) public tokenOwners;
    mapping(uint256 => uint256) public tokenSupplies;
    uint256 public nextTokenId = 1;
    
    function mintToLandlord(address to, uint256 amount) external returns (uint256) {
        uint256 tokenId = nextTokenId++;
        tokenOwners[tokenId] = to;
        tokenSupplies[tokenId] = amount;
        return tokenId;
    }
    
    function transferFraction(address from, address to, uint256 tokenId, uint256 amount) external {
        require(tokenOwners[tokenId] == from, "Not token owner");
        require(tokenSupplies[tokenId] >= amount, "Insufficient balance");
        // Simple mock implementation - in production this would handle the actual transfer
    }
}