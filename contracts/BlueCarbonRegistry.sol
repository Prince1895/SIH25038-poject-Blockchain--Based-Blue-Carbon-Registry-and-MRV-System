// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "hardhat/console.sol";

contract BlueCarbonRegistry is AccessControl {
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Events
    event ProjectRegistered(uint256 projectId, address indexed owner, string details);
    event CreditMinted(uint256 indexed tokenId, uint256 indexed projectId, address indexed to);
    event CreditRetired(uint256 indexed tokenId, address indexed retiredBy, string reason);

    constructor() {
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    // --- Functions ---
    /**
     * @notice Admin function to register a new blue carbon project.
     */
    function registerProject(string calldata /*_projectData*/) internal pure {
        
         console.log("A new project has been registered.");
    }

    /**
     * @notice Minter function to mint a new credit for an approved project.
     */
    function mintCredit(uint256 _projectId, address /*_to*/) internal pure {
         console.log("A new credit has been minted for project %s", _projectId);
    }

    /**
     * @notice Public function for a token owner to retire their credit.
     */
    function retireCredit(uint256 _tokenId, string calldata /*_reason*/) internal pure {
         console.log("Credit %s has been retired.", _tokenId);
    }
}