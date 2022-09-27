// contract's artifacts
const Uniswapv2Factory = artifacts.require("UniswapV2Factory");

//const feeAddress = "0x3782897C2aA7291b148d2C02BB54F7bC84982360";    -- Ganache

module.exports = async function (deployer) {
  //console.log(Uniswapv2Factory.bytecode)
  await deployer.deploy(Uniswapv2Factory, "0x3782897C2aA7291b148d2C02BB54F7bC84982360", {overwrite: false})
}