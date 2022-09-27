///   This file can be used to create new pairs of tokens in the uniswap v2 factory contract ////
const common = require('./utils/common.js')

const UniswapLiquidity = require('./contracts/UniswapLiquidity.json')

const DAI_WHALE_KEYS = process.env.DAI_WHALE_KEYS || ""

// Token's ABIs
const DAI = require('./contracts/DAI.json')
const HEMI = require('./contracts/HEMI.json')
const WETH = require('./contracts/WETH.json')

async function init () {
  console.log("Running in the init() function - transfer-liquidity.js")

  let { newConnectionAddress : daiWhaleAddress } = await common.initializeConnection(DAI_WHALE_KEYS)
  console.log("daiWhaleAddress ", daiWhaleAddress);

  const { web3js } = await common.getWeb3Object();
  
  //console.log("Web3js object: " , web3js)
  
  const uniswapLiquidityContract = await common.getContract(web3js,UniswapLiquidity)
  //console.log("uniswapLiquidityContract: " , uniswapLiquidityContract)

  const daiContract = await common.getContract(web3js,DAI)
  const hemiContract = await common.getContract(web3js,HEMI);
  const wethTokenContract = await common.getContract(web3js,WETH);

  return { daiWhaleAddress, web3js, uniswapLiquidityContract, daiContract, hemiContract, wethTokenContract }
}

(async () => {
  const { daiWhaleAddress, web3js, uniswapLiquidityContract, daiContract, hemiContract, wethTokenContract } = await init()
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


  console.log("Transfering the liquidity tokens that the daiWhale holds in the UniswapLiquidity contract from the pair DAI/WETH");
  await common.transferLiquidityTokens(web3js,uniswapLiquidityContract,daiWhaleAddress,daiAddress,wethTokenAddress,daiWhaleAddress,DAI_WHALE_KEYS);

})()
