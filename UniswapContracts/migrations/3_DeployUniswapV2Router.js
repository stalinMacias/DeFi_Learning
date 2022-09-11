// contract's artifacts
const UniswapV2Router02 = artifacts.require("UniswapV2Router02");

//const factoryAddress = "0xC608F0718beA3563605aa652589767Cb35fcD05D";

module.exports = async function (deployer) {
  //console.log(UniswapV2Router02.bytecode)
  await deployer.deploy(UniswapV2Router02, "0xC608F0718beA3563605aa652589767Cb35fcD05D")
}