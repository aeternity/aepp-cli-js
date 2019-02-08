#!/usr/bin/env node
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
const program = require('commander')

require = require('esm')(module/*, options*/) //use to handle es6 import/export
const utils = require('./utils/index')
const { Transaction } = require('./commands')

// ## Initialize `options`
program
  .option('-u, --url [hostname]', 'Node to connect to', utils.constant.EPOCH_URL)
  .option('-U, --internalUrl [internal]', 'Node to connect to(internal)', utils.constant.EPOCH_INTERNAL_URL)
  .option('-P, --password [password]', 'Wallet Password')
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .option('-n, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .option('-f --force', 'Ignore epoch version compatibility check')
  .option('--json', 'Print result in json format')

// ## Initialize `spend` command
//
// You can use this command to build `spend` transaction
//
// Example: `aecli tx spend ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT 100`
program
  .command('spend <senderId> <recieverId> <amount>')
  .option('-T, --ttl [ttl]', 'Validity of the spend transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-F, --fee [fee]', 'Spend transaction fee.')
  .option('--payload [payload]', 'Transaction payload.', '')
  .description('Build Spend Transaction')
  .action(async (senderId, receiverId, amount, ...arguments) => await Transaction.spend(senderId, receiverId, amount, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `name-preclaim` command
//
// You can use this command to build `preclaim` transaction
//
// Example: `aecli tx name-preclaim ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.test`
program
  .command('name-preclaim <accountId> <domain>')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .description('Build name preclaim transaction.')
  .action(async (accountId, domain, ...arguments) => await Transaction.namePreClaim(accountId, domain, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `name-update` command
//
// You can use this command to build `update` transaction
//
// Example: `aecli tx name-update ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.test`
program
  .command('name-update <accountId> <domain> [pointers...]')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .option('--nameTtl [nameTtl]', 'Validity of name.', utils.constant.NAME_TTL)
  .option('--clientTtl [clientTtl]', 'Client ttl.', utils.constant.CLIENT_TTL)
  .description('Build name update transaction.')
  .action(async (accountId, domain, pointers, ...arguments) => await Transaction.nameUpdate(accountId, domain, pointers, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `name-claim` command
//
// You can use this command to build `claim` transaction
//
// Example: `aecli tx name-claim ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi 12327389123 testname.test`
program
  .command('name-claim <accountId> <salt> <domain>')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .description('Build name claim transaction.')
  .action(async (accountId, salt, domain, ...arguments) => await Transaction.nameClaim(accountId, salt, domain, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `name-transfer` command
//
// You can use this command to build `tansfer` transaction
//
// Example: `aecli tx name-transfer ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.test`
program
  .command('name-transfer <accountId> <recipientId> <domain>')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .description('Build name tansfer transaction.')
  .action(async (accountId, transferId, domain, ...arguments) => await Transaction.nameTransfer(accountId, transferId, domain, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `name-revoke` command
//
// You can use this command to build `revoke` transaction
//
// Example: `aecli tx name-revoke ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi testname.test`
program
  .command('name-revoke <accountId> <domain>')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .description('Build name revoke transaction.')
  .action(async (accountId, domain, ...arguments) => await Transaction.nameRevoke(accountId, domain, utils.cli.getCmdFromArguments(arguments)))


// ## Initialize `contract-deploy` command
//
// You can use this command to build `contract create` transaction
//
// Example: `aecli tx contract-deploy ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi test.contract`
program
  .command('contract-deploy <ownerId> <contractPath>')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .option('-I, --init [state]', 'Deploying contract arguments for constructor function')
  .option('-G --gas [gas]', 'Amount of gas to deploy the contract', utils.constant.GAS)
  .description('Build contract create transaction.')
  .action(async (ownerId, contractPath, ...arguments) => await Transaction.contractDeploy(ownerId, contractPath, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `contract-call` command
//
// You can use this command to build `contract call` transaction
//
// Example: `aecli tx contract-call ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ct_2134235423dsfsdfsdf sum int 1 2`
program
  .command('contract-call <callerId> <contractId> <fn> <return_type> [args...]')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .option('-G --gas [gas]', 'Amount of gas to deploy the contract', utils.constant.GAS)
  .description('Build contract create transaction.')
  .action(async (callerId, contractId, fn, returnType, args, ...arguments) => await Transaction.contractCall(callerId, contractId, fn, returnType, args, utils.cli.getCmdFromArguments(arguments)))


// ## Initialize `oracle-register` command
//
// You can use this command to build `oracle-register` transaction
//
// Example: `aecli tx oracle-register ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  "{city: 'string'}" "{tmp: 'num'}"``
program
  .command('oracle-register <accountId> <queryFormat> <responseFormat>')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .option('--queryFee [queryFee]', 'Oracle Query fee.', utils.constant.QUERY_FEE)
  .option('--oracleTtl [oracleTtl]', 'Oracle Ttl.', utils.constant.ORACLE_TTL)
  .description('Build oracle register transaction.')
  .action(async (accountId, queryFormat, responseFormat, ...arguments) => await Transaction.oracleRegister(accountId, queryFormat, responseFormat, utils.cli.getCmdFromArguments(arguments)))


// ## Initialize `oracle-post-query` command
//
// You can use this command to build `oracle-post-query` transaction
//
// Example: `aecli tx oracle-post-query ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  ok_348hrfdhisdkhasdaksdasdsad {city: 'Berlin'}`
program
  .command('oracle-post-query <accountId> <oracleId> <query>')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .option('--queryFee [queryFee]', 'Oracle Query fee.', utils.constant.QUERY_FEE)
  .option('--queryTtl [oracleTtl]', 'Oracle Ttl.', utils.constant.QUERY_TTL)
  .option('--responseTtl [oracleTtl]', 'Oracle Ttl.', utils.constant.RESPONSE_TTL)
  .description('Build oracle post query transaction.')
  .action(async (accountId, oracleId, query, ...arguments) => await Transaction.oraclePostQuery(accountId, oracleId, query, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `oracle-extend` command
//
// You can use this command to build `oracle-extend` transaction
//
// Example: `aecli tx oracle-extend ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  ok_348hrfdhisdkhasdaksdasdsad 100
program
  .command('oracle-extend <callerId> <oracleId> <oracleTtl>')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .description('Build oracle extend transaction.')
  .action(async (callerId, oracleId, oracleTtl, ...arguments) => await Transaction.oracleExtend(callerId, oracleId, oracleTtl, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `oracle-respond` command
//
// You can use this command to build `oracle-respond` transaction
//
// Example: `aecli tx oracle-respond ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi  ok_348hrfdhisdkhasdaksdasdsad oq_asdjn23ifsdiuhfk2h3fuksadh {tmp: 1}`
program
  .command('oracle-respond <callerId> <oracleId> <queryId> <response>')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-F, --fee [fee]', 'Transaction fee.')
  .option('--responseTtl [oracleTtl]', 'Oracle Ttl.', utils.constant.RESPONSE_TTL)
  .description('Build oracle extend transaction.')
  .action(async (callerId, oracleId, queryId, response, ...arguments) => await Transaction.oracleRespond(callerId, oracleId, queryId, response, utils.cli.getCmdFromArguments(arguments)))


// ## Initialize `broadcast` command
//
// You can use this command to send `transaction` to the `chain`
//
// Example: `aecli tx spend ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT 100`
program
  .command('broadcast <tx>')
  .option('--waitMined', 'Transaction payload.')
  .option('--verify', 'Verify Transaction before broadcast.')
  .description('Send transaction to the chain')
  .action(async (tx, ...arguments) => await Transaction.broadcast(tx, utils.cli.getCmdFromArguments(arguments)))


// Handle unknown command's
program.on('command:*', () => utils.errors.unknownCommandHandler(program)())

// Parse arguments or show `help` if argument's is empty
program.parse(process.argv)
if (program.args.length === 0) program.help()
