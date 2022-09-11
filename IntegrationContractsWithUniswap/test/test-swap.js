// accounts[0] is the contract's owner of all the contracts that have been deployed to Ganache
const BN = require("bn.js");
const IERC20 = artifacts.require("IERC20");
const SwapTokensContract = artifacts.require("SwapTokens");

contract("Testing a swap from DAI to HEMI" , (accounts) => {
  const DAI="0x1cb527Bb2e86272694019D200B7845A7c3ceA6Ca"
  const DAI_WHALE=accounts[0] // In ganache, the accounts[0] is the owner of the contracts
  const HEMI="0xdfb0D23C696f7349B382fDac91dBEB4C4142e123"

  const WHALE = DAI_WHALE;
  const daiAmount = 10000; // 10k DAIs
  const AMOUNT_IN = new BN(10).pow(new BN(18)).mul(new BN(daiAmount));
  const AMOUNT_OUT_MIN = 1;
  const TOKEN_IN = DAI;
  const TOKEN_OUT = HEMI;
  const TO = accounts[1]; // The account that will receive the OUTPUT_TOKENS

  it("Swapping DAI for HEMI", async () => {
    const tokenIn = await IERC20.at(TOKEN_IN);    // tokenIn contract - To access the address = tokenIn.address
    const tokenOut = await IERC20.at(TOKEN_OUT);  // tokenOut contract - To access the address = tokenOut.address

    console.log(`Original DAI Balance from the WHALE Account ${await tokenIn.balanceOf(WHALE)}`);
    console.log(`Original HEMI Balance from the WHALE Account ${await tokenOut.balanceOf(WHALE)}`);

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
  })


});