// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Quest} from "./quest.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Factory is Ownable {
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

    constructor(address vault) Ownable(msg.sender) {
        require(vault != address(0), InvalidTokenAddress());
        protocolVault = vault;
    }

    function createTrivia(
        string memory tokenUri,
        string memory title,
        uint256 start,
        uint256 stop,
        uint256 totalPrize,
        address token,
        Quest.Trivium trivium
    ) external {
        address admin = msg.sender;

        require(start > block.timestamp && stop > start, InvalidStartTime());
        require(token != address(0), InvalidTokenAddress());
        require(bytes(tokenUri).length > 0, InvalidTokenUri());
        require(bytes(title).length > 0, InvalidTitle());
        require(totalPrize > 0, InvalidPrize());

        Quest quest = new Quest(
            admin,
            tokenUri,
            title,
            start,
            stop,
            totalPrize,
            token,
            protocolVault,
            trivium
        );

        address child = address(quest);

        if (trivium == Quest.Trivium.quiz) {
            totalQuiz++;
            totalDeployments++;

            /// sent the prize money to vault
            bool success = IERC20(token).transferFrom(
                msg.sender,
                child,
                totalPrize
            );
            require(success, TransferFailed());

            emit QuizCreated(admin, block.timestamp);
        } else if (trivium == Quest.Trivium.hackathon) {
            totalHackathon++;
            totalDeployments++;
            /// sent the prize money to vault
            bool success = IERC20(token).transferFrom(
                msg.sender,
                child,
                totalPrize
            );
            require(success, TransferFailed());

            emit HackathonCreated(admin, block.timestamp);
        }

        childContracts.push(child);
    }

    receive() external payable {}
}
