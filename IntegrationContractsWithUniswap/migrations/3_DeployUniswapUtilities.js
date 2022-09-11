// contract's artifacts
const UniswapUtilities = artifacts.require("UniswapUtilities");

module.exports = async function (deployer) {
  await deployer.deploy(UniswapUtilities)
}