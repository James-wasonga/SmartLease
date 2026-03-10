// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract IdentityRegistry {
    enum Role { None, Tenant, Landlord }

    mapping(address => Role) private userRoles;

    event RoleAssigned(address indexed user, Role role);

    /// Assigns a role to a user address (only once)
    function setUserRole(Role role) external {
        require(userRoles[msg.sender] == Role.None, "Role already set");
        require(role == Role.Tenant || role == Role.Landlord, "Invalid role");

        userRoles[msg.sender] = role;
        emit RoleAssigned(msg.sender, role);
    }

    /// Returns the role of a given user
    function getUserRole(address user) external view returns (Role) {
        return userRoles[user];
    }

    /// Returns true if user is a Tenant
    function isTenant(address user) external view returns (bool) {
        return userRoles[user] == Role.Tenant;
    }

    /// Returns true if user is a Landlord
    function isLandlord(address user) external view returns (bool) {
        return userRoles[user] == Role.Landlord;
    }

    /// NEW FUNCTION:
    /// Returns true if user has any verified role (required by RentPaymaster)
    function isVerified(address user) external view returns (bool) {
        return userRoles[user] != Role.None;
    }
}
