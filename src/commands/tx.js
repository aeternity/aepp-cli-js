import { Command, Argument } from 'commander';
import * as Transaction from '../actions/transaction.js';
import {
  nodeOption,
  jsonOption,
  gasOption,
  gasPriceOption,
  feeOption,
  nameFeeOption,
  queryFeeOption,
  forceOption,
  ttlOption,
  amountOption,
  coinAmountParser,
  clientTtlOption,
  nameTtlOption,
  oracleTtlOption,
  queryTtlOption,
  responseTtlOption,
} from '../arguments.js';
import {
  addExamples,
  exampleAddress1,
  exampleAddress2,
  exampleContract,
  exampleOracle,
  exampleOracleQuery,
  exampleName,
  exampleCalldata,
  exampleTransaction,
} from '../utils/helpers.js';

const program = new Command('tx')
  .summary('generate transactions to sign and submit manually')
  .description('Generates transactions to sign and submit manually. Useful for offline signing.');

const addTxBuilderOptions = (cmd, example) => {
  cmd
    .addArgument(
      new Argument(
        '<nonce>',
        'Unique number that is required to sign transaction securely',
      ).argParser((nonce) => +nonce),
    )
    .addOption(feeOption)
    .addOption(ttlOption(false))
    .addOption(jsonOption)
    .summary(`build ${cmd.name().replaceAll('-', ' ')} transaction`)
    .description(`Build ${cmd.name().replaceAll('-', ' ')} transaction.`);
  addExamples(cmd, [example]);
};

let command;

command = program
  .command('spend <senderId> <receiverId>')
  .argument('<amount>', 'Amount of coins to send', coinAmountParser)
  .option('--payload [payload]', 'Transaction payload', '')
  .action(Transaction.spend);
addTxBuilderOptions(command, `${exampleAddress1} ${exampleAddress2} 100ae 42`);

command = program.command('name-preclaim <accountId> <name>').action(Transaction.namePreClaim);
addTxBuilderOptions(command, `${exampleAddress1} ${exampleName} 42`);

command = program
  .command('name-claim <accountId> <salt> <name>')
  .addOption(nameFeeOption)
  .action(Transaction.nameClaim);
addTxBuilderOptions(command, `${exampleAddress1} 12327389123 ${exampleName} 42`);

command = program
  .command('name-update <accountId> <nameId>')
  .addOption(nameTtlOption)
  .addOption(clientTtlOption)
  .action(Transaction.nameUpdate);
addTxBuilderOptions(command, `${exampleAddress1} ${exampleName} 42 ${exampleContract}`);
command.argument('[pointers...]');

command = program
  .command('name-transfer <accountId> <recipientId> <name>')
  .action(Transaction.nameTransfer);
addTxBuilderOptions(command, `${exampleAddress1} ${exampleAddress2} ${exampleName} 42`);

command = program.command('name-revoke <accountId> <name>').action(Transaction.nameRevoke);
addTxBuilderOptions(command, `${exampleAddress1} ${exampleName} 42`);

command = program
  .command('contract-deploy <ownerId> <contractBytecode> <initCallData>')
  .addOption(gasOption)
  .addOption(gasPriceOption(false))
  .addOption(amountOption)
  .description('Build contract create transaction.')
  .action(Transaction.contractDeploy);
addTxBuilderOptions(
  command,
  `${exampleAddress1} cb_dGhpcyBtZXNzYWdlIGlzIG5vdCBpbmRleGVkdWmUpw== ${exampleCalldata} 42`,
);

command = program
  .command('contract-call <callerId> <contractId> <callData>')
  .addOption(gasOption)
  .addOption(gasPriceOption(false))
  .addOption(amountOption)
  .description('Build contract create transaction.')
  .action(Transaction.contractCall);
addTxBuilderOptions(command, `${exampleAddress1} ${exampleContract} ${exampleCalldata} 42`);

// TODO: choose between "register" and "create" (in oracle.js)
command = program
  .command('oracle-register <accountId> <queryFormat> <responseFormat>')
  .addOption(queryFeeOption(true))
  .addOption(oracleTtlOption)
  .action(Transaction.oracleRegister);
addTxBuilderOptions(command, `${exampleAddress1} '{"city": "string"}' '{"tmp": "number"}' 42`);

command = program.command('oracle-extend <oracleId> <oracleTtl>').action(Transaction.oracleExtend);
addTxBuilderOptions(command, `${exampleOracle} 100 42`);

// TODO: choose between "post" and "create" (in oracle.js)
command = program
  .command('oracle-post-query <accountId> <oracleId> <query>')
  .addOption(queryFeeOption(false))
  .addOption(queryTtlOption)
  .addOption(responseTtlOption)
  .action(Transaction.oraclePostQuery);
addTxBuilderOptions(command, `${exampleAddress2} ${exampleOracle} '{"city": "Berlin"}' 42`);

command = program
  .command('oracle-respond <oracleId> <queryId> <response>')
  .addOption(responseTtlOption)
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
addExamples(command, [exampleTransaction]);

export default program;
