pragma solidity 0.4.24;

import "./DevCoin.sol";
import "./SafeMath.sol";


contract DevCoinSale {
  using SafeMath for uint256;

  // The token being sold
  DevCoin public token;

  // Address where funds are collected
  address public wallet;

  // How many token units a buyer gets per wei.
  uint256 public rate;

  // Amount of wei raised
  uint256 public weiRaised;

  /**
   * Event for token purchase logging
   * @param purchaser who paid for the tokens
   * @param beneficiary who got the tokens
   * @param value weis paid for purchase
   * @param amount amount of tokens purchased
   */
  event TokenPurchase(
    address indexed purchaser,
    address indexed beneficiary,
    uint256 value,
    uint256 amount
  );

  /**
   * @param _rate Number of token units a buyer gets per wei
   * @param _wallet Address where collected funds will be forwarded to
   * @param _token Address of the token being sold
   */
  constructor(uint256 _rate, address _wallet, DevCoin _token) public {
    require(_rate > 0);
    require(_wallet != address(0));
    require(_token != address(0));

    rate = _rate;
    wallet = _wallet;
    token = _token;
  }

  /**
   * @dev fallback function
   */
  function() external payable {
    buyTokens(msg.sender);
  }

  /**
   * @dev token purchase
   * @param _beneficiary Address performing the token purchase
   */
  function buyTokens(address _beneficiary) public payable {

    uint256 weiAmount = msg.value;
    require(_beneficiary != address(0));
    require(weiAmount != 0);

    // calculate token amount to be created
    uint256 tokens = weiAmount.mul(rate);

    // update state
    weiRaised = weiRaised.add(weiAmount);

    // revert here if transfer fails
    require(token.transfer(_beneficiary, tokens));

    emit TokenPurchase(
      msg.sender,
      _beneficiary,
      weiAmount,
      tokens
    );

    wallet.transfer(msg.value);
  }

}
