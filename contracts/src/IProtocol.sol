    
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
}
    
