require('dotenv').config()

// Ganache Addresses

const DAI = "0x1cb527Bb2e86272694019D200B7845A7c3ceA6Ca"
//const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
//const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7"
const WETH = "0xf25812889146372f9614c499228620EB7017A569"
const HEMI = "0xdfb0D23C696f7349B382fDac91dBEB4C4142e123"

//const WETH_10 = "0xf4BB2e28688e89fCcE3c0580D37d36A7672E8A9F"

//const DAI_WHALE = process.env.DAI_WHALE
const DAI_WHALE = "0x3782897C2aA7291b148d2C02BB54F7bC84982360" // The account #2 from ganache is the DAI_WHALE
//const USDC_WHALE = process.env.USDC_WHALE
//const USDT_WHALE = process.env.USDT_WHALE
//const WETH_WHALE = process.env.WETH_WHALE
const WETH_WHALE = "0x29E3250e4bfc4939D7037BB7D670fAD932fEF9E5" // The account #4 from ganache is the WETH_WHALE
//const HEMI_WHALE = process.env.HEMI_WHALE
const HEMI_WHALE = "0x0679DaeF7C3Ea0761e55E1cf0704e0cb002cfCa8" // The account #3 from ganache is the HEMI_WHALE

// compound
//const CDAI = "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643"
//const CUSDC = "0x39AA39c021dfbaE8faC545936693aC917d5E7563"
//const CWBTC = "0xccF4429DB6322D5C611ee964527D42E5d685DD6a"
//const CETH = "0x4Ddc2D193948926D02f9B1fE9e1daa0718270ED5"

module.exports = {
  DAI,
  WETH,
  HEMI,
  DAI_WHALE,
  WETH_WHALE,
  HEMI_WHALE,
}


// Goerli Addresses