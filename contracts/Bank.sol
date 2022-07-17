// SPDX-License-Identifier: MIT
pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract Bank is Ownable  {
    IERC20 public  token;
    uint public fee = 1;
    uint public totalSupply;
    mapping(address => uint) public balanceOf;

    constructor(address _token) {
        token = IERC20(_token);
    }

    function _mint(address _to, uint _shares) private {
        totalSupply += _shares;
        balanceOf[_to] += _shares;
    }

    function _burn(address _from, uint _shares) private {
        totalSupply -= _shares;
        balanceOf[_from] -= _shares;
    }

    function deposit(uint _amount) external {
        /*
        a = amount
        B = balance of token before deposit
        T = total supply
        s = shares to mint

        (T + s) / T = (a + B) / B 

        s = aT / B
        */
        
        require(token.balanceOf(msg.sender) >= _amount, "Your token amount must be greater than amount you are trying to deposit");
        require(token.allowance(msg.sender ,address(this)) >= _amount,"You must approve our contract");
        
        uint shares;
        if (totalSupply == 0) {
            shares = _amount;
        } else {
            shares = (_amount * totalSupply) / token.balanceOf(address(this));
        }

        _mint(msg.sender, shares);
        token.transferFrom(msg.sender, address(this), _amount);
    }

    function withdraw(uint _shares) external {
        /*
        a = amount
        B = balance of token before withdraw
        T = total supply
        s = shares to burn

        (T - s) / T = (B - a) / B 

        a = sB / T
        */
        require(balanceOf[msg.sender] >= _shares ,"You cannot withdraw more than your deposition");
        uint amount = (_shares * token.balanceOf(address(this))) / totalSupply;
        _burn(msg.sender, _shares);
        token.transfer(msg.sender, amount);
    }

    function TransferTo(address _to, uint _shares) public{
        /*
        a = amount
        B = balance of token before withdraw
        T = total supply
        s = shares to burn

        (T - s) / T = (B - a) / B 

        a = sB / T
        */
        require(balanceOf[msg.sender] >= _shares ,"You cannot trasnfer token more than your deposition");
        uint amount = (_shares * token.balanceOf(address(this))) / totalSupply;
        _burn(msg.sender, _shares );
        token.transfer(_to, amount*(100-fee)/100);

        console.log("transfer to include fee:",_to,"amount:",amount*(100-fee)/100);
        
        //to enable contract owner to wthdraw fee deposited in this contract
        //trasnfer ownership of deposiy fee to owner of Bank contract
        balanceOf[address(owner())]+=(_shares-_shares*(100-fee)/100);
        totalSupply += (amount-(amount*(100-fee)/100))*totalSupply/token.balanceOf(address(this));

    }

    function TransferToGroup(address[] calldata addresses,uint _shares) external{
        /*
        a = amount
        B = balance of token before withdraw
        T = total supply
        s = shares to burn

        (T - s) / T = (B - a) / B 
        a = sB / T
        */
        require(balanceOf[msg.sender] >= _shares * addresses.length ,"You cannot trasnfer token more than your deposition");
        for(uint i = 0; i < addresses.length; i++) {
            TransferTo(addresses[i], _shares);
            console.log("transfer to exclude fee:",addresses[i],"amount:",_shares);
        }
    }

    //allow owner to reset token address
    function setToken(address _token) external onlyOwner{
        token = IERC20(_token);
    }

    //allow owner to reset trasnction fee rate
    function setFee(uint _fee) external onlyOwner{
        fee = _fee;
    }
}

