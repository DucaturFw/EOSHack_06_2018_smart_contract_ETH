const fs = require('fs')
const Web3 = require('web3')
const ethUtil = require('ethereumjs-util')
const ethTx = require('ethereumjs-tx')

const web3 = new Web3('http://localhost:8545')

const addressContract = fs.readFileSync('contract.addr').toString().toLocaleLowerCase()
const addressA = fs.readFileSync('accounts/a.addr').toString().toLocaleLowerCase()
const addressB = fs.readFileSync('accounts/b.addr').toString().toLocaleLowerCase()
const privKeyA = Buffer.from(fs.readFileSync('accounts/a.privkey').toString(), 'hex')
const privKeyB = Buffer.from(fs.readFileSync('accounts/b.privkey').toString(), 'hex')

const amount = Web3.utils.toWei('0.1', 'ether')

function deposit(contract, address, privKey, amount) {
    web3.eth.getTransactionCount(address).then(nonce => {
        var tx = new ethTx({
            nonce: Web3.utils.toHex(nonce),
            gasPrice: Web3.utils.toHex(Web3.utils.toWei('10', 'gwei')),
            gasLimit: Web3.utils.toHex(1000000),
            to: contract,
            value: Web3.utils.toHex(amount),
        })
        tx.sign(privKey)
        const txSerialized = tx.serialize()
        web3.eth.sendSignedTransaction('0x' + txSerialized.toString('hex')).then(txHash => {
            console.log(`Deposit done from ${address} with transaction ${txHash}`)
        }).catch(err => {
            console.log(`Unable to make deposit from ${address}: ${err}`)
        })
    })
}

//deposit(addressContract, addressA, privKeyA, amount)
deposit(addressContract, addressB, privKeyB, amount)
