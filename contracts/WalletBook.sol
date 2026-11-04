// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title WalletBook
 * @notice A gas-efficient, decentralized address book for EVM chains such as BOT Chain.
 * @dev Stores contact information scoped privately to each caller at the contract-access level.
 */
contract WalletBook {
    struct Contact {
        uint256 id;
        string name;
        address walletAddress;
    }

    // Mapping from user wallet address to their list of contacts
    mapping(address => Contact[]) private _userContacts;

    // Mapping: user => (contactId => 1-based index in _userContacts)
    mapping(address => mapping(uint256 => uint256)) private _contactIndex;

    // Global incremental contact ID sequence
    uint256 private _nextContactId;

    // Events emitted on state modifications
    event ContactAdded(
        address indexed user,
        uint256 indexed contactId,
        string name,
        address walletAddress
    );

    event ContactUpdated(
        address indexed user,
        uint256 indexed contactId,
        string name,
        address walletAddress
    );

    event ContactDeleted(
        address indexed user,
        uint256 indexed contactId
    );

    /**
     * @notice Saves a new contact for the sender's wallet.
     * @param name Contact's nickname or label (cannot be empty, max 64 chars).
     * @param walletAddress Contact's EVM wallet address (cannot be address(0)).
     * @return contactId The generated unique ID for this contact.
     */
    function addContact(string calldata name, address walletAddress)
        external
        returns (uint256 contactId)
    {
        require(bytes(name).length > 0, "WalletBook: Name cannot be empty");
        require(bytes(name).length <= 64, "WalletBook: Name too long (max 64 bytes)");
        require(walletAddress != address(0), "WalletBook: Invalid wallet address");

        contactId = ++_nextContactId;

        _userContacts[msg.sender].push(Contact({
            id: contactId,
            name: name,
            walletAddress: walletAddress
        }));

        // Store 1-based index
        _contactIndex[msg.sender][contactId] = _userContacts[msg.sender].length;

        emit ContactAdded(msg.sender, contactId, name, walletAddress);
    }

    /**
     * @notice Updates an existing contact for the caller.
     * @param contactId Unique ID of the contact to update.
     * @param name Updated contact name.
     * @param walletAddress Updated wallet address.
     */
    function updateContact(
        uint256 contactId,
        string calldata name,
        address walletAddress
    ) external {
        require(bytes(name).length > 0, "WalletBook: Name cannot be empty");
        require(bytes(name).length <= 64, "WalletBook: Name too long (max 64 bytes)");
        require(walletAddress != address(0), "WalletBook: Invalid wallet address");

        uint256 idxPlusOne = _contactIndex[msg.sender][contactId];
        require(idxPlusOne != 0, "WalletBook: Contact not found");

        uint256 index = idxPlusOne - 1;
        Contact storage contactToUpdate = _userContacts[msg.sender][index];
        contactToUpdate.name = name;
        contactToUpdate.walletAddress = walletAddress;

        emit ContactUpdated(msg.sender, contactId, name, walletAddress);
    }

    /**
     * @notice Deletes an existing contact belonging to the caller using O(1) swap-and-pop.
     * @param contactId Unique ID of the contact to delete.
     */
    function deleteContact(uint256 contactId) external {
        uint256 idxPlusOne = _contactIndex[msg.sender][contactId];
        require(idxPlusOne != 0, "WalletBook: Contact not found");

        uint256 index = idxPlusOne - 1;
        uint256 lastIndex = _userContacts[msg.sender].length - 1;

        if (index != lastIndex) {
            Contact storage lastContact = _userContacts[msg.sender][lastIndex];
            _userContacts[msg.sender][index] = lastContact;
            _contactIndex[msg.sender][lastContact.id] = index + 1;
        }

        _userContacts[msg.sender].pop();
        delete _contactIndex[msg.sender][contactId];

        emit ContactDeleted(msg.sender, contactId);
    }

    /**
     * @notice Retrieves all contacts saved by the caller.
     * @return Array of contacts belonging strictly to msg.sender.
     */
    function getMyContacts() external view returns (Contact[] memory) {
        return _userContacts[msg.sender];
    }

    /**
     * @notice Returns the total number of contacts saved by the caller.
     */
    function getMyContactCount() external view returns (uint256) {
        return _userContacts[msg.sender].length;
    }
}
