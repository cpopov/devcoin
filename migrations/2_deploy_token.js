const DevCoin = artifacts.require('./DevCoin.sol')
const Exchange = artifacts.require('./Exchange.sol')

module.exports = (deployer) => {
  deployer.deploy(DevCoin)
  deployer.deploy(Exchange)
}
