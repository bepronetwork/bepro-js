## Classes

<dl>
<dt><a href="#FixedSwapContract">FixedSwapContract</a></dt>
<dd></dd>
</dl>

## Functions

<dl>
<dt><a href="#setNewOwner">setNewOwner(address)</a></dt>
<dd><p>Set New Owner of the Contract</p>
</dd>
<dt><a href="#owner">owner()</a> ⇒ <code>string</code></dt>
<dd><p>Get Owner of the Contract</p>
</dd>
<dt><a href="#isPaused">isPaused()</a> ⇒ <code>boolean</code></dt>
<dd><p>Get Owner of the Contract</p>
</dd>
<dt><a href="#pauseContract">pauseContract()</a> ⇒ <code>admin</code></dt>
<dd><p>Pause Contract</p>
</dd>
<dt><a href="#erc20">erc20()</a> ⇒ <code>Address</code></dt>
<dd><p>Get Token Address</p>
</dd>
<dt><a href="#decimals">decimals()</a> ⇒ <code>Integer</code></dt>
<dd><p>Get Decimals</p>
</dd>
<dt><a href="#unpauseContract">unpauseContract()</a> ⇒ <code>admin</code></dt>
<dd><p>Unpause Contract</p>
</dd>
<dt><a href="#tradeValue">tradeValue()</a> ⇒ <code>Integer</code></dt>
<dd><p>Get swapratio for the pool</p>
</dd>
<dt><a href="#startDate">startDate()</a> ⇒ <code>Date</code></dt>
<dd><p>Get Start Date of Pool</p>
</dd>
<dt><a href="#endDate">endDate()</a> ⇒ <code>Date</code></dt>
<dd><p>Get End Date of Pool</p>
</dd>
<dt><a href="#isFinalized">isFinalized()</a> ⇒ <code>Boolean</code></dt>
<dd><p>To see if contract was finalized</p>
</dd>
<dt><a href="#individualMinimumAmount">individualMinimumAmount()</a> ⇒ <code>Integer</code></dt>
<dd><p>Get Individual Minimum Amount for each address</p>
</dd>
<dt><a href="#individualMaximumAmount">individualMaximumAmount()</a> ⇒ <code>Integer</code></dt>
<dd><p>Get Individual Maximum Amount for each address</p>
</dd>
<dt><a href="#minimumRaiseAchieved">minimumRaiseAchieved()</a> ⇒ <code>Boolean</code></dt>
<dd><p>Was Minimum Raise Achieved</p>
</dd>
<dt><a href="#minimumRaise">minimumRaise()</a> ⇒ <code>Integer</code></dt>
<dd><p>Get Minimum Raise amount for Token Sale</p>
</dd>
<dt><a href="#tokensAllocated">tokensAllocated()</a> ⇒ <code>Integer</code></dt>
<dd><p>Get Total tokens Allocated already, therefore the tokens bought until now</p>
</dd>
<dt><a href="#tokensForSale">tokensForSale()</a> ⇒ <code>Integer</code></dt>
<dd><p>Get Total tokens Allocated/In Sale for the Pool</p>
</dd>
<dt><a href="#hasMinimumRaise">hasMinimumRaise()</a> ⇒ <code>Boolea</code></dt>
<dd><p>See if hasMinimumRaise</p>
</dd>
<dt><a href="#minimumReached">minimumReached()</a> ⇒ <code>Integer</code></dt>
<dd><p>See if minimumRaise was Reached</p>
</dd>
<dt><a href="#tokensAvailable">tokensAvailable()</a> ⇒ <code>Integer</code></dt>
<dd><p>Get Total tokens owned by the Pool</p>
</dd>
<dt><a href="#tokensLeft">tokensLeft()</a> ⇒ <code>Integer</code></dt>
<dd><p>Get Total tokens available to be sold in the pool</p>
</dd>
<dt><a href="#withdrawableUnsoldTokens">withdrawableUnsoldTokens()</a> ⇒ <code>Integer</code></dt>
<dd><p>Get Total tokens available to be withdrawn by the admin</p>
</dd>
<dt><a href="#withdrawableFunds">withdrawableFunds()</a> ⇒ <code>Integer</code></dt>
<dd><p>Get Total funds raised to be withdrawn by the admin</p>
</dd>
<dt><a href="#isTokenSwapAtomic">isTokenSwapAtomic()</a> ⇒ <code>Boolean</code></dt>
<dd><p>Verify if the Token Swap is atomic on this pool</p>
</dd>
<dt><a href="#hasWhitelisting">hasWhitelisting()</a> ⇒ <code>Boolean</code></dt>
<dd><p>Verify if swap has whitelisting</p>
</dd>
<dt><a href="#isWhitelisted">isWhitelisted()</a> ⇒ <code>Boolean</code></dt>
<dd><p>Verify if address is whitelisted</p>
</dd>
<dt><a href="#wereUnsoldTokensReedemed">wereUnsoldTokensReedemed()</a> ⇒ <code>Boolean</code></dt>
<dd><p>Verify if the admin already reemeded unsold tokens</p>
</dd>
<dt><a href="#isFunded">isFunded()</a> ⇒ <code>Boolean</code></dt>
<dd><p>Verify if the Token Sale is Funded with all Tokens proposed in tokensForSale</p>
</dd>
<dt><a href="#isOpen">isOpen()</a> ⇒ <code>Boolean</code></dt>
<dd><p>Verify if the Token Sale is Open for Swap</p>
</dd>
<dt><a href="#hasStarted">hasStarted()</a> ⇒ <code>Boolean</code></dt>
<dd><p>Verify if the Token Sale has started the Swap</p>
</dd>
<dt><a href="#hasFinalized">hasFinalized()</a> ⇒ <code>Boolean</code></dt>
<dd><p>Verify if the Token Sale has finalized, if the current date is after endDate</p>
</dd>
<dt><a href="#isPreStart">isPreStart()</a> ⇒ <code>Boolean</code></dt>
<dd><p>Verify if the Token Sale in not open yet, where the admin can fund the pool</p>
</dd>
<dt><a href="#getPurchase">getPurchase(purchase_id)</a> ⇒ <code>Integer</code> | <code>Integer</code> | <code>Address</code> | <code>Integer</code> | <code>Date</code> | <code>Boolean</code> | <code>Boolean</code></dt>
<dd><p>Get Purchase based on ID</p>
</dd>
<dt><a href="#getWhiteListedAddresses">getWhiteListedAddresses()</a> ⇒ <code>Array</code> | <code>Address</code></dt>
<dd><p>Get Whitelisted Addresses</p>
</dd>
<dt><a href="#getBuyers">getBuyers()</a> ⇒ <code>Array</code> | <code>Integer</code></dt>
<dd><p>Get Buyers</p>
</dd>
<dt><a href="#getPurchaseIds">getPurchaseIds()</a> ⇒ <code>Array</code> | <code>Integer</code></dt>
<dd><p>Get All Purchase Ids</p>
</dd>
<dt><a href="#getPurchaseIds">getPurchaseIds(address)</a> ⇒ <code>Array</code> | <code>Integer</code></dt>
<dd><p>Get All Purchase Ids filter by Address/Purchaser</p>
</dd>
<dt><a href="#getETHCostFromTokens">getETHCostFromTokens(tokenAmount)</a> ⇒ <code>Integer</code></dt>
<dd><p>Get ETH Cost from Tokens Amount</p>
</dd>
<dt><a href="#swap">swap(tokenAmount)</a></dt>
<dd><p>Swap tokens by Ethereum</p>
</dd>
<dt><a href="#redeemTokens(isStandard)">redeemTokens(purchase_id)</a></dt>
<dd><p>Reedem tokens bought</p>
</dd>
<dt><a href="#redeemGivenMinimumGoalNotAchieved(isStandard)">redeemGivenMinimumGoalNotAchieved(purchase_id)</a></dt>
<dd><p>Reedem Ethereum from sale that did not achieve minimum goal</p>
</dd>
<dt><a href="#withdrawUnsoldTokens">withdrawUnsoldTokens()</a></dt>
<dd><p>Withdraw unsold tokens of sale</p>
</dd>
<dt><a href="#withdrawFunds">withdrawFunds()</a></dt>
<dd><p>Withdraw all funds from tokens sold</p>
</dd>
<dt><a href="#approveFundERC20">approveFundERC20()</a></dt>
<dd><p>Approve the pool to use approved tokens for sale</p>
</dd>
<dt><a href="#isApproved">isApproved(tokenAmount, address)</a> ⇒ <code>Boolean</code></dt>
<dd><p>Verify if the Admin has approved the pool to use receive the tokens for sale</p>
</dd>
<dt><a href="#fund">fund(tokenAmount)</a></dt>
<dd><p>Send tokens to pool for sale, fund the sale</p>
</dd>
<dt><a href="#addWhitelistedAddress">addWhitelistedAddress(Addresses)</a></dt>
<dd><p>add WhiteListed Address</p>
</dd>
<dt><a href="#removeWhitelistedAddress">removeWhitelistedAddress()</a></dt>
<dd><p>remove WhiteListed Address</p>
</dd>
<dt><a href="#safePull">safePull()</a></dt>
<dd><p>Safe Pull all tokens &amp; ETH</p>
</dd>
<dt><a href="#removeOtherERC20Tokens">removeOtherERC20Tokens(tokenAddress, toAddress)</a></dt>
<dd><p>Remove Tokens from other ERC20 Address (in case of accident)</p>
</dd>
<dt><a href="#deploy">deploy()</a></dt>
<dd><p>Deploy the Pool Contract</p>
</dd>
<dt><a href="#getOwner">getOwner(Address)</a></dt>
<dd><p>Get owner address of contract</p>
</dd>
<dt><a href="#getBalance">getBalance(Balance)</a></dt>
<dd><p>Get Balance of Contract</p>
</dd>
</dl>

