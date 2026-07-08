// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract PaymentLedger {
    event PaymentLogged(bytes32 indexed paymentHash, uint256 timestamp);

    function logPayment(bytes32 paymentHash) external {
        emit PaymentLogged(paymentHash, block.timestamp);
    }
}