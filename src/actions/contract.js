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
import { initClient, initClientByWalletFile } from '../utils/cli';
import { print, printTransaction, printUnderscored } from '../utils/print';

const readFile = (filename) => fs.readFileSync(path.resolve(process.cwd(), filename), 'utf-8');

// ## Function which compile your `source` code
export async function compile(filename, options) {
  const sdk = await initClient(options);
  const bytecode = await sdk.compileContractAPI(readFile(filename));
  if (options.json) print({ bytecode });
  else print(`Contract bytecode: ${bytecode}`);
}

function getContractParams({
  descrPath, contractAddress, contractSource, contractAci,
}, { dummySource } = {}) {
  if (descrPath) {
    const { address, ...other } = JSON.parse(readFile(descrPath));
    return { contractAddress: address, ...other };
  }
  return {
    contractAddress,
    // TODO: either remove calldata methods in cli or reconsider getContractInstance requirements
    source: (contractSource && readFile(contractSource)) ?? (dummySource && 'invalid-source'),
    aci: contractAci && JSON.parse(readFile(contractAci)),
  };
}

export async function encodeCalldata(fn, args, options) {
  const sdk = await initClient(options);
  const contract = await sdk.getContractInstance(getContractParams(options, { dummySource: true }));
  const calldata = contract.calldata.encode(contract.aci.name, fn, args);
  if (options.json) print({ calldata });
  else print(`Contract encoded calldata: ${calldata}`);
}

export async function decodeCallResult(fn, calldata, options) {
  const sdk = await initClient(options);
  const contract = await sdk.getContractInstance(getContractParams(options, { dummySource: true }));
  const decoded = contract.calldata.decode(contract.aci.name, fn, calldata);
  if (options.json) print({ decoded });
  else {
    print('Contract decoded call result:');
    print(decoded);
  }
}

// ## Function which `deploy ` contract
export async function deploy(walletPath, contractPath, callData = '', options) {
  const {
    json, gas, gasPrice, ttl, nonce, fee,
  } = options;
  // Deploy a contract to the chain and create a deploy descriptor
  // with the contract informations that can be use to invoke the contract
  // later on.
  //   The generated descriptor will be created in the same folde of the contract
  // source file. Multiple deploy of the same contract file will generate different
  // deploy descriptor
  if (callData.split('_')[0] !== 'cb') throw new Error('"callData" should be a string with "cb" prefix');
  const sdk = await initClientByWalletFile(walletPath, options);
  const contractFile = readFile(contractPath);

  const ownerId = await sdk.address();
  const { bytecode: code } = await sdk.contractCompile(contractFile);
  const opt = {
    ...sdk.Ae.defaults, gas, gasPrice, ttl, nonce, fee,
  };

  // Prepare contract create transaction
  const { tx, contractId } = await sdk.contractCreateTx({
    ...opt,
    callData,
    code,
    ownerId,
  });
  // Broadcast transaction
  const { hash } = await sdk.send(tx, opt);
  const result = await sdk.getTxInfo(hash);

  if (result.returnType === 'ok') {
    const deployDescriptor = Object.freeze({
      result,
      owner: ownerId,
      transaction: hash,
      address: contractId,
      createdAt: new Date(),
    });
    // Prepare contract descriptor
    const descPath = `${contractPath.split('/').pop()}.deploy.${ownerId.slice(3)}.json`;
    const descriptor = {
      descPath,
      source: contractFile,
      bytecode: code,
      ...deployDescriptor,
    };
    fs.writeFileSync(descPath, JSON.stringify(descriptor));
    if (json) print({ descPath, ...deployDescriptor });
    else {
      print('Contract was successfully deployed');
      printUnderscored('Contract address', descriptor.address);
      printUnderscored('Transaction hash', descriptor.transaction);
      printUnderscored('Deploy descriptor', descriptor.descPath);
    }
  } else {
    await this.handleCallError(result);
  }
}

// ## Function which `call` contract
export async function call(walletPath, fn, args, options) {
  const {
    callStatic, json, top, ttl, gas, nonce,
  } = options;
  const sdk = await initClientByWalletFile(walletPath, options);
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
