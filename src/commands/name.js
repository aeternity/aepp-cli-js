// # æternity CLI `name` file
//
// This script initialize all `name` commands
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
//
// Also we need `esm` package to handle `ES imports`
import { Command } from 'commander';
import { TX_TTL, NAME_TTL, CLIENT_TTL } from '@aeternity/aepp-sdk';
import { withGlobalOpts } from '../utils/cli';
import * as AENS from '../actions/aens';
import { nodeOption, jsonOption, feeOption } from '../arguments';

const program = new Command().name('aecli name');

// ## Initialize `options`
program
  .addOption(nodeOption)
  .option('--ttl [ttl]', 'Override the ttl that the transaction is going to be sent with', TX_TTL)
  .addOption(feeOption)
  .option('--nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .option('-P, --password [password]', 'Wallet Password')
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .option('-f --force', 'Ignore node version compatibility check')
  .addOption(jsonOption);

// ## Initialize `claim` command
//
// You can use this command to `claim` AENS name. Name must end on `.chain`.
//
// Example: `aecli name claim ./myWalletKeyFile --password testpass  testname.chain`
//
// This command send `pre-claim` transaction, wait until one block was mined, after that sent `claim` and `update` transaction's
//
// You can use `--nameTtl` and `--ttl` to pre-set transaction and name `time to leave`
program
  .command('full-claim <wallet_path> <name>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--nameFee [nameFee]', 'Amount of coins to pay for name')
  .option('--nameTtl [nameTtl]', 'Validity of name.', NAME_TTL)
  .option('--clientTtl [clientTtl]', 'Client ttl.', CLIENT_TTL)
  .description('Claim a domain name')
  .action(withGlobalOpts(AENS.fullClaim));

// ## Initialize `pre-claim` command
//
// You can use this command to `pre-claim` AENS name
//
// Example: `aecli name pre-claim ./myWalletKeyFile --password testpass  testname.chain`
//
// This command build and send `pre-claim` transaction.
// And wait until it will be mined. You can force waiting by using `--waitMined false` option. Default: true
//
// You can use `--ttl` to pre-set transaction `time to leave`
program
  .command('pre-claim <wallet_path> <name>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .description('Pre-Claim a domain name')
  .action(withGlobalOpts(AENS.preClaim));

// ## Initialize `claim` command
//
// You can use this command to `claim` AENS name. Name must end on `.chain`.
//
// Example: `aecli name claim ./myWalletKeyFile --password testpass  testname.chain`
//
// This command send `pre-claim` transaction, wait until one block was mined, after that sent `claim` and `update` transaction's
//
// You can use `--nameTtl` and `--ttl` to pre-set transaction and name `time to leave`
program
  .command('claim <wallet_path> <name> <salt>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--nameFee [nameFee]', 'Amount of coins to pay for name')
  .description('Claim a domain name')
  .action(withGlobalOpts(AENS.claim));

// ## Initialize `claim` command
//
// You can use this command to `claim` AENS name. Name must end on `.chain`.
//
// Example: `aecli name claim ./myWalletKeyFile --password testpass  testname.chain`
//
// This command send `pre-claim` transaction, wait until one block was mined, after that sent `claim` and `update` transaction's
//
// You can use `--nameTtl` and `--ttl` to pre-set transaction and name `time to leave`
program
  .command('bid <wallet_path> <name> <nameFee>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .description('Bid on name')
  .action(withGlobalOpts(AENS.nameBid));

// ## Initialize `update` command
//
// You can use this command to `update` pointer of AENS name.
//
// Example: `aecli name update ./myWalletKeyFile --password testpass testname.chain ak_qwe23dffasfgdesag323`
program
  .command('update <wallet_path> <name> [addresses...]')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--extendPointers', 'Extend pointers', false)
  .option('--nameTtl [nameTtl]', 'Validity of name.', NAME_TTL)
  .option('--clientTtl [clientTtl]', 'Client ttl.', CLIENT_TTL)
  .description('Update a name pointer')
  .action(withGlobalOpts(AENS.updateName));

// ## Initialize `extend` command
//
// You can use this command to `extend` ttl of AENS name.
//
// Example: `aecli name extend ./myWalletKeyFile --password testpass testname.chain 100`
program
  .command('extend <wallet_path> <name> <nameTtl')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--clientTtl [clientTtl]', 'Client ttl.', CLIENT_TTL)
  .description('Extend name ttl')
  .action(withGlobalOpts(AENS.extendName));

// ## Initialize `revoke` command
//
// You can use this command to `destroy` AENS name.
//
// Example: `aecli name revoke ./myWalletKeyFile --password testpass testname.chain`
program
  .command('revoke  <wallet_path> <name>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .description('Revoke a domain name')
  .action(withGlobalOpts(AENS.revokeName));

// ## Initialize `transfer` command
//
// You can use this command to `transfer` AENS name to another account.
//
// Example: `aecli name transfer ./myWalletKeyFile --password testpass testname.chain ak_qqwemjgflewgkj349gjdslksd`
program
  .command('transfer <wallet_path> <name> <address>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .description('Transfer a name to another account')
  .action(withGlobalOpts(AENS.transferName));

// ## Initialize `lookup` command
//
// You can use this command to `update` pointer of AENS name.
//
// Example: `aecli lookup name.chain`
program
  .command('lookup <name>')
  .description('Look up name')
  .action(withGlobalOpts(AENS.lookUp));

export default program;
