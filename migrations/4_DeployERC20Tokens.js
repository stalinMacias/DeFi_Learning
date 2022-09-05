// contract's artifacts
const DAI = artifacts.require("DAI");
const HEMI = artifacts.require("HEMI");

module.exports = async function(deployer) {
  await deployer.deploy(DAI, {overwrite: false})
  await deployer.deploy(HEMI, {overwrite: false})
}