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
import { SCHEMA } from '@aeternity/aepp-sdk';
import * as constant from '../utils/constant';
import { getCmdFromArguments } from '../utils/cli';
import * as Transaction from '../actions/transaction';
import { nonceArgument } from '../arguments';

const program = new Command().name('aecli tx');

// ## Initialize `options`
program
  .option('-u, --url [hostname]', 'Node to connect to', constant.NODE_URL)
  // .option('--nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .option('--fee [fee]', 'Override the fee that the transaction is going to be sent with')
  .option('--ttl [fee]', 'Override the ttl that the transaction is going to be sent with', SCHEMA.TX_TTL)
  .option('-f --force', 'Ignore node version compatibility check')
  .option('--json', 'Print result in json format');

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
  .action((senderId, receiverId, amount, nonce, ...args) => Transaction.spend(senderId, receiverId, amount, nonce, getCmdFromArguments(args)));

// ## Initialize `name-preclaim` command
//
// You can use this command to build `preclaim` transaction
//
// Example: `aecli tx name-preclaim ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.chain`
program
  .command('name-preclaim <accountId> <domain>')
  .addArgument(nonceArgument)
  .description('Build name preclaim transaction.')
  .action((accountId, domain, nonce, ...args) => Transaction.namePreClaim(accountId, domain, nonce, getCmdFromArguments(args)));

// ## Initialize `name-update` command
//
// You can use this command to build `update` transaction
//
// Example: `aecli tx name-update ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.chain`
program
  .command('name-update <accountId> <nameId>')
  .addArgument(nonceArgument)
  .argument('[pointers...]')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', SCHEMA.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .option('--nameTtl [nameTtl]', 'Validity of name.', SCHEMA.NAME_TTL)
  .option('--clientTtl [clientTtl]', 'Client ttl.', SCHEMA.CLIENT_TTL)
  .description('Build name update transaction.')
  .action((accountId, domain, nonce, pointers, ...args) => Transaction.nameUpdate(accountId, domain, nonce, pointers, getCmdFromArguments(args)));

