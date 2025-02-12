// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

contract QuestNft is ERC1155 {
   constructor(string memory uri) ERC1155(uri) {}

    function burn(uint256 id, uint256 value) external {
        _burn(msg.sender, id, value);
    }
}
