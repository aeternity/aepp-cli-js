// # æternity CLI `contract` file
//
// This script initialize all `contract` command's
// We'll use `commander` for parsing options
import { Argument, Option, Command } from 'commander';
import CliError from '../utils/CliError.js';
import * as Contract from '../actions/contract.js';
import {
  nodeOption,
  compilerOption,
  jsonOption,
  gasOption,
  gasPriceOption,
  feeOption,
  forceOption,
  passwordOption,
  ttlOption,
  networkIdOption,
} from '../arguments.js';

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

const addCommonOptions = (p) => p
  .addOption(nodeOption)
  .addOption(compilerOption)
  .addOption(forceOption)
  .addOption(jsonOption);

// ## Initialize `compile` command
//
// You can use this command to compile your `contract` to `bytecode`
//
// Example: `aecli contract compile ./mycontract.contract`
addCommonOptions(program
  .command('compile <file>')
  .description('Compile a contract')
  .action(Contract.compile));

// ## Initialize `encode-calldata` command
//
// You can use this command to prepare `callData`
//
// Example: `aecli contract encodeData ./mycontract.contract testFn 1 2`
addCommonOptions(program
  .command('encode-calldata <fn>')
  .addArgument(callArgs)
  .addOption(descriptorPathOption)
  .addOption(contractSourceFilenameOption)
  .addOption(contractAciFilenameOption)
  .description('Encode contract calldata')
  .action(Contract.encodeCalldata));

// ## Initialize `decode-calldata` command
//
// You can use this command to decode contract calldata using source or bytecode
//
// Example bytecode: `aecli contract decodeCallData cb_asdasdasd... --code cb_asdasdasdasd....`
// Example source code: `aecli contract decodeCallData cb_asdasdasd... --sourcePath ./contractSource --fn someFunction`
addCommonOptions(program
  .command('decode-call-result <fn> <data>')
  .addOption(descriptorPathOption)
  .addOption(contractSourceFilenameOption)
  .addOption(contractAciFilenameOption)
  .description('Decode contract calldata')
  .action(Contract.decodeCallResult));

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
addCommonOptions(program
  .command('call')
  .argument('<fn>', 'Name of contract entrypoint to call')
  .addArgument(callArgs)
  .argument('[wallet_path]', 'Path to secret storage file')
  .addOption(descriptorPathOption)
  .option('--contractAddress [contractAddress]', 'Contract address to call')
  .addOption(contractSourceFilenameOption)
  .addOption(contractAciFilenameOption)
  .option('-W, --no-waitMined', 'Force waiting until transaction will be mined')
  .addOption(networkIdOption)
  .addOption(passwordOption)
  .addOption(gasOption)
  .option('-s --callStatic', 'Call static')
  .option('-t --topHash', 'Hash of block to make call')
  .addOption(feeOption)
  .addOption(ttlOption)
  .option('-N, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .description('Execute a function of the contract')
  .action(Contract.call));

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
addCommonOptions(program
  .command('deploy <wallet_path>')
  .addArgument(callArgs)
  .addOption(descriptorPathOption)
  .addOption(contractSourceFilenameOption)
  .option('--contractBytecode [contractBytecode]', 'Contract bytecode file name')
  .addOption(contractAciFilenameOption)
  .addOption(networkIdOption)
  .option('-W, --no-waitMined', 'Force waiting until transaction will be mined')
  .addOption(passwordOption)
  .addOption(gasOption)
  .addOption(gasPriceOption)
  .addOption(feeOption)
  .addOption(ttlOption)
  .option('-N, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .description('Deploy a contract on the chain')
  .action(Contract.deploy));

export default program;
