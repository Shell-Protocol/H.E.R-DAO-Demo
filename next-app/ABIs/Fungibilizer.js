const FungibilizerABI = [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "oceanAddress",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "nftCollection_",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "exchangeRate_",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "inputToken",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "outputToken",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "outputAmount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "tokenId",
          "type": "bytes32"
        }
      ],
      "name": "computeInputAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "inputAmount",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "inputToken",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "outputToken",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "inputAmount",
          "type": "uint256"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "tokenId",
          "type": "bytes32"
        }
      ],
      "name": "computeOutputAmount",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "outputAmount",
          "type": "uint256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "exchangeRate",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "fungibleTokenId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "tokenId",
          "type": "uint256"
        }
      ],
      "name": "getTokenSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "totalSupply",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nftCollection",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "ocean",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ]

  module.exports = { FungibilizerABI }