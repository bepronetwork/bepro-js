"use strict"

const w3utils = web3.utils;
const PredictionMarket = artifacts.require("PredictionMarket");

module.exports = function(deployer, network, accounts) {
  deployer.deploy(PredictionMarket);
};
