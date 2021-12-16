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
import { Command } from 'commander'
import * as utils from '../utils'
import * as Contract from '../actions/contract'

export default function () {
  const program = new Command().name('aecli contract')

  // ## Initialize `options`
  program
    .option('-u --url [hostname]', 'Node to connect to', utils.constant.NODE_URL)
    .option('--internalUrl [internal]', 'Node to connect to(internal)', utils.constant.NODE_INTERNAL_URL)
    .option('--compilerUrl [compilerUrl]', 'Compiler URL', utils.constant.COMPILER_URL)
    .option('-f --force', 'Ignore node version compatibility check')
    .option('--json', 'Print result in json format')

  // ## Initialize `compile` command
  //
  // You can use this command to compile your `contract` to `bytecode`
  //
  // Example: `aecli contract compile ./mycontract.contract`
  program
    .command('compile <file>')
    .description('Compile a contract')
    .action(async (file, ...args) => await Contract.compile(file, utils.cli.getCmdFromArguments(args)))

  // ## Initialize `encode callData` command
  //
  // You can use this command to prepare `callData`
  //
  // Example: `aecli contract encodeData ./mycontract.contract testFn 1 2`
  program
    .command('encodeData <source> <fn> [args...]')
    .description('Encode contract call data')
    .action(async (source, fn, args, ...otherArgs) => await Contract.encodeData(source, fn, args, utils.cli.getCmdFromArguments(otherArgs)))

  // ## Initialize `decode call data` command
  //
  // You can use this command to decode contract call data using source or bytecode
  //
  // Example bytecode: `aecli contract decodeCallData cb_asdasdasd... --code cb_asdasdasdasd....`
  // Example source cdoe: `aecli contract decodeCallData cb_asdasdasd... --sourcePath ./contractSource --fn someFunction`
  program
    .command('decodeCallData <data>')
    .option('--sourcePath [sourcePath]', 'Path to contract source')
    .option('--code [code]', 'Compiler contract code')
    .option('--fn [fn]', 'Function name')
    .description('Decode contract call data')
    .action(async (data, ...args) => await Contract.decodeCallData(data, utils.cli.getCmdFromArguments(args)))

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
  //    `aecli contract call ./myWalletFile --password testpass sumFunc int 1 2 --descrPath ./contractDescriptorFile.json --callStatic` --> Static call using descriptor
  //    `aecli contract call ./myWalletFile --password testpass sumFunc int 1 2 --contractAddress ct_1dsf35423fdsg345g4wsdf35ty54234235 --callStatic` --> Static call using contract address
  // You can preset gas, nonce and ttl for that call. If not set use default.
  // Example: `aecli contract call ./myWalletFile --password tstpass sumFunc int 1 2 --descrPath ./contractDescriptorFile.json  --gas 2222222 --nonce 4 --ttl 1243`
  program
    .command('call <wallet_path> <fn> [args...]')
    .option('-W, --no-waitMined', 'Force waiting until transaction will be mined')
    .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
    .option('-P, --password [password]', 'Wallet Password')
    .option('-G --gas [gas]', 'Amount of gas to call the contract', utils.constant.GAS)
    .option('-d --descrPath [descrPath]', 'Path to contract descriptor file')
    .option('-s --callStatic', 'Call static', false)
    .option('-t --topHash', 'Hash of block to make call')
    .option('--contractAddress [contractAddress]', 'Contract address to call')
    .option('--contractSource [contractSource]', 'Contract source code')
    .option('-F, --fee [fee]', 'Spend transaction fee.')
    .option('-T, --ttl [ttl]', 'Validity of the spend transaction in number of blocks (default forever)', utils.constant.TX_TTL)
    .option('-N, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
    .description('Execute a function of the contract')
    .action(async (walletPath, fn, args, ...otherArgs) => await Contract.call(walletPath, fn, args, utils.cli.getCmdFromArguments(otherArgs)))

  //
  // ## Initialize `deploy` command
  //
  // You can use this command to deploy contract on the chain
  //
  // Example: `aecli contract deploy ./myWalletFile --password testpass ./contractSourceCodeFile 1 2` -> "1 2" -> Init state params
  //
  // You can preset gas and initState for deploy
  //
  // Example: `aecli contract deploy ./myWalletFile --password tstpass ./contractSourceCodeFile --gas 2222222`
  program
    .command('deploy <wallet_path> <contract_path> <callData>')
    .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
    .option('-W, --no-waitMined', 'Force waiting until transaction will be mined')
    .option('-P, --password [password]', 'Wallet Password')
    .option('-G --gas [gas]', 'Amount of gas to deploy the contract', utils.constant.GAS)
    .option('-G --gasPrice [gas]', 'Amount of gas to deploy the contract', utils.constant.GAS_PRICE)
    .option('-F, --fee [fee]', 'Spend transaction fee.')
    .option('-T, --ttl [ttl]', 'Validity of the spend transaction in number of blocks (default forever)', utils.constant.TX_TTL)
    .option('-N, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
    .description('Deploy a contract on the chain')
    .action(async (walletPath, path, callData, ...args) => await Contract.deploy(walletPath, path, callData, utils.cli.getCmdFromArguments(args)))

  return program
}
