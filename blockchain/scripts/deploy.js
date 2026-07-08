const hre = require("hardhat");

async function main() {
  const PaymentLedger = await hre.ethers.getContractFactory("PaymentLedger");
  const ledger = await PaymentLedger.deploy();
  await ledger.deployed();
  console.log("PaymentLedger deployed to:", ledger.address);
}
main().catch(console.error);