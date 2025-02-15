// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/protocol_factory.sol";
import "./dummyTaskIssuer.sol";
import "../src/protocol.sol";
import "../src/mockToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IProtocol} from "../src/IProtocol.sol";

contract FactoryQuestTest is Test {
    Factory factory;
    Protocol protocol;
    TaskIssuer taskIssuer;
    ERC20 public erc20;
    address owner = address(0x123);
    address user1 = address(0x456);
    address user2 = address(0x789);
    bytes compressed_data = hex"240000000000000030333164656466302d633565322d343662612d616132342d396534373337663865363934070000000000000043617274657369020000000000000002000000000000000100000000000000420000000000000057686963682070726f746f636f6c206973206361727465736920706172746572696e67207769746820666f722074686973206578706572696d656e74207765656b3f0b00000000000000456967656e204c61796572000000000800000000000000457468657265756d0100000008000000000000004f7074696d69736d020000000600000000000000536f6c616e61030000000000000002000000000000002200000000000000576861747320746865206475726174696f6e206f66207468652070726f6772616d3f060000000000000031207965617200000000070000000000000032207765656b7301000000070000000000000036206d6f6e746802000000060000000000000031207765656b0300000003000000000000000000594000000000000049400100000000000000240000000000000030646331386430392d383132632d346661652d613561362d6436663334353665363363332a0000000000000030786633394664366535316161643838463646346365366142383832373237396366664662393232363600000000000000000200000000000000010000000000000000000000020000000000000003000000b462af67000000005761af670000000000000000000000000000000000000000";
    bytes32 data = keccak256(compressed_data);
    address protocolVault = address(0xABC);
    address taskIssuerAddress;
    bytes32 machineHash = keccak256("machineHash");
    address tokenAddress;

    function setUp() public {
        vm.startPrank(owner);
        taskIssuer = new TaskIssuer();
        taskIssuerAddress = address(taskIssuer);
        factory = new Factory(protocolVault, taskIssuerAddress, machineHash);

        // Deploy a mock ERC20 token
        // Mock token deployment
        // erc20 = new MockToken("Mock", "MCK", owner, 20000);
        tokenAddress = address(erc20);
        vm.stopPrank();

        // IERC20(tokenAddress).approve(address(factory), 1000);
    }

    function testProtocol() public {
        vm.startPrank(owner);

        address new_protocol = factory.createProtocol("Cartesi", "01-02-2025");
        tokenAddress = address(new_protocol);
        vm.stopPrank();
  
        assert(new_protocol != address(0));
    }

    function testGradeQuiz() public {
        testProtocol();
        vm.startPrank(owner);
        IProtocol(tokenAddress).gradeQuiz("001a", "test", 100, 20, owner, "Cartesi", "public", compressed_data, 1739547363);

        bool quizStatus = IProtocol(tokenAddress).checkQuizIsRegistered("001a");
        vm.stopPrank();

        assert(quizStatus == true);
    }


    function testCoprocessorResponse() public {
        testGradeQuiz();
        vm.startPrank(taskIssuerAddress);
       bytes memory outPut = hex"7b2275756964223a2230333164656466302d633565322d343662612d616132342d396534373337663865363934222c2270726f746f636f6c223a2243617274657369222c22726573756c7473223a5b7b22757365725f61646472657373223a22307866333946643665353161616438384636463463653661423838323732373963666646623932323636222c227265776172645f616d6f756e74223a3130302e302c226c65616465725f626f61725f6164646974696f6e223a3131302e302c227175697a5f73636f7265223a322e307d5d7d";
       console.logBytes(outPut);
        IProtocol(tokenAddress).demoHandleNotice{gas: 10000000000}(data, outPut);
        bytes memory contract_output = IProtocol(tokenAddress).checkQuizResponse(keccak256(compressed_data));
        console.logBytes(contract_output);
        vm.stopPrank();

        assert(keccak256(outPut) == keccak256(contract_output));

    }

//     function testPublishQuiz() public {
//         vm.prank(owner);
//         address child = factory.createTrivia(
//             "Quiz Title",
//             block.timestamp + 1 days,
//             block.timestamp + 2 days,
//             1000,
//             tokenAddress,
//             Quest.Trivium.quiz
//         );

//         quest = Quest(child);
//         vm.prank(owner);
//         quest.publish();

//         Quest.Quiz memory quiz = quest.getQuiz();
//         assertTrue(quiz.published);
//     }

//     function testRunExecutionQuiz() public {
//         vm.prank(owner);
//         address child = factory.createTrivia(
//             "Quiz Title",
//             block.timestamp + 1 days,
//             block.timestamp + 2 days,
//             1000,
//             tokenAddress,
//             Quest.Trivium.quiz
//         );

//         quest = Quest(child);
//         vm.prank(owner);
//         quest.publish();

//         Quest.Quiz memory quiz = quest.getQuiz();
//         assertTrue(quiz.published);

//         bytes memory data = abi.encode("data");
//         vm.prank(owner);
//         quest.runExecution(data, 0);

//         assertEq(quest.QuizResults(0), data);
//     }

//     function testDistributeRewardsQuiz() public {
//         vm.prank(owner);
//         address child = factory.createTrivia(
//             "Quiz Title",
//             block.timestamp + 1 days,
//             block.timestamp + 2 days,
//             1000,
//             tokenAddress,
//             Quest.Trivium.quiz
//         );

//         quest = Quest(child);
//         vm.prank(owner);
//         quest.publish();

//         address[] memory participants = new address[](2);
//         participants[0] = user1;
//         participants[1] = user2;

//         address[] memory winners = new address[](2);
//         winners[0] = user1;
//         winners[1] = user2;

//         uint256[] memory scores = new uint256[](2);
//         scores[0] = 100;
//         scores[1] = 50;

//         string[] memory tokenUris = new string[](2);
//         tokenUris[0] = "uri1";
//         tokenUris[1] = "uri2";

//         bytes memory notice = abi.encode(
//             participants,
//             winners,
//             scores,
//             tokenUris
//         );
//         vm.prank(owner);
//         quest.handleNotice(notice);

//         assertEq(quest.getQuizWinners().length, 2);
//         assertEq(quest.getQuizWinners()[0], user1);
//         assertEq(quest.getScore(user1), 100);
//         assertEq(quest.getScore(user2), 50);
//         assertEq(IERC20(tokenAddress).balanceOf(user1), 500);
//         assertEq(IERC20(tokenAddress).balanceOf(owner), 19000);
//         assertEq(quest.uri(0), "uri1", "Incorrect uri");
//         assertEq(quest.uri(1), "uri2", "Incorrect uri");
//     }

//     function testCancelTrivia() public {
//         vm.prank(owner);
//         address child = factory.createTrivia(
//             "Quiz Title",
//             block.timestamp + 1 days,
//             block.timestamp + 2 days,
//             1000,
//             tokenAddress,
//             Quest.Trivium.quiz
//         );

//         quest = Quest(child);
//         vm.prank(owner);
//         quest.publish();

//         vm.prank(owner);
//         quest.cancelTrivia(owner, "Cancelled");

//         Quest.Quiz memory quiz = quest.getQuiz();
//         assertFalse(quiz.published);
//         assertEq(IERC20(tokenAddress).balanceOf(owner), 20000);
//     }
}
