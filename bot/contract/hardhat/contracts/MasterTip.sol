// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title MasterTip
 * @notice EVM port of the Injective CosmWasm `master-tip` contract: records guild point-currency
 *         intents on-chain (`RequestPointToken`). Fulfillment (e.g. deploying an ERC-20) can be wired later.
 */
contract MasterTip {
    struct GuildPointRequest {
        uint256 id;
        string guildIdentifier;
        address requester;
        string displayName;
        string symbol;
        uint256 supply;
        uint256 createdAt;
    }

    address public admin;
    uint256 public nextId;

    mapping(uint256 => GuildPointRequest) private _requests;

    event PointTokenRequested(
        uint256 indexed id,
        string guildIdentifier,
        address indexed requester,
        string displayName,
        string symbol,
        uint256 supply
    );
    event AdminAck(uint256 indexed id, string note);

    error Unauthorized();
    error InvalidAdmin();

    constructor(address admin_) {
        if (admin_ == address(0)) revert InvalidAdmin();
        admin = admin_;
        nextId = 1;
    }

    function requestPointToken(
        string calldata guildIdentifier,
        string calldata displayName,
        string calldata symbol,
        uint256 supply
    ) external returns (uint256 id) {
        id = nextId;
        unchecked {
            nextId = id + 1;
        }
        _requests[id] = GuildPointRequest({
            id: id,
            guildIdentifier: guildIdentifier,
            requester: msg.sender,
            displayName: displayName,
            symbol: symbol,
            supply: supply,
            createdAt: block.timestamp
        });
        emit PointTokenRequested(id, guildIdentifier, msg.sender, displayName, symbol, supply);
    }

    function adminAck(uint256 id, string calldata note) external {
        if (msg.sender != admin) revert Unauthorized();
        emit AdminAck(id, note);
    }

    function getConfig() external view returns (address admin_, uint256 nextId_) {
        return (admin, nextId);
    }

    function getRequest(uint256 id) external view returns (bool found, GuildPointRequest memory req) {
        if (id == 0 || id >= nextId) return (false, req);
        req = _requests[id];
        found = true;
    }

    /// @param startAfter use 0 to start from id 1; otherwise returns requests with id > startAfter
    function listRequests(uint256 startAfter, uint32 limit) external view returns (GuildPointRequest[] memory out) {
        uint32 lim = limit == 0 ? 30 : limit;
        if (lim > 100) lim = 100;
        if (nextId <= 1) {
            return new GuildPointRequest[](0);
        }
        uint256 start = startAfter == 0 ? 1 : startAfter + 1;
        uint256 lastExisting = nextId - 1;
        if (start > lastExisting) {
            return new GuildPointRequest[](0);
        }
        uint256 count = lastExisting - start + 1;
        if (count > lim) count = lim;
        out = new GuildPointRequest[](count);
        for (uint256 i = 0; i < count; i++) {
            out[i] = _requests[start + i];
        }
    }
}
