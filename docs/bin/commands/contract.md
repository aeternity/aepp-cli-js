





  

```js
#!/usr/bin/env node

```







# æternity CLI `contract` file

This script initialize all `contract` function


  

```js
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

import { prepareCallParams, readFile, writeFile } from '../utils/helpers'
import { initClientByWalletFile, initCompiler } from '../utils/cli'
import { handleApiError } from '../utils/errors'
import { printError, print, logContractDescriptor, printTransaction, printUnderscored } from '../utils/print'
import { GAS_PRICE } from '../utils/constant'


```







## Function which compile your `source` code


  

```js
export async function compile (file, options) {
  try {
    const code = readFile(path.resolve(process.cwd(), file), 'utf-8')
    if (!code) throw new Error('Contract file not found')

    const client = await initCompiler(options)

    await handleApiError(async () => {

```







Call `node` API which return `compiled code`


  

```js
      const contract = await client.compileContractAPI(code)
      print(`Contract bytecode:
      ${contract}`)
    })
  } catch (e) {
    printError(e.message)
  }
}


```







## Function which compile your `source` code


  

```js
export async function encodeData (source, fn, args = [], options) {
  try {
    const sourceCode = readFile(path.resolve(process.cwd(), source), 'utf-8')
    if (!sourceCode) throw new Error('Contract file not found')

    const client = await initCompiler(options)

    await handleApiError(async () => {

```







Call `node` API which return `compiled code`


  

```js
      const callData = await client.contractEncodeCallDataAPI(sourceCode, fn, args, options)
      if (options.json) {
        print(JSON.stringify({ callData }))
      } else {
        print(`Contract encoded call data: ${callData}`)
      }
    })
  } catch (e) {
    printError(e.message)
  }
}


```







## Function which compile your `source` code


  

```js
export async function decodeData (data, type, options) {
  try {
    const client = await initCompiler(options)

    await handleApiError(async () => {

```







Call `node` API which return `compiled code`


  

```js
      const decodedData = await client.contractDecodeDataAPI(type, data)
      if (options.json) {
        print(JSON.stringify({ decodedData }))
      } else {
        print(`Contract bytecode:`)
        print(decodedData)
      }
    })
  } catch (e) {
    printError(e.message)
  }
}


```







## Function which compile your `source` code


  

```js
export async function decodeCallData (data, options) {
  const { sourcePath, code, fn } = options
  let sourceCode

  if (!sourcePath && !code) throw new Error('Contract source(--sourcePath) or contract code(--code) required!')
  if (sourcePath) {
    if (!fn) throw new Error('Function name required in decoding by source!')
    sourceCode = readFile(path.resolve(process.cwd(), sourcePath), 'utf-8')
    if (!sourceCode) throw new Error('Contract file not found')
  } else {
    if (code.slice(0, 2) !== 'cb') throw new Error('Code must be like "cb_23dasdafgasffg...." ')
  }

  try {
    const client = await initCompiler(options)

    await handleApiError(async () => {

```







Call `node` API which return `compiled code`


  

```js
      const decoded = code
        ? await client.contractDecodeCallDataByCodeAPI(code, data)
        : await client.contractDecodeCallDataBySourceAPI(sourceCode, fn, data)

      if (options.json) {
        print(JSON.stringify({ decoded }))
      } else {
        print(`Decoded Call Data:`)
        print(decoded)
      }
    })
  } catch (e) {
    printError(e.message)
  }
}


```







## Function which `deploy ` contract


  

```js
async function deploy (walletPath, contractPath, init = [], options) {
  const { json, gas } = options
  const ttl = parseInt(options.ttl)
  const nonce = parseInt(options.nonce)


```







Deploy a contract to the chain and create a deploy descriptor
with the contract informations that can be use to invoke the contract
later on.
  The generated descriptor will be created in the same folde of the contract
source file. Multiple deploy of the same contract file will generate different
deploy descriptor


  

```js
  try {

```







Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`


  

```js
    const client = await initClientByWalletFile(walletPath, options)
    const contractFile = readFile(path.resolve(process.cwd(), contractPath), 'utf-8')

    await handleApiError(
      async () => {

```







`contractCompile` takes a raw Sophia contract in string form and sends it
off to the node for bytecode compilation. This might in the future be done
without talking to the node, but requires a bytecode compiler
implementation directly in the SDK.


  

```js
        const contract = await client.getContractInstance(contractFile)

```







Invoking `deploy` on the bytecode object will result in the contract
being written to the chain, once the block has been mined.
Sophia contracts always have an `init` method which needs to be invoked,
even when the contract's `state` is `unit` (`()`). The arguments to
`init` have to be provided at deployment time and will be written to the
block as well, together with the contract's bytecode.


  

```js
        const deployDescriptor = await contract.deploy([...init], { ttl, gas, nonce, gasPrice: GAS_PRICE })

```







Write contractDescriptor to file


  

```js
        const descPath = `${R.last(contractPath.split('/'))}.deploy.${deployDescriptor.deployInfo.owner.slice(3)}.json`
        const contractDescriptor = R.merge({
          descPath,
          source: contractFile,
          bytecode: contract.compiled,
          abi: 'sophia'
        }, deployDescriptor.deployInfo)

        writeFile(
          descPath,
          JSON.stringify(contractDescriptor)
        )


```







Log contract descriptor


  

```js
        logContractDescriptor(contractDescriptor, 'Contract was successfully deployed', json)
      }
    )
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}


```







## Function which `call` contract


  

```js
async function call (walletPath, fn, returnType, args, options) {
  const { callStatic, json, top } = options
  if (!fn || !returnType) {
    program.outputHelp()
    process.exit(1)
  }
  try {

```







If callStatic init `Chain` stamp else get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`


  

```js
    const client = await initClientByWalletFile(walletPath, options)
    const params = await prepareCallParams(fn, options)

    await handleApiError(
      async () => {

```







Call static or call


  

```js
        const contract = await client.getContractInstance(params.source, { contractAddress: params.address })
        const callResult = await contract.call(fn, args, { ...params.options, callStatic, top })

```







The execution result, if successful, will be an AEVM-encoded result
value. Once type decoding will be implemented in the SDK, this value will
not be a hexadecimal string, anymore.


  

```js
        if (callResult && callResult.hash) printTransaction(await client.tx(callResult.hash), json)
        print('----------------------Transaction info-----------------------')
        printUnderscored('Contract address', params.address)
        printUnderscored('Gas price', R.path(['result', 'gasPrice'])(callResult))
        printUnderscored('Gas used', R.path(['result', 'gasUsed'])(callResult))
        printUnderscored('Return value (encoded)', R.path(['result', 'returnValue'])(callResult))

```







Decode result


  

```js
        console.log(callResult)
        const decoded = await callResult.decode()
        printUnderscored('Return value (decoded)', decoded)
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
  encodeData,
  decodeData,
  decodeCallData
}


```




