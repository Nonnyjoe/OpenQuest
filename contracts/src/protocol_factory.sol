// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Protocol} from "./protocol.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Factory is Ownable {
    /////////       EVENTS      ////////////
    event PtotocolCreated(address indexed admin, uint256 time, string indexed protocol_id, address indexed protocolContract);
    event RewardTokenChanged(address indexed admin, uint256 time, address indexed token);

    address[] public childProtocols;
    mapping(string => ProtocolData) public idToProtocolData;
    address public rewardToken;

    struct ProtocolData {
        string name;
        string protocol_id;
        address contract_add;
        address admin;
    }
    //////////      ERRORS      /////////////
    // error InvalidStartTime();

    address taskIssuerAddress;
    bytes32 machineHash;

    constructor(
        // address vault,
        address reward_token,
        address _taskIssuerAddress,
        bytes32 _machineHash
    ) Ownable(msg.sender) {
        // require(vault != address(0) && _taskIssuerAddress != address(0), InvalidTokenAddress());
        // protocolVault = vault;
        taskIssuerAddress = _taskIssuerAddress;
        machineHash = _machineHash;
        rewardToken = reward_token;
    }


    function createProtocol(string memory name, string memory protocol_id) external returns (address) {
        ProtocolData memory protocol_data = ProtocolData({
            name: name,
            protocol_id: protocol_id,
            contract_add: address(0),
            admin: msg.sender

        });

        Protocol newProtocol = new Protocol(name, protocol_id, rewardToken, msg.sender, address(this), taskIssuerAddress, machineHash);

        address protocol = address(newProtocol);
        protocol_data.contract_add = protocol;


        childProtocols.push(protocol_data.contract_add);
        idToProtocolData[protocol_id] = protocol_data;


        emit PtotocolCreated(msg.sender, block.timestamp, protocol_data.protocol_id, protocol_data.contract_add);
        return protocol_data.contract_add;

    }

    function getProtocolDetailsViaId(string memory id) external view returns ( ProtocolData memory) {
            return idToProtocolData[id];
    }

    function changeRewardToken(address token_addr) external onlyOwner returns (bool) {
        rewardToken = token_addr;
        emit RewardTokenChanged(msg.sender, block.timestamp, rewardToken);
        return true;

    }


}