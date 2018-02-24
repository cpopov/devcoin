#Ethereum Smart Contracts for DevCoin


## ICO process

Addresses:

Accounts:
- owner
- reserve fund

Contracts:
- token contract
- exchange contract

1. Owner deploys contracts (pays the fees)
2. Owner transfers 20% of coins to reserve address
3. Owner transfers 80% of coins to exchange wallet address

## Token sale process
1. Buyer send eth and calls buy function on Exchange contract
2. Exchange contract transfer tokens from exchange wallet to buyer

## Token refund process
1. Seller authorises exchange to transfer token on his behalf. (alternatively keep exchange authorised)
2. Seller calls sell function on exchange contract
3. Contract transfers token to exchange wallet address and send eth to seller 

## Test locally

    npm install -g ethereumjs-testrpc
    npm install
    npm test
    
## Deploy locally

* Start testrpc
* Deploy the contracts using truffle: ```truffle migrate```
* Then launch truffle console to play with the contracts: ```truffle console```  

## Deploy on test net (Ropsten)

The fastest way is to use Metamask rather than running your own node.

## Deploy on live net

## Security

See https://consensys.github.io/smart-contract-best-practices/
