"""
Blockchain audit logging for verified payments.

Every time a caretaker/landlord approves a payment, we write an immutable
hash of that payment to a smart contract on a local Hardhat Ethereum node,
so the payment history can never be silently altered later.

This module talks directly to Hardhat's JSON-RPC endpoint via web3.py.
It is called synchronously from payments/views.py - no Celery/task queue
is required for the core flow.
"""

from web3 import Web3

# --- Network config -------------------------------------------------------
HARDHAT_RPC_URL = "http://127.0.0.1:8545"

# --- Contract config --------------------------------------------------------
# TODO: Replace with the actual deployed PaymentLedger contract address
# (printed by your Hardhat deploy script).
CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"  # TODO: Replace with actual deployed address

# TODO: Replace with the real ABI copied from
# artifacts/contracts/PaymentLedger.sol/PaymentLedger.json -> "abi"
# after compiling your contract with `npx hardhat compile`.
CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "bytes32", "name": "paymentHash", "type": "bytes32"}
        ],
        "name": "logPayment",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
    },
    # TODO: Replace/extend with the rest of your contract's real ABI
    # (events, getters, etc.) as needed.
]

# Hardhat's well-known default account #0. This account only exists on the
# local Hardhat dev chain and must NEVER be used on a real/public network.
HARDHAT_ACCOUNT_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cfFFb92266"
HARDHAT_ACCOUNT_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"


def _get_web3():
    w3 = Web3(Web3.HTTPProvider(HARDHAT_RPC_URL))
    if not w3.is_connected():
        raise ConnectionError(
            f"Could not connect to Hardhat node at {HARDHAT_RPC_URL}. "
            "Is `npx hardhat node` running?"
        )
    return w3


def log_payment_to_chain(payment_id):
    """
    Hash a verified payment and write that hash on-chain via the
    PaymentLedger contract's logPayment() function.

    Returns the transaction hash (hex string) on success. Raises on
    failure - callers (payments/views.py) decide whether to let a
    blockchain failure block verification or not.
    """
    # Imported here (not at module level) to avoid circular imports between
    # payments.models and payments.blockchain.
    from payments.models import Payment

    payment = Payment.objects.get(id=payment_id)

    payment_hash = Web3.keccak(
        text=f"{payment.lease.id}{payment.amount}{payment.transaction_ref}"
    )

    w3 = _get_web3()
    contract = w3.eth.contract(
        address=Web3.to_checksum_address(CONTRACT_ADDRESS),
        abi=CONTRACT_ABI,
    )

    account_address = Web3.to_checksum_address(HARDHAT_ACCOUNT_ADDRESS)

    tx = contract.functions.logPayment(payment_hash).build_transaction(
        {
            "from": account_address,
            "nonce": w3.eth.get_transaction_count(account_address),
            "gas": 200000,
            "gasPrice": w3.eth.gas_price,
        }
    )

    signed_tx = w3.eth.account.sign_transaction(tx, private_key=HARDHAT_ACCOUNT_PRIVATE_KEY)
    tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

    return receipt.transactionHash.hex()
