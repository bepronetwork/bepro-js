const PredictionMarket = artifacts.require("PredictionMarket");

module.exports = async function(deployer, network, accounts) {
  await deployer.deploy(PredictionMarket);
};
