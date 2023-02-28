// SPDX-License-Identifier: MIT
// Cowri Labs Inc.

pragma solidity =0.8.10;

import {LiquidityPool} from "./LiquidityPool.sol";

contract ConstantProduct is LiquidityPool {
    
    constructor(
        uint256 xToken_,
        uint256 yToken_,
        address ocean_,
        uint256 initialLpTokenSupply_
    )
        LiquidityPool(
            xToken_,
            yToken_,
            ocean_,
            initialLpTokenSupply_,
            address(0)
        )
    {}

    function swapGivenInputAmount(uint256 inputToken, uint256 inputAmount)
        public
        view
        override
        returns (uint256 outputAmount)
    {
        
    }

    function depositGivenInputAmount(uint256 depositToken, uint256 depositAmount)
        public
        view
        override
        returns (uint256 mintAmount)
    {
        
    }

    function withdrawGivenInputAmount(uint256 withdrawnToken, uint256 burnAmount)
        public
        view
        override
        returns (uint256 withdrawnAmount)
    {
      
    }

    function swapGivenOutputAmount(uint256 outputToken, uint256 outputAmount)
        public
        view
        override
        returns (uint256 inputAmount)
    {
        
    }

    function depositGivenOutputAmount(uint256 depositToken, uint256 mintAmount)
        public
        view
        override
        returns (uint256 depositAmount)
    {
        
    }

    function withdrawGivenOutputAmount(uint256 withdrawnToken, uint256 withdrawnAmount)
        public
        view
        override
        returns (uint256 burnAmount)
    {
        
    }
}
