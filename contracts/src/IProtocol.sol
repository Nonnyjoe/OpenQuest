    
interface IProtocol {
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
    ) external ;

    function checkQuizIsRegistered(string memory quiz_id) external view returns (bool);
    function coprocessorCallbackOutputsOnly(bytes32 _machineHash, bytes32 _payloadHash, bytes[] calldata outputs) external;
    function computationSent(bytes32) external view returns (bool);
    function demoHandleNotice(bytes32 payloadHash, bytes memory notice) external ;
    function checkQuizResponse(bytes32 paloadHash) external view returns (bytes memory);
    function owner( ) external view returns (address);
}
    
