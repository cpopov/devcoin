pragma solidity 0.4.18;

/**
* Abstract contract(interface) for the full ERC 20 Token standard
* see https://github.com/ethereum/EIPs/issues/20
* This is a simple fixed supply token contract.
*/
contract ERC20 {

    /**
    * Get the total token supply
    */
    function totalSupply() public view returns (uint256 supply);

    /**
    * Get the account balance of an account with address _owner
    */
    function balanceOf(address _owner) public view returns (uint256 balance);

    /**
    * Send _value amount of tokens to address _to
    * Only the owner can call this function
    */
    function transfer(address _to, uint256 _value) public returns (bool success);

    /**
    * Send _value amount of tokens from address _from to address _to
    */
    function transferFrom(address _from, address _to, uint256 _value) public returns (bool success);

    /** Allow _spender to withdraw from your account, multiple times, up to the _value amount.
    * If this function is called again it overwrites the current allowance with _value.
    * this function is required for some DEX functionality
    */
    function approve(address _spender, uint256 _value) public returns (bool success);

    /**
    * Returns the amount which _spender is still allowed to withdraw from _owner
    */
    function allowance(address _owner, address _spender) public view returns (uint256 remaining);

    /**
    * Triggered when tokens are transferred from one address to another
    */
    event Transfer(address indexed from, address indexed to, uint256 value);

    /**
    * Triggered whenever approve(address spender, uint256 value) is called.
    */
    event Approval(address indexed owner, address indexed spender, uint256 value);
}
