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
// Example: `aecli account sign ./wallet.json tx_1241rioefwj23f2wfdsfsdsdfsasdf`
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
// Example: `aecli account sign-message ./wallet.json Hello`
addCommonOptions(program
  .command('sign-message <wallet_path> [data...]')
  .option('--filePath [path]', 'Specify the path to the file for signing(ignore command message argument and use file instead)')
  .description('Sign a personal message using wallet')
  .action(Account.signMessage));

// ## Initialize `verify-message` command
//
// You can use this command to sign message
//
// Example: `aecli account verify-message ak_... asd1dasfadfsdasdasdasHexSig... Hello`
addCommonOptions(program
  .command('verify-message <address> <hexSignature> [data...]')
  .option('--filePath [path]', 'Specify the path to the file(ignore comm and message argument and use file instead)')
  .description('Check if message was signed by account')
  .action(Account.verifyMessage));

// ## Initialize `address` command
//
// You can use this command to retrieve get your public and private key
//
// Example: `aecli account address ./wallet.json` --> show only public key
//
// Example: `aecli account address ./wallet.json --privateKey` --> show  public key and private key
addCommonOptions(program
  .command('address <wallet_path>')
  .option('--privateKey', 'Print private key')
  .option('--forcePrompt', 'Force prompting')
  .description('Get wallet address')
  .action(Account.getAddress));

// ## Initialize `create` command
//
// You can use this command to generate `keypair` and encrypt it by password.
// Secret key can be provided in options, or cli will generate one.
// This command create `ethereum like keyfile`.
addCommonOptions(program
  .command('create <wallet_path>')
  .argument('[privkey]', 'Secret key as 64-bytes encoded as hex')
  .option('--overwrite', 'Overwrite if exist')
  .description('Create a secure wallet by a private key or generate one.')
  .addHelpText('after', `

Example call:
  $ aecli account create ./my-wallet.json
  $ aecli account create ./my-wallet.json 9ebd7beda0c79af72a42ece3821a56eff16359b6df376cf049aee995565f022f840c974b97164776454ba119d84edc4d6058a8dec92b6edc578ab2d30b4c4200`)
  .action(Account.createWallet));

export default program;
