#!/usr/bin/env node
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

import * as R from 'ramda'
import path from 'path'

import { grabDesc, readFile, writeFile } from '../utils/helpers'
import { initChain, initClientByWalletFile} from '../utils/cli'
import { handleApiError } from '../utils/errors'
import {printError, print, logContractDescriptor, printTransaction, printUnderscored} from '../utils/print'

// ## Function which compile your `source` code
export async function compile (file, options) {
  try {
    const code = readFile(path.resolve(process.cwd(), file), 'utf-8')
    if (!code) throw new Error('Contract file not found')

    const client = await initChain(options)

    await handleApiError(async () => {
      // Call `Epoch` API which return `compiled code`
      const contract = await client.compileEpochContract(code)
      print(`Contract bytecode:
      ${contract.bytecode}`)
    })
  } catch (e) {
    printError(e.message)
  }
}

// ## Function which `deploy ` contract
async function deploy (walletPath, contractPath, options) {
  const { init, json, gas } = options
  const ttl = parseInt(options.ttl)
  const nonce = parseInt(options.nonce)

  // Deploy a contract to the chain and create a deploy descriptor
  // with the contract informations that can be use to invoke the contract
  // later on.
  //   The generated descriptor will be created in the same folde of the contract
  // source file. Multiple deploy of the same contract file will generate different
  // deploy descriptor
  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const client = await initClientByWalletFile(walletPath, options)
    const contractFile = readFile(path.resolve(process.cwd(), contractPath), 'utf-8')

    await handleApiError(
      async () => {
        // `contractCompile` takes a raw Sophia contract in string form and sends it
        // off to the node for bytecode compilation. This might in the future be done
        // without talking to the node, but requires a bytecode compiler
        // implementation directly in the SDK.
        const contract = await client.contractCompile(contractFile, { gas })
        // Invoking `deploy` on the bytecode object will result in the contract
        // being written to the chain, once the block has been mined.
        // Sophia contracts always have an `init` method which needs to be invoked,
        // even when the contract's `state` is `unit` (`()`). The arguments to
        // `init` have to be provided at deployment time and will be written to the
        // block as well, together with the contract's bytecode.
        const deployDescriptor = await contract.deploy({ initState: init, options: { ttl, gas, nonce } })

        // Write contractDescriptor to file
        const descPath = `${R.last(contractPath.split('/'))}.deploy.${deployDescriptor.owner.slice(3)}.json`
        const contractDescriptor = R.merge({
          descPath,
          source: contractFile,
          bytecode: contract.bytecode,
          abi: 'sophia'
        }, deployDescriptor)

        writeFile(
          descPath,
          JSON.stringify(contractDescriptor)
        )

        // Log contract descriptor
        logContractDescriptor(contractDescriptor, 'Contract was successfully deployed', json)
      }
    )
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

const prepareCallParams = async (name, { descrPath,  contractAddress, gas, ttl, nonce }) => {
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)
  gas = parseInt(gas)

  if (!descrPath && !contractAddress) throw new Error('contract-descriptor or contract-address requires')

  if (contractAddress) {
    return {
      code: contractAddress,
      address: contractAddress,
      abi: 'sophia-address',
      name,
      options: { options: { ttl, gas, nonce }}
    }
  }

  const descr = await grabDesc(descrPath)
  if (!descr) throw new Error('Descriptor file not found')

  return {
    code: descr.bytecode,
    abi: descr.abi,
    name: name,
    address: descr.address,
    options: { options: { ttl, nonce, gas } }
  }
}

// ## Function which `call` contract
async function call (walletPath, fn, returnType, args, options) {
  const { callStatic, json } = options
  if (!fn || !returnType) {
    program.outputHelp()
    process.exit(1)
  }
  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const client = await initClientByWalletFile(walletPath, options)
    const params = await prepareCallParams(fn, options)

    // Prepare args
    args = args.filter(arg => arg !== '[object Object]')
    args = args.length ? `(${args.join(',')})` : '()'

    await handleApiError(
      async () => {
        // Call static or call
        const callResult = callStatic ?
          await client.contractCallStatic(params.address, 'sophia-address', params.name, { ...params.options, args }) :
          await client.contractCall(params.code, params.abi, params.address, params.name, { ...params.options, args })
        // The execution result, if successful, will be an AEVM-encoded result
        // value. Once type decoding will be implemented in the SDK, this value will
        // not be a hexadecimal string, anymore.
        if (callResult) printTransaction(await client.tx(callResult.hash), json)
        print('----------------------Transaction info-----------------------')
        printUnderscored('Contract address', params.address)
        printUnderscored('Gas price', R.path(['result', 'gasPrice'])(callResult))
        printUnderscored('Gas used', R.path(['result', 'gasUsed'])(callResult))
        printUnderscored('Return value (encoded)', R.path(['result', 'returnValue'])(callResult))
        // Decode result
        const { type, value } = await callResult.decode(returnType)
        printUnderscored('Return value (decoded)', value)
        printUnderscored('Return remote type', type)
      }
    )
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Function which `call` contract
async function callTypeChecked (walletPath, fn, returnType, callContract, options) {
  const { callStatic } = options
  if (!fn || !returnType) {
    program.outputHelp()
    process.exit(1)
  }
  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const client = await initClientByWalletFile(walletPath, options)
    const params = await prepareCallParams(fn, R.merge(options, { callContract }))
    const call = readFile(path.resolve(process.cwd(), callContract), 'utf-8')

    await handleApiError(
      async () => {
        // Call static or call
        const callResult = callStatic ?
          await client.contractCallStatic(params.address, 'sophia-address', params.name, { ...params.options, call }) :
          await client.contractCall(params.code, params.abi, params.address, params.name, { ...params.options, call })
        // The execution result, if successful, will be an AEVM-encoded result
        // value. Once type decoding will be implemented in the SDK, this value will
        // not be a hexadecimal string, anymore.
        print('Contract address_________ ' + params.address)
        print('Gas price________________ ' + R.path(['result', 'gasPrice'])(callResult))
        print('Gas used_________________ ' + R.path(['result', 'gasUsed'])(callResult))
        print('Return value (encoded)___ ' + R.path(['result', 'returnValue'])(callResult))
        // Decode result
        const { type, value } = await callResult.decode(returnType)
        print('Return value (decoded)___ ' + value)
        print('Return remote type_______ ' + type)
      }
    )
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

export const Contract = {
  compile,
  deploy,
  call,
  callTypeChecked
}
