// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/factory.sol";
import "../src/quest.sol";
import "../src/mockToken.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract FactoryQuestTest is Test {
    Factory factory;
    Quest quest;
    ERC20 public erc20;
    address owner = address(0x123);
    address user1 = address(0x456);
    address user2 = address(0x789);
    address protocolVault = address(0xABC);
    address taskIssuerAddress = address(0xDEF);
    bytes32 machineHash = keccak256("machineHash");
    address tokenAddress;

    function setUp() public {
        vm.prank(owner);
        factory = new Factory(protocolVault, taskIssuerAddress, machineHash);

        // Deploy a mock ERC20 token
        // Mock token deployment
        erc20 = new MockToken("Mock", "MCK", owner, 20000);
        tokenAddress = address(erc20);

        vm.prank(owner);
        IERC20(tokenAddress).approve(address(factory), 1000);
    }

    function testCreateQuiz() public {
        vm.prank(owner);
        address child = factory.createTrivia(
            "Quiz Title",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            500,
            tokenAddress,
            Quest.Trivium.quiz
        );

        assertEq(factory.totalQuiz(), 1);
        assertEq(factory.totalDeployments(), 1);
        assertEq(factory.childContracts(0), child);

        quest = Quest(child);
        assertEq(quest.owner(), owner);
    }

    function testCreateHackathon() public {
        vm.prank(owner);
        address child = factory.createTrivia(
            "Hackathon Title",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            1000,
            tokenAddress,
            Quest.Trivium.hackathon
        );

        assertEq(factory.totalHackathon(), 1);
        assertEq(factory.totalDeployments(), 1);
        assertEq(factory.childContracts(0), child);

        quest = Quest(child);
        assertEq(quest.owner(), owner);
    }

    function testPublishQuiz() public {
        vm.prank(owner);
        address child = factory.createTrivia(
            "Quiz Title",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            1000,
            tokenAddress,
            Quest.Trivium.quiz
        );

        quest = Quest(child);
        vm.prank(owner);
        quest.publish();

        Quest.Quiz memory quiz = quest.getQuiz();
        assertTrue(quiz.published);
    }

    function testRunExecutionQuiz() public {
        vm.prank(owner);
        address child = factory.createTrivia(
            "Quiz Title",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            1000,
            tokenAddress,
            Quest.Trivium.quiz
        );

        quest = Quest(child);
        vm.prank(owner);
        quest.publish();

        Quest.Quiz memory quiz = quest.getQuiz();
        assertTrue(quiz.published);

        bytes memory data = abi.encode("data");
        vm.prank(owner);
        quest.runExecution(data, 0);

        assertEq(quest.QuizResults(0), data);
    }

    function testDistributeRewardsQuiz() public {
        vm.prank(owner);
        address child = factory.createTrivia(
            "Quiz Title",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            1000,
            tokenAddress,
            Quest.Trivium.quiz
        );

        quest = Quest(child);
        vm.prank(owner);
        quest.publish();

        address[] memory participants = new address[](2);
        participants[0] = user1;
        participants[1] = user2;

        address[] memory winners = new address[](2);
        winners[0] = user1;
        winners[1] = user2;

        uint256[] memory scores = new uint256[](2);
        scores[0] = 100;
        scores[1] = 50;

        string[] memory tokenUris = new string[](2);
        tokenUris[0] = "uri1";
        tokenUris[1] = "uri2";

        bytes memory notice = abi.encode(
            participants,
            winners,
            scores,
            tokenUris
        );
        vm.prank(owner);
        quest.handleNotice(notice);

        assertEq(quest.getQuizWinners().length, 2);
        assertEq(quest.getQuizWinners()[0], user1);
        assertEq(quest.getScore(user1), 100);
        assertEq(quest.getScore(user2), 50);
        assertEq(IERC20(tokenAddress).balanceOf(user1), 500);
        assertEq(IERC20(tokenAddress).balanceOf(owner), 19000);
        assertEq(quest.uri(0), "uri1", "Incorrect uri");
        assertEq(quest.uri(1), "uri2", "Incorrect uri");
    }

    function testCancelTrivia() public {
        vm.prank(owner);
        address child = factory.createTrivia(
            "Quiz Title",
            block.timestamp + 1 days,
            block.timestamp + 2 days,
            1000,
            tokenAddress,
            Quest.Trivium.quiz
        );

        quest = Quest(child);
        vm.prank(owner);
        quest.publish();

        vm.prank(owner);
        quest.cancelTrivia(owner, "Cancelled");

        Quest.Quiz memory quiz = quest.getQuiz();
        assertFalse(quiz.published);
        assertEq(IERC20(tokenAddress).balanceOf(owner), 20000);
    }
}
