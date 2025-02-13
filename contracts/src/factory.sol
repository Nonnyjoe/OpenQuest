// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Quest} from "./quest.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Factory is Ownable {
    /*
        Creates a child contract using the details fed into the `createTrivia` function
        Only tokens can be used for now, Eth cannot be used.
     */
    using SafeERC20 for IERC20;
    address taskIssuerAddress;
    bytes32 machineHash;
    address protocolVault;
    uint256 public totalDeployments;
    uint256 public totalQuiz;
    uint256 public totalHackathon;

    address[] public childContracts;

    //////////      ERRORS      /////////////
    error InvalidStartTime();
    error InvalidTokenAddress();
    error InvalidTokenUri();
    error InvalidPrize();
    error InvalidTitle();
    error TransferFailed();

    /////////       EVENTS      ////////////
    event QuizCreated(address indexed admin, uint256 time);
    event HackathonCreated(address indexed admin, uint256 time);

    constructor(
        address vault,
        address _taskIssuerAddress,
        bytes32 _machineHash
    ) Ownable(msg.sender) {
        require(vault != address(0) && _taskIssuerAddress != address(0), InvalidTokenAddress());
        protocolVault = vault;
        taskIssuerAddress = _taskIssuerAddress;
        machineHash = _machineHash;
    }

    function createTrivia(
        string memory title,
        uint256 start,
        uint256 stop,
        uint256 totalPrize,
        address token,
        Quest.Trivium trivium
    ) external returns (address) {
        address admin = msg.sender;

        if (start <= block.timestamp || stop <= start)
            revert InvalidStartTime();
        require(token != address(0), InvalidTokenAddress());
        require(bytes(title).length > 0, InvalidTitle());
        require(totalPrize > 0, InvalidPrize());

        Quest quest = new Quest(
            admin,
            title,
            start,
            stop,
            totalPrize,
            token,
            protocolVault,
            trivium,
            taskIssuerAddress,
            machineHash
        );

        address child = address(quest);

        if (trivium == Quest.Trivium.quiz) {
            totalQuiz++;
            totalDeployments++;

            /// sent the prize money to child contract
            IERC20(token).safeTransferFrom(msg.sender, child, totalPrize);

            emit QuizCreated(admin, block.timestamp);
        } else if (trivium == Quest.Trivium.hackathon) {
            totalHackathon++;
            totalDeployments++;
            /// sent the prize money
            IERC20(token).safeTransferFrom(msg.sender, child, totalPrize);

            emit HackathonCreated(admin, block.timestamp);
        }

        childContracts.push(child);

        return child;
    }

    // receive() external payable {}
}
