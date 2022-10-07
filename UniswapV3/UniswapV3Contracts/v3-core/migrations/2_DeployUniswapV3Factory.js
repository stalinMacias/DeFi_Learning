/*
constructor()  <-> No parameters required to deploy the UniswapV3Factory contract
*/

// contract's artifacts
const UniswapV3Factory = artifacts.require("UniswapV3Factory");

module.exports = async function (deployer) {
  await deployer.deploy(UniswapV3Factory, {gas: 10000000000})
}