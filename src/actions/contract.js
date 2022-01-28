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

import path from 'path'
import { initClientByWalletFile, initCompiler } from '../utils/cli'
import { prepareCallParams, readFile, writeFile } from '../utils/helpers'
import { logContractDescriptor, print, printTransaction, printUnderscored } from '../utils/print'

// ## Function which compile your `source` code
export async function compile (file, options) {
  const { backend, json } = options
  const code = readFile(path.resolve(process.cwd(), file), 'utf-8')
  if (!code) throw new Error('Contract file not found')

  const client = await initCompiler(options)

  // Call `node` API which return `compiled code`
  const contract = await client.compileContractAPI(code, { backend })
  if (json) {
    print({ bytecode: contract })
  } else {
    print(`Contract bytecode: ${contract}`)
  }
}

// ## Function which compile your `source` code
export async function encodeData (source, fn, args = [], options) {
  const { backend } = options
  const sourceCode = readFile(path.resolve(process.cwd(), source), 'utf-8')
  if (!sourceCode) throw new Error('Contract file not found')

  const client = await initCompiler(options)

  // Call `node` API which return `compiled code`
  const callData = await client.contractEncodeCallDataAPI(sourceCode, fn, args, { backend })
  if (options.json) {
    print(JSON.stringify({ callData }))
  } else {
    print(`Contract encoded call data: ${callData}`)
  }
}

// ## Function which compile your `source` code
export async function decodeCallData (data, options) {
  const { sourcePath, code, fn, backend } = options
  let sourceCode

  if (!sourcePath && !code) throw new Error('Contract source(--sourcePath) or contract code(--code) required!')
  if (sourcePath) {
    if (!fn) throw new Error('Function name required in decoding by source!')
    sourceCode = readFile(path.resolve(process.cwd(), sourcePath), 'utf-8')
    if (!sourceCode) throw new Error('Contract file not found')
  } else {
    if (code.slice(0, 2) !== 'cb') throw new Error('Code must be like "cb_23dasdafgasffg...." ')
  }

  const client = await initCompiler(options)

  // Call `node` API which return `compiled code`
  const decoded = code
    ? await client.contractDecodeCallDataByCodeAPI(code, data, backend)
    : await client.contractDecodeCallDataBySourceAPI(sourceCode, fn, data, { backend })

  if (options.json) {
    print(JSON.stringify({ decoded }))
  } else {
    print('Decoded Call Data:')
    print(decoded)
  }
}

// ## Function which `deploy ` contract
export async function deploy (walletPath, contractPath, callData = '', options) {
  const { json, gas, gasPrice, ttl, nonce, fee } = options
  // Deploy a contract to the chain and create a deploy descriptor
  // with the contract informations that can be use to invoke the contract
  // later on.
  //   The generated descriptor will be created in the same folde of the contract
  // source file. Multiple deploy of the same contract file will generate different
  // deploy descriptor
  if (callData.split('_')[0] !== 'cb') throw new Error('"callData" should be a string with "cb" prefix')
  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const client = await initClientByWalletFile(walletPath, options)
  const contractFile = readFile(path.resolve(process.cwd(), contractPath), 'utf-8')

  const ownerId = await client.address()
  const { bytecode: code } = await client.contractCompile(contractFile)
  const opt = { ...client.Ae.defaults, gas, gasPrice, ttl, nonce, fee }

  // Prepare contract create transaction
  const { tx, contractId } = await client.contractCreateTx({
    ...opt,
    callData,
    code,
    ownerId
  })
  // Broadcast transaction
  const { hash } = await client.send(tx, opt)
  const result = await client.getTxInfo(hash)

  if (result.returnType === 'ok') {
    const deployDescriptor = Object.freeze({
      result,
      owner: ownerId,
      transaction: hash,
      address: contractId,
      createdAt: new Date()
    })
    // Prepare contract descriptor
    const descPath = `${contractPath.split('/').pop()}.deploy.${ownerId.slice(3)}.json`
    const contractDescriptor = {
      descPath,
      source: contractFile,
      bytecode: code,
      ...deployDescriptor
    }
    // Write to file
    writeFile(
      descPath,
      JSON.stringify(contractDescriptor)
    )
    // Log contract descriptor
    json
      ? print({ descPath, ...deployDescriptor })
      : logContractDescriptor(contractDescriptor, 'Contract was successfully deployed', json)
  } else {
    await this.handleCallError(result)
  }
}

// ## Function which `call` contract
export async function call (walletPath, fn, args, options) {
  const { callStatic, json, top } = options
  // If callStatic init `Chain` stamp else get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const client = await initClientByWalletFile(walletPath, options)
  const params = await prepareCallParams(fn, options)

  // Call static or call
  const contract = await client.getContractInstance({
    source: params.source, contractAddress: params.address
  })
  const callResult = await contract.call(fn, args, { ...params.options, callStatic, top })
  // The execution result, if successful, will be an FATE-encoded result
  // value. Once type decoding will be implemented in the SDK, this value will
  // not be a hexadecimal string, anymore.
  json && print(callResult)
  if (!json) {
    if (callResult && callResult.hash) printTransaction(await client.tx(callResult.hash), json)
    print('----------------------Transaction info-----------------------')
    printUnderscored('Contract address', params.address)
    printUnderscored('Gas price', callResult?.result?.gasPrice)
    printUnderscored('Gas used', callResult?.result?.gasUsed)
    printUnderscored('Return value (encoded)', callResult?.result?.returnValue)
    // Decode result
    const decoded = await callResult.decode()
    printUnderscored('Return value (decoded)', decoded)
  }
}
