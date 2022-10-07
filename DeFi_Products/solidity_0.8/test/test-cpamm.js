// automated tests to validate the functionality of a Constant Product Auto Market Maker (CPAMM)

const { expectRevert } = require('@openzeppelin/test-helpers');

const BN = require('bn.js')
const IERC20 = artifacts.require("IERC20");
const CPAMM = artifacts.require("CPAMM");

const { WETH, DAI, WETH_WHALE, DAI_WHALE } = require("./config");
const { sendEther } = require("./util");

contract("CPAMM", (accounts) => {
  // CPAMM will be created using the token's pair WETH/DAI
  const CALLER = accounts[0];
  const TOKEN_A = WETH;
  const TOKEN_A_WHALE = WETH_WHALE;
  const TOKEN_B = DAI;
  const TOKEN_B_WHALE = DAI_WHALE;

  const TOKEN_AMOUNT = 20;
  const TOKEN_A_AMOUNT = web3.utils.toWei(TOKEN_AMOUNT.toString() , "ether");
  const TOKEN_B_AMOUNT = web3.utils.toWei(TOKEN_AMOUNT.toString() , "ether");

  let cpamm_dai_weth;
  let tokenA;
  let tokenB;

  beforeEach(async () => {
    tokenA = await IERC20.at(TOKEN_A);
    tokenB = await IERC20.at(TOKEN_B);
    cpamm_dai_weth = await CPAMM.new(tokenA.address,tokenB.address);

    // send ETH to cover tx fee
    await sendEther(web3, accounts[0], TOKEN_A_WHALE, 1);
    await sendEther(web3, accounts[0], TOKEN_B_WHALE, 1);

  })

  const getWhalesBalances = async () => {
    return {
      weth_whale: {
        weth_balance: web3.utils.fromWei(await tokenA.balanceOf(WETH_WHALE), "ether"),
        dai_balance: web3.utils.fromWei(await tokenB.balanceOf(WETH_WHALE), "ether")
      },
      dai_whale: {
        weth_balance: web3.utils.fromWei(await tokenA.balanceOf(DAI_WHALE), "ether"),
        dai_balance: web3.utils.fromWei(await tokenB.balanceOf(DAI_WHALE), "ether")
      }
    }
  }

  const showWhaleBalances = (balances,message) => {
    console.log("===========================================================================");
    console.log("==== " + message + " ===");
    console.log("=========================");

    console.log("WETH_WHALE -> WETH Balance: ", balances.weth_whale.weth_balance);
    console.log("WETH_WHALE -> DAI Balance: ", balances.weth_whale.dai_balance);

    console.log("DAI_WHALE -> WETH Balance: ", balances.dai_whale.weth_balance) ;
    console.log("DAI_WHALE -> DAI Balance: ", balances.dai_whale.dai_balance);

    console.log("=========================");
    console.log("===========================================================================");
  }

  const getCPAMMData = async (provider) => {
    return {
      reserves: {
        reserve0: web3.utils.fromWei(await cpamm_dai_weth.reserve0.call(), "ether"),
        reserve1: web3.utils.fromWei(await cpamm_dai_weth.reserve1.call(), "ether"),
      },
      shares: {
        totalShares: web3.utils.fromWei(await cpamm_dai_weth.totalSupply.call(), "ether"),
        userShares: web3.utils.fromWei(await cpamm_dai_weth.getSharesPerProvider(provider), "ether"), //getSharesPerProvider() is declared as view in the CPAMM contract, that is why it can be called as if it were a variable....
      }
    }
  }

  const showCPAMMData = (data,message,provider) => {
    console.log("===========================================================================");
    console.log("==== " + message + " from: " + provider + " ===");
    console.log("=========================");

    console.log("reserve0 -> ", data.reserves.reserve0 , " <---> WETH");
    console.log("reserve1 -> ", data.reserves.reserve1 , " <---> DAI");

    console.log("=========================");
    console.log("CPAMM Total Shares: ", data.shares.totalShares);
    console.log("Provider: ", provider, " shares: ", data.shares.userShares);

    console.log("=========================");
    console.log("===========================================================================");
  }

  const approveTokenSpender = async(approvedTokens = 10) => {
    const APPROVED_TOKENS = web3.utils.toWei(approvedTokens.toString() , "ether");
    // approve the CPAMM contract to spend tokens on behalf of the whales - required when adding liquidity to the CPAMM
    try {
      await tokenA.approve(cpamm_dai_weth.address, APPROVED_TOKENS, { from: TOKEN_A_WHALE })
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
          console.log("Approval completed!");
          //console.log(receipt.receipt);                       // Print the entire receipt's transaction
          //console.log(receipt.receipt.logs[0].args);            // Print all the results of emiting an Event
          //console.log(receipt.receipt.logs[0].args.tokenIn);  // Print an specific value from emitting an Event

          console.log("Total tokens approved" , web3.utils.fromWei(String(receipt.receipt.logs[0].args.value), "ether"));  // Total tokens approved in ether unit

          //BN.isBN(<BN>);                                    // Validate if a variables is a BN
          //web3.utils.fromWei(String(<BN>)), "ether")        // Convert a BN to ether's unit

          //console.log(web3.utils.fromWei(String(receipt.receipt.logs[0].args.amountSwapped)), "ether");
          //console.log(receipt.events.Swap.returnValues);
      });
    } catch(error) {
      console.log(error);
    }

    await tokenB.approve(cpamm_dai_weth.address, APPROVED_TOKENS, { from: TOKEN_A_WHALE });

    await tokenA.approve(cpamm_dai_weth.address, APPROVED_TOKENS, { from: TOKEN_B_WHALE });
    await tokenB.approve(cpamm_dai_weth.address, APPROVED_TOKENS, { from: TOKEN_B_WHALE });

  }

  const swapTokens = async (tokenToSwap, swapper, amountToSwap = 10) => {
    const SWAP_AMOUNT = web3.utils.toWei(amountToSwap.toString() , "ether");
    try {
      //await cpamm_dai_weth.swap(TOKEN_A, SWAP_AMOUNT, { from: TOKEN_A_WHALE })
      await cpamm_dai_weth.swap(tokenToSwap, SWAP_AMOUNT, { from: swapper })
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
          //console.log(receipt.receipt.logs[0].args);        // Print all the results of emiting an Event

          //BN.isBN(<BN>);                                    // Validate if a variables is a BN
          //web3.utils.fromWei(String(<BN>)), "ether")        // Convert a BN to ether's unit

          //console.log(web3.utils.fromWei(String(receipt.receipt.logs[0].args.amountSwapped), "ether"));
          //console.log(receipt.events.Swap.returnValues);
      });
    } catch(error) {
      console.log(error);
    }
  }


  it("Adding & Removing liquidity from/to the CPAMM", async () => {

    // console.log(web3.utils.fromWei(await cpamm_dai_weth.getSharesPerProvider(TOKEN_A_WHALE), "ether"));

    const balancesBefore = await getWhalesBalances()
    showWhaleBalances(balancesBefore,"Balances before transfering tokens between the whales")

    // transfer tokenB to TOKEN_A_WHALE - transfer DAI
    await tokenB.transfer(TOKEN_A_WHALE, TOKEN_B_AMOUNT, { from: TOKEN_B_WHALE });

    // transfer tokenA to TOKEN_B_WHALE - transfer WETH
    await tokenA.transfer(TOKEN_B_WHALE, TOKEN_A_AMOUNT, { from: TOKEN_A_WHALE });

    const balancesAfter = await getWhalesBalances()
    showWhaleBalances(balancesAfter,"Balances after transfering tokens between the whales")

    const token0CPAMM = await cpamm_dai_weth.token0.call();
    console.log("Token 0", token0CPAMM); // 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2 = WETH <---> TOKEN_A = TOKEN0

    const token1CPAMM = await cpamm_dai_weth.token1.call();
    console.log("Token 1", token1CPAMM); // 0x6B175474E89094C44Da98b954EedeAC495271d0F = DAI  <---> TOKEN_B = TOKEN1
    
    const reservesBefore = await getCPAMMData(TOKEN_A_WHALE);
    showCPAMMData(reservesBefore,"Reserves before adding liquidity");

    console.log("Adding liquidity to the CPAMM from TOKEN_A_WHALE as a provider");
    await approveTokenSpender(TOKEN_A_AMOUNT);    // Approving cpamm contract to spend X number of tokens on behalf of the provider
    await cpamm_dai_weth.addLiquidity(TOKEN_A_AMOUNT,TOKEN_B_AMOUNT, { from: TOKEN_A_WHALE })

    const reservesAfterToken_A_WHALE = await getCPAMMData(TOKEN_A_WHALE);
    showCPAMMData(reservesAfterToken_A_WHALE,"Reserves after adding liquidity", TOKEN_A_WHALE);

    console.log("Adding liquidity to the CPAMM from TOKEN_B_WHALE as a provider");
    await cpamm_dai_weth.addLiquidity(TOKEN_A_AMOUNT,TOKEN_B_AMOUNT, { from: TOKEN_B_WHALE });

    const reservesAfterTOKEN_B_WHALE = await getCPAMMData(TOKEN_B_WHALE);
    showCPAMMData(reservesAfterTOKEN_B_WHALE,"Reserves after adding liquidity", TOKEN_B_WHALE);

    console.log("Executing a couple swaps before withdrawing the liquidity!");
    // transfer tokenB to TOKEN_A_WHALE - transfer DAI
    await tokenB.transfer(TOKEN_A_WHALE, TOKEN_B_AMOUNT, { from: TOKEN_B_WHALE });

    // transfer tokenA to TOKEN_B_WHALE - transfer WETH
    await tokenA.transfer(TOKEN_B_WHALE, TOKEN_A_AMOUNT, { from: TOKEN_A_WHALE });
    
    await approveTokenSpender(10);    // Approving cpamm contract to spend X number of tokens on behalf of the provider
    console.log("Swapping 10 WETH(TOKEN_A) as the TOKEN_WETH_WHALE");
    await swapTokens(TOKEN_A,TOKEN_A_WHALE);
    showCPAMMData(await getCPAMMData(TOKEN_A_WHALE),"Reserves after swapping 10 WETH as the TOKEN_WETH_WHALE", TOKEN_A_WHALE);

    await approveTokenSpender(10);    // Approving cpamm contract to spend X number of tokens on behalf of the provider
    console.log("Swapping 10 WETH(TOKEN_A) as the TOKEN_DAI_WHALE");
    await swapTokens(TOKEN_A,TOKEN_B_WHALE);
    showCPAMMData(await getCPAMMData(TOKEN_B_WHALE),"Reserves after swapping 10 WETH as the TOKEN_DAI_WHALE", TOKEN_B_WHALE);

    await approveTokenSpender(10);    // Approving cpamm contract to spend X number of tokens on behalf of the provider
    console.log("Swapping 10 DAI(TOKEN_B) as the TOKEN_WETH_WHALE");
    await swapTokens(TOKEN_B,TOKEN_A_WHALE);
    showCPAMMData(await getCPAMMData(TOKEN_A_WHALE),"Reserves after swapping 10 DAI as the TOKEN_WETH_WHALE", TOKEN_A_WHALE);

    await approveTokenSpender(20);    // Approving cpamm contract to spend X number of tokens on behalf of the provider
    console.log("Swapping 20 DAI(TOKEN_B) as the TOKEN_WETH_WHALE");
    await swapTokens(TOKEN_B,TOKEN_A_WHALE,20);
    showCPAMMData(await getCPAMMData(TOKEN_A_WHALE),"Reserves after swapping 10 WETH as the TOKEN_WETH_WHALE", TOKEN_A_WHALE);
    
    await approveTokenSpender(10);    // Approving cpamm contract to spend X number of tokens on behalf of the provider
    console.log("Swapping 10 DAI(TOKEN_B) as the TOKEN_DAI_WHALE");
    await swapTokens(TOKEN_B,TOKEN_B_WHALE);
    showCPAMMData(await getCPAMMData(TOKEN_B_WHALE),"Reserves after swapping 10 DAI as the TOKEN_DAI_WHALE", TOKEN_B_WHALE);


    /// ---------------------------------------------------------------------------------------- //
    // transfer tokenB to TOKEN_A_WHALE - transfer DAI
    await tokenB.transfer(TOKEN_A_WHALE, TOKEN_B_AMOUNT, { from: TOKEN_B_WHALE });

    await approveTokenSpender(20);    // Approving cpamm contract to spend X number of tokens on behalf of the provider

    console.log("Adding liquidity to the CPAMM from TOKEN_B_WHALE as a provider AFTER the SWAPS - It is expected that the transaction will be reverted");
    // <====> received the next error because the CPAMM can't take the given number of tokens to add more liquidity because the price would change
    // Error: Returned error: VM Exception while processing transaction: revert dy / dx != y / x ==> The price could change -- Reason given: dy / dx != y / x ==> The price could change.
    await expectRevert(
      cpamm_dai_weth.addLiquidity(TOKEN_A_AMOUNT,TOKEN_B_AMOUNT, { from: TOKEN_A_WHALE }),
      "dy / dx != y / x ==> The price could change -- Reason given: dy / dx != y / x ==> The price could change."
    )     
    
    /// ---------------------------------------------------------------------------------------- //
    console.log("TOKEN_A_WHALE (WETH_WHALE) withdraws all its liquidity");
    //let tokenA_WHALE_A_shares = web3.utils.fromWei(await cpamm_dai_weth.getSharesPerProvider(TOKEN_A_WHALE), "ether");

    const TOKEN_A_WHALE_SHARES = web3.utils.toWei(parseInt(web3.utils.fromWei(await cpamm_dai_weth.getSharesPerProvider(TOKEN_A_WHALE), "ether")).toString(),"ether");
    console.log("shares: ", TOKEN_A_WHALE_SHARES);
    //await cpamm_dai_weth.removeLiquidity(TOKEN_A_WHALE_SHARES)

    try {
      await cpamm_dai_weth.removeLiquidity(TOKEN_A_WHALE_SHARES, { from: TOKEN_A_WHALE })

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
          console.log("Withdraw Liquidity completed!");
          //console.log(receipt);                             // Print the entire receipt's transaction
          console.log(receipt.receipt.logs[0].args);        // Print all the results of emiting an Event

          //BN.isBN(<BN>);                                    // Validate if a variables is a BN
          //web3.utils.fromWei(String(<BN>)), "ether")        // Convert a BN to ether's unit

          console.log("Returned tokens 0: ", web3.utils.fromWei(String(receipt.receipt.logs[0].args.returnTokens0), "ether"));
          console.log("Returned tokens 1: ",web3.utils.fromWei(String(receipt.receipt.logs[0].args.returnTokens1), "ether"));
          //console.log(receipt.events.Swap.returnValues);
      });
    } catch(error) {
      console.log(error);
    }

    const reservesAfterRemovingLiquidityTOKEN_A_WHALE = await getCPAMMData(TOKEN_A_WHALE);
    showCPAMMData(reservesAfterRemovingLiquidityTOKEN_A_WHALE,"Reserves after TOKEN_A_WHALE removes all its liquidity", TOKEN_A_WHALE);
    const reservesAfterRemovingLiquidityTOKEN_B_WHALE = await getCPAMMData(TOKEN_B_WHALE);
    showCPAMMData(reservesAfterRemovingLiquidityTOKEN_B_WHALE,"Reserves after TOKEN_A_WHALE removes all its liquidity", TOKEN_B_WHALE);

    const finalWHALEBalances = await getWhalesBalances()
    showWhaleBalances(finalWHALEBalances,"Whales' balances after performing all the operations in the CPAMM (addingLiquidity, swapping and removingLiquidity");

  })

})