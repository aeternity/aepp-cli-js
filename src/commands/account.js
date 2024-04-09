// # æternity CLI `account` file
//
// This script initialize all `account` commands
// We'll use `commander` for parsing options
import { Command } from 'commander';
import * as Account from '../actions/account.js';
import {
  nodeOption, jsonOption, forceOption, passwordOption, networkIdOption,
} from '../arguments.js';

const program = new Command().name('aecli account');

// ## Initialize `options`
const addCommonOptions = (p) => p
  .addOption(passwordOption)
  .addOption(jsonOption);

// ## Initialize `sign` command
//
// You can use this command to sign your transaction's
//
// Example: `aecli account sign ./myWalletKeyFile tx_1241rioefwj23f2wfdsfsdsdfsasdf --password testpassword`
addCommonOptions(program
  .command('sign <wallet_path> <tx>')
  .addOption(nodeOption)
  .addOption(forceOption)
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

export default program;
