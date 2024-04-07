// # æternity CLI `contract` file
//
// This script initialize all `contract` function

import fs from 'fs-extra';
import { encode } from '@aeternity/aepp-sdk';
import { initSdk, initSdkByWalletFile } from '../utils/cli.js';
import { print, printTransaction, printUnderscored } from '../utils/print.js';
import CliError from '../utils/CliError.js';
import { getFullPath } from '../utils/helpers.js';

const DESCRIPTOR_VERSION = 1;

async function getContractParams({
  descrPath, contractAddress, contractSource, contractBytecode, contractAci,
}, { dummyBytecode, descrMayNotExist } = {}) {
  let descriptor = {};
  if (descrPath && (!descrMayNotExist || await fs.exists(getFullPath(descrPath)))) {
    descriptor = await fs.readJson(getFullPath(descrPath));
    if (descriptor.version !== DESCRIPTOR_VERSION) {
      throw new CliError(`Unsupported contract descriptor: version ${descriptor.version}, supported ${DESCRIPTOR_VERSION}`);
    }
  }
  const { address, version, ...other } = descriptor;
  return {
    address: contractAddress ?? address,
    // TODO: either remove calldata methods in cli or reconsider initializeContract requirements
    ...dummyBytecode && { bytecode: 'cb_invalid-bytecode' },
    ...other,
    ...contractSource && { sourceCodePath: contractSource },
    ...contractBytecode && {
      bytecode: encode(await fs.readFile(getFullPath(contractBytecode)), 'cb'),
    },
    ...contractAci && { aci: await fs.readJson(getFullPath(contractAci)) },
  };
}

// ## Function which compile your `source` code
export async function compile(contractSource, options) {
  const sdk = initSdk(options);
  const contract = await sdk.initializeContract({ sourceCodePath: contractSource });
  const bytecode = await contract.$compile();
  if (options.json) print({ bytecode });
  else print(`Contract bytecode: ${bytecode}`);
}

export async function encodeCalldata(fn, args, options) {
  const sdk = initSdk(options);
  const contract = await sdk.initializeContract(await getContractParams(options, { dummyBytecode: true }));
  // eslint-disable-next-line no-underscore-dangle
  const calldata = contract._calldata.encode(contract._name, fn, args);
  if (options.json) print({ calldata });
  else print(`Contract encoded calldata: ${calldata}`);
}

export async function decodeCallResult(fn, calldata, options) {
  const sdk = initSdk(options);
  const contract = await sdk.initializeContract(await getContractParams(options, { dummyBytecode: true }));
  // eslint-disable-next-line no-underscore-dangle
  const decoded = contract._calldata.decode(contract._name, fn, calldata);
  if (options.json) print({ decoded });
  else {
    print('Contract decoded call result:');
    print(decoded);
  }
}

// ## Function which `deploy` contract
export async function deploy(walletPath, args, options) {
  // Deploy a contract to the chain and create a deployment descriptor
  // with the contract information that can be used to invoke the contract
  // later on. The generated descriptor will be created in the same folder of the contract
  // source file or at location provided in descrPath. Multiple deploy of the same contract
  // file will generate different deploy descriptors.
  const sdk = await initSdkByWalletFile(walletPath, options);
  const contract = await sdk.initializeContract(await getContractParams(options, { descrMayNotExist: true }));
  const result = await contract.$deploy(args, options);
  const filename = options.contractSource ?? options.contractBytecode;
  options.descrPath ??= getFullPath(`${filename}.deploy.${result.address.slice(3)}.json`);
  const descriptor = {
    version: DESCRIPTOR_VERSION,
    address: result.address,
    bytecode: contract.$options.bytecode,
    // eslint-disable-next-line no-underscore-dangle
    aci: contract._aci,
  };
  await fs.outputJson(options.descrPath, descriptor);
  if (options.json) print({ ...result, descrPath: options.descrPath });
  else {
    print('Contract was successfully deployed');
    printUnderscored('Contract address', result.address);
    printUnderscored('Transaction hash', result.transaction);
    printUnderscored('Deploy descriptor', options.descrPath);
  }
}

// ## Function which `call` contract
export async function call(fn, args, walletPath, options) {
  const {
    callStatic, json, top, ttl, gas, nonce,
  } = options;
  if (callStatic !== true && walletPath == null) {
    throw new CliError('wallet_path is required for on-chain calls');
  }
  const sdk = await initSdkByWalletFile(walletPath, options);
  const contract = await sdk.initializeContract(await getContractParams(options));
  const callResult = await contract.$call(fn, args, {
    ttl: ttl && +ttl,
    gas,
    nonce: nonce && +nonce,
    callStatic,
    top,
  });
  if (json) print(callResult);
  else {
    if (callResult.hash) printTransaction(await sdk.api.getTransactionByHash(callResult.hash), json);
    print('----------------------Call info-----------------------');
    printUnderscored('Contract address', contract.$options.address);
    printUnderscored('Gas price', callResult.result?.gasPrice);
    printUnderscored('Gas used', callResult.result?.gasUsed);
    printUnderscored('Return value (encoded)', callResult.result?.returnValue);
    printUnderscored('Return value (decoded)', callResult.decodedResult);
  }
}
