#!/usr/bin/env node
// # æternity CLI `chain` file
//
// This script initialize all `chain` command's
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
const program = require('commander')

const requireEsm = require('esm')(module/*, options */) // use to handle es6 import/export
const utils = requireEsm('./utils/index')
const { Chain } = requireEsm('./commands')

program
  .name('aecli chain')

// # Initialize `options`
program
  .option('-u --url [hostname]', 'Node to connect to', utils.constant.NODE_URL)
  .option('--internalUrl [internal]', 'Node to connect to(internal)', utils.constant.NODE_INTERNAL_URL)
  .option('-L --limit [playlimit]', 'Limit for play command', utils.constant.PLAY_LIMIT)
  .option('-f --force', 'Ignore node version compatibility check')
  .option('--json', 'Print result in json format')

// ## Initialize `top` command
//
// You can use this command to retrieve `top block` from `node`
//
// Example: `aecli chain top`
program
  .command('top')
  .description('Get top of Chain')
  .action(async (...args) => await Chain.top(utils.cli.getCmdFromArguments(args)))

// ## Initialize `status` command
//
// You can use this command to retrieve `node version`
//
// Example: `aecli chain status`
program
  .command('status')
  .description('Get node version')
  .action(async (...args) => await Chain.version(utils.cli.getCmdFromArguments(args)))

// ## Initialize `ttl` command
//
// You can use this command to retrieve relative `ttl`
//
// Example: `aecli chain ttl <absolute_ttl>`
program
  .command('ttl <absoluteTtl>')
  .description('Get relative ttl')
  .action(async (absoluteTtl, ...args) => await Chain.ttl(absoluteTtl, utils.cli.getCmdFromArguments(args)))

// ## Initialize `ttl` command
//
// You can use this command to retrieve relative `ttl`
//
// Example: `aecli chain ttl <absolute_ttl>`
program
  .command('network_id')
  .description('Get network ID')
  .action(async (...args) => await Chain.getNetworkId(utils.cli.getCmdFromArguments(args)))

// ## Initialize `play` command
//
// You can use this command to get list of block by some condition(by `limit` or `height`)
//
// Example: `aecli chain play --limit 10` --> print 10 blocks starting from top
//
// Example: `aecli chain play --height` --> print blocks until reach some height starting from top
program
  .command('play')
  .option('-P --height [playToHeight]', 'Play to selected height')
  .description('Real-time block monitoring')
  .action(async (...args) => await Chain.play(utils.cli.getCmdFromArguments(args)))

// ## Initialize `broadcast` command
//
// You can use this command to send `transaction` to the `chain`
//
// Example: `aecli tx spend ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT 100`
program
  .command('broadcast <tx>')
  .option('-W, --no-waitMined', 'Force waiting until transaction will be mined')
  .option('--verify', 'Verify Transaction before broadcast.')
  .description('Send transaction to the chain')
  .action(async (tx, ...args) => await Chain.broadcast(tx, utils.cli.getCmdFromArguments(args)))

// Parse arguments
program.parse(process.argv)
