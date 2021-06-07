const { deployProxy, upgradeProxy } = require('@openzeppelin/truffle-upgrades');

const PredictionMarket = artifacts.require("PredictionMarket");

module.exports = async function(deployer, network, accounts) {
  const instance = await PredictionMarket.deployed();
  const upgraded = await upgradeProxy(instance.address, PredictionMarket);
};
