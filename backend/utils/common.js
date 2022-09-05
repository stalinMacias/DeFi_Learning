require('dotenv').config();
const Web3 = require('web3');

const HDWalletProvider = require('@truffle/hdwallet-provider');
//const OWNER_KEYS = process.env.OWNER_KEYS || ""
//const CLIENT_KEYS = process.env.CLIENT_KEYS || ""
const INFURA_API_KEY = process.env.INFURA_API_KEY || ""

async function initializeConnection(PRIVATE_KEYS) {
  let connection = await new HDWalletProvider({
    privateKeys: PRIVATE_KEYS.split(','),
    //providerOrUrl: `https://goerli.infura.io/v3/${INFURA_API_KEY}`
    //providerOrUrl: `wss://goerli.infura.io/ws/v3/${INFURA_API_KEY}`   // Goerli through ws (Web Sockets)
    providerOrUrl: `ws://172.29.224.1:7545`                             // Ganache through ws (Web Sockets)
  })

  console.log("connection's address: " ,connection.getAddress())
  
  return {
    newConnectionAddress: connection.getAddress()
  }
}

async function getWeb3Object() {
  //const web3 = new Web3(new Web3.providers.WebsocketProvider(`wss://goerli.infura.io/ws/v3/${INFURA_API_KEY}`))   // Goerli
  const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://172.29.224.1:7545'))                             // Ganache
  //console.log("web3 object: ", web3)
  return {
    web3js: web3
  }
}

async function getContract(web3js,contractJSON) {
  const networkId = await web3js.eth.net.getId()
  //console.log("netowrkId: ", networkId)
  return new web3js.eth.Contract(contractJSON.abi, contractJSON.networks[networkId].address)
}

async function generateTransactionsOptions(transactionDefined, transactionSenderAddress, web3js) {
  //const hardcodingRequiredGas = web3js.utils.toWei('0.0000000000002', 'ether')

  // Getting the account's current nonce
  const accountNonce = await web3js.eth.getTransactionCount(transactionSenderAddress)

  // Options of the transaction
  let options = {
    nonce: accountNonce,
    to      : transactionDefined._parent._address,  // contract's address
    data    : transactionDefined.encodeABI(),
    gas     : await transactionDefined.estimateGas({from: transactionSenderAddress}) //<----> For some reasong the estimateGas() seems not to be working!
    //gas     : hardcodingRequiredGas,
  };

  console.log(options);

  return options

}

async function sendingSignedTransactions(signedTransaction, web3js, txDescriptionMessage) {
  console.log("Sending the signed transaction");

  // Sending the signed transaction
  try {
    await web3js.eth.sendSignedTransaction(signedTransaction.rawTransaction)
      .once('transactionHash', function(hash){ 
        console.log("txHash", hash)
      })
      // When the receipt is received indicated that the transaction has been completed
      .once('receipt', function(receipt){
        console.log("Transaction completed! - ", txDescriptionMessage); 
        //console.log("receipt", receipt) 
      })
      .on('confirmation', function(confNumber, receipt){ 
        //console.log("confNumber",confNumber,"receipt",receipt)
        //console.log("confNumber: ",confNumber, " for tx: ", txDescriptionMessage);
      })
      .on('error', function(error){ 
        console.log("error", error)
      })
      .then(function(receipt){
          console.log("Transaction completed! - ", txDescriptionMessage);
          console.log(receipt);
      });
  } catch (error) {
    console.log("Error Sending Transaction - ", txDescriptionMessage);
    console.log(error.message);
  }

}

module.exports = {
  initializeConnection,
  getWeb3Object,
  getContract,
  generateTransactionsOptions,
  sendingSignedTransactions,
};