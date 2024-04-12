// # æternity CLI `oracle` file
//
// This script initialize all `oracle` commands
// We'll use `commander` for parsing options
import { Command } from 'commander';
import { ORACLE_TTL, QUERY_TTL, RESPONSE_TTL } from '@aeternity/aepp-sdk';
import * as Oracle from '../actions/oracle.js';
import {
  nodeOption, jsonOption, feeOption, forceOption, passwordOption, ttlOption,
} from '../arguments.js';

const program = new Command().name('aecli oracle');

// ## Initialize `options`
const addCommonOptions = (p) => p
  .addOption(nodeOption)
  .addOption(ttlOption(true))
  .addOption(feeOption)
  .option('--nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .addOption(passwordOption)
  .addOption(forceOption)
  .addOption(jsonOption);

// ## Initialize `create` command
//
// You can use this command to `create` Oracle
//
// Example: `aecli oracle create ./wallet.json string string`
//
// You can use `--ttl` to pre-set transaction `time to leave`
addCommonOptions(program
  .command('create <wallet_path> <queryFormat> <responseFormat>')
  .option('--oracleTtl [oracleTtl]', 'Relative oracle time to leave', ORACLE_TTL.value)
  .option('--queryFee [queryFee]', 'Oracle query fee', 0)
  .description('Register Oracle')
  .action(Oracle.createOracle));

// ## Initialize `extend oracle` command
//
// You can use this command to `extend` Oracle time to leave
//
// Example: `aecli oracle extend ./wallet.json ok_12dasdgfa32fasf 200`
//
// You can use `--ttl` to pre-set transaction `time to leave`
addCommonOptions(program
  .command('extend <wallet_path> <oracleId> <oracleTtl>')
  .description('Extend Oracle')
  .action(Oracle.extendOracle));

// ## Initialize `create oracle query` command
//
// You can use this command to `create` an Oracle Query
//
// Example: `aecli oracle create-query ./wallet.json ok_123asdasd... WhatTheWeatherIs?`
//
// You can use `--ttl` to pre-set transaction `time to leave`
addCommonOptions(program
  .command('create-query <wallet_path> <oracleId> <query>')
  .option('--responseTtl [responseTtl]', 'Relative query response time to leave', RESPONSE_TTL.value)
  .option('--queryTtl [queryTtl]', 'Relative query time to leave', QUERY_TTL.value)
  .option('--queryFee [queryFee]', 'Oracle query fee', 0)
  .description('Create Oracle query')
  .action(Oracle.createOracleQuery));

// ## Initialize `respond query` command
//
// You can use this command to `respond` to Oracle Query
//
// Example: `aecli oracle respondQuery ./wallet.json ok_12313... oq_12efdsafa... +16Degree`
//
// You can use `--ttl` to pre-set transaction `time to leave`
addCommonOptions(program
  .command('respond-query <wallet_path> <oracleId> <queryId> <response>')
  .option('--responseTtl [responseTtl]', 'Query response time to leave', RESPONSE_TTL.value)
  .description('Respond to Oracle Query')
  .action(Oracle.respondToQuery));

// ## Initialize `get oracle` command
//
// You can use this command to `get` an Oracle
//
// Example: `aecli oracle respondQuery ./wallet.json ok_12313... oq_12efdsafa... +16Degree`
//
// You can use `--ttl` to pre-set transaction `time to leave`
addCommonOptions(program
  .command('get <oracleId>')
  .description('Get Oracle')
  .action(Oracle.queryOracle));

export default program;
