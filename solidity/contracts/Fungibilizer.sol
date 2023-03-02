// SPDX-License-Identifier: Unlicensed

pragma solidity =0.8.10;

import {IOceanPrimitive} from "./IOceanPrimitive.sol";
import {IOceanToken} from "./IOceanToken.sol";

contract Fungibilizer is IOceanPrimitive {
    
    address public immutable ocean;
    address public immutable nftCollection;
    uint256 public immutable exchangeRate;
    uint256 public immutable fungibleTokenId;
    uint256 private fungibleTokenSupply = 0;

    constructor(
        address oceanAddress,
        address nftCollection_,
        uint256 exchangeRate_
    ) {
        ocean = oceanAddress;
        uint256[] memory registeredToken = IOceanToken(oceanAddress)
            .registerNewTokens(0, 1);
        fungibleTokenId = registeredToken[0];
        nftCollection = nftCollection_;
        exchangeRate = exchangeRate_;
    }

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
        
        uint256 nftOceanId = _calculateOceanId(nftCollection, uint256(tokenId));
        
        if (inputToken == nftOceanId && outputToken == fungibleTokenId) {
            require(inputAmount == 1);
            outputAmount = exchangeRate;
            fungibleTokenSupply += exchangeRate;
        } else if(inputToken == fungibleTokenId && outputToken == nftOceanId) {
            require(inputAmount == exchangeRate);
            outputAmount = 1;
            fungibleTokenSupply -= exchangeRate;
        } else {
            revert("Invalid input and output tokens");
        }
    }

    function computeInputAmount(
        uint256 inputToken,
        uint256 outputToken,
        uint256 outputAmount,
        address,
        bytes32 tokenId
    ) external override onlyOcean returns (uint256 inputAmount) {

        uint256 nftOceanId = _calculateOceanId(nftCollection, uint256(tokenId));
        
        if (inputToken == nftOceanId && outputToken == fungibleTokenId) {
            require(outputAmount == exchangeRate);
            inputAmount = 1;
            fungibleTokenSupply -= exchangeRate;
        } else if(inputToken == fungibleTokenId && outputToken == nftOceanId) {
            require(outputAmount == 1);
            inputAmount = exchangeRate;
            fungibleTokenSupply += exchangeRate;
        } else {
            revert("Invalid input and output tokens");
        }
    }

    function getTokenSupply(uint256 tokenId)
        external
        view
        override
        returns (uint256 totalSupply)
    {
        require(tokenId == fungibleTokenId, "invalid tokenId");
        totalSupply = fungibleTokenSupply;
    }

    function _calculateOceanId(address tokenContract, uint256 tokenId)
        internal
        pure
        returns (uint256)
    {
        return uint256(keccak256(abi.encodePacked(tokenContract, tokenId)));
    }
}