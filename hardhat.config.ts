import { task } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-jest-plugin";
import "hardhat-typechain";
require("dotenv").config();

const { API_URL, ETHERSCAN_API, PRIVATE_KEY_1, PRIVATE_KEY_2, PRIVATE_KEY_3 } =
  process.env;

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
export default {
  solidity: "0.8.9",
  defaultNetwork: "hardhat",
  networks: {
    matic: {
      url: API_URL,
      accounts: [PRIVATE_KEY_1, PRIVATE_KEY_2],
    },
    hardhat: {
      gasPrice: 875000000,
      blockGasLimit: 100000000,
    },
  },
  etherscan: {
    apiKey: ETHERSCAN_API,
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v5",
  },
};
