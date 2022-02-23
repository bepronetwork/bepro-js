const Achievements = artifacts.require("Achievements");

module.exports = async function(deployer) {
  await deployer.deploy(Achievements);
};
