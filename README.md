> # Ganache Contract's Information

> ## Uniswap's Contract
Uniswap Factory Contract - 0xC608F0718beA3563605aa652589767Cb35fcD05D

Liquidity Value Contract - 0x2c24FD079475b4430bbCE2c6c5c8554c17e79d5b   // The example from Uniswap documentation ...

UniswapV2Router Contract - 0x19326b7F6d45e40fDb04C2Cd7c47147c6FA18D92 

UniswapLiquidity Contract - 0xE39BC97a6a2fe094AC4673f26EbE0a1Ff6E24d79  // Add and Remove liquidity to/from token pools

UniswapOptimalContract - 0x2620836AD6c7939f005231BA8EC7Ca1c9a16fc3b  // Add all the tokensA by calculating and swapping the required tokensB and then adding the liquidity to the liquidity pools and make sure the pool ratio is preserved

> ## Uniswap's Utilities Contracts - Created by me using the uniswap interfaces
Uniswap Utilities - 0xc77adb7F951F8262c04c272A04537b6C6f011caa


> ## ERC20 Tokens

WETH Contract = 0xf25812889146372f9614c499228620EB7017A569

DAI ERC20 Token Contract  - 0x1cb527Bb2e86272694019D200B7845A7c3ceA6Ca

HEMI ERC20 Token Contract - 0xdfb0D23C696f7349B382fDac91dBEB4C4142e123

> ## Pair Tokens - Token Pools
DAI/HEMI PAIR CONTRACT 	  - 0x94472BE834E91EB40B0128b1a44c84d23Acea185

DAI/WETH PAIR CONTRACT    - 0xc55Cb2D7239920F21d647108fa304707BedC5478

HEMI/WETH PAIR CONTRACT   - 0x36bDb2Bf0572838df9eF6db8CD3aE0661E78a1A3

> ## Accounts

DAI_WHALE = "0x3782897C2aA7291b148d2C02BB54F7bC84982360"  // The account #2 from ganache is the DAI_WHALE

WETH_WHALE = "0x29E3250e4bfc4939D7037BB7D670fAD932fEF9E5" // The account #4 from ganache is the WETH_WHALE

HEMI_WHALE = "0x0679DaeF7C3Ea0761e55E1cf0704e0cb002cfCa8" // The account #3 from ganache is the HEMI_WHALE

> ------------------
> ------------------
> ------------------

> ## Log when creating the DAI/HEMI pair for the first time:

Sending the signed transaction to create a new pair of tokens using the Uniswap v2 Factory contract
Sending the signed transaction
txHash 

*  0x20180d93cdf951d0dccdb0dd47941db80b09f219f9526a41ca21d1cd2959fa28

Transaction completed! -  Calling the createPair() method from the UniswapV2Factory contract
Transaction completed! -  Calling the createPair() method from the UniswapV2Factory contract
{ transactionHash:
   '0x20180d93cdf951d0dccdb0dd47941db80b09f219f9526a41ca21d1cd2959fa28',
  transactionIndex: 0,
  blockHash:
   '0x9569e198968bc55f23d759fc60e4f43a44d3b9bc84beb3f571107cb12cb52b66',
  blockNumber: 1371,
  from: '0x98a906664d1045c64ab61d644ccbacf168a67d5c',
  to: '0xc608f0718bea3563605aa652589767cb35fcd05d',
  gasUsed: 2513376,
  cumulativeGasUsed: 2513376,
  contractAddress: null,
  logs:
   [ { logIndex: 0,
       transactionIndex: 0,
       transactionHash:
        '0x20180d93cdf951d0dccdb0dd47941db80b09f219f9526a41ca21d1cd2959fa28',
       blockHash:
        '0x9569e198968bc55f23d759fc60e4f43a44d3b9bc84beb3f571107cb12cb52b66',
       blockNumber: 1371,
       address: '0xC608F0718beA3563605aa652589767Cb35fcD05D',
       data:
        '0x00000000000000000000000094472be834e91eb40b0128b1a44c84d23acea1850000000000000000000000000000000000000000000000000000000000000001',
       topics: [Array],
       type: 'mined',
       id: 'log_ca6c03a6' } ],
  status: true,
  logsBloom:
   '0x00000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000100000100000000000000000000000000000000000000000000000008000000000000000000000000010000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000200000000082000000000000000000000000000000000000001000000' }

> ------------------
> ------------------
> ------------------

> ## Log when creating the DAI/HEMI pair after it was already created: 

(node:2197) UnhandledPromiseRejectionWarning: Error: Returned error: VM Exception while processing transaction: revert UniswapV2: PAIR_EXISTS

> ------------------
> ------------------
> ------------------
