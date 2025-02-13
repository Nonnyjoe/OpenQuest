// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../lib/coprocessor-base-contract/src/CoprocessorAdapter.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";





contract Protocol is Ownable, ERC1155, CoprocessorAdapter {

    address rewardToken;
    ProtocolData protocol;
    address OpenQuest;


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

    /// protocol staff
    mapping(address => bool) public protocolStaff;

    /// protocol staff
    mapping(string => bool) public isQuizRegistered;

    /// To store URIs per user
    mapping(uint256 => string) private _tokenURIs;



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

    struct ProtocolData {
        string name;
        string protocol_id;
        address contract_add;
        address admin;
    }

        /// EVENTS  ///
    event ResponseSubmitted(address by, uint256 time);
    event TriviaCanceled(address indexed admin, string reason, uint256 time);
    event StaffAdded(address indexed admin, address staff, uint256 time);
    event StaffRemoved(address indexed admin, address staff, uint256 time);
    event TransferFailed(address indexed to, uint256 amount, bytes reason);
    event QuizCreated(address indexed by, string indexed quiz_id);
    event RewardsDistributed(
        address[] winners,
        uint256 rewardPerWinner,
        uint256 time
    );


    /// ERRORS  ///
    error NewUnauthorizedCaller();
    error InvalidAddress();
    error NotStaffMember();
    error InvalidQuizId();



    modifier onlyOwnerOrStaff() {
        require(
            msg.sender == owner() || protocolStaff[msg.sender] || msg.sender == OpenQuest,
            NewUnauthorizedCaller()
        );
        _;
    }


    constructor (string memory name, string memory protocolId, address reward_token, address admin, address openQuest, address _taskIssuerAddress, bytes32 _machineHash) ERC1155(" ") Ownable(admin) CoprocessorAdapter(_taskIssuerAddress, _machineHash) {
        protocol = ProtocolData({
            name: name,
            protocol_id: protocolId,
            contract_add: address(this),
            admin: admin
        });
        rewardToken = reward_token;
        OpenQuest = openQuest;
    }


    function createQuiz(
        string memory quiz_id,
        string memory name,
        uint256 total_reward,
        uint256 max_user_reward,
        address created_by,
        string memory protocol_name,
        string memory access,
        uint256 endTime
    ) external onlyOwnerOrStaff {

       Quiz memory quiz = Quiz({
            id: quiz_id,
            admin: created_by,
            title: name,
            protocol_name: protocol_name,
            access_type: access,
            stop: endTime,
            reward: total_reward,
            max_user_reward: max_user_reward,
            completed: false
        });

        QuizIds.push(quiz_id);
        quizDetails[quiz_id] = quiz;
        isQuizRegistered[quiz_id] = true;
        emit QuizCreated(created_by, quiz_id);
    }


    function gradeQuiz(
        string memory quiz_id,
        string memory name,
        uint256 total_reward,
        uint256 max_user_reward,
        address created_by,
        string memory protocol_name,
        string memory access,
        bytes memory compressed_data,
        uint256 endTime
     ) external onlyOwnerOrStaff {

        if (isQuizRegistered[quiz_id]) {

            compressedQuizResult[quiz_id] = compressed_data;

        } else {
            Quiz memory quiz = Quiz({
                id: quiz_id,
                admin: created_by,
                title: name,
                protocol_name: protocol_name,
                access_type: access,
                stop: endTime,
                reward: total_reward,
                max_user_reward: max_user_reward,
                completed: true
            });

            QuizIds.push(quiz_id);
            quizDetails[quiz_id] = quiz;
            compressedQuizResult[quiz_id] = compressed_data;
            isQuizRegistered[quiz_id] = true;
        }


        // Call Coprocessor with the compressed_data
        callCoprocessor(compressed_data);

    }

    function submitQuiz(
        bytes memory answerHash,
        string memory quiz_id
    ) external {
        require(isQuizRegistered[quiz_id], InvalidQuizId());
       SubmissionData memory submission_data = SubmissionData({
            answerHash: answerHash,
            SubmissionTime: block.timestamp
        });

        userQuizSubmission[quiz_id][msg.sender] = submission_data;

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
        transferOwnership(newAdmin);
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
    // function getQuiz() external view returns (Quiz memory) {
    //     // require(quiz.published, QuizNotPublished());
    //     // return quiz;
    // }

    // function getScore(address account) external view returns (uint256) {
    //     return scorePerParticipant[account];
    // }

    // function getQuizWinners() external view returns (address[] memory) {
    //     return quizWinners;
    // }


    receive() external payable {}
}