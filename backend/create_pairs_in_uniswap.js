///   This file can be used to create new pairs of tokens in the uniswap v2 factory contract ////
const common = require('./utils/common.js')
const SLEEP_INTERVAL = process.env.SLEEP_INTERVAL || 5000
const UniswapV2Factory = require('./contracts/UniswapV2Factory.json')
const OWNER_KEYS = process.env.OWNER_KEYS || ""


async function init () {
  console.log("Running in the init() function")
  let { newConnectionAddress } = await common.initializeConnection(OWNER_KEYS)
  // Assign the above newConnectionAddress in the ownerAddres variable - This allows to create new connections for different users later in the code
  const ownerAddress = newConnectionAddress

  const { web3js } = await common.getWeb3Object();
  console.log("ownerAddress ", ownerAddress);
  //console.log("Web3js object: " , web3js)
  const uniswapV2FactoryContract = await common.getContract(web3js,UniswapV2Factory)
  //console.log("uniswapV2FactoryContract: " , uniswapV2FactoryContract)
  return { ownerAddress, web3js, uniswapV2FactoryContract }
}

(async () => {
  const { ownerAddress, web3js, uniswapV2FactoryContract } = await init()
  process.on( 'SIGINT', () => {
    console.log('Calling precess.exit()')
    process.exit( );
  })

  //console.log("ownerAddress ", ownerAddress)
  //console.log("Web3js object: " , web3js)
  //console.log("uniswapV2FactoryContract: " , uniswapV2FactoryContract)

  setInterval( async () => {
    /*
    requestedEthPriceTimes++;
    const price = await callerContract.methods.getCurrentEthPrice().call({ from: clientAddress })
    console.log("Current Eth price set in the Oracle: ", price);

    if(requestedEthPriceTimes == 10) {
      console.log("5th time requesting the ETC price, time to update the price in the Oracle contract");

      // Defining the transaction
      let updateEthPriceRequest = callerContract.methods.updateEthPrice()

      // Signing the transaction as the Client's owner
      //let signedTransaction  = await web3js.eth.accounts.signTransaction(options, OWNER_KEYS);
      let signedpdateEthPriceRequestTransaction  = await web3js.eth.accounts.signTransaction(await common.generateTransactionsOptions(updateEthPriceRequest, clientAddress, web3js), CLIENT_KEYS);
      //console.log("signedpdateEthPriceRequestTransaction: ", signedpdateEthPriceRequestTransaction);

      // When sending transactions to a public blockchain the transaction must be signed before actually sending it    <---> sendSignedTransaction(signedTrasaction.rawTransaction)
      console.log("Sending the signed transaction to execute the updateEthPrice() in the Caller Contract");
      await common.sendingSignedTransactions(signedpdateEthPriceRequestTransaction, web3js, "Calling the updateEthPrice() method in the Caller Contract")
      
      // Sending an unsigned transaction - Works for Ganache but not for public blockchains
      //callerContract.methods.updateEthPrice().send({ from: clientAddress, gasLimit: 100000 })

      requestedEthPriceTimes = 0
    }
    */
  }, SLEEP_INTERVAL);

})()
