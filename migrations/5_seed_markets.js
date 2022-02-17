const PredictionMarket = artifacts.require("PredictionMarket");
const realitioLib = require('@reality.eth/reality-eth-lib/formatters/question');
const web3 = require('web3');

module.exports = async function(deployer) {
  const predictionMarket = await PredictionMarket.deployed();

  const markets = [
    {
      name: 'Will Bitcoin price be above $100,000 by January 1st 2022?',
      outcomes: ['Yes', 'No'],
      category: 'Crypto;Bitcoin',
      image: 'QmXUiapNZUbxfWpNYMtbT8Xpyk4EdF6gKWa7cw8SBX5gm9',
      closesAt: 1640995200,
    },
    {
      name: 'Will PSG win the champions league',
      outcomes: ['Yes', 'No'],
      category: 'Sports;Football',
      image: 'QmVbL7tKGeJUcv7KCMYSmz961JdzeMnVAoicnMqNSjyReh',
      closesAt: 1653782400,
    },
    {
      name: 'Will Ethereum price be above $10,000 by January 1st 2022?',
      outcomes: ['Yes', 'No'],
      category: 'Crypto;Ethereum',
      image: 'QmQMWVzqkXrizpiLFqGLvx6ruWzTWUGiUpP2r26jVtDoqT',
      closesAt: 1640995200,
    },
    {
      name: 'Hello world',
      outcomes: ['Yes', 'No'],
      category: 'Foo;Bar',
      image: 'QmRufywuLNzd7xVUwRzp3wBFnFUJ1EmzVH1R5Hq9xMWfkX',
      closesAt: new Date().getTime() + 300, // expiring 5 minutes after creation
    },
  ]

  for (const market of markets) {
		const question = realitioLib.encodeText('single-select', market.name, market.outcomes, market.category);

    await predictionMarket.createMarket(
      question,
      market.image,
      market.closesAt,
      '0x000000000000000000000000000000000000dead',
      2,
      { value: '10000000000000000' }
    );
  }
};
