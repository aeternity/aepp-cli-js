// # æternity CLI `name` file
//
// This script initialize all `name` commands
// We'll use `commander` for parsing options
//
// Also we need `esm` package to handle `ES imports`
import { Command } from 'commander';
import { NAME_TTL, CLIENT_TTL } from '@aeternity/aepp-sdk';
import * as AENS from '../actions/aens';
import {
  nodeOption, jsonOption, feeOption, forceOption, passwordOption, ttlOption, networkIdOption,
} from '../arguments';

const program = new Command().name('aecli name');

// ## Initialize `options`
const addCommonOptions = (p) => p
  .addOption(nodeOption)
  .addOption(ttlOption)
  .addOption(feeOption)
  .option('--nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .addOption(passwordOption)
  .addOption(networkIdOption)
  .addOption(forceOption)
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
addCommonOptions(program
  .command('full-claim <wallet_path> <name>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--nameFee [nameFee]', 'Amount of coins to pay for name')
  .option('--nameTtl [nameTtl]', 'Validity of name.', NAME_TTL)
  .option('--clientTtl [clientTtl]', 'Client ttl.', CLIENT_TTL)
  .description('Claim an AENS name')
  .action(AENS.fullClaim));

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
addCommonOptions(program
  .command('pre-claim <wallet_path> <name>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .description('Pre-Claim an AENS name')
  .action(AENS.preClaim));

// ## Initialize `claim` command
//
// You can use this command to `claim` AENS name. Name must end on `.chain`.
//
// Example: `aecli name claim ./myWalletKeyFile --password testpass  testname.chain`
//
// This command send `pre-claim` transaction, wait until one block was mined, after that sent `claim` and `update` transaction's
//
// You can use `--nameTtl` and `--ttl` to pre-set transaction and name `time to leave`
addCommonOptions(program
  .command('claim <wallet_path> <name> <salt>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--nameFee [nameFee]', 'Amount of coins to pay for name')
  .description('Claim an AENS name')
  .action(AENS.claim));

// ## Initialize `claim` command
//
// You can use this command to `claim` AENS name. Name must end on `.chain`.
//
// Example: `aecli name claim ./myWalletKeyFile --password testpass  testname.chain`
//
// This command send `pre-claim` transaction, wait until one block was mined, after that sent `claim` and `update` transaction's
//
// You can use `--nameTtl` and `--ttl` to pre-set transaction and name `time to leave`
addCommonOptions(program
  .command('bid <wallet_path> <name> <nameFee>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .description('Bid on name')
  .action(AENS.nameBid));

// ## Initialize `update` command
//
// You can use this command to `update` pointer of AENS name.
//
// Example: `aecli name update ./myWalletKeyFile --password testpass testname.chain ak_qwe23dffasfgdesag323`
addCommonOptions(program
  .command('update <wallet_path> <name> [addresses...]')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--extendPointers', 'Extend pointers', false)
  .option('--nameTtl [nameTtl]', 'Validity of name.', NAME_TTL)
  .option('--clientTtl [clientTtl]', 'Client ttl.', CLIENT_TTL)
  .description('Update a name pointer')
  .action(AENS.updateName));

// ## Initialize `extend` command
//
// You can use this command to `extend` ttl of AENS name.
//
// Example: `aecli name extend ./myWalletKeyFile --password testpass testname.chain 100`
addCommonOptions(program
  .command('extend <wallet_path> <name> <nameTtl>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--clientTtl [clientTtl]', 'Client ttl.', CLIENT_TTL)
  .description('Extend name ttl')
  .action(AENS.extendName));

// ## Initialize `revoke` command
//
// You can use this command to `destroy` AENS name.
//
// Example: `aecli name revoke ./myWalletKeyFile --password testpass testname.chain`
addCommonOptions(program
  .command('revoke  <wallet_path> <name>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .description('Revoke an AENS name')
  .action(AENS.revokeName));

// ## Initialize `transfer` command
//
// You can use this command to `transfer` AENS name to another account.
//
// Example: `aecli name transfer ./myWalletKeyFile --password testpass testname.chain ak_qqwemjgflewgkj349gjdslksd`
addCommonOptions(program
  .command('transfer <wallet_path> <name> <address>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .description('Transfer a name to another account')
  .action(AENS.transferName));

// ## Initialize `lookup` command
//
// You can use this command to `update` pointer of AENS name.
//
// Example: `aecli lookup name.chain`
addCommonOptions(program
  .command('lookup <name>')
  .description('Look up name')
  .action(AENS.lookUp));

export default program;
