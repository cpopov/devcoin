pragma solidity 0.4.24;


import "./ERC20.sol";
import "./SafeMath.sol";

/**
Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20

This is a contract for a fixed supply coin.
*/
contract DevCoin is ERC20 {
  using SafeMath for uint256;

  // meta data
  string public constant symbol = "DEV";

  string public version = '1.0';

  string public constant name = "DevCoin";

  uint256 public constant decimals = 18;

  uint256 constant TOTAL_SUPPLY = 100 * (10 ** 6) * 10 ** decimals; // 100 millions

  // Owner of this contract
  address public owner;

  // Balances for each account
  mapping(address => uint256) internal balances;

  // Owner of account approves the transfer of an amount to another account owner -> (recipient -> amount)
  // This is used by exchanges. The owner effectively gives an exchange POA to transfer coins using
  // the function transferFrom()
  mapping(address => mapping(address => uint256)) internal allowed;

  /**
  * Constructor
  * the creator gets all the tokens initially
  */
  constructor() public {
    owner = msg.sender;
    balances[owner] = TOTAL_SUPPLY;
  }

  /**
    * Get the total token supply
    */
  function totalSupply() public view returns (uint256) {
    return TOTAL_SUPPLY;
  }

  /**
    * Get the account balance of an account with address _owner
    */
  function balanceOf(address _owner) public view returns (uint256 balance) {
    return balances[_owner];
  }

  /**
    * Send _value amount of tokens to address _to
    * Only the owner can call this function
    * No need to protect balances because only sender balance is accessed here
    */
  function transfer(address _to, uint256 _amount) public returns (bool success) {
    require(_to != address(0));
    require(_amount <= balances[msg.sender]);

    // SafeMath.sub will throw if there is not enough balance of if there is an overflow
    balances[msg.sender] = balances[msg.sender].sub(_amount);
    balances[_to] = balances[_to].add(_amount);

    // notify
    emit Transfer(msg.sender, _to, _amount);
    return true;
  }

  /**
    * Send _value amount of tokens from address _from to address _to
    */
  function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success) {
    // protection against integer overflow
    require(_to != address(0));
    require(_amount <= balances[_from]);
    require(_amount <= allowed[_from][msg.sender]);

    balances[_from] = balances[_from].sub(_amount);
    balances[_to] = balances[_to].add(_amount);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_amount);

    // notify
    emit Transfer(_from, _to, _amount);
    return true;
  }

  /** Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    * If this function is called again it overwrites the current allowance with _value.
    * this function is required for some DEX functionality
    */
  function approve(address _spender, uint256 _value) public returns (bool success) {
    // no need to check sender identity as he can only modify his own allowance
    allowed[msg.sender][_spender] = _value;
    // notify
    emit Approval(msg.sender, _spender, _value);
    return true;
  }

  /**
    * Returns the amount which _spender is still allowed to withdraw from _owner
    */
  function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }

}
