#!/usr/bin/env node
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
const program = require('commander')

require = require('esm')(module/*, options*/) //use to handle es6 import/export
const utils = require('./utils/index')
const { Oracle } = require('./commands')

// ## Initialize `options`
program
  .option('-u, --url [hostname]', 'Node to connect to', utils.constant.NODE_URL)
  .option('-U, --internalUrl [internal]', 'Node to connect to(internal)', utils.constant.NODE_INTERNAL_URL)
  .option('--ttl [ttl]', 'Override the ttl that the transaction is going to be sent with', utils.constant.TX_TTL)
  .option('--fee [fee]', 'Override the fee that the transaction is going to be sent with')
  .option('--nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .option('-P, --password [password]', 'Wallet Password')
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .option('-f --force', 'Ignore node version compatibility check')
  .option('--json', 'Print result in json format', utils.constant.OUTPUT_JSON)

// ## Initialize `create` command
//
// You can use this command to `create` Oracle
//
// Example: `aecli oracle create ./myWalletKeyFile --password testpass string string`
//
// And wait until it will be mined. You can force waiting by using `--waitMined false` option. Default: true
//
// You can use `--ttl` to pre-set transaction `time to leave`
program
  .command('create <wallet_path> <queryFormat> <responseFormat>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--oracleTtl [oracleTtl]', 'Relative Oracle time to leave', utils.constant.ORACLE_TTL)
  .option('--queryFee [queryFee]', 'Oracle query fee', utils.constant.QUERY_FEE)
  .description('Register Oracle')
  .action(async (walletPath, queryFormat, responseFormat, ...arguments) => await Oracle.createOracle(walletPath, queryFormat, responseFormat, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `extend oracle` command
//
// You can use this command to `extend` Oracle time to leave
//
// Example: `aecli oracle extend ./myWalletKeyFile --password testpass ok_12dasdgfa32fasf 200`
//
// And wait until it will be mined. You can force waiting by using `--waitMined false` option. Default: true
//
// You can use `--ttl` to pre-set transaction `time to leave`
program
  .command('extend <wallet_path> <oracleId> <oracleTtl>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .description('Extend Oracle')
  .action(async (walletPath, oracleId, oracleTtl, ...arguments) => await Oracle.extendOracle(walletPath, oracleId, oracleTtl, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `create oracle query` command
//
// You can use this command to `create` an Oracle Query
//
// Example: `aecli oracle create-query ./myWalletKeyFile --password testpass ok_123asdasd... WhatTheWeatherIs?`
//
// And wait until it will be mined. You can force waiting by using `--waitMined false` option. Default: true
//
// You can use `--ttl` to pre-set transaction `time to leave`
program
  .command('create-query <wallet_path> <oracleId> <query>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--responseTtl [responseTtl]', 'Query response time to leave', utils.constant.RESPONSE_TTL)
  .option('--queryTtl [queryTtl]', 'Query time to leave', utils.constant.QUERY_TTL)
  .option('--queryFee [queryFee]', 'Oracle query fee', utils.constant.QUERY_FEE)
  .description('Create Oracle query')
  .action(async (walletPath, oracleId, query, ...arguments) => await Oracle.createOracleQuery(walletPath, oracleId, query, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `respond query` command
//
// You can use this command to `respond` to Oracle Query
//
// Example: `aecli oracle respondQuery ./myWalletKeyFile --password testpass ok_12313... oq_12efdsafa... +16Degree`
//
// And wait until it will be mined. You can force waiting by using `--waitMined false` option. Default: true
//
// You can use `--ttl` to pre-set transaction `time to leave`
program
  .command('respond-query <wallet_path> <oracleId> <queryId> <response>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--responseTtl [responseTtl]', 'Query response time to leave', utils.constant.RESPONSE_TTL)
  .description('Respond to  Oracle Query')
  .action(async (walletPath, oracleId, queryId, response, ...arguments) => await Oracle.respondToQuery(walletPath, oracleId, queryId, response, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `get oracle` command
//
// You can use this command to `get` an Oracle
//
// Example: `aecli oracle respondQuery ./myWalletKeyFile --password testpass ok_12313... oq_12efdsafa... +16Degree`
//
// And wait until it will be mined. You can force waiting by using `--waitMined false` option. Default: true
//
// You can use `--ttl` to pre-set transaction `time to leave`
program
  .command('get <oracleId>')
  .description('Get Oracle')
  .action(async (oracleId, ...arguments) => await Oracle.queryOracle(oracleId, utils.cli.getCmdFromArguments(arguments)))

// Parse arguments
program.parse(process.argv)
