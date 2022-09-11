///   This file can be used to create new pairs of tokens in the uniswap v2 factory contract ////
const common = require('./utils/common.js')
const UniswapV2Factory = require('./contracts/UniswapV2Factory.json')
const LiquidityValueCalculator = require('./contracts/LiquidityValueCalculator.json')
const OWNER_KEYS = process.env.OWNER_KEYS || ""
// Token's ABIs
const DAI = require('./contracts/DAI.json')
const HEMI = require('./contracts/HEMI.json')
const WETH = require('./contracts/WETH.json')

async function init () {
  console.log("Running in the init() function - interact_with_pairs.js")
  let { newConnectionAddress } = await common.initializeConnection(OWNER_KEYS)
  // Assign the above newConnectionAddress in the ownerAddres variable - This allows to create new connections for different users later in the code
  const ownerAddress = newConnectionAddress

  const { web3js } = await common.getWeb3Object();
  console.log("ownerAddress ", ownerAddress);
  //console.log("Web3js object: " , web3js)

  const liquidityValueCalculatorContract = await common.getContract(web3js,LiquidityValueCalculator)
  //console.log("liquidityValueCalculatorContract: " , liquidityValueCalculatorContract)
  const token1 = await common.getContract(web3js,DAI)
  const token1Address = token1._address

  const token2 = await common.getContract(web3js,HEMI);
  const token2Address = token2._address

  const wethToken = await common.getContract(web3js,WETH);
  const wethTokenAddress = wethToken._address

  const uniswapV2FactoryContract = await common.getContract(web3js,UniswapV2Factory)
  const pairTokensAddress = await uniswapV2FactoryContract.methods.getPair(token1Address,token2Address).call()
  //console.log("pairTokensAddress: ", pairTokensAddress);
  
  const dai_weth_pair_address = await uniswapV2FactoryContract.methods.getPair(token1Address,wethTokenAddress).call()
  console.log("dai_weth_pair_address: ", dai_weth_pair_address);

  const hemi_weth_pair_address = await uniswapV2FactoryContract.methods.getPair(token2Address,wethTokenAddress).call()
  console.log("hemi_weth_pair_address: ", hemi_weth_pair_address);

  
  return { ownerAddress, web3js, liquidityValueCalculatorContract, token1Address, token2Address, pairTokensAddress }
}

(async () => {
  const { ownerAddress, web3js, liquidityValueCalculatorContract, token1Address, token2Address, pairTokensAddress } = await init()
  process.on( 'SIGINT', () => {
    console.log('Calling precess.exit()')
    process.exit( );
  })

  //console.log("ownerAddress ", ownerAddress)
  //console.log("Web3js object: " , web3js)
  //console.log("uniswapV2FactoryContract: " , uniswapV2FactoryContract)
  //console.log("token1Address: ", token1Address);
  //console.log("token2Address: ", token2Address);

  const liquidityShareValue = await liquidityValueCalculatorContract.methods.computeLiquidityShareValue(0,token1Address,token2Address).call()
  console.log("liquidityShareValue: ", liquidityShareValue) // Output example:  liquidityShareValue:  Result { '0': '0', '1': '0', tokenAAmount: '0', tokenBAmount: '0' }

  /*

  // Defining the transaction to create a new pair using the Uniswap V2 Factory contract
  let createNewPair = uniswapV2FactoryContract.methods.createPair(token1Address,token2Address)

  // Signing the transaction as the Owner
  //let signedTransaction  = await web3js.eth.accounts.signTransaction(options, OWNER_KEYS);
  let createNewPairSignedTransaction  = await web3js.eth.accounts.signTransaction(await common.generateTransactionsOptions(createNewPair, ownerAddress, web3js), OWNER_KEYS);
  //console.log("createNewPairSignedTransaction: ", createNewPairSignedTransaction);

  // When sending transactions to a public blockchain the transaction must be signed before actually sending it    <---> sendSignedTransaction(signedTrasaction.rawTransaction)
  console.log("Sending the signed transaction to create a new pair of tokens using the Uniswap v2 Factory contract");
  await common.sendingSignedTransactions(createNewPairSignedTransaction, web3js, "Calling the createPair() method from the UniswapV2Factory contract")

  */
  
  // Sending an unsigned transaction - Works for Ganache but not for public blockchains
  //callerContract.methods.updateEthPrice().send({ from: clientAddress, gasLimit: 100000 })

})()