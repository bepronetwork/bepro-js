const RealitioERC20 = artifacts.require("RealitioERC20");

module.exports = async function(deployer) {
  await deployer.deploy(RealitioERC20);
};
