// # æternity CLI `chain` file
//
// This script initialize all `chain` command's
// We'll use `commander` for parsing options
import { Command } from 'commander';
import * as Chain from '../actions/chain';
import { nodeOption, jsonOption, forceOption } from '../arguments';

const program = new Command().name('aecli chain');

// ## Initialize `options`
const addCommonOptions = (p) => p
  .addOption(nodeOption)
  .addOption(forceOption)
  .addOption(jsonOption);

// ## Initialize `top` command
//
// You can use this command to retrieve `top block` from `node`
//
// Example: `aecli chain top`
addCommonOptions(program
  .command('top')
  .description('Get top of Chain')
  .action(Chain.top));

// ## Initialize `status` command
//
// You can use this command to retrieve `node version`
//
// Example: `aecli chain status`
addCommonOptions(program
  .command('status')
  .description('Get node version')
  .action(Chain.version));

// ## Initialize `ttl` command
//
// You can use this command to retrieve relative `ttl`
//
// Example: `aecli chain ttl <absolute_ttl>`
addCommonOptions(program
  .command('ttl <absoluteTtl>')
  .description('Get relative ttl')
  .action(Chain.ttl));

// ## Initialize `ttl` command
//
// You can use this command to retrieve relative `ttl`
//
// Example: `aecli chain ttl <absolute_ttl>`
addCommonOptions(program
  .command('network_id')
  .description('Get network ID')
  .action(Chain.getNetworkId));

// ## Initialize `play` command
//
// You can use this command to get list of block by some condition (by `limit` or `height`)
//
// Example: `aecli chain play --limit 10` --> print 10 blocks starting from top
//
// Example: `aecli chain play --height 100` --> print blocks until reach height 100 starting from top
addCommonOptions(program
  .command('play')
  .option('-L --limit [playlimit]', 'Limit for play command', 10)
  .option('-P --height [playToHeight]', 'Play to selected height')
  .description('Real-time block monitoring')
  .action(Chain.play));

// ## Initialize `broadcast` command
//
// You can use this command to send `transaction` to the `chain`
//
// Example: `aecli tx spend ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT 100`
addCommonOptions(program
  .command('broadcast <tx>')
  .option('-W, --no-waitMined', 'Force waiting until transaction will be mined')
  .option('--verify', 'Verify Transaction before broadcast.')
  .description('Send transaction to the chain')
  .action(Chain.broadcast));

export default program;