<a name="FixedSwapContract"></a>

## FixedSwapContract
**Kind**: global class  
<a name="new_FixedSwapContract_new"></a>

### new FixedSwapContract(web3, tokenAddress, decimals, contractAddress)
Fixed Swap Object


| Param | Type | Description |
| --- | --- | --- |
| web3 | <code>Web3</code> |  |
| tokenAddress | <code>Address</code> |  |
| decimals | <code>Integer</code> |  |
| contractAddress | <code>Address</code> | ? (opt) |

<a name="setNewOwner"></a>

## setNewOwner(address)
Set New Owner of the Contract

**Kind**: global function  

| Param | Type |
| --- | --- |
| address | <code>string</code> | 

<a name="owner"></a>

## owner() ⇒ <code>string</code>
Get Owner of the Contract

**Kind**: global function  
**Returns**: <code>string</code> - address  
<a name="isPaused"></a>

## isPaused() ⇒ <code>boolean</code>
Get Owner of the Contract

**Kind**: global function  
<a name="pauseContract"></a>

## pauseContract() ⇒ <code>admin</code>
Pause Contract

**Kind**: global function  
<a name="erc20"></a>

## erc20() ⇒ <code>Address</code>
Get Token Address

**Kind**: global function  
**Returns**: <code>Address</code> - Token Address  
<a name="decimals"></a>

