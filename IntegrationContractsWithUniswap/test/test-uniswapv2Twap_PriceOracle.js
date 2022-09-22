const BN = require("bn.js");
const { sendEther, pow } = require("./util");
const { WETH, DAI, WETH_WHALE, DAI_WHALE, HEMI } = require("./config");

const IERC20 = artifacts.require("IERC20");
const UniswapV2Twap_PriceOracle = artifacts.require("UniswapV2Twap_PriceOracle");
const SwapTokensContract = artifacts.require("SwapTokens");

contract("UniswapV2Twap_PriceOracle", (accounts) => {
  const CALLER = accounts[0];
  const TOKEN_A = WETH;
  const TOKEN_A_WHALE = WETH_WHALE;
  const TOKEN_B = DAI;
  const TOKEN_B_WHALE = DAI_WHALE;

  const DAI_WETH_PAIR = "0xc55Cb2D7239920F21d647108fa304707BedC5478"
  
  const tokens_A_Amount = 10;
  const TOKEN_A_AMOUNT = web3.utils.toWei(tokens_A_Amount.toString(),'ether')

  const tokens_B_Amount = 10;
  const TOKEN_B_AMOUNT = web3.utils.toWei(tokens_B_Amount.toString(),'ether')

  const TOKEN_IN = DAI;
  const TOKEN_OUT = HEMI;
  const TO = accounts[3]; // The account that will receive the OUTPUT_TOKENS - Account#4 in Ganache

  let contractUniswapV2Twap_PriceOracle;
  let tokenA;
  let tokenB;
  beforeEach(async () => {
    tokenA = await IERC20.at(TOKEN_A);
    tokenB = await IERC20.at(TOKEN_B);
    
    // Make sure to pass the address of the DAI/WETH Pair as a parameter in the below line
    contractUniswapV2Twap_PriceOracle = await UniswapV2Twap_PriceOracle.new(DAI_WETH_PAIR);

    // send ETH to cover tx fee
    await sendEther(web3, accounts[0], TOKEN_A_WHALE, 1);
    await sendEther(web3, accounts[0], TOKEN_B_WHALE, 1);

    //const tokenA_Whale = await tokenA.balanceOf(TOKEN_A_WHALE);
    // transfer tokens A & B to CALLER (accounts[0])
    await tokenA.transfer(CALLER, TOKEN_A_AMOUNT, { from: TOKEN_A_WHALE });
    await tokenB.transfer(CALLER, TOKEN_B_AMOUNT, { from: TOKEN_B_WHALE });

    await tokenA.approve(contractUniswapV2Twap_PriceOracle.address, TOKEN_A_AMOUNT, { from: CALLER });
    await tokenB.approve(contractUniswapV2Twap_PriceOracle.address, TOKEN_B_AMOUNT, { from: CALLER });


  });

  /**
   * @dev swapTokens() swap from DAI to HEMI
  */
  const swapTokens = async () => {
    const tokenIn = await IERC20.at(TOKEN_IN);    // tokenIn contract - To access the address = tokenIn.address
    const tokenOut = await IERC20.at(TOKEN_OUT);  // tokenOut contract - To access the address = tokenOut.address
    const AMOUNT_IN = tokens_B_Amount;
    const AMOUNT_OUT_MIN = 1;

    console.log(`Original DAI Balance from the Account#4 in Ganache ${await tokenIn.balanceOf(accounts[3])}`);
    console.log(`Original HEMI Balance from the Account#4 in Ganache ${await tokenOut.balanceOf(accounts[3])}`);

    const swapTokensContract = await SwapTokensContract.new();
    await tokenIn.approve(swapTokensContract.address, AMOUNT_IN, { from: TOKEN_B_WHALE });

    try {
      await swapTokensContract.swap(tokenIn.address,tokenOut.address,AMOUNT_IN,AMOUNT_OUT_MIN,TO, { from: TOKEN_B_WHALE })
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
          console.log("Swap completed!");
          //console.log(receipt);                             // Print the entire receipt's transaction
          console.log(receipt.receipt.logs[0].args);          // Print all the results of emiting an Event
          //console.log(receipt.events.Swap.returnValues);
      });
    } catch(error) {
      console.log(error);
    }

    console.log(`out ${await tokenOut.balanceOf(TO)}`);

    console.log(`After swap is completed DAI Balance from the Account#4 in Ganache ${await tokenIn.balanceOf(accounts[3])}`);
    console.log(`After swap is completed HEMI Balance from the Account#4 in Ganache ${await tokenOut.balanceOf(accounts[3])}`);
    
  }
  

  it("Using the TWAP_PriceOracle to estimate the tokens to receive from trading the DAI/WETH pool", async () => {

    console.log("=== calling consult() function to estimate the amount of tokens B that could be received from trading BEFORE running some trades on the pool ===");
    let tx = await contractUniswapV2Twap_PriceOracle.consult(
      tokenB.address, //DAI
      TOKEN_B_AMOUNT,
      {
        from: CALLER,
      }
    );
    console.log("Tx result: ", tx.logs.log.args);
    /*
    for (const log of tx.logs) {
      //console.log("log.args :", log.args);
      console.log(`${log.args.message} ${web3.utils.fromWei(log.args.value, "ether")}`);
    }
    */

    console.log("=====================================");
    console.log("=====================================");
    console.log("=====================================");

    console.log("=== Running some trades on the reserve pool ===");
    tx = await swapTokens()
    console.log("=====================================");
    tx = await swapTokens()
    console.log("=====================================");
    tx = await swapTokens()
    console.log("=====================================");
    tx = await swapTokens()
    console.log("=====================================");
    tx = await swapTokens()

    console.log("=====================================");
    console.log("=====================================");
    console.log("=====================================");


    console.log("=== calling consult() function to estimate the amount of tokens B that could be received from trading AFTER running some trades on the pool ===");
    tx = await contractUniswapV2Twap_PriceOracle.consult(
      tokenB.address, //DAI
      TOKEN_B_AMOUNT,
      {
        from: CALLER,
      }
    );
    console.log("Tx result: ", tx.logs.log.args);
  });
  
});