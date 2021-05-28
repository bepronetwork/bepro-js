import Application from './build/Application';
import DexStorage from './src/utils/IPFS';
import ERC20Contract from './build/models/ERC20/ERC20Contract';
import ExchangeContract from './build/models/PredictionMarkets/ExchangeContract';
import StakingContract from './build/models/Staking/StakingContract';
import ERC20TokenLock from './build/models/ERC20/ERC20TokenLock';
import ERC721Collectibles from './build/models/ERC721/ERC721Collectibles';
import ERC721Standard from './build/models/ERC721/ERC721Standard';

export {
	Application,
	DexStorage,
	ERC20Contract,
	ExchangeContract,
	StakingContract,
	ERC20TokenLock,
	ERC721Collectibles,
	ERC721Standard
};
