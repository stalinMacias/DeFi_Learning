///   This file can be used to create new pairs of tokens in the uniswap v2 factory contract ////
const common = require('./utils/common.js')
const UniswapV2Factory = require('./contracts/UniswapV2Factory.json')
const OWNER_KEYS = process.env.OWNER_KEYS || ""
// Token's ABIs
const DAI = require('./contracts/DAI.json')
const HEMI = require('./contracts/HEMI.json')


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
  const token1 = await common.getContract(web3js,DAI)
  const token1Address = token1._address

  const token2 = await common.getContract(web3js,HEMI);
  const token2Address = token2._address
  
  return { ownerAddress, web3js, uniswapV2FactoryContract, token1Address, token2Address }
}

(async () => {
  const { ownerAddress, web3js, uniswapV2FactoryContract, token1Address, token2Address } = await init()
  process.on( 'SIGINT', () => {
    console.log('Calling precess.exit()')
    process.exit( );
  })

  //console.log("ownerAddress ", ownerAddress)
  //console.log("Web3js object: " , web3js)
  //console.log("uniswapV2FactoryContract: " , uniswapV2FactoryContract)
  //console.log("token1Address: ", token1Address);
  //console.log("token2Address: ", token2Address);

  // Defining the transaction to create a new pair using the Uniswap V2 Factory contract
  let createNewPair = uniswapV2FactoryContract.methods.createPair(token1Address,token2Address)

  // Signing the transaction as the Owner
  //let signedTransaction  = await web3js.eth.accounts.signTransaction(options, OWNER_KEYS);
  let createNewPairSignedTransaction  = await web3js.eth.accounts.signTransaction(await common.generateTransactionsOptions(createNewPair, ownerAddress, web3js), OWNER_KEYS);
  //console.log("createNewPairSignedTransaction: ", createNewPairSignedTransaction);

  // When sending transactions to a public blockchain the transaction must be signed before actually sending it    <---> sendSignedTransaction(signedTrasaction.rawTransaction)
  console.log("Sending the signed transaction to create a new pair of tokens using the Uniswap v2 Factory contract");
  await common.sendingSignedTransactions(createNewPairSignedTransaction, web3js, "Calling the createPair() method from the UniswapV2Factory contract")
  
  // Sending an unsigned transaction - Works for Ganache but not for public blockchains
  //callerContract.methods.updateEthPrice().send({ from: clientAddress, gasLimit: 100000 })

})()
