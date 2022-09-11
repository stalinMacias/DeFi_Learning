// contract's artifacts
const UniswapV2Router02 = artifacts.require("UniswapV2Router02");
const fs = require('fs')
const path = require('path');

//const factoryAddress = "0xC608F0718beA3563605aa652589767Cb35fcD05D"     --- Ganache
//const wethTokenContract = "0xf25812889146372f9614c499228620EB7017A569"  --- Ganache

module.exports = async function (deployer) {
  //console.log(UniswapV2Router02.bytecode)
  await deployer.deploy(UniswapV2Router02, "0xC608F0718beA3563605aa652589767Cb35fcD05D", "0xf25812889146372f9614c499228620EB7017A569")
  const metaDataFile = path.join(__dirname, "../contracts/builds/UniswapV2Router02.json")
  const metaData = require(metaDataFile)
  metaData.networks[deployer.network_id] = {}
  metaData.networks[deployer.network_id].address = UniswapV2Router02.address
  fs.writeFileSync(metaDataFile, JSON.stringify(metaData, null, 4))

  


}