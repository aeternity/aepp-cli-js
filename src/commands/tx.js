import { Command, Argument } from 'commander';
import {
  NAME_TTL, CLIENT_TTL, ORACLE_TTL, QUERY_TTL, RESPONSE_TTL,
} from '@aeternity/aepp-sdk';
import * as Transaction from '../actions/transaction.js';
import {
  nodeOption,
  jsonOption,
  gasOption,
  gasPriceOption,
  feeOption,
  forceOption,
  ttlOption,
  amountOption,
  coinAmountParser,
} from '../arguments.js';

const program = new Command()
  .name('aecli tx')
  .description('Generates transactions to sign and submit manually. Useful for offline signing.');

const addExamples = (cmd, examples) => cmd.addHelpText('after', `
Example call:
${examples.map((e) => `  $ ${program.name()} ${cmd.name()} ${e}`).join('\n')}`);

const addTxBuilderOptions = (cmd, example) => {
  cmd
    .addArgument(
      new Argument('<nonce>', 'Unique number that is required to sign transaction securely')
        .argParser((nonce) => +nonce),
    )
    .addOption(feeOption)
    .addOption(ttlOption(false))
    .addOption(jsonOption)
    .summary(`build ${cmd.name().replaceAll('-', ' ')} transaction`)
    .description(`Build ${cmd.name().replaceAll('-', ' ')} transaction.`);
  addExamples(cmd, [example]);
};

const exampleAddress1 = 'ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi';
const exampleAddress2 = 'ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT';
const exampleContract = 'ct_6y3N9KqQb74QsvR9NrESyhWeLNiA9aJgJ7ua8CvsTuGot6uzh';
const exampleOracle = 'ok_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi';
const exampleOracleQuery = 'oq_6y3N9KqQb74QsvR9NrESyhWeLNiA9aJgJ7ua8CvsTuGot6uzh';
const exampleName = 'example-name.chain';
const exampleCalldata = 'cb_DA6sWJo=';

let command;

command = program.command('spend <senderId> <receiverId>')
  .argument('<amount>', 'Amount of coins to send', coinAmountParser)
  .option('--payload [payload]', 'Transaction payload', '')
  .action(Transaction.spend);
addTxBuilderOptions(command, `${exampleAddress1} ${exampleAddress2} 100ae 42`);

command = program.command('name-preclaim <accountId> <name>')
  .action(Transaction.namePreClaim);
addTxBuilderOptions(command, `${exampleAddress1} ${exampleName} 42`);

command = program.command('name-claim <accountId> <salt> <name>')
  .option('--nameFee [nameFee]', 'Name fee')
  .action(Transaction.nameClaim);
addTxBuilderOptions(command, `${exampleAddress1} 12327389123 ${exampleName} 42`);

command = program.command('name-update <accountId> <nameId>')
  .option('--nameTtl [nameTtl]', 'Validity of name', NAME_TTL)
  .option('--clientTtl [clientTtl]', 'Client TTL', CLIENT_TTL)
  .action(Transaction.nameUpdate);
addTxBuilderOptions(command, `${exampleAddress1} ${exampleName} 42 ${exampleContract}`);
command.argument('[pointers...]');

command = program.command('name-transfer <accountId> <recipientId> <name>')
  .action(Transaction.nameTransfer);
addTxBuilderOptions(command, `${exampleAddress1} ${exampleAddress2} ${exampleName} 42`);

command = program.command('name-revoke <accountId> <name>')
  .action(Transaction.nameRevoke);
addTxBuilderOptions(command, `${exampleAddress1} ${exampleName} 42`);

command = program.command('contract-deploy <ownerId> <contractBytecode> <initCallData>')
  .addOption(gasOption)
  .addOption(gasPriceOption(false))
  .addOption(amountOption)
  .description('Build contract create transaction.')
  .action(Transaction.contractDeploy);
addTxBuilderOptions(command, `${exampleAddress1} cb_dGhpcyBtZXNzYWdlIGlzIG5vdCBpbmRleGVkdWmUpw== ${exampleCalldata} 42`);

command = program.command('contract-call <callerId> <contractId> <callData>')
  .addOption(gasOption)
  .addOption(gasPriceOption(false))
  .addOption(amountOption)
  .description('Build contract create transaction.')
  .action(Transaction.contractCall);
addTxBuilderOptions(command, `${exampleAddress1} ${exampleContract} ${exampleCalldata} 42`);

command = program.command('oracle-register <accountId> <queryFormat> <responseFormat>')
  .option('--queryFee [queryFee]', 'Oracle query fee', 0)
  .option('--oracleTtl [oracleTtl]', 'Oracle TTL', ORACLE_TTL.value)
  .action(Transaction.oracleRegister);
addTxBuilderOptions(command, `${exampleAddress1} '{"city": "string"}' '{"tmp": "number"}' 42`);

command = program.command('oracle-extend <oracleId> <oracleTtl>')
  .action(Transaction.oracleExtend);
addTxBuilderOptions(command, `${exampleOracle} 100 42`);

command = program.command('oracle-post-query <accountId> <oracleId> <query>')
  .option('--queryFee [queryFee]', 'Oracle query fee', 0)
  .option('--queryTtl [oracleTtl]', 'Oracle TTL', QUERY_TTL.value)
  .option('--responseTtl [oracleTtl]', 'Oracle TTL', RESPONSE_TTL.value)
  .action(Transaction.oraclePostQuery);
addTxBuilderOptions(command, `${exampleAddress2} ${exampleOracle} '{"city": "Berlin"}' 42`);

command = program.command('oracle-respond <oracleId> <queryId> <response>')
  .option('--responseTtl [oracleTtl]', 'Oracle TTL', RESPONSE_TTL.value)
  .action(Transaction.oracleRespond);
addTxBuilderOptions(command, `${exampleOracle} ${exampleOracleQuery} '{"tmp": 1}' 42`);

command = program
  .command('verify <tx>')
  .addOption(nodeOption)
  .addOption(forceOption)
  .addOption(jsonOption)
  .summary('verify transaction using node')
  .description('Verify transaction using node.')
  .action(Transaction.verify);
addExamples(command, ['tx_+FoMAaEBzqet5HDJ+Z2dTkAIgKhvHUm7REti8Rqeu2S7z+tz/vOhARX7Ovvi4N8rfRN/Dsvb2ei7AJ3ysIkBrG5pnY6qW3W7iQVrx14tYxAAAIYPUN430AAAKoBebL57']);

export default program;
