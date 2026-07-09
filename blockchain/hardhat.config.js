// Hardhat 3 requires the config file itself to be an ES module (package.json
// has "type": "module"), and plugins must be explicitly listed in a
// `plugins` array - just importing them is no longer enough like it was
// in Hardhat 2.
import { defineConfig } from "hardhat/config";
import hardhatToolboxMochaEthers from "@nomicfoundation/hardhat-toolbox-mocha-ethers";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthers],

  solidity: {
    version: "0.8.19",
  },

  networks: {
    // In-process simulated chain used automatically for `npx hardhat test`
    // and any script run without --network. Nothing else needs to run for
    // this one - Hardhat spins it up and tears it down per-run.
    hardhat: {
      type: "edr-simulated",
      chainType: "generic",
    },

    // Connects to a *separately running* `npx hardhat node` process at
    // http://127.0.0.1:8545. Use this for the Django backend integration:
    // `npx hardhat run scripts/deploy.js --network localhost`
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
      chainType: "generic",
    },
  },
});
