const PredictionMarket = artifacts.require("PredictionMarket");
const {
  FEE,
  TOKEN,
  REQUIRED_BALANCE,
  REALITIO_ADDRESS,
  REALITIO_TIMEOUT,
} = process.env;


module.exports = async function(deployer) {
  await deployer.deploy(
    PredictionMarket,
    FEE, // fee
    TOKEN, // token
    REQUIRED_BALANCE, // requiredBalance
    REALITIO_ADDRESS, // realitioAddress
    REALITIO_TIMEOUT, // realitioTimeout,
  );
};
