# NFT AMM Solidity Contracts

This folder contains the Solidity contracts and relevant scripts to power the NFT AMM. 

## NFT Wraps and Unwraps

Script to demonstrate wrapping and unwrapping ERC-721's into the Ocean.

```shell
npx hardhat run scripts/nftWrapUnwrap.js
```

## Fungibilizer

Ocean primitive that handles converting NFTs into fungible tokens and vice versa at a fixed exchange rate. 
`fungibilizer.js` contains functions to deploy the primitive and interact with it.

```shell
npx hardhat run scripts/fungibilizer.js
```

## Liquidity Pool

Constant product liquidity pool built using [Proteus AMM](https://shellprotocol.io/posts/shell-launches-proteus-amm-engine/). 
`pool.js` contains functions to deploy the primitive and interact with it.

```shell
npx hardhat run scripts/pool.js
```