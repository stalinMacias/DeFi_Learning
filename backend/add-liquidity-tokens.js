///   This file can be used to create new pairs of tokens in the uniswap v2 factory contract ////
const common = require('./utils/common.js')
const UniswapV2Factory = require('./contracts/UniswapV2Factory.json')
const UniswapUtilities = require('./contracts/UniswapUtilities.json')

const UniswapLiquidity = require('./contracts/UniswapLiquidity.json')

const OWNER_KEYS = process.env.OWNER_KEYS || ""
const DAI_WHALE_KEYS = process.env.DAI_WHALE_KEYS || ""

// Token's ABIs
const DAI = require('./contracts/DAI.json')
const HEMI = require('./contracts/HEMI.json')
const WETH = require('./contracts/WETH.json')

async function init () {
  console.log("Running in the init() function - add-liquidity-tokens.js")
  let { newConnectionAddress : ownerAddress } = await common.initializeConnection(OWNER_KEYS)
  // Assign the above newConnectionAddress in the ownerAddres variable - This allows to create new connections for different users later in the code
  //const ownerAddress = newConnectionAddress
  console.log("ownerAddress ", ownerAddress);

  let { newConnectionAddress : daiWhaleAddress } = await common.initializeConnection(DAI_WHALE_KEYS)
  console.log("daiWhaleAddress ", daiWhaleAddress);

  const { web3js } = await common.getWeb3Object();
  
  //console.log("Web3js object: " , web3js)
  
  const uniswapLiquidityContract = await common.getContract(web3js,UniswapLiquidity)
  //console.log("uniswapLiquidityContract: " , uniswapLiquidityContract)

  const daiContract = await common.getContract(web3js,DAI)
  const hemiContract = await common.getContract(web3js,HEMI);
  const wethTokenContract = await common.getContract(web3js,WETH);

          /* Getting the contract's address of the different pairs */
  const uniswapV2FactoryContract = await common.getContract(web3js,UniswapV2Factory)

  const dai_hemi_pair_address = await uniswapV2FactoryContract.methods.getPair(daiContract._address,hemiContract._address).call()
  //console.log("pairTokensAddress: ", pairTokensAddress);
  
  const dai_weth_pair_address = await uniswapV2FactoryContract.methods.getPair(daiContract._address,wethTokenContract._address).call()
  console.log("dai_weth_pair_address: ", dai_weth_pair_address);

  const hemi_weth_pair_address = await uniswapV2FactoryContract.methods.getPair(hemiContract._address,wethTokenContract._address).call()
  console.log("hemi_weth_pair_address: ", hemi_weth_pair_address);


          /* Getting the reserve pools of the different pairs */
  const uniswapUtilitiesContract = await common.getContract(web3js,UniswapUtilities)

  let dai_weth_pool_reserves = await uniswapUtilitiesContract.methods.getReserves(dai_weth_pair_address).call();
  console.log("Pool reserves from the DAI/WETH Pair: " , dai_weth_pool_reserves);

  let hemi_weth_pool_reserves = await uniswapUtilitiesContract.methods.getReserves(hemi_weth_pair_address).call();
  console.log("Pool reserves from the HEMI/WETH Pair: " , hemi_weth_pool_reserves);

  let dai_hemi_pool_reserves = await uniswapUtilitiesContract.methods.getReserves(dai_hemi_pair_address).call();
  console.log("Pool reserves from the DAI/HEMI Pair: " , dai_hemi_pool_reserves);

  
  return { ownerAddress, daiWhaleAddress, web3js, uniswapV2FactoryContract, uniswapUtilitiesContract, uniswapLiquidityContract, daiContract, hemiContract, wethTokenContract }
}

(async () => {
  const { ownerAddress, daiWhaleAddress, web3js, uniswapV2FactoryContract, uniswapUtilitiesContract, uniswapLiquidityContract, daiContract, hemiContract, wethTokenContract } = await init()
  process.on( 'SIGINT', () => {
    console.log('Calling precess.exit()')
    process.exit( );
  })

  //console.log("ownerAddress ", ownerAddress)
  //console.log("Web3js object: " , web3js)
  //console.log("uniswapV2FactoryContract: " , uniswapV2FactoryContract)
  
  const daiAddress = daiContract._address
  const hemiAddress = hemiContract._address
  const wethTokenAddress = wethTokenContract._address

  let daiTokensAsLiquidity =  1000
  let wethTokensAsLiquidity =  10

  // Increase allowance on daiToken contract for the UniswapLiquidity contract
  await common.increaseAllowance(web3js,daiContract,daiTokensAsLiquidity,uniswapLiquidityContract._address,daiWhaleAddress,DAI_WHALE_KEYS);
  // Increase allowance on daiToken contract for the UniswapLiquidity contract
  await common.increaseAllowance(web3js,wethTokenContract,wethTokensAsLiquidity,uniswapLiquidityContract._address,daiWhaleAddress,DAI_WHALE_KEYS);

  const daiAllowance = await daiContract.methods.allowance(daiWhaleAddress,uniswapLiquidityContract._address).call()
  console.log("daiAllowance: ", daiAllowance);

  const wethAllowance = await wethTokenContract.methods.allowance(daiWhaleAddress,uniswapLiquidityContract._address).call()
  console.log("wethAllowance: ", wethAllowance);

  // Defining the transaction to add liquidity to a token pool
  console.log("Defining the transaction to add liquidity to a token pool");
  console.log("daiTokensAsLiquidity", web3js.utils.toWei(daiTokensAsLiquidity.toString(),'ether'));
  console.log("wethTokensAsLiquidity", web3js.utils.toWei(wethTokensAsLiquidity.toString(),'ether'));
  
  let addLiquidity = uniswapLiquidityContract.methods.addLiquidity(daiAddress,wethTokenAddress,web3js.utils.toWei(daiTokensAsLiquidity.toString(),'ether'),web3js.utils.toWei(wethTokensAsLiquidity.toString(),'ether'))
  // Signing the transaction as the DAI_WHALE_KEYS
  //let signedTransaction  = await web3js.eth.accounts.signTransaction(options, OWNER_KEYS);
  let addLiquiditySignedTransaction  = await web3js.eth.accounts.signTransaction(await common.generateTransactionsOptions(addLiquidity, daiWhaleAddress, web3js), DAI_WHALE_KEYS);
  //console.log("addLiquiditySignedTransaction: ", addLiquiditySignedTransaction);

  // Sending a signed transaction  <---> sendSignedTransaction(signedTrasaction.rawTransaction)
  //console.log("Sending the signed transaction to create a new pair of tokens using the Uniswap v2 Factory contract - DAI/WETH");
  console.log("Adding liquidity to the pool DAI/WETH");
  await common.sendingSignedTransactions(addLiquiditySignedTransaction, web3js, "Adding liquidity to the pool DAI/WETH")

})()
