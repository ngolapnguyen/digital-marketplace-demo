// contracts/MashiroDemoToken1.sol
// SPDX-License-Identifier: MIT OR Apache-2.0
pragma solidity ^0.8.3;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MashiroDemoToken1 is ERC20 {
    address public owner;

    constructor() public ERC20("MashiroDemoToken1", "MDT1") {
        _mint(msg.sender, 1000000 ether);
        owner = msg.sender;
    }

    function getSome(uint256 amount) external {
        _mint(msg.sender, amount);
    }
}
