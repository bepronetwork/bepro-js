pragma solidity >=0.6.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract Votable {
    using SafeMath for uint256;

    /* EVENTS */
    event voteCasted(address indexed voter, uint indexed pollID, uint256 vote, uint256 weight);
    event pollCreated(address indexed creator, uint indexed pollID, string description, uint votingLength);
    event pollStatusUpdate(bool status);

    /* Determine the current state of a poll */
    enum PollStatus { IN_PROGRESS, ENDED }

    /* POLL */
    struct Poll {
        address creator;
        PollStatus status;
        uint256 optionsSize;
        mapping(uint256 => uint256) options;
        mapping(uint256 => uint256) votesPerOption;
        string description;
        address[] voters;
        uint expirationTime;
        uint256 winnerId;
        mapping(address => Voter) voterInfo;
    }

    /* VOTER */
    struct Voter {
        bool hasVoted;
        uint256 vote;
        uint256 weight;
    }

    /* TOKEN MANAGER */
    struct TokenManager {
        uint tokenBalance;
        mapping(uint => uint) lockedTokens;
        uint[] participatedPolls;
    }

    /* STATE VARIABLES */
    mapping(uint => Poll) public polls;
    mapping(address => TokenManager) public bank;

    uint256 public pollCount;
    ERC20 public erc20;

    /* CONSTRUCTOR */
    constructor(address _token) public {
        require(_token != address(0));
        erc20 = ERC20(_token);
    }

    /* POLL OPERATIONS */

    /*
    * Creates a new poll with a specified quorum percentage.
    */
    function createPoll(string calldata _description, uint _voteLength, uint256[] calldata options) external returns (uint){
        require(_voteLength > 0, "The voting period cannot be 0.");
        require(options.length > 1, "Options have to be higher than 1");
        pollCount++;

        Poll storage curPoll = polls[pollCount];
        curPoll.creator = msg.sender;
        curPoll.status = PollStatus.IN_PROGRESS;
        
        for(uint i = 0; i < options.length; i++){
            curPoll.options[i] = options[i];
        }
        curPoll.optionsSize = options.length;
        curPoll.expirationTime = block.timestamp.add(_voteLength).mul(1 seconds);
        curPoll.description = _description;

        emit pollCreated(msg.sender, pollCount, _description, _voteLength);
        return pollCount;
    }

    /*
    * Ends a poll. Only the creator of a given poll can end that poll.
    */
    function endPoll(uint _pollID) external validPoll(_pollID) {
        require(polls[_pollID].status == PollStatus.IN_PROGRESS, "Vote is not in progress.");
        require(block.timestamp >= polls[_pollID].expirationTime, "Voting period has not expired");
        _countVotes(_pollID);
        polls[_pollID].status = PollStatus.ENDED;
    }

    /*
    * Gets the status of a poll.
    */
    function getPoolInformation(uint _pollID) public view validPoll(_pollID) returns (address, PollStatus, uint256, string memory, address[] memory, uint256) {
        return (polls[_pollID].creator, polls[_pollID].status, polls[_pollID].optionsSize, polls[_pollID].description, 
        polls[_pollID].voters, polls[_pollID].expirationTime);
    }

    /*
    * Gets the winner vote of pool
    */
    function getPoolWinner(uint _pollID) public view validPoll(_pollID) returns (uint256, uint256) {
        return (polls[_pollID].winnerId, getPollOptionById(_pollID, polls[_pollID].winnerId));
    }

    /*
    * Gets the pool option meaning by id
    */
    function getPollOptionById(uint256 _pollID, uint id) public view validPoll(_pollID) returns (uint256) {
        return polls[_pollID].options[id];
    }

    /*
    * Gets the complete list of polls a user has voted in.
    */
    function getPollHistory(address _voter) public view returns(uint[] memory) {
        return bank[_voter].participatedPolls;
    }

    /*
    * Gets a voter's encrypted vote and weight for a given expired poll.
    */
    function getPollInfoForVoter(uint _pollID, address _voter) public view validPoll(_pollID) returns (uint256, uint256) {
        require(polls[_pollID].status != PollStatus.IN_PROGRESS);
        require(userHasVoted(_pollID, _voter));
        Poll storage curPoll = polls[_pollID];
        uint256 vote = curPoll.voterInfo[_voter].vote;
        uint256 weight = curPoll.voterInfo[_voter].weight;
        return (vote, weight);
    }

   /*
    * Checks if a user has voted for a specific poll.
    */
    function userHasVoted(uint _pollID, address _user) public view validPoll(_pollID) returns (bool) {
        return (polls[_pollID].voterInfo[_user].hasVoted);
    }

    /*
    * Modifier that checks for a valid poll ID.
    */
    modifier validPoll(uint _pollID) {
        require(_pollID > 0 && _pollID <= pollCount, "Not a valid poll Id.");
        _;
    }

    /* VOTE OPERATIONS */

    /*
    * Casts a vote for a given poll.
    */
    function castVote(uint _pollID, uint256 _voteId) external validPoll(_pollID) {
        Poll storage curPoll = polls[_pollID];
        require(curPoll.status == PollStatus.IN_PROGRESS, "Poll has expired.");
        require(!userHasVoted(_pollID, msg.sender), "User has already voted.");
        require(curPoll.expirationTime > block.timestamp);
        require(_voteId < curPoll.optionsSize, "Vote option is not availble");
        
        // update token bank
        bank[msg.sender].lockedTokens[_pollID] = getTokenStake(msg.sender);
        bank[msg.sender].participatedPolls.push(_pollID);

        curPoll.votesPerOption[_voteId] = curPoll.votesPerOption[_voteId].add(getTokenStake(msg.sender));

        curPoll.voterInfo[msg.sender] = Voter({
            hasVoted: true,
            vote: _voteId,
            weight: getTokenStake(msg.sender)
        });

        curPoll.voters.push(msg.sender);

        emit voteCasted(msg.sender, _pollID, _voteId, getTokenStake(msg.sender));
    }

    /*
    * Function that counts votes
    */
    function _countVotes(uint _pollID) internal returns (uint256) {
        Poll storage curPoll = polls[_pollID];

        uint256 winnerId = curPoll.votesPerOption[0];
        for(uint i = 1; i < curPoll.optionsSize; i++){
            if(curPoll.votesPerOption[i] > curPoll.votesPerOption[i-1]){
                winnerId = i;
            }
        }
        curPoll.winnerId = winnerId;
        return winnerId;
    }


    /* TOKEN OPERATIONS */

    /*
    * Stakes tokens for a given voter in return for voting credits.
    * NOTE:
    *  User must approve transfer of tokens.
    *  _numTokens is denominated in *wei*.
    */
    function stakeVotingTokens(uint256 _numTokens) external {
        require(erc20.balanceOf(msg.sender) >= _numTokens, "User does not have enough tokens");
        require(erc20.transferFrom(msg.sender, address(this), _numTokens), "User did not approve token transfer.");
        bank[msg.sender].tokenBalance += _numTokens;
    }

    /*
    * Allows a voter to withdraw voting tokens after a poll has ended.
    * NOTE: _numTokens is denominated in *wei*.
    */
    function withdrawTokens(uint256 _numTokens) external {
        uint largest = getLockedAmount(msg.sender);
        require(getTokenStake(msg.sender) - largest >= _numTokens, "User is trying to withdraw too many tokens.");
        bank[msg.sender].tokenBalance -= _numTokens;
        require(erc20.transfer(msg.sender, _numTokens));
    }

    /*
    * Gets the amount of Voting Tokens that are locked for a given voter.
    */
    function getLockedAmount(address _voter) public view returns (uint) {
        TokenManager storage manager = bank[_voter];
        uint largest;
        for (uint i = 0; i < manager.participatedPolls.length; i++) {
            uint curPollID = manager.participatedPolls[i];
            if (manager.lockedTokens[curPollID] > largest) {
                largest = manager.lockedTokens[curPollID];
            }
        }
        return largest;
    }

    /*
    * Gets the amount of Voting Credits for a given voter.
    */
    function getTokenStake(address _voter) public view returns(uint) {
        return bank[_voter].tokenBalance;
    }

}