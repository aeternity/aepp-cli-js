import { Command } from 'commander';
import { ORACLE_TTL, QUERY_TTL, RESPONSE_TTL } from '@aeternity/aepp-sdk';
import * as Oracle from '../actions/oracle.js';
import {
  nodeOption, jsonOption, feeOption, forceOption, passwordOption, ttlOption,
} from '../arguments.js';
import { addExamples, exampleOracle, exampleOracleQuery } from '../utils/helpers.js';

const program = new Command('oracle').summary('interact with oracles');

const addCommonOptions = (cmd, example) => {
  cmd
    .addOption(nodeOption)
    .addOption(forceOption)
    .addOption(jsonOption);
  const summary = cmd.summary();
  cmd.description(`${summary[0].toUpperCase()}${summary.slice(1)}.`);
  addExamples(cmd, [example]);
};

let command = program.command('get <oracleId>')
  .summary('print oracle details')
  .action(Oracle.queryOracle);
addCommonOptions(command, exampleOracle);

const addTxOptions = (cmd, example) => {
  cmd
    .addOption(passwordOption)
    .addOption(ttlOption(true))
    .addOption(feeOption)
    .option('--nonce [nonce]', 'Override the nonce that the transaction is going to be sent with');
  addCommonOptions(cmd, example);
};

command = program.command('create <wallet_path> <queryFormat> <responseFormat>')
  .option('--oracleTtl [oracleTtl]', 'Relative oracle time to leave', ORACLE_TTL.value)
  .option('--queryFee [queryFee]', 'Oracle query fee', 0)
  .summary('register current account as oracle')
  .action(Oracle.createOracle);
addTxOptions(command, './wallet.json string string');

command = program.command('extend <wallet_path> <oracleTtl>')
  .summary('extend oracle\'s time to leave')
  .action(Oracle.extendOracle);
addTxOptions(command, './wallet.json 200');

command = program.command('create-query <wallet_path> <oracleId> <query>')
  .option('--responseTtl [responseTtl]', 'Relative query response time to leave', RESPONSE_TTL.value)
  .option('--queryTtl [queryTtl]', 'Relative query time to leave', QUERY_TTL.value)
  .option('--queryFee [queryFee]', 'Oracle query fee', 0)
  .summary('create an oracle query')
  .action(Oracle.createOracleQuery);
addTxOptions(command, `./wallet.json ${exampleOracle} WhatTheWeatherIs?`);

command = program.command('respond-query <wallet_path> <queryId> <response>')
  .option('--responseTtl [responseTtl]', 'Query response time to leave', RESPONSE_TTL.value)
  .summary('respond to an oracle query')
  .action(Oracle.respondToQuery);
addTxOptions(command, `./wallet.json ${exampleOracleQuery} +16Degree`);

export default program;
