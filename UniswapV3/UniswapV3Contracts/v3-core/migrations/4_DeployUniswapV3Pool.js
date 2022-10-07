/*
constructor()  <-> No parameters required to deploy the UniswapV3Pool contract
*/

// contract's artifacts
const UniswapV3Pool = artifacts.require("UniswapV3Pool");

module.exports = async function (deployer) {
  await deployer.deploy(UniswapV3Pool, {overwrite: false})
}