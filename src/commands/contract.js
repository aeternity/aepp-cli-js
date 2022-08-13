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
import { Argument, Option, Command } from 'commander';
import { TX_TTL, MIN_GAS_PRICE } from '@aeternity/aepp-sdk';
import { COMPILER_URL } from '../utils/constant';
import { getCmdFromArguments } from '../utils/cli';
import CliError from '../utils/CliError';
import * as Contract from '../actions/contract';
import {
  nodeOption, jsonOption, gasOption, feeOption,
} from '../arguments';

const callArgs = new Argument('[args]', 'JSON-encoded arguments array of contract call')
  .argParser((argsText) => {
    let args;
    try {
      args = JSON.parse(argsText);
    } catch (error) {
      throw new CliError(`Can't parse contract arguments: ${error.message}`);
    }
    if (!Array.isArray(args)) throw new CliError(`Call arguments should be an array, got ${argsText} instead`);
    return args;
  })
  .default([]);

const descriptorPathOption = new Option('-d --descrPath [descrPath]', 'Path to contract descriptor file');
const contractSourceFilenameOption = new Option('--contractSource [contractSource]', 'Contract source code file name');
const contractAciFilenameOption = new Option('--contractAci [contractAci]', 'Contract ACI file name');

const program = new Command().name('aecli contract');

// ## Initialize `options`
program
  .addOption(nodeOption)
  .option('--compilerUrl [compilerUrl]', 'Compiler URL', COMPILER_URL)
  .option('-f --force', 'Ignore node version compatibility check')
  .addOption(jsonOption);

// ## Initialize `compile` command
//
// You can use this command to compile your `contract` to `bytecode`
//
// Example: `aecli contract compile ./mycontract.contract`
program
  .command('compile <file>')
  .description('Compile a contract')
  .action((file, ...args) => Contract.compile(file, getCmdFromArguments(args)));

// ## Initialize `encode-calldata` command
//
// You can use this command to prepare `callData`
//
// Example: `aecli contract encodeData ./mycontract.contract testFn 1 2`
program
  .command('encode-calldata <fn>')
  .addArgument(callArgs)
  .addOption(descriptorPathOption)
  .addOption(contractSourceFilenameOption)
  .addOption(contractAciFilenameOption)
  .description('Encode contract calldata')
  .action((fn, args, ...otherArgs) => Contract.encodeCalldata(fn, args, getCmdFromArguments(otherArgs)));

// ## Initialize `decode-calldata` command
//
// You can use this command to decode contract calldata using source or bytecode
//
// Example bytecode: `aecli contract decodeCallData cb_asdasdasd... --code cb_asdasdasdasd....`
// Example source code: `aecli contract decodeCallData cb_asdasdasd... --sourcePath ./contractSource --fn someFunction`
program
  .command('decode-call-result <fn> <data>')
  .addOption(descriptorPathOption)
  .addOption(contractSourceFilenameOption)
  .addOption(contractAciFilenameOption)
  .description('Decode contract calldata')
  .action((fn, data, ...args) => Contract.decodeCallResult(fn, data, getCmdFromArguments(args)));

// ## Initialize `call` command
//
// You can use this command to execute a function's of contract
//
// Example:
//    `aecli contract call ./myWalletFile --password testpass sumFunc '[1, 2]' --descrPath ./contractDescriptorFile.json ` --> Using descriptor file
//    `aecli contract call ./myWalletFile --password testpass sumFunc '[1, 2]' --contractAddress ct_1dsf35423fdsg345g4wsdf35ty54234235 ` --> Using contract address
//
// Also you have ability to make `static` call using `--callStatic` flag
// Example:
//    `aecli contract call ./myWalletFile --password testpass sumFunc '[1, 2]' --descrPath ./contractDescriptorFile.json --callStatic` --> Static call using descriptor
//    `aecli contract call ./myWalletFile --password testpass sumFunc '[1, 2]' --contractAddress ct_1dsf35423fdsg345g4wsdf35ty54234235 --callStatic` --> Static call using contract address
// You can preset gas, nonce and ttl for that call. If not set use default.
// Example: `aecli contract call ./myWalletFile --password testpass sumFunc '[1, 2]' --descrPath ./contractDescriptorFile.json --gas 2222222 --nonce 4 --ttl 1243`
program
  .command('call <wallet_path> <fn>')
  .addArgument(callArgs)
  .addOption(descriptorPathOption)
  .option('--contractAddress [contractAddress]', 'Contract address to call')
  .addOption(contractSourceFilenameOption)
  .addOption(contractAciFilenameOption)
  .option('-W, --no-waitMined', 'Force waiting until transaction will be mined')
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .option('-P, --password [password]', 'Wallet Password')
  .addOption(gasOption)
  .option('-s --callStatic', 'Call static')
  .option('-t --topHash', 'Hash of block to make call')
  .addOption(feeOption)
  .option('-T, --ttl [ttl]', 'Validity of the spend transaction in number of blocks (default forever)', TX_TTL)
  .option('-N, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .description('Execute a function of the contract')
  .action((walletPath, fn, args, ...otherArgs) => Contract.call(walletPath, fn, args, getCmdFromArguments(otherArgs)));

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
  .command('deploy <wallet_path>')
  .addArgument(callArgs)
  .addOption(descriptorPathOption)
  .addOption(contractSourceFilenameOption)
  .option('--contractBytecode [contractBytecode]', 'Contract bytecode file name')
  .addOption(contractAciFilenameOption)
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .option('-W, --no-waitMined', 'Force waiting until transaction will be mined')
  .option('-P, --password [password]', 'Wallet Password')
  .addOption(gasOption)
  .option('-G --gasPrice [gas]', 'Amount of gas to deploy the contract', MIN_GAS_PRICE)
  .addOption(feeOption)
  .option('-T, --ttl [ttl]', 'Validity of the spend transaction in number of blocks (default forever)', TX_TTL)
  .option('-N, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .description('Deploy a contract on the chain')
  .action((walletPath, args, ...otherArgs) => Contract.deploy(walletPath, args, getCmdFromArguments(otherArgs)));

export default program;
