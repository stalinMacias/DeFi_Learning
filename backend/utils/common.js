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
    providerOrUrl: `ws://172.30.96.1:7545`                             // Ganache through ws (Web Sockets)
  })

  console.log("connection's address: " ,connection.getAddress())
  
  return {
    newConnectionAddress: connection.getAddress()
  }
}

async function getWeb3Object() {
  //const web3 = new Web3(new Web3.providers.WebsocketProvider(`wss://goerli.infura.io/ws/v3/${INFURA_API_KEY}`))   // Goerli
  const web3 = new Web3(new Web3.providers.WebsocketProvider('ws://172.30.96.1:7545'))                             // Ganache
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
          return receipt;
      });
  } catch (error) {
    console.log("Error Sending Transaction - ", txDescriptionMessage);
    console.log(error.message);
  }

}

/**
 * @dev - This function is responsible to increase the allowance for the UniswapLiquidity contract BEFORE calling the addLiquidity() function from the uniswap contracts!
 * @param {web3Object}                    - The web3 object
 * @param {contractObject} tokenContract  - The object's contract of the ERC20 token that'll be called to increase the allowance
 * @param {int} allowanceAmount           - The amount of tokens that will be granted as allowance to the spender
 * @param {address} spenderAddress        - The spender's address (The address that'll receive the allowance)
 * @param {address} signerAddress         - The address of the account that is signing the transaction - The owner of the tokens
 * @param {PRIVATE_KEYS} SIGNER           - The PRIVATE_KEYS of the signer - The owner of the tokens
 */
 async function increaseAllowance(web3js,tokenContract,allowanceAmount,spenderAddress,signerAddress,SIGNER) {
  let allowance = web3js.utils.toWei(allowanceAmount.toString(),'ether')
  // Defining the transaction to grant the required allowance to the UniswapLiquidity contract to spend tokens on behalf of the provider
  let grantAllowance = tokenContract.methods.increaseAllowance(spenderAddress,allowance)

  // Signing the transaction
  let grantAllowanceSignedTransaction  = await web3js.eth.accounts.signTransaction(await generateTransactionsOptions(grantAllowance, signerAddress, web3js), SIGNER);
  
  // Sending a signed transaction  <---> sendSignedTransaction(signedTrasaction.rawTransaction)
  await sendingSignedTransactions(grantAllowanceSignedTransaction, web3js, "Increasing the required allowance to allow the Liquidity contract to spend tokens on behalf of the provider")

}

module.exports = {
  initializeConnection,
  getWeb3Object,
  getContract,
  generateTransactionsOptions,
  sendingSignedTransactions,
  increaseAllowance,
};