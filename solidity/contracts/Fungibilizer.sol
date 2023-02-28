// SPDX-License-Identifier: Unlicensed

pragma solidity =0.8.10;

import {IOceanPrimitive} from "./IOceanPrimitive.sol";
import {IOceanToken} from "./IOceanToken.sol";

contract Fungibilizer is IOceanPrimitive {
    address public immutable ocean;

    //TODO: Fill in contract variables and constructor

    constructor () {}

    modifier onlyOcean() {
        require(msg.sender == ocean);
        _;
    }

    function computeOutputAmount(
        uint256 inputToken,
        uint256 outputToken,
        uint256 inputAmount,
        address,
        bytes32 tokenId
    ) external override onlyOcean returns (uint256 outputAmount) {

    }

    function computeInputAmount(
        uint256 inputToken,
        uint256 outputToken,
        uint256 outputAmount,
        address,
        bytes32 tokenId
    ) external override onlyOcean returns (uint256 inputAmount) {

    }

    function getTokenSupply(uint256 tokenId)
        external
        view
        override
        returns (uint256 totalSupply)
    {
        
    }

    function _calculateOceanId(address tokenContract, uint256 tokenId)
        internal
        pure
        returns (uint256)
    {
        
    }
}