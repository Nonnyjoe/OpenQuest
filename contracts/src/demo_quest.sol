// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

// import {ICoprocessorAdapter} from "./ICoprocessorAdapter.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "../lib/coprocessor-base-contract/src/CoprocessorAdapter.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Quest is Ownable, ERC1155, CoprocessorAdapter {
    using SafeERC20 for IERC20;

    uint256 _tokenIdCounter;

    address coprocessorAdapter = 0xff35E413F5e22A9e1Cc02F92dcb78a5076c1aaf3;
    address protocolVault;
    address[] public quizParticipants;
    address[] public hackathonParticipants;
    address[] public quizWinners;
    address[] public hackathonWinners;

    // Quiz public quiz;
    Hackathon public hackathon;
    Trivium public currentEventType;

    /// @notice Keeps track of scores of participants
    mapping(uint256 => bytes) public QuizResults;
    /// @notice Tracks points gained per hacker
    mapping(uint256 => bytes) public HackathonResults;
    /// @notice maps participants to their scores
    mapping(address => uint256) public scorePerParticipant;
    /// protocol staff
    mapping(address => bool) public protocolStaff;
    /// To store URIs per user
    mapping(uint256 => string) private _tokenURIs;







    /// @notice maps a quizId to an address then finally to a hash of answers;
    mapping(string => mapping(address => SubmissionData)) public userQuizSubmission;

    string [] public QuizIds;
    /// @notice maps a quizId to its compressed result bytes;
    mapping(string => Quiz) public quizDetails;

    /// @notice maps a quizId to its compressed result bytes;
    mapping(string => bytes) public compressedQuizResult;

    /// @notice maps a protocol id to user address and finally to his leaderboard score;
    mapping(string => mapping(address => uint256)) public leaderboardPoint;

    /// @notice maps a protocol id to user address and finally to a bool indicating if he is a member of the protocol
    mapping(string => mapping(address => bool)) public isProtocolMember;

    /// @notice maps a protocol id to an array of its members;
    mapping(string => address[]) public protocolMembers;

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

    struct SubmissionData {
        bytes answerHash;
        uint256 SubmissionTime;
    }

    struct Quiz {
        string id;
        address admin;
        string title;
        string protocol_name;
        string access_type;
        uint256 stop;
        uint256 reward;
        uint256 max_user_reward;
        bool completed;
    }

    enum Trivium {
        quiz,
        hackathon
    }

    /// EVENTS  ///
    event ResponseSubmitted(address by, uint256 time);
    event TriviaCanceled(address indexed admin, string reason, uint256 time);
    event StaffAdded(address indexed admin, address staff, uint256 time);
    event StaffRemoved(address indexed admin, address staff, uint256 time);
    event RewardsDistributed(
        address[] winners,
        uint256 rewardPerWinner,
        uint256 time
    );

    event TransferFailed(address indexed to, uint256 amount, bytes reason);

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
    error InvalidAddress();
    error NewUnauthorizedCaller();
    error LengthMismatch();
    error NotStaffMember();
    error NoWinners();
    
    
    constructor(
        address admin,
        string memory tokenUri,
        address _taskIssuerAddress, bytes32 _machineHash
    ) ERC1155(tokenUri) Ownable(admin) CoprocessorAdapter(_taskIssuerAddress, _machineHash) {

    }

    modifier onlyOwnerOrStaff() {
        require(
            msg.sender == owner() || protocolStaff[msg.sender],
            NewUnauthorizedCaller()
        );
        _;
    }


    function gradeQuiz(
        string memory quiz_id,
        string memory name,
        uint256 total_reward,
        uint256 max_user_reward,
        address created_by,
        string memory protocol,
        string memory access,
        bytes memory compressed_data,
        uint256 endTime
     ) external onlyOwnerOrStaff {

       Quiz memory quiz = Quiz({
            id: quiz_id,
            admin: created_by,
            title: name,
            protocol_name: protocol,
            access_type: access,
            stop: endTime,
            reward: total_reward,
            max_user_reward: max_user_reward,
            completed: true
        });

        QuizIds.push(quiz_id);
        quizDetails[quiz_id] = quiz;
        compressedQuizResult[quiz_id] = compressed_data;

        // Call Coprocessor with the compressed_data

    }

    function submitQuiz(
        bytes memory answerHash,
        string memory quiz_id
    ) external {
       SubmissionData memory submission_data = SubmissionData({
            answerHash: answerHash,
            SubmissionTime: block.timestamp
        });

        userQuizSubmission[quiz_id][msg.sender] = submission_data;

    }

    /// @dev A callback for coprocessor after running calculations with the submitted results
    function receiveCoprocessorResult(
        address[] memory participants,
        address[] memory winners,
        uint256[] memory scores,
        string[] memory tokenUris
    ) external {
        require(msg.sender == coprocessorAdapter, NewUnauthorizedCaller());
        // Ensure the input arrays have the same length
        require(scores.length == participants.length, LengthMismatch());
        require(tokenUris.length == participants.length, LengthMismatch());

        // uint256 rewardPerWinner = (quiz.reward / winners.length);
        // address token = quiz.token;

        if (currentEventType == Trivium.quiz) {
            // add winners to quizWinners
            require(winners.length > 0, NoWinners());
            for (uint256 i = 0; i < winners.length; i++) {
                quizWinners.push(winners[i]);
                // IERC20(token).safeTransfer(winners[i], rewardPerWinner);
            }
            // emit RewardsDistributed(winners, rewardPerWinner, block.timestamp);

            // Add participants to quizParticipants and map scores
            for (uint256 i = 0; i < participants.length; i++) {
                quizParticipants.push(participants[i]);
                scorePerParticipant[participants[i]] = scores[i];
                uint256 tokenId = _tokenIdCounter++;
                _mint(participants[i], tokenId, 1, "");
                _setTokenURI(tokenId, tokenUris[i]);
            }
        } else if (currentEventType == Trivium.hackathon) {
            for (uint256 i = 0; i < winners.length; i++) {
                hackathonWinners.push(winners[i]);
                /// TODO distribute rewards
            }

            for (uint256 i = 0; i < participants.length; i++) {
                hackathonParticipants.push(participants[i]);
                scorePerParticipant[participants[i]] = scores[i];
                uint256 tokenId = _tokenIdCounter++;
                _mint(participants[i], tokenId, 1, "");
                _setTokenURI(tokenId, tokenUris[i]);
            }
        }
    }

    function addStaff(address staff) external onlyOwner {
        require(staff != address(0), InvalidAddress());
        protocolStaff[staff] = true;
        emit StaffAdded(msg.sender, staff, block.timestamp);
    }

    function removeStaff(address staff) external onlyOwner {
        require(protocolStaff[staff], NotStaffMember());
        delete protocolStaff[staff];
        emit StaffRemoved(msg.sender, staff, block.timestamp);
    }


    function changeAdmin(address newAdmin) external onlyOwner {
        require(newAdmin != address(0), InvalidAddress());
        if (currentEventType == Trivium.quiz) {
            // quiz.admin = newAdmin;
            transferOwnership(newAdmin);
        } else if (currentEventType == Trivium.hackathon) {
            hackathon.admin = newAdmin;
            transferOwnership(newAdmin);
        }
    }

    function cancelTrivia(
        address recipient,
        string calldata reason
    ) external onlyOwnerOrStaff {
        require(recipient != address(0), InvalidAddress());
        if (currentEventType == Trivium.quiz) {
            // quiz.published = false;
            // IERC20(quiz.token).safeTransfer(recipient, quiz.reward);
            emit TriviaCanceled(msg.sender, reason, block.timestamp);
        } else if (currentEventType == Trivium.hackathon) {
            hackathon.published = false;
            IERC20(hackathon.token).safeTransfer(recipient, hackathon.bounty);
            emit TriviaCanceled(msg.sender, reason, block.timestamp);
        }
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        require(bytes(_tokenURIs[tokenId]).length > 0, "URI not set");
        return _tokenURIs[tokenId];
    }

    //////////      INTERNALS       ///////////

    function _setTokenURI(uint256 tokenId, string memory newURI) internal {
        require(bytes(_tokenURIs[tokenId]).length == 0, "URI already set");
        _tokenURIs[tokenId] = newURI;
    }

    //////////      VIEW FUNCTIONS      //////////////////
    function getQuiz() external view returns (Quiz memory) {
        // require(quiz.published, QuizNotPublished());
        // return quiz;
    }

    function getHackathon() external view returns (Hackathon memory) {
        require(hackathon.published, HackathonNotPublished());
        return hackathon;
    }

    function getScore(address account) external view returns (uint256) {
        return scorePerParticipant[account];
    }

    function getQuizWinners() external view returns (address[] memory) {
        return quizWinners;
    }

    function getHackathonWinners() external view returns (address[] memory) {
        return hackathonWinners;
    }

    receive() external payable {}
}