# BoardPay Blockchain Layer

## What was actually wrong with the uploaded files

The Solidity contract (`contracts/PaymentLedger.sol`) was already correct
and needed no changes - hash-only storage, correct `PaymentLogged` event,
correct `^0.8.19` pragma.

The real problem: `package.json` already had `hardhat@3.9.1` and `ethers@6`
installed (confirmed from `package-lock.json`), but `hardhat.config.js` and
`scripts/deploy.js` were written in old CommonJS / Hardhat-2 / ethers-v5
style (`require(...)`, `module.exports`, `.deploy()` → `.deployed()` →
`.address`). Hardhat 3 is a genuinely different runtime, not just a version
bump:

- Config files **must** be ES modules, and plugins must be explicitly listed
  in a `plugins: [...]` array - importing a plugin no longer registers it
  as a side effect like it did in Hardhat 2.
- The umbrella `@nomicfoundation/hardhat-toolbox` package (what was in your
  `package.json`) **does not work at all with Hardhat 3** - its own npm page
  says so directly. The Hardhat-3-compatible equivalent is
  `@nomicfoundation/hardhat-toolbox-mocha-ethers`, which is what I swapped
  it for.
- ethers v6 renamed the deployment-confirmation API: `contract.deployed()`
  → `contract.waitForDeployment()`, and `contract.address` → `await
  contract.getAddress()`.
- Scripts run through `network.connect()` to get their `ethers` object now,
  rather than a global `hre.ethers`.

I fixed all of the above. Nothing here was a stylistic rewrite - each change
corresponds to something that would otherwise throw at `npx hardhat run`.

## Files

```
blockchain/
  contracts/PaymentLedger.sol   - unchanged, already correct
  hardhat.config.js             - rewritten for Hardhat 3 (ESM, explicit plugins, networks)
  scripts/deploy.js             - rewritten for Hardhat 3 + ethers v6
  package.json                  - fixed toolbox dependency
backend_payments/
  blockchain.py                 - Django-side glue (unchanged from before, ABI tightened to match the real contract)
  views.py                      - for reference only; already wired up correctly, no edits needed
```

`backend_payments/` here mirrors your Django app's `payments/` folder - copy
`blockchain.py` into your actual `payments/` directory if you haven't
already (it's the same file I gave you when fixing the Django backend).

## Setup

### 1. Install Node dependencies

```powershell
cd blockchain
npm install
```

This installs the *correct* toolbox this time - delete `node_modules` and
`package-lock.json` first if you still have the old install from before.

### 2. Start a local Hardhat node

```powershell
npx hardhat node
```

Leave this running in its own terminal. It exposes JSON-RPC at
`http://127.0.0.1:8545` and prints 20 funded test accounts - account `#0`
(`0xf39Fd6e51aad88F6F4ce6aB8827279cfFFb92266`) is the one hardcoded in
`payments/blockchain.py`.

### 3. Compile and deploy the contract

In a second terminal:

```powershell
npx hardhat build            # Hardhat 3 renamed `compile` to `build`
npx hardhat run scripts/deploy.js --network localhost
```

You'll see output like:

```
Deploying PaymentLedger with account: 0xf39Fd6e51aad88F6F4ce6aB8827279cfFFb92266
PaymentLedger deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

Copy this address into payments/blockchain.py:
CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"
```

Copy that address into `payments/blockchain.py`'s `CONTRACT_ADDRESS`
placeholder (currently `0x000...000`, marked `# TODO`).

### 4. Test the whole flow

1. Start the Django backend (`python manage.py runserver`) alongside the
   still-running `npx hardhat node`.
2. As a student, `POST /api/payments/` with a receipt image - creates a
   `PENDING` payment.
3. As a caretaker/landlord, `PATCH /api/payments/{id}/verify/` with
   `{"action": "approve"}`.
4. Watch the `npx hardhat node` terminal - you'll see the incoming
   `eth_sendRawTransaction` call logged, along with the sender/receiver and
   gas used.
5. Check the API response (or re-fetch the payment) - `blockchain_tx_hash`
   should now be populated with a `0x...` transaction hash.

If the Hardhat node isn't running, `verify` still succeeds (payment moves to
`VERIFIED`) - the blockchain error is printed to the Django console instead
of blocking the caretaker's workflow, and `blockchain_tx_hash` stays blank
so it can be backfilled later.
