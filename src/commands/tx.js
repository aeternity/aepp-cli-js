// # æternity CLI `transaction` file
//
// This script initialize all `transaction` command's
// We'll use `commander` for parsing options
//
// Also we need `esm` package to handle `ES imports`
import { Command } from 'commander';
import {
  NAME_TTL, CLIENT_TTL, ORACLE_TTL, QUERY_TTL, RESPONSE_TTL,
} from '@aeternity/aepp-sdk';
import * as Transaction from '../actions/transaction.js';
import {
  nodeOption,
  jsonOption,
  gasOption,
  gasPriceOption,
  nonceArgument,
  feeOption,
  forceOption,
  ttlOption,
  networkIdOption,
} from '../arguments.js';

const program = new Command().name('aecli tx');

// ## Initialize `options`
const addCommonOptions = (p) => p
  .addOption(nodeOption)
// .option('--nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .addOption(feeOption)
  .addOption(ttlOption(false))
  .addOption(forceOption)
  .addOption(jsonOption);

// ## Initialize `spend` command
//
// You can use this command to build `spend` transaction
//
// Example: `aecli tx spend ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT 100`
addCommonOptions(program
  .command('spend <senderId> <recieverId> <amount>')
  .addArgument(nonceArgument)
  .option('--payload [payload]', 'Transaction payload.', '')
  .description('Build Spend Transaction')
  .action(Transaction.spend));

// ## Initialize `name-preclaim` command
//
// You can use this command to build `preclaim` transaction
//
// Example: `aecli tx name-preclaim ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.chain`
addCommonOptions(program
  .command('name-preclaim <accountId> <name>')
  .addArgument(nonceArgument)
  .description('Build name preclaim transaction.')
  .action(Transaction.namePreClaim));

// ## Initialize `name-update` command
//
// You can use this command to build `update` transaction
//
// Example: `aecli tx name-update ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.chain`
addCommonOptions(program
  .command('name-update <accountId> <nameId>')
  .addArgument(nonceArgument)
  .argument('[pointers...]')
  .option('--nameTtl [nameTtl]', 'Validity of name.', NAME_TTL)
  .option('--clientTtl [clientTtl]', 'Client ttl.', CLIENT_TTL)
  .description('Build name update transaction.')
  .action(Transaction.nameUpdate));

// ## Initialize `name-claim` command
//
// You can use this command to build `claim` transaction
//
// Example: `aecli tx name-claim ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi 12327389123 testname.chain`
addCommonOptions(program
  .command('name-claim <accountId> <salt> <name>')
  .addArgument(nonceArgument)
  .option('--nameFee [nameFee]', 'Name fee.')
  .description('Build name claim transaction.')
  .action(Transaction.nameClaim));

// ## Initialize `name-transfer` command
//
// You can use this command to build `tansfer` transaction
//
// Example: `aecli tx name-transfer ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.chain`
addCommonOptions(program
  .command('name-transfer <accountId> <recipientId> <name>')
  .addArgument(nonceArgument)
  .description('Build name tansfer transaction.')
  .action(Transaction.nameTransfer));

// ## Initialize `name-revoke` command
//
// You can use this command to build `revoke` transaction
//
// Example: `aecli tx name-revoke ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.chain`
addCommonOptions(program
  .command('name-revoke <accountId> <name>')
  .addArgument(nonceArgument)
  .description('Build name revoke transaction.')
  .action(Transaction.nameRevoke));

// ## Initialize `contract-deploy` command
//
// You can use this command to build `contract create` transaction
//
// Example: `aecli tx contract-deploy ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi test.contract`
addCommonOptions(program
  .command('contract-deploy <ownerId> <contractBytecode> <initCallData>')
  .addArgument(nonceArgument)
  .addOption(gasOption)
  .addOption(gasPriceOption(false))
  .option('--amount [amount]', 'Amount', 0)
  .description('Build contract create transaction.')
  .action(Transaction.contractDeploy));

// ## Initialize `contract-call` command
//
// You can use this command to build `contract call` transaction
//
// Example: `aecli tx contract-call ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ct_2134235423dsfsdfsdf sum int 1 2`
addCommonOptions(program
  .command('contract-call <callerId> <contractId> <callData>')
  .addArgument(nonceArgument)
  .addOption(gasOption)
  .addOption(gasPriceOption(false))
  .option('--amount [amount]', 'Amount', 0)
  .description('Build contract create transaction.')
  .action(Transaction.contractCall));

// ## Initialize `oracle-register` command
//
// You can use this command to build `oracle-register` transaction
//
// Example: `aecli tx oracle-register ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  "{city: 'string'}" "{tmp: 'num'}"``
addCommonOptions(program
  .command('oracle-register <accountId> <queryFormat> <responseFormat>')
  .addArgument(nonceArgument)
  .option('--queryFee [queryFee]', 'Oracle Query fee.', 0)
  .option('--oracleTtl [oracleTtl]', 'Oracle Ttl.', ORACLE_TTL.value)
  .description('Build oracle register transaction.')
  .action(Transaction.oracleRegister));

// ## Initialize `oracle-post-query` command
//
// You can use this command to build `oracle-post-query` transaction
//
// Example: `aecli tx oracle-post-query ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  ok_348hrfdhisdkhasdaksdasdsad {city: 'Berlin'}`
addCommonOptions(program
  .command('oracle-post-query <accountId> <oracleId> <query>')
  .addArgument(nonceArgument)
  .option('--queryFee [queryFee]', 'Oracle Query fee.', 0)
  .option('--queryTtl [oracleTtl]', 'Oracle Ttl.', QUERY_TTL.value)
  .option('--responseTtl [oracleTtl]', 'Oracle Ttl.', RESPONSE_TTL.value)
  .description('Build oracle post query transaction.')
  .action(Transaction.oraclePostQuery));

// ## Initialize `oracle-extend` command
//
// You can use this command to build `oracle-extend` transaction
//
// Example: `aecli tx oracle-extend ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  ok_348hrfdhisdkhasdaksdasdsad 100
addCommonOptions(program
  .command('oracle-extend <callerId> <oracleId> <oracleTtl>')
  .addArgument(nonceArgument)
  .description('Build oracle extend transaction.')
  .action(Transaction.oracleExtend));

// ## Initialize `oracle-respond` command
//
// You can use this command to build `oracle-respond` transaction
//
// Example: `aecli tx oracle-respond ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  ok_348hrfdhisdkhasdaksdasdsad oq_asdjn23ifsdiuhfk2h3fuksadh {tmp: 1}`
addCommonOptions(program
  .command('oracle-respond <callerId> <oracleId> <queryId> <response>')
  .addArgument(nonceArgument)
  .option('--responseTtl [oracleTtl]', 'Oracle Ttl.', RESPONSE_TTL.value)
  .description('Build oracle extend transaction.')
  .action(Transaction.oracleRespond));

// ## Initialize `verify` command
//
// You can use this command to send `transaction` to the `chain`
//
// Example: `aecli tx spend ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT 100`
addCommonOptions(program
  .command('verify <tx>')
  .addOption(networkIdOption)
  .description('Verify transaction')
  .action(Transaction.verify));

export default program;
