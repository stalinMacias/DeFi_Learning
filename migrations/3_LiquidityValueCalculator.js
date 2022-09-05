// contract's artifacts
const LiquidityValueCalculator = artifacts.require("LiquidityValueCalculator");

//const FactoryContractAddress = "0xC608F0718beA3563605aa652589767Cb35fcD05D"

module.exports = async function (deployer) {
  await deployer.deploy(LiquidityValueCalculator, "0xC608F0718beA3563605aa652589767Cb35fcD05D")
}