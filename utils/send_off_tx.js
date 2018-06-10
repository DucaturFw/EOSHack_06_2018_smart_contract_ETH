const fs = require('fs')
const Web3 = require('web3')
const secp256k1 = require('secp256k1')
const ethUtil = require('ethereumjs-util')
const ethTx = require('ethereumjs-tx')

const web3 = new Web3('http://localhost:8545')

const addressContract = fs.readFileSync('contract.addr').toString().toLocaleLowerCase()
const addressA = fs.readFileSync('accounts/a.addr').toString().toLocaleLowerCase()
const addressB = fs.readFileSync('accounts/b.addr').toString().toLocaleLowerCase()
const privKeyA = Buffer.from(fs.readFileSync('accounts/a.privkey').toString(), 'hex')
const privKeyB = Buffer.from(fs.readFileSync('accounts/b.privkey').toString(), 'hex')

const contractAbi = JSON.parse(fs.readFileSync('bin/contracts/l2dex.abi'))
const contract = new web3.eth.Contract(contractAbi, addressContract)

const channelId = 1
const amount = Web3.utils.toWei('0.01', 'ether')

const channelIdHex = Web3.utils.toHex(channelId).substr(2).padStart(8, '0')
const amountHex = Web3.utils.toHex(amount).substr(2).padStart(64, '0')

const message = addressA.substr(2) + addressB.substr(2) + channelIdHex + amountHex
console.log(`Message: ${message}`)

const messageHash = ethUtil.sha3(Buffer.from(message, 'hex'))
const messageHashHex = '0x' + messageHash.toString('hex')
console.log(`MessageHash: ${messageHashHex}`)

const sig = secp256k1.sign(messageHash, privKeyA) // ?

const r = '0x' + sig.signature.slice(0, 32).toString('hex');
const s = '0x' + sig.signature.slice(32, 64).toString('hex');
const v = sig.recovery + 27;

const transaction = {
    from: addressA,
    to: addressB,
    channelId: channelId,
    amount: amount,	
    v: v,
    r: r,
    s: s,
}

console.log('Transaction:', transaction)
fs.writeFileSync('tx.json', JSON.stringify(transaction))


// send to chain - if needed 
web3.eth.getTransactionCount(addressA).then(nonce => {
    const bytecode = contract.methods.pushOffChain(
        transaction.from,
        transaction.channelId,
        transaction.amount,
        transaction.to,
        transaction.v,
        transaction.r,
        transaction.s
    ).encodeABI()
    var tx = new ethTx({
        nonce: Web3.utils.toHex(nonce),
        gasPrice: Web3.utils.toHex(Web3.utils.toWei('10', 'gwei')),
        gasLimit: Web3.utils.toHex(1000000),
        to: addressContract,
        from: addressA,
        data: bytecode,
    })
    tx.sign(privKeyA)
    var txSerialized = tx.serialize()
    web3.eth.sendSignedTransaction('0x' + txSerialized.toString('hex')).then(txHash => {
        console.log(`Transaction pushed off chain from ${addressA} with transaction ${txHash}`)
    }).catch(err => {
        console.log(`Unable to push off chain transaction from ${addressA}: ${err}`)
    })
})
