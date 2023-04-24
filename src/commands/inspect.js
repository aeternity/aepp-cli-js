// # æternity CLI `inspect` file
//
// This script initialize all `inspect` commands
// We'll use `commander` for parsing options
import { Command } from 'commander';
import inspect from '../actions/inspect';
import { nodeOption, jsonOption, forceOption } from '../arguments';

const program = new Command().name('aecli inspect');

// ## Initialize `options`
const addCommonOptions = (p) => p
  .addOption(nodeOption)
  .addOption(forceOption)
  .addOption(jsonOption);

// ## Initialize `inspect` command
//
// You can use this command to get info about account, block, transaction or name
//
// Example: `aecli inspect testName.chain` --> get info about AENS `name`
//
// Example: `aecli inspect ak_134defawsgf34gfq4f` --> get info about `account`
//
// Example: `aecli inspect kh_134defawsgf34gfq4f` --> get info about `key block` by block `hash`
//
// Example: `aecli inspect mh_134defawsgf34gfq4f` --> get info about `micro block` by block `hash`
//
// Example: `aecli inspect 1234` --> get info about `block` by block `height`
//
// Example: `aecli inspect th_asfwegfj34234t34t` --> get info about `transaction` by transaction `hash`
addCommonOptions(program
  .arguments('<hash>')
  .description('Hash or Name to inspect (eg: ak_..., mk_..., name.chain)')
  .action(inspect));

export default program;
