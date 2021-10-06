pragma solidity >=0.6.0 <0.8.0;
//pragma solidity =0.7.6;
pragma abicoder v2; //needed to return struct

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
import "../../uniswap/UniswapV3RouterBridge.sol";

/// @title LoopHole Finance smart contract
contract Loophole is Ownable, Context, ReentrancyGuardOptimized, UniswapV3RouterBridge {
    using SafeMath for uint256;
    using SafePercentMath for uint256;
    
    //mapping(address => PoolInfo) pools; // pool exists toggles.
    //// Add the library methods
    //using EnumerableSet for EnumerableSet.AddressSet;
    //EnumerableSet.AddressSet private poolTokensList;
    
    // hundred constant used in percentage calculations as parts/100
    uint256 private immutable HUNDRED = 100;
    
    // two hundred constant used in percentage calculations as parts/100/2
    uint256 private immutable TWO_HUNDRED = 200;
    
    // LOOP POOL indx in the pools list
    uint256 private immutable LOOP_POOL_INDEX = 0;

    /// @notice Liquidity Provider reward token
    address public lpToken;
    /// @notice amount of LP tokens to reward per block
    uint256 public lpTokensPerBlock;

    // we use the uniswap pool fee 0.3%.
    uint24 public immutable uniswapPoolFee = 3000;

    //uint256 private c;


    // for details about this variable, please read the NOTE below 'accLPtokensPerShare' in PoolInfo struct
    uint256 public immutable LPtokensPerShareMultiplier = 1e12;

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

    // maps poolId-user-UserInfo
    mapping(uint256 => mapping(address => UserInfo)) private userInfo;
    // <<<

    // maps the amount each user has staked/put into a pool as pool_id-user-amount
    //mapping(uint256 => mapping(address => uint256)) private entryStakeUser;

    // maps the amount each user has unstaked/exited from a pool as pool_id-user-amount
    //mapping(uint256 => mapping(address => uint256)) private unstakeUser;

    // maps the amount each user has staked/put into a pool as pool_id-user-amount
    // but adjusted so he can’t benefit from past token distribution.
    //mapping(uint256 => mapping(address => uint256)) private entryStakeAdjusted;

    
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
    uint256 public exitPenalty;

    // LOOP pool exit penalty, applied to user current staked amount + profit from pool distribution, as e.g 20 for 20 %
    uint256 public exitPenaltyLP;
    
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
    /// @param blocksElapsed Blocks elapsed since last reward block
    /// @param lpTokensReward LP tokens reward since last mining block
    /// @param accLPtokensPerShare Accumulated LP tokens per pool tokens
    /// @param pid Pool id, index in the pools array
    event PoolRewardUpdated(address indexed token, uint256 blocksElapsed, uint256 lpTokensReward, uint256 accLPtokensPerShare, uint256 indexed pid);
    
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



    /// @notice constructor
    /// @param _swapRouter Uniswap SwapRouter address to access the market for tokens exchange
    /// @param _lpToken Liquidity Provider token address as IERC20
    /// @param _lpTokensPerBlock LP tokens amount reward per mining block
    /// @param _startBlock Start block for mining reward
    /// @param _exitPenalty Exit penalty from main pool, for example 20 for 20 %
    /// @param _exitPenaltyLP Exit penalty from loop pool, for example 20 for 20 %
    constructor(
        ISwapRouter _swapRouter
        , IERC20 _lpToken
        , uint256 _lpTokensPerBlock
        , uint256 _startBlock
        , uint256 _exitPenalty
        , uint256 _exitPenaltyLP
    ) UniswapV3RouterBridge(_swapRouter) {
        
        lpToken = address(_lpToken);
        lpTokensPerBlock = _lpTokensPerBlock;
        startBlock = _startBlock;
        
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

    /// Modifiers
    
    modifier requireMainPool(uint256 pid) {
        _requireMainPool(pid);
        _;
    }

    modifier requireValidPid(uint256 pid) {
        _requireValidPid(pid);
        _;
    }

    modifier requireNewPool(address token) {
        _requireNewPool(token);
        _;
    }

    modifier requireNewAllocPoint(uint256 pid, uint256 allocPoint) {
        _requireNewAllocPoint(pid, allocPoint);
        _;
    }

    /// Modifier helper functions, used to reduse/optimize contract bytesize

    // require given pool id to be MAIN pool index, different then LOOP pool index
    function _requireMainPool(uint256 pid) internal pure {
        require(pid != LOOP_POOL_INDEX, "PID_LOOP"); //PID is LOOP pool
    }

    // require given pool id to be in range
    function _requireValidPid(uint256 pid) internal view {
        require(pid < poolInfo.length, "PID_OORI"); //PID Out Of Range Index
    }

    // require new pool token address only
    function _requireNewPool(address token) internal view {
        require(poolExists[token] == false, "TPE"); //Token Pool Exists
    }

    // require new allocation point for pool
    function _requireNewAllocPoint(uint256 pid, uint256 allocPoint) internal view {
        require(poolInfo[pid].allocPoint != allocPoint, "PID_NR"); //PID New Required
    }

    /// Features

    /// @notice add/enable new pool, only owner mode
    /// @dev ADD | NEW TOKEN POOL
    /// @param token Token address as IERC20
    /// @param allocPoint Pool allocation point/share distributed to this pool from mining rewards
    /// @return pid added token pool index
    function add(
        IERC20 token
        , uint256 allocPoint // when zero it is the LOOP pool
        //, bool withUpdate
    ) public onlyOwner requireNewPool(address(token)) returns (uint256 pid) {

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
            lastRewardBlock: lastRewardBlock,
            accLPtokensPerShare: 0
        }));

        poolExists[address(token)] = true;
        emit PoolAdded(address(token), allocPoint, poolInfo.length-1);
        return (poolInfo.length-1);
    }

    /// @notice update pool allocation point/share
    /// @dev UPDATE | ALLOCATION POINT
    /// @param pid Pool id
    /// @param allocPoint Set allocation point/share for pool id
    /// @param withUpdate Update all pools and distribute mining reward for all
    function set(uint256 pid, uint256 allocPoint, bool withUpdate) external 
        onlyOwner 
        requireMainPool(pid) 
        requireValidPid(pid) 
        requireNewAllocPoint(pid, allocPoint)
    {
        if (withUpdate) {
            massUpdatePools();
        }
        totalAllocPoint = totalAllocPoint.sub(poolInfo[pid].allocPoint).add(allocPoint);
        poolInfo[pid].allocPoint = allocPoint;
        emit PoolSet(address(poolInfo[pid].token), allocPoint, pid);
    }
    


    // Main Pools and Loop Pool
    /// @notice stake tokens on given pool id
    /// @param pid Pool id
    /// @param amount The token amount user wants to stake to the pool.
    function stake(uint256 pid, uint256 amount) external requireValidPid(pid) nonReentrant {
        if (isMainPoolId(pid)) //LOOP pool can not be mined for LP rewards
            updatePool(pid);

        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][_msgSender()];
        //address sender = _msgSender();
        
        // withdraw LP rewards based on user current stake
        withdrawLPrewards(pid, pool.accLPtokensPerShare, user.payRewardMark);

        //TODO: ???
        // calculate LP tokens as share of the pool the user stakes into
        // //amount / pool.totalPool * pool.totalPoolLP;
        //uint256 lpShareTokens = amount.mul(pool.totalPoolLP).div(pool.totalPool);
        //pool.totalPoolLP = pool.totalPoolLP.add(lpShareTokens);
        //IERC20(lpToken).mint(sender, lpShareTokens);
        //???

        // check div by 0 when totalPool = 0
        uint256 newEntryStake;
        if (pool.totalPool == 0 || pool.entryStakeTotal == 0)
            newEntryStake = amount;
        else newEntryStake = amount.mul(pool.entryStakeTotal).div(pool.totalPool);
        user.entryStakeAdjusted = user.entryStakeAdjusted.add(newEntryStake);
        pool.entryStakeTotal = pool.entryStakeTotal.add(newEntryStake);
        user.entryStake = user.entryStake.add(amount);
        pool.totalPool = pool.totalPool.add(amount);

        //if (amount > 0) { // if adding more
        //require(IERC20(pool.token).transferFrom(_msgSender(), address(this), amount), "transferFrom failed");
        TransferHelper.safeTransferFrom(pool.token, _msgSender(), address(this), amount);
        //}
        
        //user.rewardDebt = user.amount.mul(pool.accLPtokensPerShare); //.div(1e12);
        // update LP rewards withdrawn
        updateLPrewardsPaid(pid, pool.accLPtokensPerShare, user);

        emit Deposit(_msgSender(), pid, amount);
    }

    /// @notice user exit staking amount from main pool, require main pool only
    /// @param pid Pool id
    /// @param amount The token amount user wants to exit/unstake from the pool.
    /// @param amountOutMinimum The min LP token amount expected to be received from exchange,
    /// needed from outside for security reasons, using zero value in production is discouraged.
    /// @return net tokens amount sent to user address
    function exit(uint256 pid, uint256 amount, uint256 amountOutMinimum) external 
        requireMainPool(pid) 
        requireValidPid(pid) 
        nonReentrant 
        returns (uint256)
    {
        //if (isMainPoolId(pid)) //LOOP pool can not be mined for LP rewards
            updatePool(pid);
        
        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][_msgSender()];
        //address sender = _msgSender();
        
        // withdraw LP rewards based on user current stake
        withdrawLPrewards(pid, pool.accLPtokensPerShare, user.payRewardMark);

        {// avoid stack too deep error
            uint256 userCurrentStake = currentStake(pid, _msgSender());
            //uint256 exitAmount = amount.div(userCurrentStake).mul(pool.entryStakeAdjusted[sender]);
            uint256 exitAmount = amount.mul(user.entryStakeAdjusted).div(userCurrentStake);
            pool.entryStakeTotal = pool.entryStakeTotal.sub(exitAmount);
            user.entryStakeAdjusted = user.entryStakeAdjusted.sub(exitAmount);
            pool.totalPool = pool.totalPool.sub(amount);
        }

        uint256 exitPenaltyAmount;
        if (pool.totalPool == 0) { // last user exited his whole stake/amount
            // no exit penalty amount is added to pool.totalDistributedPenalty in this case
            // whole exit penalty is swaped via uniswap and added to LOOP pool
            exitPenaltyAmount = amount.mul(exitPenalty).div(HUNDRED);
            // pool.totalPool = pool.totalPool.sub(amount);
        }
        else {
            //NOTE: due to rounding margin error the contract might have more tokens than specified by pool variables
            //NOTE: for example 21 tokens, 50% of it is 10 as we work with integers, 1 token is still in the contract
            exitPenaltyAmount = amount.mul(exitPenalty).div(TWO_HUNDRED); //div(HUNDRED).div(2)
            pool.totalDistributedPenalty = pool.totalDistributedPenalty.add(exitPenaltyAmount);
            pool.totalPool = pool.totalPool.add(exitPenaltyAmount);

            //NOTE: x_tokens = amount * (exitPenalty / 2)
            //NOTE: x_tokens go back into the pool for distribution to the rest of the users
            //NOTE: the other x_tokens go to exchange for LP tokens
            // totalPool = totalPool - amount * (1 - exitPenalty / 2);
            //uint256 afterExitPercent = HUNDRED.sub(exitPenalty.div(2));
            //pool.totalPool = pool.totalPool.sub(amount.mul(afterExitPercent).div(HUNDRED)); //auto added what went into totalDistributedPenalty
        }

        uint256 amountLP = swapCollectedPenalty(pool.token, exitPenaltyAmount, amountOutMinimum);
        addRewardToLoopPool(amountLP);
        emit TokenExchanged(_msgSender(), pool.token, exitPenaltyAmount, lpToken, amountLP);

        uint256 withdrawAmount = amount.mul(HUNDRED.sub(exitPenalty)).div(HUNDRED); //amount * (1 - exitPenalty);
        user.unstake = user.unstake.add(withdrawAmount);
        //require(pool.token.transfer(_msgSender(), withdrawAmount), "transfer failed");
        TransferHelper.safeTransfer(pool.token, _msgSender(), withdrawAmount);
        emit Withdraw(_msgSender(), pid, amount, withdrawAmount);

        // update LP rewards withdrawn
        updateLPrewardsPaid(pid, pool.accLPtokensPerShare, user);

        return withdrawAmount;
    }

    /// @notice User exit staking amount from LOOP pool, require LOOP pool only
    /// @param amount The token amount user wants to exit/unstake from the pool.
    /// @return net tokens amount sent to user address
    function exit(uint256 amount) external nonReentrant returns (uint256) {
        uint256 pid = LOOP_POOL_INDEX;
        //updatePool(pid);

        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][_msgSender()];
        //address sender = _msgSender();

        // withdraw LP rewards based on user current stake
        withdrawLPrewards(pid, pool.accLPtokensPerShare, user.payRewardMark);
        
        {// avoid stack too deep error
            uint256 userCurrentStake = currentStake(pid, _msgSender());
            ////TODO: is this required???: require(userCurrentStake >= amount, "exit amount too high");

            uint256 exitAmount = amount.mul(user.entryStakeAdjusted).div(userCurrentStake);
            pool.entryStakeTotal = pool.entryStakeTotal.sub(exitAmount);
            user.entryStakeAdjusted = user.entryStakeAdjusted.sub(exitAmount);
            pool.totalPool = pool.totalPool.sub(amount);
        }

        //NOTE: x_tokens = amount * exitPenaltyLP / 2
        //NOTE: x_tokens go back into the LOOP pool for distribution to the rest of the users
        //NOTE: the other x_tokens are burnt
        uint256 exitPenaltyAmount = amount.mul(exitPenaltyLP).div(HUNDRED); //amount * exitPenaltyLP
        liquidityMining(exitPenaltyAmount); // LP tokens back to Liquidity Mining available for mining rewards
        //burn(exitPenaltyAmount);
        
        uint256 withdrawAmount = amount.mul(HUNDRED.sub(exitPenaltyLP)).div(HUNDRED); //amount * (1 - exitPenaltyLP);
        user.unstake = user.unstake.add(withdrawAmount);
        //require(pool.token.transfer(_msgSender(), withdrawAmount), "transfer failed");
        TransferHelper.safeTransfer(pool.token, _msgSender(), withdrawAmount);
        emit Withdraw(_msgSender(), pid, amount, withdrawAmount);

        // update LP rewards withdrawn
        updateLPrewardsPaid(pid, pool.accLPtokensPerShare, user);

        return withdrawAmount;
    }

    /// @notice View pending LP token rewards for user
    /// @dev VIEW | PENDING REWARD
    /// @param _pid Pool id of main pool
    /// @param _user User address to check pending rewards for
    /// @return Pending LP token rewards for user
    function getUserReward(uint256 _pid, address _user)
        requireMainPool(_pid) 
        requireValidPid(_pid) 
        external view returns (uint256)
    {
        PoolInfo storage pool = poolInfo[_pid];
        UserInfo storage user = userInfo[_pid][_user];
        uint256 accLPtokensPerShare = pool.accLPtokensPerShare;
        //uint256 lpSupply = pool.token.balanceOf(address(this));
        uint256 lpSupply = pool.totalPool;
        if (getBlockNumber() > pool.lastRewardBlock && lpSupply != 0) {
            uint256 lpTokensReward = getPoolReward(pool);
            // calculate LP tokens per pool token of selected pid pool
            accLPtokensPerShare = accLPtokensPerShare.add(lpTokensReward.mul(LPtokensPerShareMultiplier).div(lpSupply));
        }
        
        uint256 currentRewardMark = currentStake(_pid, _user).mul(accLPtokensPerShare).div(LPtokensPerShareMultiplier);
        if (currentRewardMark > user.payRewardMark)
            return currentRewardMark.sub(user.payRewardMark);
        else return 0;
    }

    /// @notice Withdraw available LP reward for pool id
    /// @dev Use this function paired with 'updateLPrewardsPaid' on deposits, withdraws and lp rewards withdrawals.
    /// @param pid Pool id
    /// @param poolAccLPtokensPerShare Pool accLPtokensPerShare
    /// @param userPayRewardMark User payRewardMark
    /// @return LP reward withdrawn
    function withdrawLPrewards(uint256 pid, uint256 poolAccLPtokensPerShare, uint256 userPayRewardMark) internal returns (uint256)
    {
        uint256 userCurrentStake = currentStake(pid, _msgSender());
        uint256 accReward = userCurrentStake.mul(poolAccLPtokensPerShare).div(LPtokensPerShareMultiplier);
        if (accReward > userPayRewardMark) { // send pending rewards, if applicable
            uint256 reward = accReward.sub(userPayRewardMark);
            //lptoken.safeTransfer(msg.sender, reward);
            TransferHelper.safeTransfer(lpToken, _msgSender(), reward);
            emit Collect(_msgSender(), pid, reward);
            return reward;
        }
        return 0;
    }

    /// @notice Update accumulated withdrawn LP rewards
    /// @dev Use this function paired with 'withdrawLPrewards' on deposits, withdraws and lp rewards withdrawals.
    /// @param pid Pool id
    /// @param poolAccLPtokensPerShare Pool accLPtokensPerShare
    /// @param user UserInfo pointer
    function updateLPrewardsPaid(uint256 pid, uint256 poolAccLPtokensPerShare, UserInfo storage user) internal
    {
        uint256 userCurrentStake = currentStake(pid, _msgSender());
        user.payRewardMark = userCurrentStake.mul(poolAccLPtokensPerShare).div(LPtokensPerShareMultiplier);
    }

    /// @notice User collects his share of LP tokens reward
    /// @dev Internal function to be called by other external ones,
    /// checks/modifiers are used in external functions only to avoid duplicates.
    /// 'nonReentrant' lock modifier is required in the external function using this one.
    /// @param pid Pool id
    /// @return LP reward tokens amount sent to user address
    function _collectRewards(uint256 pid) internal returns (uint256)
    {
        updatePool(pid);
        PoolInfo storage pool = poolInfo[pid];
        UserInfo storage user = userInfo[pid][_msgSender()];
        uint256 poolAccLPtokensPerShare = pool.accLPtokensPerShare;

        /*uint256 reward = 0;
        uint256 userCurrentStake = currentStake(pid, _msgSender());
        uint256 accReward = userCurrentStake.mul(pool.accLPtokensPerShare).div(LPtokensPerShareMultiplier);
        if (accReward > user.payRewardMark) { // sends pending rewards, if applicable
            reward = accReward.sub(user.payRewardMark);
            // update acc LP rewards paid
            user.payRewardMark = userCurrentStake.mul(pool.accLPtokensPerShare).div(LPtokensPerShareMultiplier);
            
            TransferHelper.safeTransfer(address(lpToken), _msgSender(), reward);
            emit Collect(_msgSender(), pid, reward);
        }*/
        uint256 reward = withdrawLPrewards(pid, poolAccLPtokensPerShare, user.payRewardMark);
        updateLPrewardsPaid(pid, poolAccLPtokensPerShare, user);
        return reward;
    }

    /// @notice User collects his share of LP tokens reward
    /// @param pid Pool id
    /// @return LP reward tokens amount sent to user address
    function collectRewards(uint256 pid) 
        requireMainPool(pid) 
        requireValidPid(pid) 
        nonReentrant 
        external returns (uint256)
    {
        return _collectRewards(pid);
    }

    /// @notice User collects his share of LP tokens rewards of all pools
    /// @dev MASS LP rewards collect | HIGH GAS call
    /// @return LP rewards tokens from all pools
    /// NOTE: index zero is zero for LOOP pool
    /*function collectRewardsAll() external nonReentrant returns (uint256[] memory)
    {
        uint256 length = poolInfo.length;
        uint256[] memory rewards = new uint256[](length);
        rewards[0] = 0;
        // only main pools, 0 index is for LOOP pool
        for (uint256 pid = 1; pid < length; ++pid) {
            rewards[pid] = _collectRewards(pid);
        }
        return rewards;
    }*/

    /// @notice current total user stake in a given pool
    /// @param pid Pool id
    /// @param user The user address
    /// @return stake tokens amount
    function currentStake(uint256 pid, address user) requireValidPid(pid) public view returns (uint256) {
        PoolInfo storage pool = poolInfo[pid];
        if (pool.entryStakeTotal == 0)
            return 0;
        return pool.totalPool.mul(userInfo[pid][user].entryStakeAdjusted).div(pool.entryStakeTotal);
    }

    /// @notice percentage of how much a user has earned so far from the other users exit, would be just a statistic
    /// @param pid Pool id
    /// @param user The user address
    /// @return earnings percent as integer
    function earnings(uint256 pid, address user) requireValidPid(pid) external view returns (uint256) {
        UserInfo storage userData = userInfo[pid][user];
        return (userData.unstake.add(currentStake(pid, user))).div(userData.entryStake);
    }

    // Main Pools
    /// @notice swap collected penalty from main pools exits for LOOPhole (LP) tokens in the open market
    /// @param tokenIn Token address we exchange for LP tokens
    /// @param amount The tokens amount to be exchanged for LP tokens
    /// @param amountOutMinimum The min LP tokens amount to be received from exchange, needed for security reasons
    /// @return amountLP Amount of LP tokens
    function swapCollectedPenalty(address tokenIn, uint256 amount, uint256 amountOutMinimum) internal returns (uint256 amountLP) {
        //uniswap call to exchange given tokens for LP tokens
        amountLP = swapExactInputSingle(tokenIn, poolInfo[LOOP_POOL_INDEX].token, uniswapPoolFee, address(this), amount, amountOutMinimum);
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
    //function burn(uint256 amount) internal {
        //TODO:
        //require(IERC20(lpToken).burn(address(this), amount), "burn failed");
    //}

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
    function updatePool(uint256 pid) public requireMainPool(pid) requireValidPid(pid) {
        PoolInfo storage pool = poolInfo[pid];
        if (getBlockNumber() <= pool.lastRewardBlock) {
            return;
        }
        
        uint256 lpSupply = pool.totalPool;
        // main pools must have some tokens on this contract except LOOP pool tokens
        if (lpSupply == 0) {
            pool.lastRewardBlock = getBlockNumber();
            return;
        }
        
        uint256 lpTokensReward = getPoolReward(pool);
        //TODO: how do we register/allocate and distribute LP reward tokens to each pool
        // ??? mint LP reward tokens to contract
        ///??? require(IERC20(lpToken).mint(address(this), lpTokensReward), "mint failed");
        //pool.accLPtokensPerShare = pool.accLPtokensPerShare.add(lpTokensReward.mul(LPtokensPerShareMultiplier).div(lpSupply));
        //pool.totalPool = pool.totalPool.add(lpTokensReward);
        
        // calculate LP tokens per pool token of selected pool id
        pool.accLPtokensPerShare = pool.accLPtokensPerShare.add(lpTokensReward.mul(LPtokensPerShareMultiplier).div(lpSupply));
        uint256 blocksElapsed = getBlockNumber() - pool.lastRewardBlock;
        pool.lastRewardBlock = getBlockNumber();
        emit PoolRewardUpdated(pool.token, blocksElapsed, lpTokensReward, pool.accLPtokensPerShare, pid);
    }

    /// @notice get LP tokens reward for given pool
    /// @param pool Pool
    /// @return tokensReward Tokens amount as reward based on last mining block
    function getPoolReward(PoolInfo storage pool) internal view virtual returns (uint256 tokensReward) {
        uint256 blocksElapsed = getBlocksFromRange(pool.lastRewardBlock, getBlockNumber());
        return blocksElapsed.mul(lpTokensPerBlock).mul(pool.allocPoint).div(totalAllocPoint);
    }

    /// @notice get LP tokens reward for given pool id
    /// @param pid Pool id
    /// @return tokensReward Tokens amount as reward based on last mining block
    function getPoolReward(uint256 pid) requireValidPid(pid) external view virtual returns (uint256 tokensReward) {
        PoolInfo storage pool = poolInfo[pid];
        return getPoolReward(pool);
    }
    
    /// @notice Check if given pool id is MAIN pool id
    /// @param pid Pool id
    /// @return true if given pool id is MAIN pool id
    function isMainPoolId(uint256 pid) private pure returns (bool) {
        return (pid != LOOP_POOL_INDEX);
    }

    /// @notice Check if given pool id is LOOP pool id
    /// @param pid Pool id
    /// @return true if given pool id is LOOP pool id
    //function isLoopPoolId(uint256 pid) private pure returns (bool) {
    //    return (pid == LOOP_POOL_INDEX);
    //}

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
    /// @return token
    /// @return allocPoint
    /// @return lastRewardBlock
    /// @return totalPool
    /// @return entryStakeTotal
    /// @return totalDistributedPenalty
    /// @return accLPtokensPerShare
    /// All pool attributes
    function getPool(uint256 pid) requireValidPid(pid) external view returns (
        address token, uint256 allocPoint, uint256 lastRewardBlock, uint256 totalPool,
        uint256 entryStakeTotal, uint256 totalDistributedPenalty, uint256 accLPtokensPerShare)
    {
        PoolInfo storage p = poolInfo[pid];
        return (p.token, p.allocPoint, p.lastRewardBlock, p.totalPool, 
            p.entryStakeTotal, p.totalDistributedPenalty, p.accLPtokensPerShare);
    }

    /// @notice Get pool attributes as struct
    /// @param pid Pool id
    /// @return pool
    function getPoolInfo(uint256 pid) requireValidPid(pid) external view returns (PoolInfo memory pool)
    {
        PoolInfo storage p = poolInfo[pid];
        return (p);
    }

    /// @notice Get pools array length
    /// @return pools count
    function poolLength() external view returns (uint256) {
        return poolInfo.length;
    }

    /// @notice Get pool attributes as struct
    /// @param pid Pool id
    /// @param user User address
    /// @return user info
    function getUserInfo(uint256 pid, address user) 
        requireValidPid(pid) 
        external view returns (UserInfo memory)
    {
        UserInfo storage userData = userInfo[pid][user];
        return (userData);
    }

    /// @notice Get total accumulated 'entry stake' so far for a given user address in a pool id
    /// @param pid Pool id
    /// @param user User address
    /// @return user entry stake amount in a given pool
    function getTotalEntryStakeUser(uint256 pid, address user) external view returns (uint256) {
        return userInfo[pid][user].entryStake;
    }

    /// @notice Get total accumulated 'unstake' so far for a given user address in a pool id
    /// @param pid Pool id
    /// @param user User address
    /// @return user unstake amount in a given pool
    function getTotalUnstakeUser(uint256 pid, address user) external view returns (uint256) {
        return userInfo[pid][user].unstake;
    }

    /// @notice Get current net 'entry stake' for a given user address in a pool id
    /// @param pid Pool id
    /// @param user User address
    /// @return user current entry stake amount in a given pool
    /*function getCurrentEntryStakeUser(uint256 pid, address user) public view returns (uint256) {
        uint256 selExitPenalty = exitPenalty;
        if (isLoopPoolId(pid))
            selExitPenalty = exitPenaltyLP;
        uint256 totalGrossUnstaked = userInfo[pid][user].unstake.mul(HUNDRED).div(HUNDRED.sub(selExitPenalty));
        return userInfo[pid][user].entryStake.sub(totalGrossUnstaked);
    }*/

    /// @notice Get 'entry stake adjusted' for a given user address in a pool id
    /// @param pid Pool id
    /// @param user User address
    /// @return user entry stake adjusted amount in given pool
    function getEntryStakeAdjusted(uint256 pid, address user) external view returns (uint256) {
        return userInfo[pid][user].entryStakeAdjusted;
    }
}
