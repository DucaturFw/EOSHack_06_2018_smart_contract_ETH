var Web3 = require('web3');
var fs = require('fs');
const crypto = require('crypto');
const secp256k1 = require('secp256k1');


const optionDefinitions = [
    { name: 'help', alias: 'h', type: Boolean },
    { name: 'key', type: String, defaultValue: "./keys/Alice.hex"},
  //  { name: 'provider', type: String, defaultValue: "http://localhost:8545"},
    { name: 'value', type: Number, defaultValue: 1.0},
    { name: 'partner', type: String, defaultValue:"./keys/Bob_addr.hex"},
    { name: 'ptx', type: String}, //defaultValue: "./txs/tx013.json"},
    { name: 'tx', type: String}, //defaultValue: "./txs/tx014.json"},
  ]

const commandLineArgs = require('command-line-args')  
const opts = commandLineArgs(optionDefinitions)

var eth_util = require('ethereumjs-util')
var Tx = require('ethereumjs-tx');

var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider("http://localhost:8545"))

let from = '0xc5c7977789b84bf99b4663b0db9220b7a4abad57';
let to = '0xed78c89ac96c13b28c0d40e06fe1884ef68cdac9';
let id = 1;
let val = 500000000000000000;// web3.toWei("0.1, "ether"); //sum in wei
let MyPriv = '';
const leftpad=(s,n)=> "0".repeat(n-s.length)+s;


var id_hex = leftpad(web3.toHex(id).substr(2), 64)
var val_hex = leftpad(web3.toHex(val).substr(2), 64)


let msg = from.substr(2)
+to.substr(2)
+id_hex 
+val_hex;

console.log('msg',msg)

let hash = eth_util.sha3(new Buffer(msg,'hex'))
let hash_hex = '0x'+hash.toString('hex')

console.log('hash',hash_hex);

var sig = secp256k1.sign(hash, MyPriv);

let r = '0x'+sig.signature.slice(0, 32).toString('hex');
let s = '0x'+sig.signature.slice(32, 64).toString('hex');
let v = sig.recovery + 27;

let tx={
	id:id,
	from:from,to:to,
	val:val,	
	v:v,r:r,s:s
}

console.log('tx',tx);
fs.writeFileSync('./tx.json',JSON.stringify(tx))
