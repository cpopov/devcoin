pragma solidity ^0.4.18;


import "./ERC20Interface.sol";
import "./library/SafeMath.sol";

/**
Implements ERC 20 Token standard: https://github.com/ethereum/EIPs/issues/20

This is a contract for a fixed supply coin.
*/
contract DevCoin is ERC20Interface {
  using SafeMath for uint256;

  // meta data
  string public constant symbol = "DEV";

  string public version = '0.1';

  string public constant name = "DevCoin";

  uint256 public constant decimals = 18;

  uint256 TOTAL_SUPPLY = 100 * (10 ** 6) * 10 ** decimals; // 100 millions

  // Owner of this contract
  address public owner;

  // Balances for each account
  mapping(address => uint256) internal balances;

  // Owner of account approves the transfer of an amount to another account owner -> (recipient -> amount)
  // This is used by exchanges. The owner effectively gives an exchange POA to transfer coins using
  // the function transferFrom()
  mapping(address => mapping(address => uint256)) internal allowed;

  // Constructor
  // the creator gets all the tokens initially
  function DevCoin() public {
    owner = msg.sender;
    balances[owner] = TOTAL_SUPPLY;
  }

  // Implements ERC20Interface
  function totalSupply() public view returns (uint256 supply) {
    supply = TOTAL_SUPPLY;
  }

  // Implements ERC20Interface
  function balanceOf(address _owner) public view returns (uint256 balance) {
    return balances[_owner];
  }

  // Implements ERC20Interface
  // No need to protect balances because only sender balance is accessed here
  function transfer(address _to, uint256 _amount) public returns (bool success) {
    require(_to != address(0));
    require(_amount <= balances[msg.sender]);

    // SafeMath.sub will throw if there is not enough balance of if there is an overflow
    balances[msg.sender] = balances[msg.sender].sub(_amount);
    balances[_to] = balances[_to].add(_amount);

    // notify
    Transfer(msg.sender, _to, _amount);
    return true;
  }

  // Implements ERC20Interface
  function transferFrom(address _from, address _to, uint256 _amount) public returns (bool success) {
    // protection against integer overflow
    require(_to != address(0));
    require(_amount <= balances[_from]);
    require(_amount <= allowed[_from][msg.sender]);

    balances[_from] = balances[_from].sub(_amount);
    balances[_to] = balances[_to].add(_amount);
    allowed[_from][msg.sender] = allowed[_from][msg.sender].sub(_amount);

    // notify
    Transfer(_from, _to, _amount);
    return true;
  }

  // Implements ERC20Interface
  function approve(address _spender, uint256 _value) public returns (bool success) {
    // no need to check sender identity as he can only modify his own allowance
    allowed[msg.sender][_spender] = _value;
    // notify
    Approval(msg.sender, _spender, _value);
    return true;
  }

  // Implements ERC20Interface
  function allowance(address _owner, address _spender) public view returns (uint256 remaining) {
    return allowed[_owner][_spender];
  }


}
