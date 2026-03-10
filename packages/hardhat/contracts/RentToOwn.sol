    //SPDX-License-Identifier: MIT
    pragma solidity ^0.8.20;

    import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
    import "@openzeppelin/contracts/access/Ownable.sol";
    ///NEW: Import PropertyToken
    import "./PropertyToken.sol"; //Import PropertyToken contract

    contract RentToOwn is Ownable {
        enum PaymentType { Fixed, Flexible }

        struct Tenant {
            uint256 totalPaid;
            uint256 equityPercentage;
            uint256 lastPaymentTimestamp;
        }

        struct Property {
            address landlord;
            uint256 value;
            uint256 duration; // in months
            PaymentType paymentType;
            uint256 createdAt;
            address tenant;
            bool isOccupied;
            uint256 escrowBalance;
            uint256 totalPaidToLandlord;
            uint256 tokenId; // Represent token for property - uncommment

            // New metadata fields
            string name;
            string image;
            string propertyAddress;
            string city;
            string state;
            string zipCode;
            string currency;

            mapping(address => Tenant) tenants;
        }

        IERC20 public liskToken;
        PropertyToken public propertyToken; /// NEW: Declare PropertyToken
        uint256 public nextPropertyId;
        mapping(uint256 => Property) private properties;

        // Add uint256 tokenId later for the property, as well as when emitting
        event PropertyCreated(
            uint256 indexed propertyId,
            address indexed landlord,
            uint256 value,
            uint256 duration,
            uint256 tokenId,
            string name,
            string image,
            string propertyAddress,
            string city,
            string state,
            string zipCode,
            string currency        
        );

        event RentPaid(uint256 indexed propertyId, address indexed tenant, uint256 amount);
        event EquityUpdated(uint256 indexed propertyId, address indexed tenant, uint256 newEquity);
        event PropertyOccupied(uint256 indexed propertyId, address indexed tenant);
        event LandlordWithdrawal(address indexed landlord, uint256 indexed propertyId, uint256 amount);
        event TokensTransferred(uint256 indexed propertyId, address indexed from, address indexed to, uint256 tokenId, uint256 amount); /// NEW EVENT


    constructor(address _liskToken, address _propertyToken) Ownable(msg.sender) {
        liskToken = IERC20(_liskToken);
        /// NEW: Uncommented
        propertyToken = PropertyToken(_propertyToken); //Represent the property token - uncomment
        ///
    }

        function createProperty(
            uint256 value,
            uint256 duration,
            PaymentType paymentType,
            string memory name,
            string memory image,
            string memory propertyAddr,
            string memory city,
            string memory state,
            string memory zipCode,
            string memory currency
        ) external {
            require(value > 0 && duration > 0, "Invalid property value or duration");

            Property storage prop = properties[nextPropertyId];
            prop.landlord = msg.sender;
            prop.value = value;
            prop.duration = duration;
            prop.paymentType = paymentType;
            prop.createdAt = block.timestamp;
            prop.name = name;
            prop.image = image;
            prop.propertyAddress = propertyAddr;
            prop.city = city;
            prop.state = state;
            prop.zipCode = zipCode;
            prop.currency = currency;
            
            // /// NEW: Uncommented
            // uint256 tokenId = propertyToken.mintToLandlord(msg.sender, 100); // mint 100 tokens - uncomment when Token contract is available
            // prop.tokenId = tokenId;
            // ///

            /// NEW: Uncommented
            // uint256 tokenId = propertyToken.mintPropertyToken(image); // mint 100 tokens - uncomment when Token contract is available
            uint256 tokenId = propertyToken.mintToLandlord(msg.sender, image); 
            prop.tokenId = tokenId;
            ///

            emit PropertyCreated(
                nextPropertyId,
                msg.sender,
                value,
                duration,
                tokenId,
                name,
                image,
                propertyAddr,
                city,
                state,
                zipCode,
                currency
            );

            nextPropertyId++; 
        }

        function payRent(uint256 propertyId, uint256 amount) external {
            Property storage prop = properties[propertyId];
            require(prop.landlord != address(0), "Invalid property");
            require(amount > 0, "Zero amount");

            uint256 monthlyRent = prop.value / prop.duration;
            require(liskToken.transferFrom(msg.sender, address(this), amount), "Transfer Failed");

            Tenant storage tenant = prop.tenants[msg.sender];

            if (!prop.isOccupied) {
                prop.escrowBalance += amount;

                if (prop.escrowBalance >= monthlyRent) {
                    prop.isOccupied = true;
                    prop.tenant = msg.sender;

                    tenant.totalPaid += prop.escrowBalance;
                    tenant.lastPaymentTimestamp = block.timestamp;
                    tenant.equityPercentage = (1e4 * tenant.totalPaid) / prop.value;
                    prop.totalPaidToLandlord += prop.escrowBalance;

                    emit PropertyOccupied(propertyId, msg.sender);
                    emit RentPaid(propertyId, msg.sender, prop.escrowBalance);
                    emit EquityUpdated(propertyId, msg.sender, tenant.equityPercentage);

                    prop.escrowBalance = 0;
                } else {
                    emit RentPaid(propertyId, msg.sender, amount);
                    return;
                }
            } else {
                require(prop.tenant == msg.sender, "Not assigned tenant");

                if (prop.paymentType == PaymentType.Fixed) {
                    require(amount == monthlyRent, "Must pay exact monthly rent");
                }

                tenant.totalPaid += amount;
                tenant.lastPaymentTimestamp = block.timestamp;

                uint256 oldEquity = tenant.equityPercentage;
                uint256 newEquity = (tenant.totalPaid * 1e4) / prop.value;
                require(newEquity >= oldEquity, "New equity must be >= old equity");
                tenant.equityPercentage = newEquity;

                prop.totalPaidToLandlord += amount;

                // Transfer tokens only for the increase in equity
                uint256 equityChange = newEquity - oldEquity;
                if (equityChange > 0) {
                    uint256 tokensToTransfer = (equityChange * 100) / 1e4;
                    if (tokensToTransfer > 0) {
                        propertyToken.transferFraction(prop.landlord, msg.sender, prop.tokenId, tokensToTransfer);
                        emit TokensTransferred(propertyId, prop.landlord, msg.sender, prop.tokenId, tokensToTransfer);
                    }
                }

                emit RentPaid(propertyId, msg.sender, amount);
                emit EquityUpdated(propertyId, msg.sender, tenant.equityPercentage);
            }
        }

        function withdrawRent(uint256 propertyId) external {
            Property storage prop = properties[propertyId];
            require(msg.sender == prop.landlord, "Not the landlord");

            uint256 amount = prop.totalPaidToLandlord;
            require(amount > 0, "No amount to withdraw");

            prop.totalPaidToLandlord = 0;
            require(liskToken.transfer(msg.sender, amount), "Withdraw Failed");

            emit LandlordWithdrawal(msg.sender, propertyId, amount);
        }

        function getTenantEquity(uint256 propertyId, address tenantAddr) external view returns (uint256) {
            return properties[propertyId].tenants[tenantAddr].equityPercentage;
        }

        function isAvailable(uint256 propertyId) external view returns (bool) {
            return !properties[propertyId].isOccupied;
        }

        function getTenantTotalPaid(uint256 propertyId, address tenantAddr) external view returns (uint256) {
            return properties[propertyId].tenants[tenantAddr].totalPaid;
        }

        function getBasicPropertyDetails(uint256 propertyId) external view returns (
        address landlord,
        uint256 value,
        uint256 duration,
        PaymentType paymentType,
        address tenant,
        bool isOccupied
    ) {
        Property storage p = properties[propertyId];
        return (
            p.landlord,
            p.value,
            p.duration,
            p.paymentType,
            p.tenant,
            p.isOccupied
        );
    }

    function getPropertyMetadata(uint256 propertyId) external view returns (
        string memory name,
        string memory image,
        string memory propertyAddress,
        string memory city,
        string memory state,
        string memory zipCode,
        string memory currency
    ) {
        Property storage p = properties[propertyId];
        return (
            p.name,
            p.image,
            p.propertyAddress,
            p.city,
            p.state,
            p.zipCode,
            p.currency
        );
    }

        // function getPropertyDetails(uint256 propertyId) external view returns (
        //     address landlord,
        //     uint256 value,
        //     uint256 duration,
        //     PaymentType paymentType,
        //     address tenant,
        //     bool isOccupied,
        //     string memory name,
        //     string memory image,
        //     string memory propertyAddress,
        //     string memory city,
        //     string memory state,
        //     string memory zipCode,
        //     string memory currency
        // ) {
        //     Property storage p = properties[propertyId];
        //     return (
        //         p.landlord,
        //         p.value,
        //         p.duration,
        //         p.paymentType,
        //         p.tenant,
        //         p.isOccupied,
        //         p.name,
        //         p.image,
        //         p.propertyAddress,
        //         p.city,
        //         p.state,
        //         p.zipCode,
        //         p.currency
        //     );
        // }

        function getEscrowBalance(uint256 propertyId) external view returns (uint256) {
            return properties[propertyId].escrowBalance;
        }

        function getTotalPaidToLandlord(uint256 propertyId) external view returns (uint256) {
            return properties[propertyId].totalPaidToLandlord;
        }
        /// NEW: FUNCTION 
            function getPropertyTokenId(uint256 propertyId) external view returns (uint256) {
            return properties[propertyId].tokenId;
        }

        /// NEWEST
        function getMonthlyRentPayable( uint256 propertyId, address tenantAddr, uint256 monthNumber) external view returns (uint256 rentAmount, bool isPayable) {
            Property storage prop = properties[propertyId];

            // check if property exists
            require(prop.landlord != address(0), "Invalid property");

            // Check if month number is valid(1 to duration)
            if (monthNumber == 0 || monthNumber > prop.duration) {
                return(0, false);
            }

            // calculate monthly rent
            uint256 monthlyRent = prop.value / prop.duration;

            // If property is not occupied, return the monthly rent
            if (!prop.isOccupied) {
                return (monthlyRent, true);
            }

            //If property is occupied, check if the requested address is the current tenant
            if(prop.tenant != tenantAddr) {
                return (0, false);
            }

            // For Occupied properties, check paymment type
            if (prop.paymentType == PaymentType.Fixed) {
                // Fixed payment type: always the same monthly rent
                return (monthlyRent, true);
            }else {
                // Flexible payment: return monthly rent as base amount
                return (monthlyRent, true);
            }
        }
    }
