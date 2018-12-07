#!/usr/bin/env node
// # æternity CLI `contract` file
//
// This script initialize all `contract` command's
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
// Also we need `esm` package to handle `ES imports`
const program = require('commander')

require = require('esm')(module/*, options*/) //use to handle es6 import/export
const utils = require('./utils/index')
const { Contract } = require('./commands')

// ## Initialize `options`
program
  .option('-u --url [hostname]', 'Node to connect to', utils.constant.EPOCH_URL)
  .option('--internalUrl [internal]', 'Node to connect to(internal)', utils.constant.EPOCH_INTERNAL_URL)
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .option('--native', 'Build transaction natively')
  .option('-T, --ttl [ttl]', 'Validity of the transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-n, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .option('-f --force', 'Ignore epoch version compatibility check')
  .option('--json', 'Print result in json format')

// ## Initialize `compile` command
//
// You can use this command to compile your `contract` to `bytecode`
//
// Example: `aecli contract compile ./mycontract.contract`
program
  .command('compile <file>')
  .description('Compile a contract')
  .action(async (file, ...arguments) => await Contract.compile(file, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `call` command
//
// You can use this command to execute a function's of contract
//
// Example:
//    `aecli contract call ./myWalletFile --password testpass sumFunc int 1 2 --descrPath ./contractDescriptorFile.json ` --> Using descriptor file
//    `aecli contract call ./myWalletFile --password testpass sumFunc int 1 2 --contractAddress ct_1dsf35423fdsg345g4wsdf35ty54234235 ` --> Using contract address
//
// Also you have ability to make `static` call using `--callStatic` flag
// Example:
//    `aecli contract call ./myWalletFile --password testpass sumFunc int ./pseudoContractCall --descrPath ./contractDescriptorFile.json --callStatic` --> Static call
//
// You can preset gas, nonce and ttl for that call. If not set use default.
// Example: `aecli contract call ./myWalletFile --password tstpass sumFunc int 1 2 --descrPath ./contractDescriptorFile.json  --gas 2222222 --nonce 4 --ttl 1243`
program
  .command('call <wallet_path> <fn> <return_type> [args...]')
  .option('-P, --password [password]', 'Wallet Password')
  .option('-G --gas [gas]', 'Amount of gas to call the contract', utils.constant.GAS)
  .option('-d --descrPath [descrPath]', 'Path to contract descriptor file')
  .option('-s --callStatic', 'Call static', false)
  .option('--contractAddress [contractAddress]', 'Contract address to call')
  .description('Execute a function of the contract')
  .action(async (walletPath, fn, returnType, args, ...arguments) => await Contract.call(walletPath, fn, returnType, args, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `callChecked` command
//
// You can use this command to execute a function's of contract using `pseudo contract` which calling `contract` with `params`
// This `pseudo contract` can be used for check custom type's
//
// Example:
//    `aecli contract call ./myWalletFile --password testpass sumFunc int ./pseudoContractCall --descrPath ./contractDescriptorFile.json ` --> Using descriptor file
//    `aecli contract call ./myWalletFile --password testpass sumFunc int ./pseudoContractCall --contractAddress ct_1dsf35423fdsg345g4wsdf35ty54234235 ` --> Using contract address
//
// Also you have ability to make `static` call using `--callStatic` flag
// Example:
//    `aecli contract call ./myWalletFile --password testpass sumFunc int ./pseudoContractCall --descrPath ./contractDescriptorFile.json --callStatic` --> Static call
//
// You can preset gas, nonce and ttl for that call. If not set use default.
// Example: `aecli contract call ./myWalletFile --password tstpass sumFunc int 1 2 --descrPath ./contractDescriptorFile.json  --gas 2222222 --nonce 4 --ttl 1243`
program
  .command('callChecked <wallet_path> <fn> <return_type> <callContractPath>')
  .option('-P, --password [password]', 'Wallet Password')
  .option('-G --gas [gas]', 'Amount of gas to call the contract', utils.constant.GAS)
  .option('-s --callStatic', 'Call static', false)
  .option('-d --descrPath [descrPath]', 'path to contract descriptor file')
  .option('--contractAddress [contracAddress]', 'path to call pseudo contract(Using for type-checked call\'s)')
  .description('Execute a function of the contract using type-checked call')
  .action(async (walletPath, fn, returnType, callContractPath, ...arguments) => await Contract.callTypeChecked(walletPath, fn, returnType, callContractPath, utils.cli.getCmdFromArguments(arguments)))

// ## Initialize `deploy` command
//
// You can use this command to deploy contract on the chain
//
// Example: `aecli contract deploy ./myWalletFile --password testpass ./contractSourceCodeFile`
//
// You can preset gas and initState for deploy
//
// Example: `aecli contract call ./myWalletFile --password tstpass ./contractDescriptorFile.json sumFunc int 1 2 --gas 2222222 --init state`
program
  .command('deploy <wallet_path> <contract_path>')
  .option('-P, --password [password]', 'Wallet Password')
  .option('-I, --init [state]', 'Deploying contract arguments for constructor function')
  .option('-G --gas [gas]', 'Amount of gas to deploy the contract', utils.constant.GAS)
  .description('Deploy a contract on the chain')
  .action(async (walletPath, path, ...arguments) => await Contract.deploy(walletPath, path, utils.cli.getCmdFromArguments(arguments)))

// Handle unknown command's
program.on('command:*', () => utils.errors.unknownCommandHandler(program)())

// Parse arguments or show `help` if argument's is empty
program.parse(process.argv)
if (program.args.length === 0) program.help()
