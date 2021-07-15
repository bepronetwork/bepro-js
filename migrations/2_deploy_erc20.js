const PredictionMarket = artifacts.require("PredictionMarket");
const ERC20PresetMinterPauser = artifacts.require("ERC20PresetMinterPauser");

module.exports = async function(deployer, network, accounts) {
  // NOTE: USE THIS ONLY FOR DEV PURPOSES!!
  await deployer.deploy(ERC20PresetMinterPauser, "Polkamarkets", "POLK");
  const token = await ERC20PresetMinterPauser.deployed();
  await token.mint('0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1', '100000000000000000000000000');
}
