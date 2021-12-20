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
import { readJSONFile, readFile } from '../utils/helpers';
import {
  logContractDescriptor, print, printTransaction, printUnderscored,
} from '../utils/print';

// ## Function which compile your `source` code
export async function compile(file, options) {
  const { json } = options;
  const code = readFile(path.resolve(process.cwd(), file), 'utf-8');
  if (!code) throw new Error('Contract file not found');

  const sdk = await initClient(options);

  // Call `node` API which return `compiled code`
  const contract = await sdk.compileContractAPI(code);
  if (json) {
    print({ bytecode: contract });
  } else {
    print(`Contract bytecode: ${contract}`);
  }
}

function getContractParams({ descrPath, contractAddress, contractSource }) {
  if (contractAddress && contractSource) {
    const source = readFile(path.resolve(process.cwd(), contractSource), 'utf-8');
    return { source, contractAddress };
  }
  if (descrPath) {
    const { source, address } = readJSONFile(path.resolve(process.cwd(), descrPath));
    return { source, contractAddress: address };
  }
  throw new Error('--descrPath or --contractAddress and --contractSource requires');
}

// ## Function which compile your `source` code
export async function encodeData(source, fn, args = [], options) {
  const sourceCode = readFile(path.resolve(process.cwd(), source), 'utf-8');
  if (!sourceCode) throw new Error('Contract file not found');

  const sdk = await initClient(options);

  // Call `node` API which return `compiled code`
  const callData = await sdk.contractEncodeCallDataAPI(sourceCode, fn, args);
  if (options.json) {
    print(JSON.stringify({ callData }));
  } else {
    print(`Contract encoded call data: ${callData}`);
  }
}

// ## Function which compile your `source` code
export async function decodeCallData(data, options) {
  const { sourcePath, code, fn } = options;
  let sourceCode;

  if (!sourcePath && !code) throw new Error('Contract source(--sourcePath) or contract code(--code) required!');
  if (sourcePath) {
    if (!fn) throw new Error('Function name required in decoding by source!');
    sourceCode = readFile(path.resolve(process.cwd(), sourcePath), 'utf-8');
    if (!sourceCode) throw new Error('Contract file not found');
  } else if (code.slice(0, 2) !== 'cb') throw new Error('Code must be like "cb_23dasdafgasffg...." ');

  const sdk = await initClient(options);

  // Call `node` API which return `compiled code`
  const decoded = code
    ? await sdk.contractDecodeCallDataByCodeAPI(code, data)
    : await sdk.contractDecodeCallDataBySourceAPI(sourceCode, fn, data);

  if (options.json) {
    print(JSON.stringify({ decoded }));
  } else {
    print('Decoded Call Data:');
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
  const contractFile = readFile(path.resolve(process.cwd(), contractPath), 'utf-8');

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
    const contractDescriptor = {
      descPath,
      source: contractFile,
      bytecode: code,
      ...deployDescriptor,
    };
    // Write to file
    fs.writeFileSync(
      descPath,
      JSON.stringify(contractDescriptor),
    );
    // Log contract descriptor
    if (json) print({ descPath, ...deployDescriptor });
    else logContractDescriptor(contractDescriptor, 'Contract was successfully deployed', json);
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

  // Call static or call
  const contract = await sdk.getContractInstance(getContractParams(options));
  const callResult = await contract.call(fn, args, {
    ttl: parseInt(ttl),
    gas: parseInt(gas),
    nonce: parseInt(nonce),
    callStatic,
    top,
  });
  // The execution result, if successful, will be an FATE-encoded result
  // value. Once type decoding will be implemented in the SDK, this value will
  // not be a hexadecimal string, anymore.
  if (json) print(callResult);
  else {
    if (callResult && callResult.hash) printTransaction(await sdk.tx(callResult.hash), json);
    print('----------------------Transaction info-----------------------');
    printUnderscored('Contract address', contract.deployInfo.address);
    printUnderscored('Gas price', callResult?.result?.gasPrice);
    printUnderscored('Gas used', callResult?.result?.gasUsed);
    printUnderscored('Return value (encoded)', callResult?.result?.returnValue);
    // Decode result
    const decoded = await callResult.decode();
    printUnderscored('Return value (decoded)', decoded);
  }
}
