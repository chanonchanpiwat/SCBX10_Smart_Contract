
const hre = require("hardhat");

async function main() {
  
  const  ERC20 = await hre.ethers.getContractFactory("ERC20");
  const  erc20 = await ERC20.deploy(100000);
  const erc20Deployed = await erc20.deployed();
  console.log(`ERC20 deployed at address${erc20Deployed.address}`)
  
  const Bank = await hre.ethers.getContractFactory("Bank");
  const bank = await Bank.deploy(erc20Deployed.address);
  const bankDeployed = await bank.deployed();
  console.log(`Bank deployed at address${bankDeployed.address}`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
