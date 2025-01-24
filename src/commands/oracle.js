import { Command } from 'commander';
import * as Oracle from '../actions/oracle.js';
import {
  nodeOption,
  jsonOption,
  feeOption,
  queryFeeOption,
  forceOption,
  passwordOption,
  ttlOption,
  oracleTtlArgument,
  oracleTtlOption,
  queryTtlOption,
  responseTtlOption,
} from '../arguments.js';
import { addExamples, exampleOracle, exampleOracleQuery } from '../utils/helpers.js';

const program = new Command('oracle').summary('interact with oracles');

const addCommonOptions = (cmd, example) => {
  cmd
    .addOption(passwordOption)
    .addOption(ttlOption(true))
    .addOption(feeOption)
    .option('--nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
    .addOption(nodeOption)
    .addOption(forceOption)
    .addOption(jsonOption);
  const summary = cmd.summary();
  cmd.description(`${summary[0].toUpperCase()}${summary.slice(1)}.`);
  addExamples(cmd, [example]);
};

let command = program
  .command('create <wallet_path> <queryFormat> <responseFormat>')
  .addOption(oracleTtlOption)
  .addOption(queryFeeOption(true))
  .summary('register current account as oracle')
  .action(Oracle.createOracle);
addCommonOptions(command, './wallet.json string string');

command = program
  .command('extend <wallet_path>')
  .addArgument(oracleTtlArgument)
  .summary("extend oracle's time to leave")
  .action(Oracle.extendOracle);
addCommonOptions(command, './wallet.json 200');

command = program
  .command('create-query <wallet_path> <oracleId> <query>')
  .addOption(queryTtlOption)
  .addOption(responseTtlOption)
  .addOption(queryFeeOption(false))
  .summary('create an oracle query')
  .action(Oracle.createOracleQuery);
addCommonOptions(command, `./wallet.json ${exampleOracle} WhatTheWeatherIs?`);

command = program
  .command('respond-query <wallet_path> <queryId> <response>')
  .addOption(responseTtlOption)
  .summary('respond to an oracle query')
  .action(Oracle.respondToQuery);
addCommonOptions(command, `./wallet.json ${exampleOracleQuery} +16Degree`);

export default program;
