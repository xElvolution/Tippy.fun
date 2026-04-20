// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title TippyMaker
/// @notice Non-custodial, AI-judged bounty & tipping registry for Tippy.Fun on Conflux eSpace.
///
///         A single multi-campaign contract that handles two modes:
///           - Mode 0 "Bounty":  organizer runs a hackathon / bounty. AI judges + AI arbiter
///                               rank submissions. Organizer publishes the result on-chain via
///                               `settleWinners`, earmarking entitlements. Winners pull their
///                               prize with `claim` before `claimDeadline`. After the deadline,
///                               the organizer can `reclaimUnclaimed` to return forgotten
///                               prizes to the treasury.
///           - Mode 1 "Tip":     organizer runs an always-on engagement campaign. For every
///                               submission that the AI pipeline rates as passing, the
///                               organizer (or their arbiter signer) calls `payTip` and funds
///                               transfer directly to the submitter in the same tx. No claim
///                               step, no expiry. When the organizer is done they call
///                               `finalize` and the remainder returns to them.
///
///         Each campaign carries its own payout token:
///           - `token == address(0)` means native CFX.
///           - Any other address is an ERC-20 (e.g. USDT0, AxCNH). Funding uses transferFrom;
///             payouts use transfer.
///
///         Every AI verdict commits a `verdictHash` (keccak256 of the canonical off-chain
///         verdict payload). Off-chain storage (Supabase / IPFS) holds the human-readable
///         verdicts; the hash on-chain proves they haven't been edited after the fact.
///
///         No admin, no protocol fee, no upgrade path. Funds only move to winners or back to
///         the organizer.
contract TippyMaker {
    /*//////////////////////////////////////////////////////////////
                                 TYPES
    //////////////////////////////////////////////////////////////*/

    enum Mode {
        Bounty,
        Tip
    }

    struct Campaign {
        address organizer;
        address token; // address(0) = native CFX, otherwise ERC-20
        Mode mode;
        string metadataURI; // off-chain JSON: title, criteria, judge models, etc.
        uint256 prizePool; // unreserved balance available for settlement/tips/refund
        uint256 totalFunded; // all-time funding (including seed + tips + top-ups)
        uint256 totalTipped; // subset of totalFunded that came from `tip`
        uint256 totalPaidOut; // all-time paid to winners (claims + direct tips)
        uint256 totalEntitled; // bounty mode: reserved for unclaimed winners
        uint64 submissionsClose; // 0 = open-ended
        uint64 claimDeadline; // bounty mode only; 0 for tip mode
        uint64 createdAt;
        bool finalized;
        bytes32 latestVerdictHash;
    }

    struct Entitlement {
        uint256 amount;
        bool claimed;
    }

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    Campaign[] private _campaigns;

    /// @dev campaign id => winner => entitlement (bounty mode only)
    mapping(uint256 => mapping(address => Entitlement)) private _entitlements;

    /// @dev campaign id => submissionHash => paid (tip mode anti-double-pay)
    mapping(uint256 => mapping(bytes32 => bool)) public submissionPaid;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    event CampaignCreated(
        uint256 indexed id,
        address indexed organizer,
        address indexed token,
        Mode mode,
        string metadataURI,
        uint64 submissionsClose,
        uint64 claimDeadline,
        uint256 seedAmount
    );

    event Funded(uint256 indexed id, address indexed from, uint256 amount);

    event Tipped(uint256 indexed id, address indexed from, uint256 amount, string note);

    event WinnerSettled(
        uint256 indexed id,
        address indexed to,
        uint256 amount,
        bytes32 indexed submissionHash,
        bytes32 verdictHash,
        string payoutNote
    );

    event PrizeClaimed(uint256 indexed id, address indexed to, uint256 amount);

    event UnclaimedReclaimed(
        uint256 indexed id, address indexed winner, uint256 amount, address organizer
    );

    event TipPaid(
        uint256 indexed id,
        address indexed to,
        uint256 amount,
        bytes32 indexed submissionHash,
        bytes32 verdictHash,
        string payoutNote
    );

    event CampaignFinalized(uint256 indexed id, uint256 refundedToOrganizer);

    event MetadataUpdated(uint256 indexed id, string metadataURI);

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    error CampaignNotFound();
    error NotOrganizer();
    error AlreadyFinalized();
    error InsufficientBalance();
    error ZeroAmount();
    error InvalidRecipient();
    error WrongMode();
    error LengthMismatch();
    error ClaimWindowClosed();
    error ClaimWindowOpen();
    error NothingToClaim();
    error AlreadyClaimed();
    error AlreadyPaid();
    error TokenMismatch();
    error NativeValueNotAllowed();
    error TransferFailed();

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/

    modifier exists(uint256 id) {
        if (id >= _campaigns.length) revert CampaignNotFound();
        _;
    }

    modifier onlyOrganizer(uint256 id) {
        if (_campaigns[id].organizer != msg.sender) revert NotOrganizer();
        _;
    }

    /*//////////////////////////////////////////////////////////////
                          CREATION & FUNDING
    //////////////////////////////////////////////////////////////*/

    /// @notice Create a new campaign and optionally seed the prize pool.
    /// @param token           address(0) for native CFX, or an ERC-20 address.
    /// @param mode            0 = Bounty (claim-based), 1 = Tip (instant payout).
    /// @param metadataURI     off-chain JSON with title, rules, criteria, chosen judge/arbiter models.
    /// @param submissionsClose  unix ts after which submissions should stop (soft, UI-enforced). 0 = none.
    /// @param claimDeadline     unix ts after which unclaimed bounty prizes can be reclaimed by the organizer.
    ///                          Required for Bounty mode; must be 0 for Tip mode.
    /// @param seedAmount        seed amount. For native CFX must equal msg.value; for ERC-20 pulled via transferFrom.
    /// @return id  The 0-based index of the new campaign.
    function createCampaign(
        address token,
        Mode mode,
        string calldata metadataURI,
        uint64 submissionsClose,
        uint64 claimDeadline,
        uint256 seedAmount
    ) external payable returns (uint256 id) {
        if (mode == Mode.Bounty && claimDeadline == 0) revert WrongMode();
        if (mode == Mode.Tip && claimDeadline != 0) revert WrongMode();

        id = _campaigns.length;
        _campaigns.push(
            Campaign({
                organizer: msg.sender,
                token: token,
                mode: mode,
                metadataURI: metadataURI,
                prizePool: 0,
                totalFunded: 0,
                totalTipped: 0,
                totalPaidOut: 0,
                totalEntitled: 0,
                submissionsClose: submissionsClose,
                claimDeadline: claimDeadline,
                createdAt: uint64(block.timestamp),
                finalized: false,
                latestVerdictHash: bytes32(0)
            })
        );

        emit CampaignCreated(
            id, msg.sender, token, mode, metadataURI, submissionsClose, claimDeadline, seedAmount
        );

        if (seedAmount > 0) {
            _pullFunds(token, msg.sender, seedAmount);
            Campaign storage c = _campaigns[id];
            c.prizePool += seedAmount;
            c.totalFunded += seedAmount;
            emit Funded(id, msg.sender, seedAmount);
        } else if (msg.value != 0) {
            // User sent CFX but passed seedAmount=0 — reject to avoid stuck funds.
            revert NativeValueNotAllowed();
        }
    }

    /// @notice Top up the prize pool. Anyone can fund any campaign.
    function fund(uint256 id, uint256 amount) external payable exists(id) {
        if (amount == 0) revert ZeroAmount();
        Campaign storage c = _campaigns[id];
        if (c.finalized) revert AlreadyFinalized();
        _pullFunds(c.token, msg.sender, amount);
        c.prizePool += amount;
        c.totalFunded += amount;
        emit Funded(id, msg.sender, amount);
    }

    /// @notice Tip a campaign with an on-chain note. Same accounting as `fund` plus a social feed event.
    function tip(uint256 id, uint256 amount, string calldata note) external payable exists(id) {
        if (amount == 0) revert ZeroAmount();
        Campaign storage c = _campaigns[id];
        if (c.finalized) revert AlreadyFinalized();
        _pullFunds(c.token, msg.sender, amount);
        c.prizePool += amount;
        c.totalFunded += amount;
        c.totalTipped += amount;
        emit Tipped(id, msg.sender, amount, note);
    }

    /*//////////////////////////////////////////////////////////////
                              BOUNTY MODE
    //////////////////////////////////////////////////////////////*/

    /// @notice Organizer publishes the AI-arbiter ranking on-chain, reserving prize amounts
    ///         for each winner. Winners pull funds via `claim` before `claimDeadline`.
    /// @param verdictHash    keccak of the canonical off-chain verdict blob (judges + arbiter)
    ///                       so off-chain records can be verified against the chain.
    function settleWinners(
        uint256 id,
        address[] calldata winners,
        uint256[] calldata amounts,
        bytes32[] calldata submissionHashes,
        bytes32 verdictHash,
        string calldata payoutNote
    ) external exists(id) onlyOrganizer(id) {
        Campaign storage c = _campaigns[id];
        if (c.finalized) revert AlreadyFinalized();
        if (c.mode != Mode.Bounty) revert WrongMode();
        uint256 n = winners.length;
        if (n == 0) revert ZeroAmount();
        if (amounts.length != n || submissionHashes.length != n) revert LengthMismatch();

        uint256 total;
        for (uint256 i = 0; i < n; i++) {
            address w = winners[i];
            uint256 a = amounts[i];
            if (w == address(0)) revert InvalidRecipient();
            if (a == 0) revert ZeroAmount();
            total += a;
            _entitlements[id][w].amount += a;
            emit WinnerSettled(id, w, a, submissionHashes[i], verdictHash, payoutNote);
        }

        if (total > c.prizePool) revert InsufficientBalance();
        c.prizePool -= total;
        c.totalEntitled += total;
        c.latestVerdictHash = verdictHash;
    }

    /// @notice Winner pulls their settled prize before `claimDeadline`.
    function claim(uint256 id) external exists(id) {
        Campaign storage c = _campaigns[id];
        if (c.mode != Mode.Bounty) revert WrongMode();
        if (block.timestamp > c.claimDeadline) revert ClaimWindowClosed();

        Entitlement storage e = _entitlements[id][msg.sender];
        if (e.claimed) revert AlreadyClaimed();
        uint256 amount = e.amount;
        if (amount == 0) revert NothingToClaim();

        e.amount = 0;
        e.claimed = true;
        c.totalEntitled -= amount;
        c.totalPaidOut += amount;

        _pushFunds(c.token, payable(msg.sender), amount);
        emit PrizeClaimed(id, msg.sender, amount);
    }

    /// @notice Organizer sweeps unclaimed prizes back into the pool after `claimDeadline`.
    ///         The organizer passes the winners they wish to reclaim from (read them from
    ///         `WinnerSettled` events). Claimed or zero entries are skipped silently-as-error
    ///         to keep the call atomic.
    function reclaimUnclaimed(uint256 id, address[] calldata winners)
        external
        exists(id)
        onlyOrganizer(id)
    {
        Campaign storage c = _campaigns[id];
        if (c.mode != Mode.Bounty) revert WrongMode();
        if (block.timestamp <= c.claimDeadline) revert ClaimWindowOpen();

        uint256 reclaimed;
        for (uint256 i = 0; i < winners.length; i++) {
            address w = winners[i];
            Entitlement storage e = _entitlements[id][w];
            if (e.claimed) continue;
            uint256 amt = e.amount;
            if (amt == 0) continue;
            e.amount = 0;
            e.claimed = true;
            reclaimed += amt;
            emit UnclaimedReclaimed(id, w, amt, msg.sender);
        }
        if (reclaimed == 0) revert NothingToClaim();
        c.totalEntitled -= reclaimed;
        c.prizePool += reclaimed;
    }

    /*//////////////////////////////////////////////////////////////
                                TIP MODE
    //////////////////////////////////////////////////////////////*/

    /// @notice Instantly pay a submitter in Tip mode. Called by the organizer after the AI
    ///         arbiter rates a submission as passing. Each submissionHash can be paid at most once.
    function payTip(
        uint256 id,
        address payable to,
        uint256 amount,
        bytes32 submissionHash,
        bytes32 verdictHash,
        string calldata payoutNote
    ) external exists(id) onlyOrganizer(id) {
        if (to == address(0)) revert InvalidRecipient();
        if (amount == 0) revert ZeroAmount();

        Campaign storage c = _campaigns[id];
        if (c.finalized) revert AlreadyFinalized();
        if (c.mode != Mode.Tip) revert WrongMode();
        if (amount > c.prizePool) revert InsufficientBalance();
        if (submissionPaid[id][submissionHash]) revert AlreadyPaid();

        submissionPaid[id][submissionHash] = true;
        c.prizePool -= amount;
        c.totalPaidOut += amount;
        c.latestVerdictHash = verdictHash;

        _pushFunds(c.token, to, amount);
        emit TipPaid(id, to, amount, submissionHash, verdictHash, payoutNote);
    }

    /*//////////////////////////////////////////////////////////////
                           FINALIZE / METADATA
    //////////////////////////////////////////////////////////////*/

    /// @notice Organizer closes the campaign and sweeps the remaining pool back to themselves.
    ///         For Bounty mode this requires the claim deadline to have passed *or* all
    ///         entitlements to be cleared — otherwise winners could be robbed of their prize.
    function finalize(uint256 id) external exists(id) onlyOrganizer(id) {
        Campaign storage c = _campaigns[id];
        if (c.finalized) revert AlreadyFinalized();
        if (c.mode == Mode.Bounty && c.totalEntitled > 0 && block.timestamp <= c.claimDeadline) {
            revert ClaimWindowOpen();
        }
        c.finalized = true;
        uint256 refund = c.prizePool;
        c.prizePool = 0;
        if (refund > 0) {
            _pushFunds(c.token, payable(c.organizer), refund);
        }
        emit CampaignFinalized(id, refund);
    }

    /// @notice Organizer updates the metadata URI (fix a typo, publish final results, etc).
    function updateMetadata(uint256 id, string calldata metadataURI)
        external
        exists(id)
        onlyOrganizer(id)
    {
        Campaign storage c = _campaigns[id];
        if (c.finalized) revert AlreadyFinalized();
        c.metadataURI = metadataURI;
        emit MetadataUpdated(id, metadataURI);
    }

    /*//////////////////////////////////////////////////////////////
                              VIEW HELPERS
    //////////////////////////////////////////////////////////////*/

    function getCampaign(uint256 id) external view exists(id) returns (Campaign memory) {
        return _campaigns[id];
    }

    function campaignsCount() external view returns (uint256) {
        return _campaigns.length;
    }

    function entitlementOf(uint256 id, address winner)
        external
        view
        returns (uint256 amount, bool claimed)
    {
        Entitlement storage e = _entitlements[id][winner];
        return (e.amount, e.claimed);
    }

    /// @notice Recent-campaigns page for the explore grid (newest first).
    function getRecentCampaigns(uint256 offset, uint256 limit)
        external
        view
        returns (Campaign[] memory page, uint256[] memory ids)
    {
        uint256 total = _campaigns.length;
        if (offset >= total) {
            return (new Campaign[](0), new uint256[](0));
        }
        uint256 end = total - offset;
        uint256 start = end > limit ? end - limit : 0;
        uint256 size = end - start;
        page = new Campaign[](size);
        ids = new uint256[](size);
        for (uint256 i = 0; i < size; i++) {
            uint256 idx = end - 1 - i;
            page[i] = _campaigns[idx];
            ids[i] = idx;
        }
    }

    /*//////////////////////////////////////////////////////////////
                           INTERNAL TOKEN UTILS
    //////////////////////////////////////////////////////////////*/

    function _pullFunds(address token, address from, uint256 amount) internal {
        if (token == address(0)) {
            if (msg.value != amount) revert InsufficientBalance();
        } else {
            if (msg.value != 0) revert NativeValueNotAllowed();
            _safeTransferFrom(token, from, address(this), amount);
        }
    }

    function _pushFunds(address token, address payable to, uint256 amount) internal {
        if (token == address(0)) {
            (bool ok,) = to.call{value: amount}("");
            if (!ok) revert TransferFailed();
        } else {
            _safeTransfer(token, to, amount);
        }
    }

    /// @dev Supports both standard and non-standard (e.g. USDT-style) ERC-20s by checking the
    ///      return data only if it exists, and treating a successful empty return as success.
    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool ok, bytes memory data) =
            token.call(abi.encodeWithSelector(IERC20.transfer.selector, to, amount));
        if (!ok || (data.length != 0 && !abi.decode(data, (bool)))) revert TransferFailed();
    }

    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool ok, bytes memory data) =
            token.call(abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount));
        if (!ok || (data.length != 0 && !abi.decode(data, (bool)))) revert TransferFailed();
    }
}

/// @dev Minimal ERC-20 interface used by TippyMaker. Intentionally not imported so the
///      contract has zero external dependencies and is easy to audit.
interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}
