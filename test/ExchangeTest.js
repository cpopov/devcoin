const DevCoinAbstraction = artifacts.require('DevCoin')
const ExchangeAbstraction = artifacts.require('Exchange')
// const BigNumber = require('bignumber.js')
const expect = require('chai').expect

contract('Exchange', function (accounts) {
  let tokenContract
  let exchangeContract
  const creatorAccount = accounts[0]
  const userAccount = accounts[1]
  let initialUserEther

  let init = async () => {
    tokenContract = await DevCoinAbstraction.new()
    exchangeContract = await ExchangeAbstraction.new(tokenContract.address)
    await tokenContract.transfer(userAccount, 100, {from: creatorAccount})
    await tokenContract.approve(exchangeContract.address, 100, {from: creatorAccount})
    await tokenContract.approve(exchangeContract.address, 100, {from: userAccount})
    initialUserEther = await web3.eth.getBalance(userAccount)
    // give the exchange some Ether
    await web3.eth.sendTransaction({
      from: creatorAccount,
      to: exchangeContract.address,
      value: web3.toWei('10', 'Ether')
    })
  }

  describe('Token Purchase', () => {
    beforeEach(init)

    it('Customer should be able buy tokens from exchange and get change', async () => {
      let res = await exchangeContract.buyToken(10, {from: userAccount, value: web3.toWei('1', 'Ether')})
      assert.ok(res)

      const event1 = res.logs[0].event
      expect(event1).to.equal('BuyToken')

      let userTokenBalance = await tokenContract.balanceOf.call(userAccount)
      expect(userTokenBalance.toNumber()).to.equal(110)

      let userEtherBalance = web3.eth.getBalance(userAccount)
      let etherSpent = web3.fromWei(initialUserEther.minus(userEtherBalance), 'ether')
      expect(etherSpent.toNumber()).to.be.lessThan(1)
    })

    it('Customer should not be able buy tokens from exchange if not enough ether sent', async () => {
      try {
        await exchangeContract.buyToken(1000, {from: userAccount, value: web3.toWei('0.1', 'Ether')})
      } catch (e) {
        assert.ok(e)
      }

      // const event1 = res.logs[0].event
      // expect(event1).to.equal('BuyToken')

      let userTokenBalance = await tokenContract.balanceOf.call(userAccount)
      expect(userTokenBalance.toNumber()).to.equal(100)

      let userEtherBalance = web3.eth.getBalance(userAccount)
      let etherSpent = web3.fromWei(initialUserEther.minus(userEtherBalance), 'ether')
      expect(etherSpent.toNumber()).to.be.lessThan(0.1)
    })
  })

  describe('Token Sale', () => {
    beforeEach(init)

    it('Customer should be able sell tokens to exchange and get ether', async () => {
      let res = await exchangeContract.sellToken(11, {from: userAccount})
      assert.ok(res)

      const event1 = res.logs[0].event
      expect(event1).to.equal('SellToken')

      let userTokenBalance = await tokenContract.balanceOf.call(userAccount)
      expect(userTokenBalance.toNumber()).to.equal(89)

      let userEtherBalance = web3.eth.getBalance(userAccount)
      let etherEarned = web3.fromWei(userEtherBalance.minus(initialUserEther), 'ether')
      expect(etherEarned.toNumber()).to.be.above(0.001)
    })
  })

  describe('Price change', () => {
    beforeEach(init)

    it('Owner should be able to change price', async () => {
      let res = await exchangeContract.updateRate(2000, {from: creatorAccount})
      assert.ok(res)

      let rate = await exchangeContract.rate.call()
      expect(rate.toNumber()).to.equal(2000)
    })

    it('Only Owner should be able to change price', async () => {
      try {
        await exchangeContract.updateRate(2000, {from: userAccount})
      } catch (e) {
        assert.ok(e)
      }

      let rate = await exchangeContract.rate.call()
      expect(rate.toNumber()).to.equal(1000)
    })
  })
})