## decimals() ⇒ <code>Integer</code>
Get Decimals

**Kind**: global function  
**Returns**: <code>Integer</code> - Integer  
<a name="unpauseContract"></a>

## unpauseContract() ⇒ <code>admin</code>
Unpause Contract

**Kind**: global function  
<a name="tradeValue"></a>

## tradeValue() ⇒ <code>Integer</code>
Get swapratio for the pool

**Kind**: global function  
**Returns**: <code>Integer</code> - trade value against ETH  
<a name="startDate"></a>

## startDate() ⇒ <code>Date</code>
Get Start Date of Pool

**Kind**: global function  
<a name="endDate"></a>

## endDate() ⇒ <code>Date</code>
Get End Date of Pool

**Kind**: global function  
<a name="isFinalized"></a>

## isFinalized() ⇒ <code>Boolean</code>
To see if contract was finalized

**Kind**: global function  
<a name="individualMinimumAmount"></a>

## individualMinimumAmount() ⇒ <code>Integer</code>
Get Individual Minimum Amount for each address

**Kind**: global function  
<a name="individualMaximumAmount"></a>

## individualMaximumAmount() ⇒ <code>Integer</code>
Get Individual Maximum Amount for each address

**Kind**: global function  
<a name="minimumRaiseAchieved"></a>

## minimumRaiseAchieved() ⇒ <code>Boolean</code>
Was Minimum Raise Achieved

**Kind**: global function  
<a name="minimumRaise"></a>

## minimumRaise() ⇒ <code>Integer</code>
Get Minimum Raise amount for Token Sale

