pragma solidity >=0.6.0 <0.8.0;
//pragma solidity =0.7.6;
//pragma abicoder v2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Context.sol";

import "@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol";
import '@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol';
import '@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol';

//import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
//import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "../../utils/Ownable.sol";
import "../../utils/ReentrancyGuardOptimized.sol";
import "../../math/SafePercentMath.sol";
import "../../uniswap/UniswapV3Router.sol";

/// @title LoopHole Finance smart contract
contract Loophole is Ownable, Context, ReentrancyGuardOptimized, UniswapV3Router {
    using SafeMath for uint256;
    using SafePercentMath for uint256;
    
    //mapping(address => PoolInfo) pools; // pool exists toggles.
    //// Add the library methods
    //using EnumerableSet for EnumerableSet.AddressSet;
    //EnumerableSet.AddressSet private poolTokensList;
    
    // hundred constant used in percentage calculations as parts/100
    uint256 private constant HUNDRED = 100;
    
    // LOOP POOL indx in the pools list
    uint256 private constant LOOP_POOL_INDEX = 0;

    /// @notice Liquidity Provider reward token
    address public lpToken;
    /// @notice amount of LP tokens to reward per block
    uint256 public lpTokensPerBlock;

    //uint256 private c;

    // Main Pools and Loop Pool
    // INFO | POOL VARIABLES
    struct PoolInfo {
        address token;             // Address of staked token contract.
        uint256 allocPoint;       // How many allocation points assigned to this pool, LP tokens to distribute per block to this pool.
        //uint256 taxRate;          // Rate at which the LP token is taxed.
        uint256 lastRewardBlock;  // Last block number that LP tokens distribution occurs.
        //uint256 accLPtokensPerShare;  // Accumulated LP tokens per share

        uint256 totalPool;                              // total staked tokens in the pool.
        uint256 entryStakeTotal;                        // total tokens entered into a pool.
        uint256 totalDistributedPenalty;                // total tokens distributed from the exit penalty.
    }

    // maps the amount each user has staked/put into a pool as pool_id-user-amount
    mapping(uint256 => mapping(address => uint256)) private entryStakeUser;

    // maps the amount each user has staked/put into a pool as pool_id-user-amount
    // but adjusted so he can’t benefit from past token distribution.
    mapping(uint256 => mapping(address => uint256)) private entryStakeAdjusted;

    
    // LOOP pool is on index 0, the rest are MAIN pools
    PoolInfo[] private poolInfo;
    //mapping (uint256 => mapping (address => UserInfo)) private userInfo; //custom: poolId-user-UserInfo
    uint256 public totalAllocPoint = 0; // automated track of total allocated points of all pools = sum of all pools points
    uint256 public startBlock;          // start block for liquidity mining LP tokens
    //uint256 public bonusEndBlock;
    mapping (address => bool) public poolExists; //mapping for existent pools by given token address.

    // LOOP pool
    //PoolInfo public loopPoolInfo;

    // MAIN pool type exit penalty, applied to user current staked amount as e.g 20 for 20 %
    uint256 private exitPenalty;

    // LOOP pool exit penalty, applied to user current staked amount + profit from pool distribution, as e.g 20 for 20 %
    uint256 private exitPenaltyLP;
    
    // Deposit event when user stakes tokens into a pool
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    
    // Withdraw event when user exits specific amount from staking pool
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
    //event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);



    /// @notice constructor
    /// @param _swapRouter Uniswap SwapRouter address to access the market for tokens exchange
    /// @param _lpToken Liquidity Provider token address as IERC20
    /// @param _lpTokensPerBlock LP tokens amount reward per mining block
    /// @param _startBlock Start block for mining reward
    /// @param _exitPenalty Exit penalty from main pool, for example 20 for 20 %
    /// @param _exitPenaltyLP Exit penalty from loop pool, for example 20 for 20 %
    constructor(
        //IUniswapV3Pool _uniswapV3
        ISwapRouter _swapRouter
        , IERC20 _lpToken
        , uint256 _lpTokensPerBlock
        , uint256 _startBlock
        //, uint256 _bonusEndBlock
        , uint256 _exitPenalty
        , uint256 _exitPenaltyLP
    ) UniswapV3Router(_swapRouter) {
        
        lpToken = address(_lpToken);
        lpTokensPerBlock = _lpTokensPerBlock;
        startBlock = _startBlock;
        //bonusEndBlock = _bonusEndBlock;

        exitPenalty = _exitPenalty; //20; // default value is 20% as 20
        exitPenaltyLP = _exitPenaltyLP; //10; // default value is 10% as 10

        // zero is poolAllocPoint for LOOP pool, this is a LP tokens reward pool
        add(_lpToken, 0);
    }

    /*function f1(address tokenAddress, uint256 amount) external nonReentrant {
        c = 1;
    }

    function f2(address tokenAddress, uint256 amount) external nonReentrant {
        c = 2;
    }

    function f3(address tokenAddress, uint256 amount) external nonReentrant {
        c = 3;
    }*/

    /// Modifier helper functions, used to reduse/optimize contract bytesize
    
    modifier requireMainPool(uint256 pid) {
        _requireMainPool(pid);
        _;
    }

    // require given pool id to be MAIN pool index, different then LOOP pool index
    function _requireMainPool(uint256 pid) internal pure {
        require(pid != LOOP_POOL_INDEX, "LOOP pool index");
    }

    /// Features

    // Main Pools and Loop Pool
    /// @notice stake tokens on given pool id
    /// @param pid Pool id
    /// @param amount The token amount user wants to stake to the pool.
    function stake(uint256 pid, uint256 amount) external {
        //updatePool(pid);

        PoolInfo storage pool = poolInfo[pid];
        address user = _msgSender();
        
        //TODO: ???
        // calculate LP tokens as share of the pool the user stakes into
        // //amount / pool.totalPool * pool.totalPoolLP;
        //uint256 lpShareTokens = amount.mul(pool.totalPoolLP).div(pool.totalPool);
        //pool.totalPoolLP = pool.totalPoolLP.add(lpShareTokens);
        //IERC20(lpToken).mint(user, lpShareTokens);
        //???

        //uint256 prevAdjustedEntryStake = entryStakeAdjusted[user];
        //uint256 newEntryStake = amount.mul(entryStakeTotal).div(totalPool); ///??? div by 0 when totalPool = 0
        //entryStakeAdjusted[user] = prevAdjustedEntryStake.add(newEntryStake);
        //// entryStakeTotal = entryStakeTotal.add(entryStakeAdjusted[user].sub(prevAdjustedEntryStake));
        //entryStakeTotal = entryStakeTotal.add(newEntryStake);
        //entryStakeUser[user] = entryStakeUser[user].add(amount);
        //totalPool = totalPool.add(amount);

        // check div by 0 when totalPool = 0
        uint256 newEntryStake;
        if (pool.totalPool == 0 || pool.entryStakeTotal == 0)
            newEntryStake = amount;
        else newEntryStake = amount.mul(pool.entryStakeTotal).div(pool.totalPool);
        entryStakeAdjusted[pid][user] = entryStakeAdjusted[pid][user].add(newEntryStake);
        pool.entryStakeTotal = pool.entryStakeTotal.add(newEntryStake);
        entryStakeUser[pid][user] = entryStakeUser[pid][user].add(amount);
        pool.totalPool = pool.totalPool.add(amount);

        //if (amount > 0) { // if adding more
        //require(IERC20(pool.token).transferFrom(user, address(this), amount), "transferFrom failed");
        TransferHelper.safeTransferFrom(pool.token, user, address(this), amount);
        //}
        
        //user.rewardDebt = user.amount.mul(pool.accLPtokensPerShare); //.div(1e12);
        emit Deposit(user, pid, amount);
    }

    /// @notice add/enable new pool, only owner mode
    /// @dev ADD | NEW TOKEN POOL
    /// @param token Token address as IERC20
    /// @param allocPoint Pool allocation point/share distributed to this pool from mining rewards
    function add(
        IERC20 token
        , uint256 allocPoint // when zero it is the LOOP pool
        //, bool withUpdate
    ) public onlyOwner {
        // require new pool only
        require(poolExists[address(token)] == false, "Token pool exists");

        //if (withUpdate) {
        //    massUpdatePools();
        //}
        uint256 lastRewardBlock = getBlockNumber() > startBlock ? getBlockNumber() : startBlock;
        totalAllocPoint = totalAllocPoint.add(allocPoint);
        poolInfo.push(PoolInfo({
            token: address(token),
            allocPoint: allocPoint,
            totalPool: 0,
            entryStakeTotal: 0,
            totalDistributedPenalty: 0,
            lastRewardBlock: lastRewardBlock
            //accLPtokensPerShare: 0
        }));

        poolExists[address(token)] = true;
    }

    /// @notice update pool allocation point/share
    /// @dev UPDATE | ALLOCATION POINT
    /// @param pid Pool id
    /// @param allocPoint Set allocation point/share for pool id
    /// @param withUpdate Update all pools and distribute mining reward for all
    function set(uint256 pid, uint256 allocPoint, bool withUpdate) external requireMainPool(pid) onlyOwner {
        if (withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[pid].allocPoint).add(allocPoint);
        poolInfo[pid].allocPoint = allocPoint;
    }
    
    /// @notice user exit staking amount from main pool, require main pool only
    /// @param pid Pool id
    /// @param amount The token amount user wants to exit/unstake from the pool.
    /// @return net tokens amount sent to user address
    function exit(uint256 pid, uint256 amount) external requireMainPool(pid) nonReentrant returns (uint256) {
        updatePool(pid);

        PoolInfo storage pool = poolInfo[pid];
        address user = _msgSender();
        
        //NOTE: due to rounding margin error the contract might have more tokens than specified by pool variables
        //NOTE: for example 21 tokens, 50% of it is 10 as we work with integers, 1 token is still in the contract
        uint256 exitPenaltyAmount = amount.mul(exitPenalty).div(HUNDRED).div(2);
        pool.totalDistributedPenalty = pool.totalDistributedPenalty.add(exitPenaltyAmount);
        
        uint256 userCurrentStake = currentStake(pid, user);
        //uint256 exitAmount = amount.div(userCurrentStake).mul(pool.entryStakeAdjusted[user]);
        uint256 exitAmount = amount.mul(entryStakeAdjusted[pid][user]).div(userCurrentStake);
        pool.entryStakeTotal = pool.entryStakeTotal.sub(exitAmount);
        entryStakeAdjusted[pid][user] = entryStakeAdjusted[pid][user].sub(exitAmount);
        entryStakeUser[pid][user] = entryStakeUser[pid][user].sub(amount);
        
        //NOTE: x_tokens = amount * (exitPenalty / 2)
        //NOTE: x_tokens go back into the pool for distribution to the rest of the users
        //NOTE: the other x_tokens go to exchange for LP tokens
        //totalPool = totalPool - amount * (1 - exitPenalty / 2);
        uint256 afterExitPercent = HUNDRED.sub(exitPenalty.div(2));
        pool.totalPool = pool.totalPool.sub(amount.mul(afterExitPercent).div(HUNDRED)); //auto added what went into totalDistributedPenalty
        uint256 amountLP = swapCollectedPenalty(pool.token, exitPenaltyAmount);
        addRewardToLoopPool(amountLP);

        uint256 withdrawAmount = amount.mul(HUNDRED.sub(exitPenalty)).div(HUNDRED); //amount * (1 - exitPenalty);
        //require(pool.token.transfer(user, withdrawAmount), "transfer failed");
        TransferHelper.safeTransfer(pool.token, user, withdrawAmount);
        emit Withdraw(user, pid, withdrawAmount);

        return withdrawAmount;
    }

    /// @notice User exit staking amount from LOOP pool, require LOOP pool only
    /// @param amount The token amount user wants to exit/unstake from the pool.
    /// @return net tokens amount sent to user address
    function exit(uint256 amount) external returns (uint256) {
        uint256 pid = LOOP_POOL_INDEX;
        //updatePool(pid);

        PoolInfo storage pool = poolInfo[pid];
        address user = _msgSender();
        
        uint256 userCurrentStake = currentStake(pid, user);
        ////TODO: is this required???: require(userCurrentStake >= amount, "exit amount too high");

        uint256 exitAmount = amount.mul(entryStakeAdjusted[pid][user]).div(userCurrentStake);
        pool.entryStakeTotal = pool.entryStakeTotal.sub(exitAmount);
        entryStakeAdjusted[pid][user] = entryStakeAdjusted[pid][user].sub(exitAmount);
        entryStakeUser[pid][user] = entryStakeUser[pid][user].sub(amount);
        pool.totalPool = pool.totalPool.sub(amount);
        //NOTE: x_tokens = amount * exitPenaltyLP / 2
        //NOTE: x_tokens go back into the LOOP pool for distribution to the rest of the users
        //NOTE: the other x_tokens are burnt
        uint256 exitPenaltyAmount = amount.mul(exitPenaltyLP).div(HUNDRED).div(2); //amount * exitPenaltyLP / 2
        liquidityMining(exitPenaltyAmount); // LP tokens back to Liquidity Mining available for mining rewards
        burn(exitPenaltyAmount);
        
        uint256 withdrawAmount = amount.mul(HUNDRED.sub(exitPenaltyLP)).div(HUNDRED); //amount * (1 - exitPenaltyLP);
        //require(pool.token.transfer(user, withdrawAmount), "transfer failed");
        TransferHelper.safeTransfer(pool.token, user, withdrawAmount);
        emit Withdraw(user, pid, withdrawAmount);

        return withdrawAmount;
    }

    /// @notice current total user stake in a given pool
    /// @param pid Pool id
    /// @param user The user address
    /// @return stake tokens amount
    function currentStake(uint256 pid, address user) public view returns (uint256) {
        PoolInfo storage pool = poolInfo[pid];
        return pool.totalPool.mul(entryStakeAdjusted[pid][user]).div(pool.entryStakeTotal);
    }

    /// @notice percentage of how much a user has earned so far from the other users exit, would be just a statistic
    /// @param pid Pool id
    /// @param user The user address
    /// @return earnings percent as integer
    function earnings(uint256 pid, address user) external view returns (uint256) {
        //(((currentStake(user) * (1 - exitPenalty)) / entryStakeUser(user)) - 1 ) * 100
        uint256 oneMinusExitPenalty = HUNDRED.sub(exitPenalty);
        //uint256 t1 = currentStake(pid, user).mul(oneMinusExitPenalty).div(HUNDRED).mul(HUNDRED).div(entryStakeUser[pid][user]);
        uint256 t1 = currentStake(pid, user).mul(oneMinusExitPenalty).div(entryStakeUser[pid][user]);
        return t1.sub(HUNDRED);
    }

    // Main Pools
    /// @notice swap collected penalty from main pools exits for LOOPhole (LP) tokens in the open market
    /// @param tokenIn Token address we exchange for LP tokens
    /// @param amount The tokens amount to be exchanged for LP tokens
    /// @return amountLP Amount of LP tokens
    function swapCollectedPenalty(address tokenIn, uint256 amount) internal returns (uint256 amountLP) {
        //uniswap call to exchange given tokens for LP tokens
        //TODO: provide 'amountOutMinimum' as external argument for security reasons
        uint256 amountOutMinimum = 0;
        amountLP = swapExactInputSingle(tokenIn, poolInfo[LOOP_POOL_INDEX].token, amount, amountOutMinimum);
    }

    /// @notice send LP tokens back to Liquidity Mining available for mining rewards.
    /// @dev amount is the LP tokens
    /// @param amount LP tokens
    function liquidityMining(uint256 amount) internal {
        //TODO: ... something else needed like send tokens where?
    }

    // Loop Pool
    /// @notice adds to the LOOP pool the amount in LOOPhole tokens corresponding to half the penalty for leaving the main pools.
    /// @param amount Tokens amount to add to the LOOP pool
    function addRewardToLoopPool(uint256 amount) internal {
        poolInfo[LOOP_POOL_INDEX].totalDistributedPenalty = poolInfo[LOOP_POOL_INDEX].totalDistributedPenalty.add(amount);
        poolInfo[LOOP_POOL_INDEX].totalPool = poolInfo[LOOP_POOL_INDEX].totalPool.add(amount);
    }

    /// @notice burn LP tokens
    /// @param amount Amount of LP tokens to burn
    function burn(uint256 amount) internal {
        //TODO:
        //require(IERC20(lpToken).burn(address(this), amount), "burn failed");
    }

    /// @notice get blocks range given two block numbers, usually computes blocks elapsed since last mining reward block.
    /// @dev RETURN | BLOCK RANGE SINCE LAST REWARD AS REWARD MULTIPLIER | INCLUDES START BLOCK
    /// @param from block start
    /// @param to block end
    /// @return blocks count
    function getBlocksFromRange(uint256 from, uint256 to) public view returns (uint256) {
        from = from >= startBlock ? from : startBlock;
        return to.sub(from);
    }

    /// @notice update all pools for mining rewards
    /// @dev UPDATE | (ALL) REWARD VARIABLES | BEWARE: HIGH GAS POTENTIAL
    function massUpdatePools() public {
        uint256 length = poolInfo.length;
        // only main pools, 0 index is for LOOP pool
        for (uint256 pid = 1; pid < length; ++pid) {
            updatePool(pid);
        }
    }

    /// @notice Update pool to trigger LP tokens reward since last reward mining block
    /// @dev UPDATE | (ONE POOL) REWARD VARIABLES
    /// @param pid Pool id
    function updatePool(uint256 pid) public requireMainPool(pid) {
        PoolInfo storage pool = poolInfo[pid];
        if (getBlockNumber() <= pool.lastRewardBlock) {
            return;
        }
        uint256 lpSupply = IERC20(pool.token).balanceOf(address(this));
        if (lpSupply == 0) {
            pool.lastRewardBlock = getBlockNumber();
            return;
        }
        uint256 lpTokensReward = getPoolReward(pid);
        //TODO: how do we register/allocate and distribute LP reward tokens to each pool
        ///??? require(IERC20(lpToken).transfer(address(this), lpTokensReward), "transfer failed"); // transfer tokens from contract to contract ???
        //pool.accLPtokensPerShare = pool.accLPtokensPerShare.add(lpTokensReward.div(lpSupply)); //.mul(HUNDRED)
        /// ??? pool.totalPool = pool.totalPool.add(lpTokensReward);
        pool.lastRewardBlock = getBlockNumber();
    }

    /// @notice get LP tokens reward for given pool id
    /// @param pid Pool id
    /// @param tokensReward Tokens amount as reward based on last mining block
    function getPoolReward(uint256 pid) public view virtual returns (uint256 tokensReward) {
        uint256 blocksElapsed = getBlocksFromRange(poolInfo[pid].lastRewardBlock, getBlockNumber());
        tokensReward = blocksElapsed.mul(lpTokensPerBlock).mul(poolInfo[pid].allocPoint).div(totalAllocPoint);
    }
    
    /// @notice Check if given pool id is LOOP pool id
    /// @param pid Pool id
    /// @return true if given pool id is LOOP pool id
    function isLoopPoolId(uint256 pid) private pure returns (bool) {
        return (pid == LOOP_POOL_INDEX);
    }

    /// @notice get current block timestamp
    /// @return current block timestamp
    function getBlockTimestamp() public view returns (uint256) {
        return block.timestamp;
    }

    /// @notice get current block number
    /// @return current block number
    function getBlockNumber() public view returns (uint256) {
        return block.number;
    }

    /// @notice Get pool attributes
    /// @param pid Pool id
    /// @return token allocPoint lastRewardBlock totalPool entryStakeTotal totalDistributedPenalty
    /// All possible pool attributes
    function getPool(uint256 pid) external view returns (
        address token, uint256 allocPoint, uint256 lastRewardBlock, uint256 totalPool,
        uint256 entryStakeTotal, uint256 totalDistributedPenalty)
    {
        PoolInfo storage p = poolInfo[pid];
        return (p.token, p.allocPoint, p.lastRewardBlock, p.totalPool, p.entryStakeTotal, p.totalDistributedPenalty);
    }

    /// @notice Get 'entry stake' for a given user address in a pool id
    /// @param pid Pool id
    /// @param user User address
    /// @return user entry stake in a given pool
    function getEntryStakeUser(uint256 pid, address user) external view returns (uint256) {
        return entryStakeUser[pid][user];
    }

    /// @notice Get 'entry stake adjusted' for a given user address in a pool id
    /// @param pid Pool id
    /// @param user User address
    /// @return user entry stake adjusted in given pool
    function getEntryStakeAdjusted(uint256 pid, address user) external view returns (uint256) {
        return entryStakeAdjusted[pid][user];
    }
}
