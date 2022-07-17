require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");

const private_key = "2cd508a8f0c420e3057123c823b3fd8b21e51c8052bb20523206c12130f8374c";
const rinkeby_URL = "https://rinkeby.infura.io/v3/a5f96620841c40638d9a4dc8dd08bb56";
const ETHERSCAN_API_KEY = "5H27IZH1NWI2YYHPBHN6F9EKJTE2VWZHVS";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    rinkeby: {
      url: rinkeby_URL,
      accounts: [private_key]
    }
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  }
};

//ERC20_address = "04663A86b90f5C28836b90C76dF7D77F89C76838" old contract
//Bank_address = "0xa817E8d6717EBc07b9Ce6e4766BeBE6E10aCFe0B"

//new ERC20 deployed at address0x01BE77496a887Fd552E97ff4d32E9D1943F20679 new contract
//new Bank deployed at address0xC6D229545b5E0757E742de1AE88ef039645f3AA0

//const token_adddress = "0x01BE77496a887Fd552E97ff4d32E9D1943F20679";
//const bank_address = "0xC6D229545b5E0757E742de1AE88ef039645f3AA0";

//deploy command:npx hardhat run --network rinkeby scripts/deploy.js
//npx hardhat verify --network rinkeby contract_address argument