**Kind**: global function  
**Returns**: <code>Integer</code> - Amount in Tokens  
<a name="tokensAllocated"></a>

## tokensAllocated() ⇒ <code>Integer</code>
Get Total tokens Allocated already, therefore the tokens bought until now

**Kind**: global function  
**Returns**: <code>Integer</code> - Amount in Tokens  
<a name="tokensForSale"></a>

## tokensForSale() ⇒ <code>Integer</code>
Get Total tokens Allocated/In Sale for the Pool

**Kind**: global function  
**Returns**: <code>Integer</code> - Amount in Tokens  
<a name="hasMinimumRaise"></a>

## hasMinimumRaise() ⇒ <code>Boolea</code>
See if hasMinimumRaise

**Kind**: global function  
<a name="minimumReached"></a>

## minimumReached() ⇒ <code>Integer</code>
See if minimumRaise was Reached

**Kind**: global function  
<a name="tokensAvailable"></a>

## tokensAvailable() ⇒ <code>Integer</code>
Get Total tokens owned by the Pool

**Kind**: global function  
**Returns**: <code>Integer</code> - Amount in Tokens  
<a name="tokensLeft"></a>

## tokensLeft() ⇒ <code>Integer</code>
Get Total tokens available to be sold in the pool

**Kind**: global function  
**Returns**: <code>Integer</code> - Amount in Tokens  
<a name="withdrawableUnsoldTokens"></a>

## withdrawableUnsoldTokens() ⇒ <code>Integer</code>
Get Total tokens available to be withdrawn by the admin

**Kind**: global function  
**Returns**: <code>Integer</code> - Amount in Tokens  
<a name="withdrawableFunds"></a>

## withdrawableFunds() ⇒ <code>Integer</code>
Get Total funds raised to be withdrawn by the admin

**Kind**: global function  
**Returns**: <code>Integer</code> - Amount in ETH  
<a name="isTokenSwapAtomic"></a>

## isTokenSwapAtomic() ⇒ <code>Boolean</code>
Verify if the Token Swap is atomic on this pool

**Kind**: global function  
<a name="hasWhitelisting"></a>

## hasWhitelisting() ⇒ <code>Boolean</code>
Verify if swap has whitelisting

**Kind**: global function  
<a name="isWhitelisted"></a>

## isWhitelisted() ⇒ <code>Boolean</code>
Verify if address is whitelisted

**Kind**: global function  
<a name="wereUnsoldTokensReedemed"></a>

## wereUnsoldTokensReedemed() ⇒ <code>Boolean</code>
Verify if the admin already reemeded unsold tokens

**Kind**: global function  
<a name="isFunded"></a>

## isFunded() ⇒ <code>Boolean</code>
Verify if the Token Sale is Funded with all Tokens proposed in tokensForSale

**Kind**: global function  
<a name="isOpen"></a>

## isOpen() ⇒ <code>Boolean</code>
Verify if the Token Sale is Open for Swap

**Kind**: global function  
<a name="hasStarted"></a>

## hasStarted() ⇒ <code>Boolean</code>
Verify if the Token Sale has started the Swap

**Kind**: global function  
<a name="hasFinalized"></a>

## hasFinalized() ⇒ <code>Boolean</code>
Verify if the Token Sale has finalized, if the current date is after endDate

**Kind**: global function  
<a name="isPreStart"></a>

## isPreStart() ⇒ <code>Boolean</code>
Verify if the Token Sale in not open yet, where the admin can fund the pool

**Kind**: global function  
<a name="getPurchase"></a>

## getPurchase(purchase_id) ⇒ <code>Integer</code> \| <code>Integer</code> \| <code>Address</code> \| <code>Integer</code> \| <code>Date</code> \| <code>Boolean</code> \| <code>Boolean</code>
Get Purchase based on ID

**Kind**: global function  
**Returns**: <code>Integer</code> - _id<code>Integer</code> - amount<code>Address</code> - purchaser<code>Integer</code> - ethAmount<code>Date</code> - timestamp<code>Boolean</code> - wasFinalized<code>Boolean</code> - reverted  

| Param | Type |
| --- | --- |
| purchase_id | <code>Integer</code> | 

<a name="getWhiteListedAddresses"></a>

## getWhiteListedAddresses() ⇒ <code>Array</code> \| <code>Address</code>
Get Whitelisted Addresses

