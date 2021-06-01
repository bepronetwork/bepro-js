import Application from './build/Application';
import DexStorage from './build/utils/IPFS';
import Network from './build/models/bepro/Network';
import ERC20Contract from './build/models/ERC20/ERC20Contract';
import StakingContract from './build/models/Staking/StakingContract';
import ERC20TokenLock from './build/models/ERC20/ERC20TokenLock';
import ERC721Collectibles from './build/models/ERC721/ERC721Collectibles';
import ERC721Standard from './build/models/ERC721/ERC721Standard';

export {
	Application,
	DexStorage,
	ERC20Contract,
	Network,
	StakingContract,
	ERC20TokenLock,
	ERC721Collectibles,
	ERC721Standard
};
