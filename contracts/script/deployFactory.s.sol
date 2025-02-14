// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";
import "../src/protocol_factory.sol";
import "../src/IProtocol.sol";

contract DeployFactory is Script {
    function run() external {
        // Load environment variables (optional if you use dotenv)
        address rewardToken = vm.envAddress("REWARD_TOKEN");
        address taskIssuer = vm.envAddress("TASK_ISSUER");
        bytes32 machineHash = vm.envBytes32("MACHINE_HASH");

        string memory protocolName = "TestProtocol";
        string memory protocolId = "test_protocol";

        vm.startBroadcast();

        // Deploy the Factory contract
        Factory factory = new Factory(rewardToken, taskIssuer, machineHash);
        console.log("Factory contract deployed at:", address(factory));

        // Deploy a Protocol contract through the Factory
        address childContract = factory.createProtocol(protocolName, protocolId);
        console.log("Child Protocol contract deployed at:", childContract);

        vm.stopBroadcast();

        // Write contract addresses to a file

        // string memory jsonContent = string.concat(
        //     "{\n",
        //     '  "factory": "', vm.toString(address(factory)), '",\n',
        //     '  "childProtocol": "', vm.toString(childContract), '"\n',
        //     "}"
        // );
        // vm.writeFile("./deploys/deployed_addresses.json", jsonContent);
        // console.log("Contract addresses written to deployed_addresses.json");
    }
}

// hex"69d8519f2b52b73e547ba150698732c586e083ad8a56e53ca8a8227b02983f6c"