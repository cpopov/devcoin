const DevCoinAbstraction = artifacts.require('DevCoin')
const BigNumber = require('bignumber.js')
const expect = require('chai').expect

contract('DevCoin', function (accounts) {
  let tokenContract
  const creatorAccount = accounts[0]
  const secondAccount = accounts[1]
  const decimals = 18
  const initialAmount = new BigNumber(100).times(new BigNumber(10).pow(6 + decimals))

  describe('Creation', function () {
    beforeEach(function () {
      return DevCoinAbstraction.new().then(function (instance) {
        tokenContract = instance
        return tokenContract
      })
    })

    it('should gove all the initial balance to the creator', function () {
      return tokenContract.balanceOf.call(creatorAccount)
        .then(function (balance) {
          expect(balance.toNumber()).to.equal(initialAmount.toNumber())
          return tokenContract.decimals.call()
        })
        .then(function (decimalsResult) {
          expect(decimalsResult.toNumber()).to.equal(decimals)
          return tokenContract.symbol.call()
        })
        .then(function (symbol) {
          expect(symbol).to.equal('DEV')
          return symbol
        })
    })
  })

  describe('Normal Transfers', function () {
    beforeEach(function () {
      return DevCoinAbstraction.new().then(function (instance) {
        tokenContract = instance
        return tokenContract
      })
    })

    it('ether transfer should be reversed.', function (done) {
      web3.eth.sendTransaction({
        from: creatorAccount,
        to: tokenContract.address,
        value: web3.toWei('10', 'Ether')
      }, function (err) {
        assert(err, 'Transaction should be rejected')
        tokenContract.balanceOf.call(creatorAccount).then(function (balanceAfter) {
          expect(balanceAfter.toNumber()).to.equal(initialAmount.toNumber())
          return done()
        })
          .catch(done)
      })
    })

    it('should transfer all tokens', function () {
      return tokenContract.transfer(secondAccount, initialAmount, {from: creatorAccount})
        .then(function (success) {
          assert.ok(success)
          return tokenContract.balanceOf.call(secondAccount)
        })
        .then(function (balance) {
          expect(balance.toNumber()).to.equal(initialAmount.toNumber())
          return balance
        })
    })

    it('should fail when trying to transfer initialAmount + 1', function () {
      return tokenContract.transfer(secondAccount, initialAmount.add(1), {from: creatorAccount})
        .then(function () {
          throw new Error('Transfer expected to fail')
        })
        .catch(function (e) {
          assert.ok(e)
        })
    })

    it('transfers: should transfer 1 token', function () {
      return tokenContract.transfer(secondAccount, 1, {from: creatorAccount})
        .then(function (res) {
          assert.ok(res)

          // check event log
          const transferLog = res.logs[0]
          expect(transferLog.args.from).to.equal(creatorAccount)
          expect(transferLog.args.to).to.equal(secondAccount)
          expect(transferLog.args.value.toString()).to.equal('1')
          return true
        })
    })
  })

  describe('Approvals', function () {
    beforeEach(function (done) {
      DevCoinAbstraction.new().then(function (instance) {
        tokenContract = instance
        return done()
      })
        .catch(done)
    })

    it('when msg.sender approves 100 to accounts[1] then account[1] should be able to withdraw 20 from msg.sender', function () {
      let sender = creatorAccount
      return tokenContract.approve(secondAccount, 100, {from: sender})
        .then(function (res) {
          assert.ok(res)

          // check event logs
          const approvalLog = res.logs[0]
          expect(approvalLog.args.owner).to.equal(creatorAccount)
          expect(approvalLog.args.spender).to.equal(secondAccount)
          expect(approvalLog.args.value.toString()).to.equal('100')

          return tokenContract.allowance.call(sender, secondAccount)
        })
        .then(function (allowance) {
          expect(allowance.toNumber()).to.equal(100)
          return tokenContract.transferFrom(sender, accounts[2], 20, {from: secondAccount})
        })
        .then(function (success) {
          assert.ok(success)
          return tokenContract.allowance.call(sender, secondAccount)
        })
        .then(function (allowance) {
          expect(allowance.toNumber()).to.equal(80)
          return tokenContract.balanceOf.call(accounts[2])
        })
        .then(function (balance) {
          expect(balance.toNumber()).to.equal(20)
          return tokenContract.balanceOf.call(creatorAccount)
        })
        .then(function (balance) {
          expect(balance.plus(20).toNumber()).to.equal(initialAmount.toNumber())
          return true
        })
    })

    it('when msg.sender approves 100 to accounts[1] then account[1] should not be able to withdraw 101 from msg.sender', function () {
      let sender = creatorAccount
      return tokenContract.approve(secondAccount, 100, {from: sender})
        .then(function (success) {
          assert.ok(success)
          return tokenContract.allowance.call(sender, secondAccount)
        })
        .then(function (allowance) {
          expect(allowance.toNumber()).to.equal(100)
          return tokenContract.transferFrom(sender, accounts[2], 101, {from: secondAccount})
        })
        .then(function () {
          throw new Error('Should fail')
        })
        .catch(function (e) {
          assert.ok(e)
        })
    })

    it('withdrawal from account with no allowance should fail', function () {
      return tokenContract.transferFrom(creatorAccount, accounts[2], 60, {from: accounts[1]})
        .then(function () {
          throw new Error('Should fail')
        })
        .catch(function (e) {
          assert.ok(e)
        })
    })
  })
})