**Kind**: global function  
**Returns**: <code>Array</code> \| <code>Address</code> - addresses  
<a name="getBuyers"></a>

## getBuyers() ⇒ <code>Array</code> \| <code>Integer</code>
Get Buyers

**Kind**: global function  
**Returns**: <code>Array</code> \| <code>Integer</code> - _ids  
<a name="getPurchaseIds"></a>

## getPurchaseIds() ⇒ <code>Array</code> \| <code>Integer</code>
Get All Purchase Ids

**Kind**: global function  
**Returns**: <code>Array</code> \| <code>Integer</code> - _ids  
<a name="getPurchaseIds"></a>

## getPurchaseIds(address) ⇒ <code>Array</code> \| <code>Integer</code>
Get All Purchase Ids filter by Address/Purchaser

**Kind**: global function  
**Returns**: <code>Array</code> \| <code>Integer</code> - _ids  

| Param | Type |
| --- | --- |
| address | <code>Address</code> | 

<a name="getETHCostFromTokens"></a>

## getETHCostFromTokens(tokenAmount) ⇒ <code>Integer</code>
Get ETH Cost from Tokens Amount

**Kind**: global function  
**Returns**: <code>Integer</code> - ethAmount  

| Param | Type |
| --- | --- |
| tokenAmount | <code>Integer</code> | 

<a name="swap"></a>

## swap(tokenAmount)
Swap tokens by Ethereum

**Kind**: global function  

| Param | Type |
| --- | --- |
| tokenAmount | <code>Integer</code> | 

<a name="redeemTokens(isStandard)"></a>

## redeemTokens(purchase_id)
Reedem tokens bought

**Kind**: global function  

| Param | Type |
| --- | --- |
| purchase_id | <code>Integer</code> | 

<a name="redeemGivenMinimumGoalNotAchieved(isStandard)"></a>

## redeemGivenMinimumGoalNotAchieved(purchase_id)
Reedem Ethereum from sale that did not achieve minimum goal

**Kind**: global function  

| Param | Type |
| --- | --- |
| purchase_id | <code>Integer</code> | 

<a name="withdrawUnsoldTokens"></a>

## withdrawUnsoldTokens()
Withdraw unsold tokens of sale

**Kind**: global function  
<a name="withdrawFunds"></a>

## withdrawFunds()
Withdraw all funds from tokens sold

**Kind**: global function  
<a name="approveFundERC20"></a>

## approveFundERC20()
Approve the pool to use approved tokens for sale

**Kind**: global function  
<a name="isApproved"></a>

## isApproved(tokenAmount, address) ⇒ <code>Boolean</code>
Verify if the Admin has approved the pool to use receive the tokens for sale

**Kind**: global function  

| Param | Type |
| --- | --- |
| tokenAmount | <code>Integer</code> | 
| address | <code>Address</code> | 

<a name="fund"></a>

## fund(tokenAmount)
Send tokens to pool for sale, fund the sale

**Kind**: global function  

| Param | Type |
| --- | --- |
| tokenAmount | <code>Integer</code> | 

<a name="addWhitelistedAddress"></a>

## addWhitelistedAddress(Addresses)
add WhiteListed Address

**Kind**: global function  

| Param | Type |
| --- | --- |
| Addresses | <code>Array</code> \| <code>Addresses</code> | 

<a name="removeWhitelistedAddress"></a>

## removeWhitelistedAddress()
remove WhiteListed Address

**Kind**: global function  
<a name="safePull"></a>

## safePull()
Safe Pull all tokens & ETH

**Kind**: global function  
<a name="removeOtherERC20Tokens"></a>

## removeOtherERC20Tokens(tokenAddress, toAddress)
Remove Tokens from other ERC20 Address (in case of accident)

**Kind**: global function  

| Param | Type |
| --- | --- |
| tokenAddress | <code>Address</code> | 
| toAddress | <code>Address</code> | 

<a name="deploy"></a>

## deploy()
Deploy the Pool Contract

**Kind**: global function  
<a name="getOwner"></a>

## getOwner(Address)
Get owner address of contract

**Kind**: global function  

| Param | Type |
| --- | --- |
| Address | <code>Address</code> | 

<a name="getBalance"></a>

## getBalance(Balance)
Get Balance of Contract

**Kind**: global function  

| Param | Type |
| --- | --- |
| Balance | <code>Integer</code> | 

