const BN = require("bn.js")
const { sendEther, pow } = require("./util")
const { WETH, DAI, USDC, USDT, WETH_WHALE, DAI_WHALE, USDC_WHALE, USDT_WHALE } = require("./config")

const IERC20 = artifacts.require("IERC20")
const UniswapOptimal = artifacts.require("UniswapOptimal")

contract("UniswapOptimal", (accounts) => {

  const WHALE = DAI_WHALE
  const AMOUNT = pow(10, 18).mul(new BN(1000))

  let contract
  let fromToken
  let toToken
  let pair

  beforeEach(async () => {
    fromToken = await IERC20.at(DAI)
    toToken = await IERC20.at(WETH)
    contract = await UniswapOptimal.new()
    pair = await IERC20.at(await contract.getPair(fromToken.address, toToken.address))

    await sendEther(web3, accounts[0], WHALE, 1)
    fromToken.approve(contract.address, AMOUNT, { from: WHALE })
  })

  const snapshot = async () => {
    return {
      lp: await pair.balanceOf(contract.address),
      fromToken: await fromToken.balanceOf(contract.address),
      toToken: await toToken.balanceOf(contract.address),
    }
  }

  it("optimal swap - Adding liquidity to pool DAI/WETH", async () => {
    const before = await snapshot()
    console.log("lp - before", before.lp.toString())
    console.log("from - before", before.fromToken.toString())
    console.log("to - before", before.toToken.toString())

    await contract.zap(fromToken.address, toToken.address, AMOUNT, {
      from: WHALE,
    })
    const after = await snapshot()

    console.log("lp - after", after.lp.toString())
    console.log("from - after", after.fromToken.toString())
    console.log("to - after", after.toToken.toString())

    /*
    lp - before 0
    from - before 0
    to - before 0
    lp - after 12052239278959479614
    from - after 0
    to - after 0
    */
  })


  it("sub-optimal swap", async () => {
    /*
    const before = await snapshot()
    console.log("lp - before", before.lp.toString())
    console.log("from - before", before.fromToken.toString())
    console.log("to - before", before.toToken.toString())

    await contract.subOptimalZap(fromToken.address, toToken.address, AMOUNT, {
      from: WHALE,
    })
    const after = await snapshot()
    console.log("lp", after.lp.toString())
    console.log("from", after.fromToken.toString())
    console.log("to", after.toToken.toString())
    */
    /*
    lp - before 0
    from - before 0
    to - before 0

    lp 7506059565771639984
    from 1465009718782719784
    to 0
    */
    
  })



});