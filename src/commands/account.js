// # æternity CLI `account` file
//
// This script initialize all `account` commands
// We'll use `commander` for parsing options
import { Command } from 'commander';
import * as Account from '../actions/account';
import {
  nodeOption,
  jsonOption,
  coinAmountParser,
  feeOption,
  forceOption,
  passwordOption,
  ttlOption,
  networkIdOption,
} from '../arguments';

const program = new Command().name('aecli account');

// ## Initialize `options`
const addCommonOptions = (p) => p
  .addOption(nodeOption)
  .addOption(passwordOption)
  .addOption(forceOption)
  .addOption(jsonOption);

// ## Initialize `spend` command
//
// You can use this command to send tokens to another account
//
// Example: `aecli account spend ./myWalletKeyFile ak_1241rioefwj23f2wfdsfsdsdfsasdf 100 --password testpassword`
//
// Example: `aecli account spend ./myWalletKeyFile aensAccountName.chain 100 --password testpassword`
//
// You can set transaction `ttl(Time to leave)`. If not set use default.
//
// Example: `aecli account spend ./myWalletKeyFile ak_1241rioefwj23f2wfdsfsdsdfsasdf 100 --password testpassword --ttl 20` --> this tx will leave for 20 blocks
addCommonOptions(program
  .command('spend <wallet_path>')
  .argument('<receiver>', 'Address or name of recipient account')
  .argument(
    '<amountOrPercent>',
    'Amount of coins to send in aettos/ae (example 1.2ae), or percent of sender balance (example 42%)',
    (amount) => {
      if (amount.endsWith('%')) return { fraction: +amount.slice(0, -1) };
      return { amount: coinAmountParser(amount) };
    },
  )
  .addOption(networkIdOption)
  .option('--payload [payload]', 'Transaction payload.', '')
  .addOption(feeOption)
  .addOption(ttlOption)
  .option('-N, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .action(Account.spend));

// ## Initialize `sign` command
//
// You can use this command to sign your transaction's
//
// Example: `aecli account sign ./myWalletKeyFile tx_1241rioefwj23f2wfdsfsdsdfsasdf --password testpassword`
addCommonOptions(program
  .command('sign <wallet_path> <tx>')
  .addOption(networkIdOption)
  .description('Sign a transaction using wallet')
  .action(Account.sign));

// ## Initialize `sign-message` command
//
// You can use this command to sign message
//
// Example: `aecli account sign-message ./myWalletKeyFile Hello --password testpassword`
addCommonOptions(program
  .command('sign-message <wallet_path> [data...]')
  .option('--filePath [path]', 'Specify the path to the file for signing(ignore command message argument and use file instead)')
  .description('Sign a personal message using wallet')
  .action(Account.signMessage));

// ## Initialize `verify-message` command
//
// You can use this command to sign message
//
// Example: `aecli account verify-message ./myWalletKeyFile asd1dasfadfsdasdasdasHexSig... Hello --password testpassword`
addCommonOptions(program
  .command('verify-message <wallet_path> <hexSignature> [data...]')
  .option('--filePath [path]', 'Specify the path to the file(ignore comm and message argument and use file instead)')
  .description('Check if message was signed by wallet')
  .action(Account.verifyMessage));

// ## Initialize `balance` command
//
// You can use this command to retrieve balance of account
//
// Example: `aecli account balance ./myWalletKeyFile --password testpassword`
addCommonOptions(program
  .command('balance <wallet_path>')
  .option('--height [height]', 'Specific block height')
  .option('--hash [hash]', 'Specific block hash')
  .description('Get wallet balance')
  .action(Account.getBalance));

// ## Initialize `address` command
//
// You can use this command to retrieve get your public and private key
//
// Example: `aecli account address ./myWalletKeyFile --password testpassword` --> show only public key
//
// Example: `aecli account address ./myWalletKeyFile --password testpassword --privateKey` --> show  public key and private key
addCommonOptions(program
  .command('address <wallet_path>')
  .option('--privateKey', 'Print private key')
  .option('--forcePrompt', 'Force prompting')
  .description('Get wallet address')
  .action(Account.getAddress));

// ## Initialize `create` command
//
// You can use this command to generate `keypair` and encrypt it by password.
// This command create `ethereum like keyfile`.
//
// Example: `aecli account create ./mykeys/my-wallet.json --password testpassword`
addCommonOptions(program
  .command('create <wallet_path>')
  .option('--overwrite', 'Overwrite if exist')
  .description('Create a secure wallet')
  .action(Account.createSecureWallet));

// ## Initialize `save` command
//
// You can use this command to generate `keypair` from `private-key` and encrypt it by password.
// This command create `ethereum like keyfile`.
//
// Example: `aecli account save ./mykeys/my-wallet.json 1902855723940510273412074210842018342148234 --password testpassword`
addCommonOptions(program
  .command('save <wallet_path> <privkey>')
  .option('--overwrite', 'Overwrite if exist')
  .description('Save a private keys string to a password protected file wallet')
  .action(Account.createSecureWalletByPrivKey));

// ## Initialize `nonce` command
//
// You can use this command to get `account nonce`.
//
// Example: `aecli account nonce myWalletName --password testpassword
addCommonOptions(program
  .command('nonce <wallet_path>')
  .description('Get account nonce')
  .action(Account.getAccountNonce));

// ## Initialize `generateKeyPairs` command
//
// You can use this command to generate KeyPair's.
//
// Example: `aecli account generate 10 --force
addCommonOptions(program
  .command('generate <count>')
  .description('Generate account key pairs')
  .action(Account.generateKeyPairs));

export default program;
