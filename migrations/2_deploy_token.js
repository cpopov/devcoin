const DevCoin = artifacts.require('./DevCoin.sol')

module.exports = (deployer) => {
  deployer.deploy(DevCoin)
}
