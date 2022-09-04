// # æternity CLI `transaction` file
//
// This script initialize all `transaction` command's
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
import { Command } from 'commander';
import {
  TX_TTL, NAME_TTL, CLIENT_TTL, MIN_GAS_PRICE, QUERY_FEE, ORACLE_TTL, QUERY_TTL,
} from '@aeternity/aepp-sdk';
import { RESPONSE_TTL } from '../utils/constant';
import { withGlobalOpts } from '../utils/cli';
import * as Transaction from '../actions/transaction';
import {
  nodeOption, jsonOption, gasOption, nonceArgument, feeOption,
} from '../arguments';

const program = new Command().name('aecli tx');

// ## Initialize `options`
program
  .addOption(nodeOption)
// .option('--nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .addOption(feeOption)
  .option('--ttl [fee]', 'Override the ttl that the transaction is going to be sent with', TX_TTL)
  .option('-f --force', 'Ignore node version compatibility check')
  .addOption(jsonOption);

// ## Initialize `spend` command
//
// You can use this command to build `spend` transaction
//
// Example: `aecli tx spend ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT 100`
program
  .command('spend <senderId> <recieverId> <amount>')
  .addArgument(nonceArgument)
  .option('--payload [payload]', 'Transaction payload.', '')
  .description('Build Spend Transaction')
  .action(withGlobalOpts(Transaction.spend));

// ## Initialize `name-preclaim` command
//
// You can use this command to build `preclaim` transaction
//
// Example: `aecli tx name-preclaim ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.chain`
program
  .command('name-preclaim <accountId> <domain>')
  .addArgument(nonceArgument)
  .description('Build name preclaim transaction.')
  .action(withGlobalOpts(Transaction.namePreClaim));

// ## Initialize `name-update` command
//
// You can use this command to build `update` transaction
//
// Example: `aecli tx name-update ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.chain`
program
  .command('name-update <accountId> <nameId>')
  .addArgument(nonceArgument)
  .argument('[pointers...]')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', TX_TTL)
  .addOption(feeOption)
  .option('--nameTtl [nameTtl]', 'Validity of name.', NAME_TTL)
  .option('--clientTtl [clientTtl]', 'Client ttl.', CLIENT_TTL)
  .description('Build name update transaction.')
  .action(withGlobalOpts(Transaction.nameUpdate));

// ## Initialize `name-claim` command
//
// You can use this command to build `claim` transaction
//
// Example: `aecli tx name-claim ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi 12327389123 testname.chain`
program
  .command('name-claim <accountId> <salt> <domain>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', TX_TTL)
  .addOption(feeOption)
  .option('--nameFee [nameFee]', 'Name fee.')
  .description('Build name claim transaction.')
  .action(withGlobalOpts(Transaction.nameClaim));

// ## Initialize `name-transfer` command
//
// You can use this command to build `tansfer` transaction
//
// Example: `aecli tx name-transfer ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.chain`
program
  .command('name-transfer <accountId> <recipientId> <domain>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', TX_TTL)
  .addOption(feeOption)
  .description('Build name tansfer transaction.')
  .action(withGlobalOpts(Transaction.nameTransfer));

// ## Initialize `name-revoke` command
//
// You can use this command to build `revoke` transaction
//
// Example: `aecli tx name-revoke ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.chain`
program
  .command('name-revoke <accountId> <domain>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', TX_TTL)
  .addOption(feeOption)
  .description('Build name revoke transaction.')
  .action(withGlobalOpts(Transaction.nameRevoke));

// ## Initialize `contract-deploy` command
//
// You can use this command to build `contract create` transaction
//
// Example: `aecli tx contract-deploy ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi test.contract`
program
  .command('contract-deploy <ownerId> <contractBytecode> <initCallData>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', TX_TTL)
  .addOption(feeOption)
  .addOption(gasOption)
  .option('-G --gasPrice [gas]', 'Amount of gas to deploy the contract', MIN_GAS_PRICE)
  .option('--amount [amount]', 'Amount', 0)
  .description('Build contract create transaction.')
  .action(withGlobalOpts(Transaction.contractDeploy));

// ## Initialize `contract-call` command
//
// You can use this command to build `contract call` transaction
//
// Example: `aecli tx contract-call ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ct_2134235423dsfsdfsdf sum int 1 2`
program
  .command('contract-call <callerId> <contractId> <callData>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', TX_TTL)
  .addOption(feeOption)
  .addOption(gasOption)
  .option('-G --gasPrice [gas]', 'Amount of gas to deploy the contract', MIN_GAS_PRICE)
  .option('--amount [amount]', 'Amount', 0)
  .description('Build contract create transaction.')
  .action(withGlobalOpts(Transaction.contractCall));

// ## Initialize `oracle-register` command
//
// You can use this command to build `oracle-register` transaction
//
// Example: `aecli tx oracle-register ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  "{city: 'string'}" "{tmp: 'num'}"``
program
  .command('oracle-register <accountId> <queryFormat> <responseFormat>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', TX_TTL)
  .addOption(feeOption)
  .option('--queryFee [queryFee]', 'Oracle Query fee.', QUERY_FEE)
  .option('--oracleTtl [oracleTtl]', 'Oracle Ttl.', ORACLE_TTL.value)
  .description('Build oracle register transaction.')
  .action(withGlobalOpts(Transaction.oracleRegister));

// ## Initialize `oracle-post-query` command
//
// You can use this command to build `oracle-post-query` transaction
//
// Example: `aecli tx oracle-post-query ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  ok_348hrfdhisdkhasdaksdasdsad {city: 'Berlin'}`
program
  .command('oracle-post-query <accountId> <oracleId> <query>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', TX_TTL)
  .addOption(feeOption)
  .option('--queryFee [queryFee]', 'Oracle Query fee.', QUERY_FEE)
  .option('--queryTtl [oracleTtl]', 'Oracle Ttl.', QUERY_TTL.value)
  .option('--responseTtl [oracleTtl]', 'Oracle Ttl.', RESPONSE_TTL)
  .description('Build oracle post query transaction.')
  .action(withGlobalOpts(Transaction.oraclePostQuery));

// ## Initialize `oracle-extend` command
//
// You can use this command to build `oracle-extend` transaction
//
// Example: `aecli tx oracle-extend ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  ok_348hrfdhisdkhasdaksdasdsad 100
program
  .command('oracle-extend <callerId> <oracleId> <oracleTtl>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', TX_TTL)
  .addOption(feeOption)
  .description('Build oracle extend transaction.')
  .action(withGlobalOpts(Transaction.oracleExtend));

// ## Initialize `oracle-respond` command
//
// You can use this command to build `oracle-respond` transaction
//
// Example: `aecli tx oracle-respond ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  ok_348hrfdhisdkhasdaksdasdsad oq_asdjn23ifsdiuhfk2h3fuksadh {tmp: 1}`
program
  .command('oracle-respond <callerId> <oracleId> <queryId> <response>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', TX_TTL)
  .addOption(feeOption)
  .option('--responseTtl [oracleTtl]', 'Oracle Ttl.', RESPONSE_TTL)
  .description('Build oracle extend transaction.')
  .action(withGlobalOpts(Transaction.oracleRespond));

// ## Initialize `verify` command
//
// You can use this command to send `transaction` to the `chain`
//
// Example: `aecli tx spend ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT 100`
program
  .command('verify <tx>')
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .description('Verify transaction')
  .action(withGlobalOpts(Transaction.verify));

export default program;
