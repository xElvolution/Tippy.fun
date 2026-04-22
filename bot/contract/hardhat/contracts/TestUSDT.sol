// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from '@openzeppelin/contracts/token/ERC20/ERC20.sol';

/**
 * @title TestUSDT
 * @notice EVM equivalent of the Injective CW20 test USDT: 6 decimals, fixed mint of 10_000_000 tokens
 *         (human) to `recipient`. Raw total 10_000_000 × 10^6, matching `instantiate.test-usdt.example.json`.
 */
contract TestUSDT is ERC20 {
    error InvalidRecipient();

    constructor(address recipient) ERC20('Tippy Test USD', 'USDT') {
        if (recipient == address(0)) revert InvalidRecipient();
        _mint(recipient, 10_000_000 * 10 ** 6);
    }

    function decimals() public pure override returns (uint8) {
        return 6;
    }
}
