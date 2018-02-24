const HDWalletProvider = require('truffle-hdwallet-provider')
const fs = require('fs')

// First read in the secrets.json to get our mnemonic
let secrets
let mnemonic
if (fs.existsSync('secrets.json')) {
  secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'))
  mnemonic = secrets.mnemonic
} else {
  console.log('No secrets.json found!')
  mnemonic = ''
}

module.exports = {
  networks: {
    live: {
      network_id: 1, // Ethereum public network
      host: 'localhost',
      port: '8545',
      from: ''
      // optional config values
      // host - defaults to "localhost"
      // port - defaults to 8545
      // gas
      // gasPrice
      // from - default address to use for any transaction Truffle makes during migrations
    },
    ropsten: {
      provider: new HDWalletProvider(mnemonic, 'https://ropsten.infura.io/CKq698Ba7JBfY6KhqFIF'),
      network_id: '3',
      from: '0x86a53f60A4D33Fc678c7aBF2f4d49645357A9A0d'
    },
    testrpc: {
      network_id: 'default'
    },
    development: { // truffle test hardcodes the "test" network.
      host: 'localhost',
      port: '8545',
      network_id: 'default'
    }
  }
}
