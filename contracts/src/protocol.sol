// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "../lib/coprocessor-base-contract/src/CoprocessorAdapter.sol";

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "forge-std/Script.sol";

contract Protocol is Ownable, CoprocessorAdapter, Script {

    IERC20 rewardToken;
    ProtocolData protocol;
    address OpenQuest;
    string [] public QuizIds;
    address[] public ecosystemMembers;


    /// @notice maps a quizId to an address then finally to a hash of answers;
    mapping(string => mapping(address => SubmissionData)) public userQuizSubmission;

    mapping(address => uint256) public leaderboard;

    /// @notice maps a quizId to its compressed result bytes;
    mapping(string => Quiz) public quizDetails;

    /// @notice maps a quizId to an array of participants addresses;
    mapping(string => address[]) public quizparticipants;

    /// @notice maps a protocol id to user address and finally to a bool indicating if he is a member of the protocol
    mapping(string => mapping(address => uint256)) public usersQuizScore;

    /// @notice maps a quizId to its compressed result bytes;
    mapping(string => bytes) public compressedQuizResult;

    /// @notice maps a compressed result bytes to its quizId;
    mapping(bytes => string) public quizResultToQuizId;

        /// @notice maps a 
    mapping(bytes32 => bytes) public quizResponse;

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

    struct RewardData {
        string userAddress;
        uint256 rewardAmount;
        uint256 leaderboardAddition;
        uint256 quizScore;
    }

    struct QuizResponse {
    string uuid;
    string protocol;
    RewardData[] results;
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
    event GradeQuiz(bytes data);
    event ResultReceived(bytes data);


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


    constructor (string memory name, string memory protocolId, address reward_token, address admin, address openQuest, address _taskIssuerAddress, bytes32 _machineHash) Ownable(admin) CoprocessorAdapter(_taskIssuerAddress, _machineHash) {
        protocol = ProtocolData({
            name: name,
            protocol_id: protocolId,
            contract_add: address(this),
            admin: admin
        });
        rewardToken = IERC20(reward_token);
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
     ) external  {

        if (isQuizRegistered[quiz_id]) {

            compressedQuizResult[quiz_id] = compressed_data;
            quizResultToQuizId[compressed_data] = quiz_id;

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

        
        emit GradeQuiz(compressed_data);


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
        ecosystemMembers.push(msg.sender);

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


    //////////      INTERNALS       ///////////

    function _setTokenURI(uint256 tokenId, string memory newURI) internal {
        require(bytes(_tokenURIs[tokenId]).length == 0, "URI already set");
        _tokenURIs[tokenId] = newURI;
    }

    //////////      VIEW FUNCTIONS      //////////////////
    function checkQuizIsRegistered(string memory quiz_id) external view returns (bool) {
        return isQuizRegistered[quiz_id];
    }

    function checkQuizResponse(bytes32 paloadHash) public view returns (bytes memory) {
        return quizResponse[paloadHash];
    }

    // function getScore(address account) external view returns (uint256) {
    //     return scorePerParticipant[account];
    // }

    // function getQuizWinners() external view returns (address[] memory) {
    //     return quizWinners;
    // }


    receive() external payable {}



    function handleNotice(bytes32 payloadHash, bytes memory notice) internal override {
        quizResponse[payloadHash] = notice;
        // string memory quizId = quizResultToQuizId[abi.encodePacked(payloadHash)];

        // (string memory uuid, string memory _protocol, RewardData[] memory results) = abi.decode(
        //     notice,
        //     (string, string, RewardData[])
        // );

        // for (uint256 i = 0; i < results.length; i++) {
        //     RewardData memory r = results[i];

        //     // if (r.rewardAmount != 0) {
        //     //     rewardToken.transfer(r.userAddress, r.rewardAmount);
        //     // }

        //     leaderboard[r.userAddress] += r.leaderboardAddition;

        //     quizparticipants[uuid].push(r.userAddress);
        //     usersQuizScore[uuid][r.userAddress] = r.quizScore;

        // }

        emit ResultReceived(notice);
        

    }

        function demoHandleNotice(bytes32 payloadHash, bytes calldata notice) public {
        // Decode the top-level tuple (uuid, protocol, results)
            quizResponse[payloadHash] = notice;
            // console.log("test location");
        // RewardData[] memory results = new RewardData[](encodedResults.length);

        // Decode each RewardData tuple inside the results array
        // for (uint i = 0; i < encodedResults.length; i++) {
        //     (string memory user_address, bytes memory reward_amount_bytes, bytes memory leader_boar_addition_bytes, bytes memory quiz_score_bytes) = abi.decode(encodedResults[i], (string, bytes, bytes, bytes));
            
        //     // Convert bytes to uint256 for amounts and scores
        //     uint256 reward_amount = toUint256(reward_amount_bytes);
        //     uint256 leader_boar_addition = toUint256(leader_boar_addition_bytes);
        //     uint256 quiz_score = toUint256(quiz_score_bytes);

        //     results[i] = RewardData((user_address), reward_amount, leader_boar_addition, quiz_score);
        // }

        // return (uuid, protocol);

    }

    
    function toUint256(bytes memory b) internal pure returns (uint256) {
        require(b.length <= 32, "Invalid bytes length");
        uint256 number;
        for (uint i = 0; i < b.length; i++) {
            number = number * 256 + uint8(b[i]);
        }
    //     return number;

        // require(notice.length <= 0xffff, "Data too large for EVM memory.");
        // (uuid, protocol ) = abi.decode(notice, (string, string));
        // console.log(uuid);
        // console.log(protocol);
        // return (uuid, protocol);


    }

}