// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {QuestNft} from "./quest_nft.sol";

contract Quest is Ownable {
    QuestNft public questNft;

    address protocolVault;
    address[] public quizParticipants;
    address[] public hackathonParticipants;

    address[] public quizWinners;
    address[] public hackathonWinners;

    Quiz public quiz;
    Hackathon public hackathon;

    Trivium public currentEventType;

    /// @notice Keeps track of scores of participants
    mapping(address => uint256) public QuizScores;
    /// @notice Tracks points gained per hacker
    mapping(address => uint256) public HackathonPoint;

    struct Hackathon {
        string title;
        string tokenUri;
        uint256 start;
        uint256 stop;
        uint256 bounty;
        bool published;
        address admin;
        address token;
    }

    struct Quiz {
        address admin;
        address token;
        string title;
        string tokenUri;
        uint256 start;
        uint256 stop;
        uint256 reward;
        bool published;
    }

    enum Trivium {
        quiz,
        hackathon
    }

    /// EVENTS  ///
    event QuizCreated(address indexed admin, uint256 time);
    event HackathonCreated(address indexed admin, uint256 time);
    event ResponseSubmitted(address by, uint256 time);
    event TriviaCanceled(address indexed admin, string memory reason, uint256 time);


    /// ERRORS  ///
    error NotQuizAdmin();
    error NotHackathonAdmin();
    error QuizNotPublished();
    error HackathonNotPublished();
    error QuizAlreadyPublished();
    error HackathonAlreadyPublished();
    error QuizNotActive();
    error HackathonNotActive();
    error QuizStillActive();
    error HackathonStillActive();
    error TransferFailed();
    error InvalidAddress();

    constructor(
        address admin,
        string memory tokenUri,
        string memory title,
        uint256 start,
        uint256 stop,
        uint256 bounty,
        address token,
        address vault,
        Trivium trivium
    ) Ownable(admin) {
        protocolVault = vault;

        if (trivium == Trivium.quiz) {
            quiz = Quiz({
                admin: admin,
                token: token,
                title: title,
                tokenUri: tokenUri,
                start: start,
                stop: stop,
                reward: bounty,
                published: false
            });
            currentEventType = Trivium.quiz;
            bool success = IERC20(token).transferFrom(
                msg.sender,
                protocolVault,
                bounty
            );
            require(success, TransferFailed());
            emit QuizCreated(msg.sender, block.timestamp);
        }
        if (trivium == Trivium.hackathon) {
            hackathon = Hackathon({
                title: title,
                tokenUri: tokenUri,
                start: start,
                stop: stop,
                bounty: bounty,
                published: false,
                admin: admin,
                token: token
            });
            currentEventType = Trivium.hackathon;
            bool success = IERC20(token).transferFrom(
                msg.sender,
                protocolVault,
                bounty
            );
            require(success, TransferFailed());
            emit HackathonCreated(msg.sender, block.timestamp);
        }
    }

    function publish() external onlyOwner {
        if (currentEventType == Trivium.quiz) {
            quiz.published = true;
        } else if (currentEventType == Trivium.hackathon) {
            hackathon.published = true;
        }
    }

    function submitResponse(bytes memory quizData) external {
       if (currentEventType == Trivium.quiz) {
            require(quiz.published = true, QuizNotActive());
        /// TODO

        } else if (currentEventType == Trivium.hackathon) {
            require(hackathon.published = true, HackathonNotActive());
        /// TODO

        }
    }

    function setWinners(address[] calldata winnerAddresses) external onlyOwner {
        if (currentEventType == Trivium.quiz) {
            if (block.timestamp <= quiz.stop) revert QuizStillActive();
            for (uint i = 0; i < winnerAddresses.length; i++) {
                quizWinners.push(winnerAddresses[i]);
            }
            /// TODO Pay winners
        } else if (currentEventType == Trivium.hackathon) {
            if (block.timestamp <= hackathon.stop)
                revert HackathonStillActive();
            for (uint i = 0; i < winnerAddresses.length; i++) {
                hackathonWinners.push(winnerAddresses[i]);
            /// TODO Pay winners
            }
        }
    }

    function changeAdmin(address newAdmin) external onlyOwner {
        require(newAdmin != address(0), InvalidAddress());
        if (currentEventType == Trivium.quiz) {
            quiz.admin = newAdmin;
            transferOwnership(newOwner);
        } else if (currentEventType == Trivium.hackathon) {
            hackathon.admin = newAdmin;
            transferOwnership(newOwner);
        }
    }

    function cancelTrivia(address recipient, string calldata reason) external onlyOwner {
        require(recipient != address(0), InvalidAddress());
        if (currentEventType == Trivium.quiz) {
            quiz.published = false;
            IERC20(quiz.token).transferFrom(protocolVault, recipient, quiz.reward);
            emit TriviaCanceled(admin, reason, block.timestamp);
        } else if (currentEventType == Trivium.hackathon) {
            hackathon.published = false;
            IERC20(hackathon.token).transferFrom(protocolVault, recipient, hackathon.bounty);
            emit TriviaCanceled(admin, reason, block.timestamp);
        }
    }

    //////////      VIEW FUNCTIONS      //////////////////
    function getQuiz() external view returns (Quiz memory) {
        require(quiz.published, QuizNotPublished());
        return quiz;
    }

    function getHackathon() external view returns (Hackathon memory) {
        require(hackathon.published, HackathonNotPublished());
        return hackathon;
    }

    receive() external payable {}
}
