from celery import shared_task
from web3 import Web3
from django.conf import settings
import hashlib

BLOCKCHAIN_RPC = "http://127.0.0.1:8545"  # Hardhat local node
CONTRACT_ADDRESS = "0x5FbDB..."  # replace with your deployed address
CONTRACT_ABI = [...]  # copy from blockchain/artifacts/contracts/PaymentLedger.sol/PaymentLedger.json under "abi"

@shared_task
def log_payment_to_chain(payment_id):
    from payments.models import Payment  # import here to avoid circular
    payment = Payment.objects.get(id=payment_id)
    # create hash
    data = f"{payment.lease.id}{payment.amount}{payment.transaction_ref}".encode()
    payment_hash = Web3.keccak(data)
    # connect to blockchain
    w3 = Web3(Web3.HTTPProvider(BLOCKCHAIN_RPC))
    contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
    # use a fixed account (Hardhat account #0, private key known)
    account = w3.eth.accounts[0]
    # send transaction
    tx = contract.functions.logPayment(payment_hash).buildTransaction({
        'from': account,
        'nonce': w3.eth.get_transaction_count(account),
        'gas': 100000,
        'gasPrice': w3.eth.gas_price,
    })
    signed_tx = w3.eth.account.sign_transaction(tx, private_key='0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80')  # Hardhat's default first account
    tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    # save tx hash to payment
    payment.blockchain_tx_hash = receipt.transactionHash.hex()
    payment.save()
    return receipt.transactionHash.hex()