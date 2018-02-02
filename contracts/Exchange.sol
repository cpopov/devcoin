pragma solidity ^0.4.18;

import "./library/SafeMath.sol";
import "./ERC20.sol";

/**
*  Smart contract enabling funding and exchanging of DevCoin.
*  The rate is defined by the owner of the contract, but it will never be less than ICO price.
*  The price of token in ETH is 1/rate. Eg for 1 Eth the sender will get rate number of tokens.
*/
contract Exchange {
  using SafeMath for uint256;

  address public owner;
  uint public creationTime = now;
  uint public ICO_RATE = 1000; // tokens for 1 eth
  uint public rate = 1000; // tokens for 1 eth
  ERC20 public token;


  event BuyToken(address user, uint amount, uint costWei, uint balance);
  event SellToken(address user, uint amount, uint costWei, uint balance);

  /**
   * @dev Throws if called by any account other than the owner.
   */
  modifier onlyOwner() {
    require(msg.sender == owner);
    _;
  }

  /**
  * constructor
  */
  function Exchange(address tokenContractAddr) public {
    token = ERC20(tokenContractAddr);
    owner = msg.sender;
  }

  /**
  * Fallback function. Used to load the exchange with ether
  */
  function() public payable { }

  /**
  * Sender requests to buy [amount] of tokens from the contract.
  * Sender needs to send enough ether to buy the tokens at a price of amount / rate
  */
  function buyToken(uint amount) payable public returns (bool success) {
    // ensure enough tokens are owned by the depositor
    uint costWei = (amount * 1 ether) / rate;
    require(msg.value >= costWei);
    assert(token.transferFrom(owner, msg.sender, amount));
    BuyToken(msg.sender, amount, costWei, token.balanceOf(msg.sender));
    uint change = msg.value - costWei;
    if (change >= 1) msg.sender.transfer(change);
    return true;
  }

  /**
  *  Sender requests to sell [amount] of tokens to the contract in return of Eth.
  */
  function sellToken(uint amount) public returns (bool success) {
    // ensure enough funds
    uint costWei = (amount * 1 ether) / rate;
    require(this.balance >= costWei);
    assert(token.transferFrom(msg.sender, owner, amount));
    msg.sender.transfer(costWei);
    SellToken(msg.sender, amount, costWei, token.balanceOf(msg.sender));
    return true;
  }

  function updateRate(uint newRate) onlyOwner public returns (bool success) {
    // make sure rate is never less than ICO rate
    require(newRate >= ICO_RATE);
    rate = newRate;
    return true;
  }
}
