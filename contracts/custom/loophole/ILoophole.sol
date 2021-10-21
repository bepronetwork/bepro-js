pragma solidity >=0.6.0 <0.8.0;
pragma abicoder v2; //needed to return struct

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Interface of the Loophole contract.
 */
interface ILoophole {
    
    // Main Pools and Loop Pool
    // INFO | POOL VARIABLES
    struct PoolInfo {
        address token;            // Address of staked token contract.
        uint256 allocPoint;       // How many allocation points assigned to this pool, LP tokens to distribute per block to this pool.
        uint256 lastRewardBlock;  // Last block number that LP tokens distribution occurs.
        uint256 totalPool;               // total staked tokens in the pool.
        uint256 entryStakeTotal;         // total tokens entered into a pool.
        uint256 totalDistributedPenalty; // total tokens distributed from the exit penalty.
        uint256 accLPtokensPerShare;  // Accumulated LP tokens per share which is pool token, times 1e12, see note below.
        //NOTE: 1e12 is our scaling multiplier since we calculate LP tokens per pool token staked before adding to this variable, 
        //with this multiplier we can have as much as this price ration between LP and pool token:
        //1 LP token / 1e12 pool tokens
        //we will usually have more than 1 LP as reward but we divide per pool tokens staked, that amount has to be up to 1e12 in this case,
        //if it is more, our formula won't work, we leave decimals out of this because LP token decimals are also present,
        //usually tokens have 18 decimals for ERC20 token standard.
    }
    
    // >>> upgrade version
    struct UserInfo {
        // accumulated staked amount
        uint256 entryStake;

        // accumulated net unstaked amount or exitStake
        uint256 unstake;

        // current user adjusted stake in the pool
        uint256 entryStakeAdjusted;

        // LP tokens reward mark to control new rewards and already paid ones
        uint256 payRewardMark;
    }



    /// @notice add/enable new pool, only owner mode
    /// @dev ADD | NEW TOKEN POOL
    /// @param token Token address as IERC20
    /// @param allocPoint Pool allocation point/share distributed to this pool from mining rewards
    /// @return pid added token pool index
    function add(IERC20 token, uint256 allocPoint) external returns (uint256 pid);

    /// @notice update pool allocation point/share
    /// @dev UPDATE | ALLOCATION POINT
    /// @param pid Pool id
    /// @param allocPoint Set allocation point/share for pool id
    /// @param withUpdate Update all pools and distribute mining reward for all
    function set(uint256 pid, uint256 allocPoint, bool withUpdate) external;

    /// @notice stake tokens on given pool id
    /// @param pid Pool id
    /// @param amount The token amount user wants to stake to the pool.
    function stake(uint256 pid, uint256 amount) external;

    /// @notice user exit staking amount from main pool, require main pool only
    /// @param pid Pool id
    /// @param amount The token amount user wants to exit/unstake from the pool.
    /// @param amountOutMinimum The min LP token amount expected to be received from exchange,
    /// needed from outside for security reasons, using zero value in production is discouraged.
    /// @return net tokens amount sent to user address
    function exit(uint256 pid, uint256 amount, uint256 amountOutMinimum) external returns (uint256);

    /// @notice User exit staking amount from LOOP pool, require LOOP pool only
    /// @param amount The token amount user wants to exit/unstake from the pool.
    /// @return net tokens amount sent to user address
    function exit(uint256 amount) external returns (uint256);

    /// @notice View pending LP token rewards for user
    /// @dev VIEW | PENDING REWARD
    /// @param pid Pool id of main pool
    /// @param userAddress User address to check pending rewards for
    /// @return Pending LP token rewards for user
    function getUserReward(uint256 pid, address userAddress) external view returns (uint256);

    /// @notice User collects his share of LP tokens reward
    /// @param pid Pool id
    /// @return LP reward tokens amount sent to user address
    function collectRewards(uint256 pid) external returns (uint256);

    /// @notice User collects his share of LP tokens rewards of all pools
    /// @dev MASS LP rewards collect | HIGH GAS call
    /// @return LP rewards tokens from all pools
    /// NOTE: index zero is zero for LOOP pool
    //function collectRewardsAll() external returns (uint256[] memory);

    /// @notice current total user stake in a given pool
    /// @param pid Pool id
    /// @param user The user address
    /// @return stake tokens amount
    function currentStake(uint256 pid, address user) external view returns (uint256);

    /// @notice percentage of how much a user has earned so far from the other users exit, would be just a statistic
    /// @param pid Pool id
    /// @param user The user address
    /// @return earnings percent as integer
    function earnings(uint256 pid, address user) external view returns (uint256);

    /// @notice get blocks range given two block numbers, usually computes blocks elapsed since last mining reward block.
    /// @dev RETURN | BLOCK RANGE SINCE LAST REWARD AS REWARD MULTIPLIER | INCLUDES START BLOCK
    /// @param from block start
    /// @param to block end
    /// @return blocks count
    function getBlocksFromRange(uint256 from, uint256 to) external view returns (uint256);

    /// @notice update all pools for mining rewards
    /// @dev UPDATE | (ALL) REWARD VARIABLES | BEWARE: HIGH GAS POTENTIAL
    function massUpdatePools() external;

