const BN = require("bn.js");
const { sendEther, pow } = require("./util");
const { WETH, DAI, WETH_WHALE, DAI_WHALE, HEMI, HEMI_WHALE } = require("./config");

const IERC20 = artifacts.require("IERC20");
const UniswapLiquidity = artifacts.require("UniswapLiquidity");

contract("UniswapLiquidity", (accounts) => {
  const CALLER = accounts[4]; // Account #5 in Ganache

  const TOKEN_A = WETH;
  const TOKEN_A_WHALE = WETH_WHALE;

  const TOKEN_B = DAI;
  const TOKEN_B_WHALE = DAI_WHALE;

  const TOKEN_C = HEMI;
  const TOKEN_C_WHALE = HEMI_WHALE;

  //const TOKEN_A_AMOUNT = pow(10, 18);
  const token_A_amount = 1
  const TOKEN_A_AMOUNT = web3.utils.toWei(token_A_amount.toString(),"ether");

  const token_B_amount = 1000
  const TOKEN_B_AMOUNT = web3.utils.toWei(token_B_amount.toString(),"ether");

  const token_C_amount = 500
  const TOKEN_C_AMOUNT = web3.utils.toWei(token_C_amount.toString(),"ether");

  let contractUniswapLiquidity;
  let tokenA;
  let tokenB;
  let tokenC;
  beforeEach(async () => {
    tokenA = await IERC20.at(TOKEN_A);
    tokenB = await IERC20.at(TOKEN_B);
    tokenC = await IERC20.at(TOKEN_C);
    contractUniswapLiquidity = await UniswapLiquidity.new();

    /*
    try {
      await web3.eth.sendTransaction({
        from: accounts[0],
        to: TOKEN_B_WHALE,
        value: web3.utils.toWei(amount.toString(), "ether"),
      })
      // When the receipt is received indicated that the transaction has been completed
      .once('receipt', function(receipt){
        console.log("Transaction completed"); 
        //console.log("receipt", receipt) 
      })
      .on('confirmation', function(confNumber, receipt){ 
        //console.log("confNumber",confNumber,"receipt",receipt)
      })
      .on('error', function(error){ 
        console.log("error", error)
      })
      .then(function(receipt){
          console.log("Transaction completed!");
          //console.log(receipt);                             // Print the entire receipt's transaction
          console.log(receipt.receipt.logs[0].args);          // Print all the results of emiting an Event
          console.log(receipt.receipt.logs[0].args.tokenIn);  // Print an specific value from emitting an Event
          //console.log(receipt.events.Swap.returnValues);
      });
    } catch(error) {
      console.log(error);
    }
    */

    // send ETH to cover tx fee
    //await sendEther(web3, accounts[0], TOKEN_A_WHALE, 1);
    //await sendEther(web3, accounts[0], TOKEN_B_WHALE, 1);

    //const tokenA_Whale = await tokenA.balanceOf(TOKEN_A_WHALE);

    // transfer tokensA&B to CALLER from the TOKENS_WHALES to add liquidity to pool DAI/WETH
    /*
    await tokenA.transfer(CALLER, TOKEN_A_AMOUNT, { from: TOKEN_A_WHALE });
    await tokenB.transfer(CALLER, TOKEN_B_AMOUNT, { from: TOKEN_B_WHALE });

    await tokenA.approve(contractUniswapLiquidity.address, TOKEN_A_AMOUNT, { from: CALLER });
    await tokenB.approve(contractUniswapLiquidity.address, TOKEN_B_AMOUNT, { from: CALLER });
    */


    // transfer tokensA&C to CALLER from the TOKENS_WHALES to add liquidity to pool HEMI/WETH
    await tokenA.transfer(CALLER, TOKEN_A_AMOUNT, { from: TOKEN_A_WHALE });
    await tokenC.transfer(CALLER, TOKEN_C_AMOUNT, { from: TOKEN_C_WHALE });

    await tokenA.approve(contractUniswapLiquidity.address, TOKEN_A_AMOUNT, { from: CALLER });
    await tokenC.approve(contractUniswapLiquidity.address, TOKEN_C_AMOUNT, { from: CALLER });

    /*
    // transfer tokenB to TOKEN_A_WHALE
    await tokenB.transfer(TOKEN_A_WHALE, TOKEN_B_AMOUNT, { from: TOKEN_B_WHALE });
    // approve this contract to spend the amount of tokens that will be provided as liquidity from TOKEN_A_WHALE
    await tokenA.approve(contractUniswapLiquidity.address, TOKEN_A_AMOUNT, { from: TOKEN_A_WHALE });
    await tokenB.approve(contractUniswapLiquidity.address, TOKEN_B_AMOUNT, { from: TOKEN_A_WHALE });

    // transfer tokenA to TOKEN_B_WHALE
    await tokenA.transfer(TOKEN_B_WHALE, TOKEN_A_AMOUNT, { from: TOKEN_A_WHALE });
    // approve this contract to spend the amount of tokens that will be provided as liquidity from TOKEN_A_WHALE
    await tokenA.approve(contractUniswapLiquidity.address, TOKEN_A_AMOUNT, { from: TOKEN_B_WHALE });
    await tokenB.approve(contractUniswapLiquidity.address, TOKEN_B_AMOUNT, { from: TOKEN_B_WHALE });
    */

  });
  

  it("add liquidity and remove liquidity", async () => {

    /*
    console.log("=== add liquidity to pool DAI/WETH - CALLER ===");
    tx = await contractUniswapLiquidity.addLiquidity(
      tokenA.address,
      tokenB.address,
      TOKEN_A_AMOUNT,
      TOKEN_B_AMOUNT,
      {
        from: CALLER,
      }
    );
    for (const log of tx.logs) {
      //console.log("log.args :", log.args);
      console.log(`${log.args.message} ${web3.utils.fromWei(log.args.value, "ether")}`);
    }
    */

    console.log("=== add liquidity to pool HEMI/WETH - CALLER ===");
    tx = await contractUniswapLiquidity.addLiquidity(
      tokenA.address,
      tokenC.address,
      TOKEN_A_AMOUNT,
      TOKEN_C_AMOUNT,
      {
        from: CALLER,
      }
    );
    for (const log of tx.logs) {
      //console.log("log.args :", log.args);
      console.log(`${log.args.message} ${web3.utils.fromWei(log.args.value, "ether")}`);
    }


    /*
    console.log("=== remove liquidity from pool DAI/WETH - CALLER ===");
    tx = await contractUniswapLiquidity.removeLiquidity(tokenA.address, tokenB.address, {
      from: CALLER,
    });
    
    for (const log of tx.logs) {
      console.log(`${log.args.message} ${web3.utils.fromWei(log.args.value, "ether")}`);
    }
    */


  });
  
});