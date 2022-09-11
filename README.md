> # Ganache Contract's Information

> ## Uniswap's Contract
Uniswap Factory Contract - 0xC608F0718beA3563605aa652589767Cb35fcD05D

Liquidity Value Contract - 0x2c24FD079475b4430bbCE2c6c5c8554c17e79d5b

UniswapV2Router Contract - 

> ## ERC20 Tokens
DAI ERC20 Token Contract  - 0x1cb527Bb2e86272694019D200B7845A7c3ceA6Ca

HEMI ERC20 Token Contract - 0xdfb0D23C696f7349B382fDac91dBEB4C4142e123

> ## Pair Tokens
DAI/HEMI PAIR CONTRACT 	  - 0x94472BE834E91EB40B0128b1a44c84d23Acea185

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
