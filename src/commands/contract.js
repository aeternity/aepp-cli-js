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
  amountOption,
} from '../arguments.js';
import { addExamples, exampleContract } from '../utils/helpers.js';

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

const descriptorPathOption = new Option('-d, --descrPath [descrPath]', 'Path to contract descriptor file');
// TODO: remove "contract" prefix because it is clear in context
const contractSourceFilenameOption = new Option('--contractSource [contractSource]', 'Contract source code file name');
const contractAciFilenameOption = new Option('--contractAci [contractAci]', 'Contract ACI file name');

const program = new Command('contract').summary('contract interactions');

const exampleContractPath = './contract.aes';
const exampleContractDescriptorPath = './contract.aes.deploy.229e.json';
const exampleContractAciPath = './contract.json';
const exampleCalldata = 'cb_DA6sWJo=';
const exampleFunction = 'sum';
const exampleArgs = '\'[1, 2]\'';

const addCompilerOptions = (cmd, examples) => {
  cmd.addOption(compilerOption).addOption(forceOption).addOption(jsonOption);
  if (!cmd.description()) {
    const summary = cmd.summary();
    cmd.description(`${summary[0].toUpperCase()}${summary.slice(1)}.`);
  }
  addExamples(cmd, examples);
};

let command = program.command('compile <file>')
  .summary('compile a contract to get bytecode')
  .action(Contract.compile);
addCompilerOptions(command, [exampleContractPath]);

command = program.command('encode-calldata <fn>')
  .addArgument(callArgs)
  .addOption(descriptorPathOption)
  .addOption(contractSourceFilenameOption)
  .addOption(contractAciFilenameOption)
  .summary('encode calldata for contract call')
  .action(Contract.encodeCalldata);
addCompilerOptions(command, [
  `--descrPath ${exampleContractDescriptorPath} ${exampleFunction} ${exampleArgs}`,
  `--contractSource ${exampleContractPath} ${exampleFunction} ${exampleArgs}`,
  `--contractAci ${exampleContractAciPath} ${exampleFunction} ${exampleArgs}`,
]);

command = program
  .command('decode-call-result <fn> <encoded_result>')
  .addOption(descriptorPathOption)
  .addOption(contractSourceFilenameOption)
  .addOption(contractAciFilenameOption)
  .summary('decode contract call result')
  .action(Contract.decodeCallResult);
addCompilerOptions(command, [
  `--descrPath ${exampleContractDescriptorPath} test ${exampleCalldata}`,
  `--contractSource ${exampleContractPath} test ${exampleCalldata}`,
  `--contractAci ${exampleContractAciPath} test ${exampleCalldata}`,
]);

const addCommonOptions = (cmd, examples) => {
  cmd
    .addOption(descriptorPathOption)
    .addOption(contractSourceFilenameOption)
    .addOption(contractAciFilenameOption)
    .addOption(nodeOption)
    .addOption(passwordOption)
    .addOption(gasOption)
    .addOption(gasPriceOption(true))
    .option('-N, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
    .addOption(amountOption)
    .addOption(feeOption)
    .addOption(ttlOption(true));
  addCompilerOptions(cmd, examples);
};

command = program.command('call')
  .argument('<fn>', 'Name of contract entrypoint to call')
  .addArgument(callArgs)
  .argument('[wallet_path]', 'Path to secret storage file, not needed to make a static call')
  .option('--contractAddress [contractAddress]', 'Contract address to call')
  .option('-s, --callStatic', 'estimate the return value, without making a transaction on chain')
  .addOption(
    new Option('-t, --topHash', 'Hash of block to make call').implies({ callStatic: true }),
  )
  .summary('execute a function of the contract')
  .action(Contract.call);
addCommonOptions(command, [
  `./wallet.json ${exampleFunction} ${exampleArgs} --descrPath ${exampleContractDescriptorPath}`,
  `./wallet.json ${exampleFunction} ${exampleArgs} --contractAddress ${exampleContract} --callStatic`,
  `./wallet.json ${exampleFunction} ${exampleArgs} --descrPath ${exampleContractDescriptorPath} --gas 2222222 --nonce 4 --ttl 1243`,
]);

command = program.command('deploy <wallet_path>')
  .addArgument(callArgs)
  .option('--contractBytecode [contractBytecode]', 'Contract bytecode file name')
  .summary('deploy a contract on the chain')
  .description([
    'Deploy a contract on the chain and create a deployment descriptor with the contract',
    'information that can be used to invoke the contract later on.',
    'The generated descriptor will be made in the same folder of the contract source file or',
    'at the location provided in `descrPath`.',
    'Multiple deploys of the same contract file will generate different deploy descriptors.',
  ].join(' '))
  .action(Contract.deploy);
addCommonOptions(command, [
  `./wallet.json --contractSource ${exampleContractPath} ${exampleArgs}`,
  `./wallet.json --descrPath ${exampleContractDescriptorPath} --gas 2222222`,
  `./wallet.json --contractBytecode ./contract.txt --contractAci ${exampleContractAciPath}`,
]);

export default program;