// ## Initialize `name-claim` command
//
// You can use this command to build `claim` transaction
//
// Example: `aecli tx name-claim ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi 12327389123 testname.chain`
program
  .command('name-claim <accountId> <salt> <domain>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', SCHEMA.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .option('--nameFee [nameFee]', 'Name fee.', SCHEMA.NAME_FEE)
  .description('Build name claim transaction.')
  .action((accountId, salt, domain, nonce, ...args) => Transaction.nameClaim(accountId, salt, domain, nonce, getCmdFromArguments(args)));

// ## Initialize `name-transfer` command
//
// You can use this command to build `tansfer` transaction
//
// Example: `aecli tx name-transfer ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.chain`
program
  .command('name-transfer <accountId> <recipientId> <domain>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', SCHEMA.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .description('Build name tansfer transaction.')
  .action((accountId, transferId, domain, nonce, ...args) => Transaction.nameTransfer(accountId, transferId, domain, nonce, getCmdFromArguments(args)));

// ## Initialize `name-revoke` command
//
// You can use this command to build `revoke` transaction
//
// Example: `aecli tx name-revoke ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.chain`
program
  .command('name-revoke <accountId> <domain>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', SCHEMA.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .description('Build name revoke transaction.')
  .action((accountId, domain, nonce, ...args) => Transaction.nameRevoke(accountId, domain, nonce, getCmdFromArguments(args)));

// ## Initialize `contract-deploy` command
//
// You can use this command to build `contract create` transaction
//
// Example: `aecli tx contract-deploy ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi test.contract`
program
  .command('contract-deploy <ownerId> <contractBytecode> <initCallData>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', SCHEMA.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .option('-G --gas [gas]', 'Amount of gas to deploy the contract', constant.GAS)
  .option('-G --gasPrice [gas]', 'Amount of gas to deploy the contract', SCHEMA.MIN_GAS_PRICE)
  .option('--amount [amount]', 'Amount', constant.AMOUNT)
  .option('--deposit [deposit]', 'Deposit', constant.DEPOSIT)
  .description('Build contract create transaction.')
  .action((ownerId, contractBytecode, initCallData, nonce, ...args) => Transaction.contractDeploy(ownerId, contractBytecode, initCallData, nonce, getCmdFromArguments(args)));

// ## Initialize `contract-call` command
//
// You can use this command to build `contract call` transaction
//
// Example: `aecli tx contract-call ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ct_2134235423dsfsdfsdf sum int 1 2`
program
  .command('contract-call <callerId> <contractId> <callData>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', SCHEMA.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .option('-G --gas [gas]', 'Amount of gas to deploy the contract', constant.GAS)
  .option('-G --gasPrice [gas]', 'Amount of gas to deploy the contract', SCHEMA.MIN_GAS_PRICE)
  .option('--amount [amount]', 'Amount', constant.AMOUNT)
  .description('Build contract create transaction.')
  .action((callerId, contractId, callData, nonce, ...args) => Transaction.contractCall(callerId, contractId, callData, nonce, getCmdFromArguments(args)));

// ## Initialize `oracle-register` command
//
// You can use this command to build `oracle-register` transaction
//
// Example: `aecli tx oracle-register ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  "{city: 'string'}" "{tmp: 'num'}"``
program
  .command('oracle-register <accountId> <queryFormat> <responseFormat>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', SCHEMA.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .option('--queryFee [queryFee]', 'Oracle Query fee.', SCHEMA.QUERY_FEE)
  .option('--oracleTtl [oracleTtl]', 'Oracle Ttl.', SCHEMA.ORACLE_TTL.value)
  .description('Build oracle register transaction.')
  .action((accountId, queryFormat, responseFormat, nonce, ...args) => Transaction.oracleRegister(accountId, queryFormat, responseFormat, nonce, getCmdFromArguments(args)));

// ## Initialize `oracle-post-query` command
//
// You can use this command to build `oracle-post-query` transaction
//
// Example: `aecli tx oracle-post-query ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  ok_348hrfdhisdkhasdaksdasdsad {city: 'Berlin'}`
program
  .command('oracle-post-query <accountId> <oracleId> <query>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', SCHEMA.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .option('--queryFee [queryFee]', 'Oracle Query fee.', SCHEMA.QUERY_FEE)
  .option('--queryTtl [oracleTtl]', 'Oracle Ttl.', SCHEMA.QUERY_TTL.value)
  .option('--responseTtl [oracleTtl]', 'Oracle Ttl.', constant.RESPONSE_TTL)
  .description('Build oracle post query transaction.')
  .action((accountId, oracleId, query, nonce, ...args) => Transaction.oraclePostQuery(accountId, oracleId, query, nonce, getCmdFromArguments(args)));

// ## Initialize `oracle-extend` command
//
// You can use this command to build `oracle-extend` transaction
//
// Example: `aecli tx oracle-extend ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  ok_348hrfdhisdkhasdaksdasdsad 100
program
  .command('oracle-extend <callerId> <oracleId> <oracleTtl>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', SCHEMA.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .description('Build oracle extend transaction.')
  .action((callerId, oracleId, oracleTtl, nonce, ...args) => Transaction.oracleExtend(callerId, oracleId, oracleTtl, nonce, getCmdFromArguments(args)));

// ## Initialize `oracle-respond` command
//
// You can use this command to build `oracle-respond` transaction
//
// Example: `aecli tx oracle-respond ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  ok_348hrfdhisdkhasdaksdasdsad oq_asdjn23ifsdiuhfk2h3fuksadh {tmp: 1}`
program
  .command('oracle-respond <callerId> <oracleId> <queryId> <response>')
  .addArgument(nonceArgument)
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', SCHEMA.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .option('--responseTtl [oracleTtl]', 'Oracle Ttl.', constant.RESPONSE_TTL)
  .description('Build oracle extend transaction.')
  .action((callerId, oracleId, queryId, response, nonce, ...args) => Transaction.oracleRespond(callerId, oracleId, queryId, response, nonce, getCmdFromArguments(args)));

// ## Initialize `verify` command
//
// You can use this command to send `transaction` to the `chain`
//
// Example: `aecli tx spend ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT 100`
program
  .command('verify <tx>')
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .description('Verify transaction')
  .action((tx, ...args) => Transaction.verify(tx, getCmdFromArguments(args)));

export default program;
