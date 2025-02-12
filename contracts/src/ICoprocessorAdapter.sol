// SPDX-License-Identifier: MIT

pragma solidity ^0.8.13;

interface ICoprocessorAdapter {
    /// @param input The bytes input data for the task
    function callCoprocessor(bytes calldata input) external;
}