// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract DAI is ERC20 {

    constructor() ERC20("DAI Stable Coin","DAI"){
        _mint(msg.sender,100000);   // Will mint 100k tokens
    }

    function faucet(address to, uint amount) external {
        _mint(to, amount);
    }
}