    /// @notice Update pool to trigger LP tokens reward since last reward mining block
    /// @dev UPDATE | (ONE POOL) REWARD VARIABLES
    /// @param pid Pool id
    /// @return blocksElapsed Blocks elapsed since last reward block
    /// @return lpTokensReward Amount of LP tokens reward since last reward block
    /// @return accLPtokensPerShare Pool accumulated LP tokens per pool token (per share)
    function updatePool(uint256 pid) external returns (uint256 blocksElapsed, uint256 lpTokensReward, uint256 accLPtokensPerShare);

    /// @notice get LP tokens reward for given pool id, only MAIN pool, LOOP pool reward will always be zero
    /// @param pid Pool id
    /// @return tokensReward Tokens amount as reward based on last mining block
    function getPoolReward(uint256 pid) external view returns (uint256 tokensReward);

    /// @notice get current block timestamp
    /// @return current block timestamp
    function getBlockTimestamp() external view returns (uint256);

    /// @notice get current block number
    /// @return current block number
    function getBlockNumber() external view returns (uint256);

    /// @notice Get pool attributes
    /// @param pid Pool id
    /// @return token
    /// @return allocPoint
    /// @return lastRewardBlock
    /// @return totalPool
    /// @return entryStakeTotal
    /// @return totalDistributedPenalty
    /// @return accLPtokensPerShare
    /// All pool attributes
    function getPool(uint256 pid) external view returns (
        address token, uint256 allocPoint, uint256 lastRewardBlock, uint256 totalPool,
        uint256 entryStakeTotal, uint256 totalDistributedPenalty, uint256 accLPtokensPerShare);
    
    /// @notice Get pool attributes as struct
    /// @param pid Pool id
    /// @return pool
    function getPoolInfo(uint256 pid) external view returns (PoolInfo memory pool);

    /// @notice Get pools array length
    /// @return pools count
    function poolsCount() external view returns (uint256);

    /// @notice Get pool attributes as struct
    /// @param pid Pool id
    /// @param user User address
    /// @return user info
    function getUserInfo(uint256 pid, address user) external view returns (UserInfo memory);

    /// @notice Get total accumulated 'entry stake' so far for a given user address in a pool id
    /// @param pid Pool id
    /// @param user User address
    /// @return user entry stake amount in a given pool
    function getTotalEntryStakeUser(uint256 pid, address user) external view returns (uint256);

    /// @notice Get total accumulated 'unstake' so far for a given user address in a pool id
    /// @param pid Pool id
    /// @param user User address
    /// @return user unstake amount in a given pool
    function getTotalUnstakeUser(uint256 pid, address user) external view returns (uint256);

    /// @notice Get current net 'entry stake' for a given user address in a pool id
    /// @param pid Pool id
    /// @param user User address
    /// @return user current entry stake amount in a given pool
    //function getCurrentEntryStakeUser(uint256 pid, address user) external view returns (uint256);

    /// @notice Get 'entry stake adjusted' for a given user address in a pool id
    /// @param pid Pool id
    /// @param user User address
    /// @return user entry stake adjusted amount in given pool
    function getEntryStakeAdjusted(uint256 pid, address user) external view returns (uint256);



    /// @notice PoolAdded event when new pool is added/enabled
    /// @param token Staking token address
    /// @param allocPoint Allocation point of this token in the total pools allocation
    /// @param pid Pool id, index in the pools array
    event PoolAdded(address indexed token, uint256 indexed allocPoint, uint256 indexed pid);
    
    /// @notice PoolSet event when pool allocation point/share is set/updated
    /// @param token Staking token address
    /// @param allocPoint Allocation point of this token in the total pools allocation
    /// @param pid Pool id, index in the pools array
    event PoolSet(address indexed token, uint256 indexed allocPoint, uint256 indexed pid);

    /// @notice PoolRewardUpdated event when pool block is updated for liquidity mining LP rewards
    /// @param token Staking token address
    /// @param blockNumber Block number
    /// @param blocksElapsed Blocks elapsed since last reward block
    /// @param lpTokensReward LP tokens reward since last mining block
    /// @param accLPtokensPerShare Accumulated LP tokens per pool tokens
    /// @param pid Pool id, index in the pools array
    event PoolRewardUpdated(address indexed token, uint256 blockNumber, uint256 blocksElapsed, uint256 lpTokensReward, uint256 accLPtokensPerShare, uint256 indexed pid);
    
    /// @notice Deposit event when user stakes tokens into a pool
    /// @param user User/owner address
    /// @param pid Pool id
    /// @param amount Amount of tokens to stake
    event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
    
    /// @notice Withdraw event when user withdraws/exits amount from staking pool
    /// @param user User/owner address
    /// @param pid Pool id
    /// @param amount Amount of tokens to withdraw/exit
    /// @param netAmount Net amount of tokens to withdraw/exit after paying penalty
    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount, uint256 netAmount);
    //event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);

    /// @notice Collect LP tokens reward from staking pool
    /// @param user User/owner address
    /// @param pid Pool id
    /// @param reward Amount of LP tokens user has got as reward from pool id
    event Collect(address indexed user, uint256 indexed pid, uint256 reward);

    /// @notice Token exchanged event when user exits/unnstakes and part of penalty are exchanged for LP tokens on uniswap
    /// @param user User address
    /// @param token Token address to be exchanged
    /// @param tokenAmount Token amount to be exchanged for LP tokens
    /// @param tokenLP LP token address
    /// @param tokenAmountLP LP Token amount as result from the exchange
    event TokenExchanged(address indexed user, address indexed token, uint256 tokenAmount, address indexed tokenLP, uint256 tokenAmountLP);

}