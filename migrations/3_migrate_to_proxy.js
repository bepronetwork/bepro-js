const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const PredictionMarket = artifacts.require("PredictionMarket");

module.exports = async function(deployer, network, accounts) {
  const instance = await deployProxy(PredictionMarket, [], { deployer });
  const upgraded = await upgradeProxy(instance.address, PredictionMarket);
};
