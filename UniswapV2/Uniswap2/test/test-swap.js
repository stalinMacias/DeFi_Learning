// accounts[0] is the contract's owner of all the contracts that have been deployed to Ganache
const BN = require("bn.js");
const { WETH, DAI, WETH_WHALE, DAI_WHALE, HEMI, HEMI_WHALE } = require("./config");

const IERC20 = artifacts.require("IERC20");
const SwapTokensContract = artifacts.require("SwapTokens");

contract("Testing a swap from DAI to HEMI" , (accounts) => {
  const WHALE = DAI_WHALE;
  const daiAmount = 100; // 100 DAIs
  const AMOUNT_IN = new BN(10).pow(new BN(18)).mul(new BN(daiAmount));
  const AMOUNT_OUT_MIN = 1;
  const TOKEN_IN = DAI;
  const TOKEN_OUT = HEMI;
  const TO = accounts[3]; // The account that will receive the OUTPUT_TOKENS - Account#4 in Ganache

  it("Swapping DAI for HEMI", async () => {
    const tokenIn = await IERC20.at(TOKEN_IN);    // tokenIn contract - To access the address = tokenIn.address
    const tokenOut = await IERC20.at(TOKEN_OUT);  // tokenOut contract - To access the address = tokenOut.address

    console.log(`Original DAI Balance from the Account#4 in Ganache ${await tokenIn.balanceOf(accounts[3])}`);
    console.log(`Original HEMI Balance from the Account#4 in Ganache ${await tokenOut.balanceOf(accounts[3])}`);

    const swapTokensContract = await SwapTokensContract.new();
    await tokenIn.approve(swapTokensContract.address, AMOUNT_IN, { from: WHALE });

    try {
      await swapTokensContract.swap(tokenIn.address,tokenOut.address,AMOUNT_IN,AMOUNT_OUT_MIN,TO, { from: WHALE })
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
          console.log(receipt.receipt.logs[0].args.tokenIn);  // Print an specific value from emitting an Event
          //console.log(receipt.events.Swap.returnValues);
      });
    } catch(error) {
      console.log(error);
    }

    console.log(`out ${await tokenOut.balanceOf(TO)}`);

    console.log(`After swap is completed DAI Balance from the Account#4 in Ganache ${await tokenIn.balanceOf(accounts[3])}`);
    console.log(`After swap is completed HEMI Balance from the Account#4 in Ganache ${await tokenOut.balanceOf(accounts[3])}`);
  })


});