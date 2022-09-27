const common = require('./utils/common.js')
const OWNER_KEYS = process.env.OWNER_KEYS || ""
// Token's ABIs
const DAI = require('./contracts/DAI.json')
const HEMI = require('./contracts/HEMI.json')

async function init () {
  console.log("Running in the init() function")
  let { newConnectionAddress } = await common.initializeConnection(OWNER_KEYS)
  // Assign the above newConnectionAddress in the ownerAddres variable - This allows to create new connections for different users later in the code
  const ownerAddress = newConnectionAddress

  const { web3js } = await common.getWeb3Object();
  console.log("ownerAddress ", ownerAddress);

  const dai = await common.getContract(web3js,DAI)
  //const daiAddress = dai._address
  //console.log("dai methods: ", dai.methods);

  const hemi = await common.getContract(web3js,HEMI);
  
  return { ownerAddress, web3js, dai, hemi }
}

(async () => {
  const { ownerAddress, web3js, dai, hemi } = await init()
  process.on( 'SIGINT', () => {
    console.log('Calling precess.exit()')
    process.exit( );
  })

  const amount = 100000; // 100k

  // Transaction to mint new DAI tokens
  let mintNewTokens = await dai.methods.faucet(ownerAddress,web3js.utils.toWei(amount.toString(), "ether"));

  // Signing the transaction as the Owner
  //let signedTransaction  = await web3js.eth.accounts.signTransaction(options, OWNER_KEYS);
  mintNewTokensSignedTransaction  = await web3js.eth.accounts.signTransaction(await common.generateTransactionsOptions(mintNewTokens, ownerAddress, web3js), OWNER_KEYS);
  //console.log("mintNewTokensSignedTransaction: ", mintNewTokensSignedTransaction);

  // When sending transactions to a public blockchain the transaction must be signed before actually sending it    <---> sendSignedTransaction(signedTrasaction.rawTransaction)
  console.log("Sending the signed transaction to mint new DAI Tokens");
  await common.sendingSignedTransactions(mintNewTokensSignedTransaction, web3js, "Calling the faucet() method from the DAI contract o mint new tokens")
  

  // Transaction to mint new HEMI tokens
  mintNewTokens = await hemi.methods.faucet(ownerAddress,web3js.utils.toWei(amount.toString(), "ether"));

  // Signing the transaction as the Owner
  //let signedTransaction  = await web3js.eth.accounts.signTransaction(options, OWNER_KEYS);
  mintNewTokensSignedTransaction  = await web3js.eth.accounts.signTransaction(await common.generateTransactionsOptions(mintNewTokens, ownerAddress, web3js), OWNER_KEYS);
  //console.log("mintNewTokensSignedTransaction: ", mintNewTokensSignedTransaction);

  // When sending transactions to a public blockchain the transaction must be signed before actually sending it    <---> sendSignedTransaction(signedTrasaction.rawTransaction)
  console.log("Sending the signed transaction to mint new HEMI Tokens");
  await common.sendingSignedTransactions(mintNewTokensSignedTransaction, web3js, "Calling the faucet() method from the HEMI contract o mint new tokens")

  // Sending an unsigned transaction - Works for Ganache but not for public blockchains
  //callerContract.methods.updateEthPrice().send({ from: clientAddress, gasLimit: 100000 })

})()
