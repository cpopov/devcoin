const DevCoinContract = artifacts.require('DevCoin')
const DevCoinSaleContract = artifacts.require('DevCoinSale')
const BigNumber = require('bignumber.js')
const chai = require('chai')
chai.use(require('chai-bignumber')(BigNumber))
const expect = chai.expect
const expectRevert = require('./helpers').expectRevert

contract('DevCoinSale', function (accounts) {
  let tokenContract
  let crowdsaleContract
  const creatorAccount = accounts[0]
  const userAccount = accounts[1]
  const decimals = 18
  const tokensForSale = new BigNumber(80).times(new BigNumber(10).pow(6 + decimals))

  let init = async () => {
    tokenContract = await DevCoinContract.new()
    crowdsaleContract = await DevCoinSaleContract.new(1000, creatorAccount, tokenContract.address)
    // the contract needs to own the takens for sale
    tokenContract.transfer(crowdsaleContract.address, tokensForSale)
  }

  describe('Token Sale', () => {
    beforeEach(init)

    it('Sender should be able to buy tokens', async () => {
      let initialOwnerEthBalance = await web3.eth.getBalance(creatorAccount)
      console.log('Initial owner Eth balance', web3.fromWei(initialOwnerEthBalance).toString())
      let initialUserEthBalance = await web3.eth.getBalance(userAccount)
      console.log('Initial user Eth balance', web3.fromWei(initialUserEthBalance).toString())
      let ownerTokenBalance = await tokenContract.balanceOf.call(creatorAccount)
      console.log('Owner token balance', ownerTokenBalance.toNumber())
      let crowdsaleTokenBalance = await tokenContract.balanceOf.call(crowdsaleContract.address)
      console.log('Crowdsale contract token balance', crowdsaleTokenBalance.toNumber())

      // when user sends 1 eth to EvedoTokenSale contract
      await crowdsaleContract.sendTransaction({from: userAccount, value: web3.toWei(1, 'ether')})
      let userTokenBalance = await tokenContract.balanceOf.call(userAccount)
      console.log('User Token Balance', userTokenBalance.toNumber())
      const expectedTokenBalance = new BigNumber(1000).times(new BigNumber(10).pow(decimals))
      expect(userTokenBalance).to.bignumber.equal(expectedTokenBalance)
      crowdsaleTokenBalance = await tokenContract.balanceOf.call(crowdsaleContract.address)
      console.log('Crowdsale contract token balance after transfer', crowdsaleTokenBalance.toNumber())

      // check that funds have been transferred
      let ownerEthBalanceAfterSale = await web3.eth.getBalance(creatorAccount)
      console.log('Owner Balance After sale', web3.fromWei(ownerEthBalanceAfterSale).toString())
      expect(web3.fromWei(ownerEthBalanceAfterSale.minus(initialOwnerEthBalance))).to.bignumber.be.greaterThan(0.9)
    })

    it('Sender needs to send eth', async () => {
      // when user sends 0 eth to EvedoTokenSale contract
      await expectRevert(crowdsaleContract.sendTransaction({from: userAccount, value: web3.toWei(0, 'ether')}))
    })
  })
})
