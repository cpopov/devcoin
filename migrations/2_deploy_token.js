const DevCoin = artifacts.require('./DevCoin.sol')

module.exports = (deployer) => {
  return deployer.deploy(DevCoin)
}
