// # æternity CLI `account` file
//
// This script initialize all `account` commands
/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */
// We'll use `commander` for parsing options
import { Command } from 'commander';
import { TX_TTL } from '@aeternity/aepp-sdk';
import { getCmdFromArguments } from '../utils/cli';
import * as Account from '../actions/account';
import {
  nodeOption, jsonOption, coinAmountParser, feeOption,
} from '../arguments';

const program = new Command().name('aecli account');

// ## Initialize `options`
program
  .addOption(nodeOption)
  .option('-P, --password [password]', 'Wallet Password')
  .option('-f --force', 'Ignore epoch version compatibility check')
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
program
  .command('spend <wallet_path> <receiverIdOrName>')
  .argument('<amount>', 'Amount of coins to send in aettos or in ae (example: 1.2ae)', coinAmountParser)
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .option('--payload [payload]', 'Transaction payload.', '')
  .addOption(feeOption)
  .option('-T, --ttl [ttl]', 'Validity of the spend transaction in number of blocks (default forever)', TX_TTL)
  .option('-N, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .action((walletPath, receiverIdOrName, amount, ...args) => Account.spend(walletPath, receiverIdOrName, amount, getCmdFromArguments(args)));

// ## Initialize `transfer` command
//
// You can use this command to send % of balance to another account
//
// Example: `aecli account transfer ./myWalletKeyFile ak_1241rioefwj23f2wfdsfsdsdfsasdf 0.5 --password testpassword`
//
// You can set transaction `ttl(Time to leave)`. If not set use default.
//
// Example: `aecli account transfer ./myWalletKeyFile ak_1241rioefwj23f2wfdsfsdsdfsasdf 0.5 --password testpassword --ttl 20` --> this tx will leave for 20 blocks
program
  .command('transfer <wallet_path>')
  .argument('<receiver>', 'Address or name of recipient account')
  .argument('<fraction>', 'Fraction of balance to spend (between 0 and 1)', (v) => +v)
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .option('--payload [payload]', 'Transaction payload.', '')
  .addOption(feeOption)
  .option('-T, --ttl [ttl]', 'Validity of the spend transaction in number of blocks (default forever)', TX_TTL)
  .option('-N, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .action((walletPath, receiver, percentage, ...args) => Account.transferFunds(walletPath, receiver, percentage, getCmdFromArguments(args)));

// ## Initialize `sign` command
//
// You can use this command to sign your transaction's
//
// Example: `aecli account sign ./myWalletKeyFile tx_1241rioefwj23f2wfdsfsdsdfsasdf --password testpassword`
program
  .command('sign <wallet_path> <tx>')
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .description('Create a transaction to another wallet')
  .action((walletPath, tx, ...args) => Account.sign(walletPath, tx, getCmdFromArguments(args)));

// ## Initialize `sign-message` command
//
// You can use this command to sign message
//
// Example: `aecli account sign-message ./myWalletKeyFile Hello --password testpassword`
program
  .command('sign-message <wallet_path> [data...]')
  .option('--filePath [path]', 'Specify the path to the file for signing(ignore command message argument and use file instead)')
  .description('Create a transaction to another wallet')
  .action((walletPath, data, ...args) => Account.signMessage(walletPath, data, getCmdFromArguments(args)));

// ## Initialize `verify-message` command
//
// You can use this command to sign message
//
// Example: `aecli account verify-message ./myWalletKeyFile asd1dasfadfsdasdasdasHexSig... Hello --password testpassword`
program
  .command('verify-message <wallet_path> <hexSignature> [data...]')
  .option('--filePath [path]', 'Specify the path to the file(ignore comm and message argument and use file instead)')
  .description('Create a transaction to another wallet')
  .action((walletPath, hexSignature, data, ...args) => Account.verifyMessage(walletPath, hexSignature, data, getCmdFromArguments(args)));

// ## Initialize `balance` command
//
// You can use this command to retrieve balance of account
//
// Example: `aecli account balance ./myWalletKeyFile --password testpassword`
program
  .command('balance <wallet_path>')
  .option('--height [height]', 'Specific block height')
  .option('--hash [hash]', 'Specific block hash')
  .description('Get wallet balance')
  .action((walletPath, ...args) => Account.getBalance(walletPath, getCmdFromArguments(args)));

// ## Initialize `address` command
//
// You can use this command to retrieve get your public and private key
//
// Example: `aecli account address ./myWalletKeyFile --password testpassword` --> show only public key
//
// Example: `aecli account address ./myWalletKeyFile --password testpassword --privateKey` --> show  public key and private key
program
  .command('address <wallet_path>')
  .option('--privateKey', 'Print private key')
  .option('--forcePrompt', 'Force prompting')
  .description('Get wallet address')
  .action((walletPath, ...args) => Account.getAddress(walletPath, getCmdFromArguments(args)));

// ## Initialize `create` command
//
// You can use this command to generate `keypair` and encrypt it by password.
// This command create `ethereum like keyfile`.
//
// You can use `--output ./keys` to set directory to save you key.
//
// Example: `aecli account create myWalletName --password testpassword`
//
// Example: `aecli account create myWalletName --password testpassword --output ./mykeys` --> create `key-file` in `mykeys` directory
program
  .command('create <wallet_path>')
  .option('-O, --output [output]', 'Output directory', '.')
  .option('--overwrite', 'Overwrite if exist')
  .description('Create a secure wallet')
  .action((walletPath, ...args) => Account.createSecureWallet(walletPath, getCmdFromArguments(args)));

// ## Initialize `save` command
//
// You can use this command to generate `keypair` from `private-key` and encrypt it by password.
// This command create `ethereum like keyfile`.
//
// You can use `--output ./keys` to set directory to save you key
//
// Example: `aecli account save myWalletName 1902855723940510273412074210842018342148234  --password testpassword`
//
// Example: `aecli account save myWalletName 1902855723940510273412074210842018342148234 --password testpassword --output ./mykeys` --> create `key-file` in `mykeys` directory
program
  .command('save <wallet_path> <privkey>')
  .option('-O, --output [output]', 'Output directory', '.')
  .option('--overwrite', 'Overwrite if exist')
  .description('Save a private keys string to a password protected file wallet')
  .action((walletPath, priv, ...args) => Account.createSecureWalletByPrivKey(walletPath, priv, getCmdFromArguments(args)));

// ## Initialize `nonce` command
//
// You can use this command to get `account nonce`.
//
// You can use `--output ./keys` to set directory to save you key
//
// Example: `aecli account nonce myWalletName --password testpassword
program
  .command('nonce <wallet_path>')
  .description('Get account nonce')
  .action((walletPath, ...args) => Account.getAccountNonce(walletPath, getCmdFromArguments(args)));

// ## Initialize `generateKeyPairs` command
//
// You can use this command to generate KeyPair's.
//
// Example: `aecli account generate 10 --force
program
  .command('generate <count>')
  .option('--forcePrompt', 'Force prompting')
  .description('Generate keyPairs')
  .action((count, ...args) => Account.generateKeyPairs(count, getCmdFromArguments(args)));

export default program;
