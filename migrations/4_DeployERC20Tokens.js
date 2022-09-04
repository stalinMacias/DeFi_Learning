// contract's artifacts
const DAI = artifacts.require("DAI");
const HEMI = artifacts.require("HEMI");

module.exports = async function(deployer) {
  await deployer.deploy(DAI)
  await deployer.deploy(HEMI)
}