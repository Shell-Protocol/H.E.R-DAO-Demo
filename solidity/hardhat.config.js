require("@nomicfoundation/hardhat-toolbox");

const PRIVATE_KEY = "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.10",
  networks: {
    localhost: {
      url: `http://127.0.0.1:8545/`,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    arbitrumGoerli: {
        url: 'https://goerli-rollup.arbitrum.io/rpc',
        accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  }
};
