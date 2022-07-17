const { expect } = require("chai");
const { ethers } = require("hardhat");


describe("BankandToken", function () {
  let owner;
  let addr1; 
  let addr2;
  let addr3;
  let erc20Deployed;
  let bankDeployed;

  this.beforeEach("Deploying smart contract", async () => {

    //initialized ERC20 coontract with owner initial supply 100,000 CCY
    [owner, addr1, addr2, addr3] = await ethers.getSigners(initial_supply="100000");
    const  ERC20 = await ethers.getContractFactory("ERC20");
    const  erc20 = await ERC20.deploy(initial_supply);
    erc20Deployed = await erc20.deployed();
    balanceTokenBefore = await erc20Deployed.balanceOf(owner.address);

    //initialize Bank contract 
    const Bank = await ethers.getContractFactory("Bank");
    const bank = await Bank.deploy(erc20Deployed.address);
    bankDeployed = await bank.deployed();

    
  });
  

  it("user able to deposit arbitary amount of ERC20 token and withdraw arbitary amount with no more than deposited Token in the Bank", async (deposit_amount="67",withdraw_amount="2") => {

    //approve Bank contract to spend ERC20 you wish to deposit
    const erc20Signed = erc20Deployed.connect(owner);
    await erc20Signed.approve(bankDeployed.address,deposit_amount);

    //deposit 2500 of 100,000 to Bank contract
    const bankSigned = bankDeployed.connect(owner);
    await bankSigned.deposit(deposit_amount);

    let balanceTokenAfter = await erc20Deployed.balanceOf(owner.address);
    let balanceBankAfter = await bankDeployed.balanceOf(owner.address);

    //checking for amount bank balance and owner balance after user deposit token
    let ownerTokenBalance = (parseInt(initial_supply)-parseInt(deposit_amount)).toString();
    let ownerBankBalance = deposit_amount.toString();
    expect(balanceTokenAfter.toString()).to.equal(ownerTokenBalance);
    expect(balanceBankAfter.toString()).to.equal(ownerBankBalance);

    //checking for amount bank balance and owner balance after user withdraw token
    // balanceTokenAfter and balanceBankAfter are the amount after actions which is depending on prior action
    await bankSigned.withdraw(withdraw_amount);
    balanceTokenAfter = await erc20Deployed.balanceOf(owner.address);
    balanceBankAfter = await bankDeployed.balanceOf(owner.address);

    ownerTokenBalance= (parseInt(initial_supply)-parseInt(deposit_amount)+parseInt(withdraw_amount)).toString();
    ownerBankBalance = (parseInt(deposit_amount)-parseInt(withdraw_amount)).toString()
    expect(balanceTokenAfter.toString()).to.equal(ownerTokenBalance);
    expect(balanceBankAfter.toString()).to.equal(ownerBankBalance);

  })

  it ("user able to transfer deposited ERC20 token to other accounts with 1% fee [sender = owner]", async (deposit_amount="1500",transfer_amount="1000") => {
    
    //approve Bank contract to spend ERC20 you wish to deposit
    const erc20Signed = erc20Deployed.connect(owner);
    await erc20Signed.approve(bankDeployed.address,deposit_amount);

    //deposit token into Bank contract
    let bankSigned = bankDeployed.connect(owner);
    await bankSigned.deposit(deposit_amount);
  
    
    const BankBalanceOwnerBefore = await bankDeployed.balanceOf(owner.address).then((data) => parseInt(data.toString()));
    const BankBalanceAddress1Before = await bankDeployed.balanceOf(addr1.address).then((data) => parseInt(data.toString()));
    

    const TokenBalanceOwnerBefore = await erc20Deployed.balanceOf(owner.address).then((data) => parseInt(data.toString()));
    const TokenBalanceAdress1Before = await erc20Deployed.balanceOf(addr1.address).then((data) => parseInt(data.toString()));
    const TokenBalanceBankBefore = await erc20Deployed.balanceOf(bankDeployed.address).then((data) => parseInt(data.toString()));
    
   
    //transfering deposit ERC20 from owner to
    await bankSigned.TransferTo(addr1.address,transfer_amount.toString());
    balanceBankAfter = await bankDeployed.balanceOf(addr1.address);

    const BankBalanceOwnerAfter = await bankDeployed.balanceOf(owner.address).then((data) => parseInt(data.toString()));

    const TokenBalanceAddress1After = await erc20Deployed.balanceOf(addr1.address).then((data) => parseInt(data.toString()));
    const TokenBalanceBankAfter = await erc20Deployed.balanceOf(bankDeployed.address).then((data) => parseInt(data.toString()));
    
    
    //recipient received transfered Token minus fee from Bank
    expect(TokenBalanceAddress1After).to.equal(TokenBalanceAdress1Before+Math.floor(0.99*(transfer_amount)));
    //Bank collected 1% transfer fee
    expect(TokenBalanceBankAfter,Math.ceil(0.01*(transfer_amount)));
    //Case1 owner call transfer function then fee are re-added to owner
    expect(BankBalanceOwnerAfter).to.equal(BankBalanceOwnerBefore-transfer_amount+Math.ceil(0.01*(transfer_amount)));

  })

  

  it ("user able to transfer deposited ERC20 token to other accounts with 1% fee [sender = not owner]", async (deposit_amount="1500",transfer_amount="1000") => {
    
    const erc20Signed = erc20Deployed.connect(addr1);
    await erc20Signed.mint(deposit_amount);

    //approve Bank contract to spend ERC20 you wish to deposit
    await erc20Signed.approve(bankDeployed.address,deposit_amount);

    //deposit token into Bank contract
    let bankSigned = bankDeployed.connect(addr1);
    await bankSigned.deposit(deposit_amount);
  
    
    const BankBalanceAdd1Before = await bankDeployed.balanceOf(addr1.address).then((data) => parseInt(data.toString()));
    const BankBalanceOwnerBefore = await bankDeployed.balanceOf(owner.address).then((data) => parseInt(data.toString()));
    

    const TokenBalanceAdd2After = await erc20Deployed.balanceOf(addr2.address).then((data) => parseInt(data.toString()));

    
   
    //transfering deposit ERC20 from addr1 to
    await bankSigned.TransferTo(addr2.address,transfer_amount.toString());
    balanceBankAfter = await bankDeployed.balanceOf(addr2.address);

    const BankBalanceAdd1After = await bankDeployed.balanceOf(addr1.address).then((data) => parseInt(data.toString()));
    const BankBalanceOwnerAfter = await bankDeployed.balanceOf(owner.address).then((data) => parseInt(data.toString()));

    const TokenBalanceAdd1After = await erc20Deployed.balanceOf(addr2.address).then((data) => parseInt(data.toString()));
    const TokenBalanceBankAfter = await erc20Deployed.balanceOf(bankDeployed.address).then((data) => parseInt(data.toString()));
    
    
    //recipient received transfered Token minus fee from Bank
    expect(TokenBalanceAdd1After).to.equal(TokenBalanceAdd2After+Math.floor(0.99*(transfer_amount)));
    //Bank collected 1% transfer fee
    expect(TokenBalanceBankAfter,Math.ceil(0.01*(transfer_amount)));
    //Case1 addr1 call transfer function
    expect(BankBalanceAdd1After).to.equal(BankBalanceAdd1Before-transfer_amount);
    //Bank owner gain deposit fee
    expect(BankBalanceOwnerAfter).to.equal(BankBalanceOwnerBefore+Math.ceil(0.01*(transfer_amount)));
    console.log('owner balance in bank ',BankBalanceOwnerAfter,'bank',TokenBalanceBankAfter);

  })
  
  it("transfer to multiple account at the same time", async () => {

    //approve Bank contract to spend ERC20 you wish to deposit
    const erc20Signed = erc20Deployed.connect(owner);
    await erc20Signed.approve(bankDeployed.address,"10000");

    //deposit 2500 of 10000 to Bank contract
    let bankSigned = bankDeployed.connect(owner);
    await bankSigned.deposit("10000");
    //await bankSigned.TransferTo(addr2.address,"0");
    //await bankSigned.TransferTo(addr1.address,"0");

    const TokenBalanceAdress1Before = await erc20Deployed.balanceOf(addr1.address).then((data) => parseInt(data.toString()));
    const TokenBalanceAdress2Before = await erc20Deployed.balanceOf(addr2.address).then((data) => parseInt(data.toString()));
    const TokenBalanceBankBefore = await erc20Deployed.balanceOf(bankDeployed.address).then((data) => parseInt(data.toString()));
    const BankBalanceOwnerBefore = await bankDeployed.balanceOf(owner.address).then((data) => parseInt(data.toString()));

    bankSigned = bankDeployed.connect(owner);
    await bankSigned.TransferToGroup([addr1.address,addr2.address],"2000")
   
    
    const BankBalanceOwnerAfter = await bankDeployed.balanceOf(owner.address).then((data) => parseInt(data.toString()));

    const TokenBalanceAddress1After = await erc20Deployed.balanceOf(addr1.address).then((data) => parseInt(data.toString()));
    const TokenBalanceAddress2After = await erc20Deployed.balanceOf(addr2.address).then((data) => parseInt(data.toString()));
    const TokenBalanceBankAfter = await erc20Deployed.balanceOf(bankDeployed.address).then((data) => parseInt(data.toString()));
    
    //recipient received transfered Token from Bank
    //Bank collected 1% transfer fee
    // console.log(BankBalanceOwnerAfter,BankBalanceOwnerBefore-transferAmount)
    expect(TokenBalanceAddress1After).to.equal(TokenBalanceAdress1Before+Math.floor(0.99*(2000)));
    expect(TokenBalanceAddress2After).to.equal(TokenBalanceAdress2Before+Math.floor(0.99*(2000)));
    expect(TokenBalanceBankAfter).to.equal(TokenBalanceBankBefore-2*2000+2*Math.ceil(0.01*(2000)));
    expect(BankBalanceOwnerAfter).to.equal(BankBalanceOwnerBefore-2*2000+2*Math.ceil(0.01*(2000)));
   
    // console.log(TokenBalanceBankAfter,Math.ceil(0.01*(transferAmount)))
    
  });


});