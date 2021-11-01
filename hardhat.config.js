/* hardhat.config.js */
require("@nomiclabs/hardhat-waffle");
const fs = require("fs");
const privateKey =
  fs.readFileSync(".secret").toString().trim() || "01234567890123456789";

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 1337,
    },
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com/",
      accounts: [privateKey],
    },
    rinkeby: {
      url: "https://rinkeby.infura.io/v3/9b31d39016184be99b8e405ce6ca014a",
      accounts: [privateKey],
    },
    ropsten: {
      url: "https://ropsten.infura.io/v3/a228bf98f09e471798dd65d4e1c00551",
      accounts: [privateKey],
    },
  },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
