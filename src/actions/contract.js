// # æternity CLI `contract` file
//
// This script initialize all `contract` function
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

import fs from 'fs';
import path from 'path';
import { TxBuilderHelper } from '@aeternity/aepp-sdk';
import { initSdk, initSdkByWalletFile } from '../utils/cli';
import { print, printTransaction, printUnderscored } from '../utils/print';

const resolve = (filename) => path.resolve(process.cwd(), filename);
const readFile = (filename, encoding = 'utf-8') => fs.readFileSync(resolve(filename), encoding);

// ## Function which compile your `source` code
export async function compile(filename, options) {
  const sdk = await initSdk(options);
  const { bytecode } = await sdk.compilerApi.compileContract({ code: readFile(filename) });
  if (options.json) print({ bytecode });
  else print(`Contract bytecode: ${bytecode}`);
}

function getContractParams({
  descrPath, contractAddress, contractSource, contractBytecode, contractAci,
}, { dummySource } = {}) {
  if (descrPath && fs.existsSync(resolve(descrPath))) {
    const { address, ...other } = JSON.parse(readFile(descrPath));
    return { contractAddress: address, ...other };
  }
  return {
    contractAddress,
    // TODO: either remove calldata methods in cli or reconsider getContractInstance requirements
    source: (contractSource && readFile(contractSource)) ?? (dummySource && 'invalid-source'),
    bytecode: contractBytecode && TxBuilderHelper.encode(readFile(contractBytecode, null), 'cb'),
    aci: contractAci && JSON.parse(readFile(contractAci)),
  };
}

export async function encodeCalldata(fn, args, options) {
  const sdk = await initSdk(options);
  const contract = await sdk.getContractInstance(getContractParams(options, { dummySource: true }));
  // eslint-disable-next-line no-underscore-dangle
  const calldata = contract.calldata.encode(contract._name, fn, args);
  if (options.json) print({ calldata });
  else print(`Contract encoded calldata: ${calldata}`);
}

export async function decodeCallResult(fn, calldata, options) {
  const sdk = await initSdk(options);
  const contract = await sdk.getContractInstance(getContractParams(options, { dummySource: true }));
  // eslint-disable-next-line no-underscore-dangle
  const decoded = contract.calldata.decode(contract._name, fn, calldata);
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
  const descriptor = getContractParams(options);
  const contract = await sdk.getContractInstance(descriptor);
  const result = await contract.deploy(args, options);
  Object.assign(descriptor, {
    address: result.address,
    bytecode: contract.bytecode,
  });
  const filename = options.contractSource ?? options.contractBytecode;
  options.descrPath ||= path
    .resolve(process.cwd(), `${filename}.deploy.${result.address.slice(3)}.json`);
  fs.writeFileSync(options.descrPath, JSON.stringify(descriptor, undefined, 2));
  if (options.json) print({ ...result, descrPath: options.descrPath });
  else {
    print('Contract was successfully deployed');
    printUnderscored('Contract address', result.address);
    printUnderscored('Transaction hash', result.transaction);
    printUnderscored('Deploy descriptor', options.descrPath);
  }
}

// ## Function which `call` contract
export async function call(walletPath, fn, args, options) {
  const {
    callStatic, json, top, ttl, gas, nonce,
  } = options;
  const sdk = await initSdkByWalletFile(walletPath, options);
  const contract = await sdk.getContractInstance(getContractParams(options));
  const callResult = await contract.call(fn, args, {
    ttl: parseInt(ttl),
    gas: parseInt(gas),
    nonce: parseInt(nonce),
    callStatic,
    top,
  });
  if (json) print(callResult);
  else {
    if (callResult.hash) printTransaction(await sdk.tx(callResult.hash), json);
    print('----------------------Call info-----------------------');
    printUnderscored('Contract address', contract.deployInfo.address);
    printUnderscored('Gas price', callResult.result?.gasPrice);
    printUnderscored('Gas used', callResult.result?.gasUsed);
    printUnderscored('Return value (encoded)', callResult.result?.returnValue);
    printUnderscored('Return value (decoded)', callResult.decodedResult);
  }
}
