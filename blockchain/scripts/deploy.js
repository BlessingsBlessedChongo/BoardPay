// Deploys PaymentLedger to whatever network you pass via --network.
//
// Usage (against a locally running `npx hardhat node`):
//   npx hardhat run scripts/deploy.js --network localhost
//
// This file is ESM (package.json has "type": "module"), and uses Hardhat 3's
// network manager + ethers v6 API - NOT the old Hardhat 2 / ethers v5 style
// (no `.deploy()` -> `.deployed()` -> `.address`; ethers v6 uses
// `waitForDeployment()` -> `getAddress()`).
import { network } from "hardhat";

async function main() {
  // No network name passed to connect() - it falls back to whatever
  // --network flag you used to invoke `hardhat run`.
  const { ethers } = await network.connect();

  const [deployer] = await ethers.getSigners();
  console.log("Deploying PaymentLedger with account:", deployer.address);

  const paymentLedger = await ethers.deployContract("PaymentLedger");
  await paymentLedger.waitForDeployment();

  const address = await paymentLedger.getAddress();
  console.log("PaymentLedger deployed to:", address);
  console.log("\nCopy this address into payments/blockchain.py:");
  console.log(`CONTRACT_ADDRESS = "${address}"`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
