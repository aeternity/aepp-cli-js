#!/usr/bin/env node
// # æternity CLI `transaction` file
//
// This script initialize all `transaction` function
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
import { encodeBase58Check, salt, assertedType } from '@aeternity/aepp-sdk/es/utils/crypto'
import { commitmentHash } from '@aeternity/aepp-sdk/es/tx/builder/helpers'
import { initChain, initOfflineTxBuilder, initTxBuilder } from '../utils/cli'
import { handleApiError } from '../utils/errors'
import { print, printError, printUnderscored, printValidation } from '../utils/print'
import { readFile, validateName } from '../utils/helpers'
import { VM_VERSION, AMOUNT, DEPOSIT, GAS_PRICE, BUILD_ORACLE_TTL } from '../utils/constant'
import { TX_TYPE } from '@aeternity/aepp-sdk/es/tx/builder/schema'

// Default transaction build param's
const DEFAULT_CONTRACT_PARAMS = { vmVersion: VM_VERSION, amount: AMOUNT, deposit: DEPOSIT, gasPrice: GAS_PRICE }

const printBuilderTransaction = ({ tx, txObject }, type) => {
  printUnderscored('Transaction type', type)
  print('Summary')
  Object
    .entries(txObject)
    .forEach(([key, value]) => printUnderscored(`    ${key.toUpperCase()}`, value))
  print('Output')
  printUnderscored('    Encoded', tx)
  print('This is an unsigned transaction. Use `account sign` and `tx broadcast` to submit the transaction to the network, or verify that it will be accepted with `tx verify`.')
}

// ## Build `spend` transaction
async function spend (senderId, recipientId, amount, nonce, options) {
  let { ttl, json, fee, payload } = options
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)
  try {
    // Initialize `Ae`
    const txBuilder = initOfflineTxBuilder()
    // Build params
    const params = {
      senderId,
      recipientId,
      amount,
      ttl,
      nonce,
      fee,
      payload
    }
    // calculate fee
    fee = txBuilder.calculateFee(fee, TX_TYPE.spend, { params })
    // Build `spend` transaction
    const tx = txBuilder.buildTx({ ...params, fee }, TX_TYPE.spend)
    // Print Result
    if (json) print({ tx: tx.tx, params: tx.txObject })
    else printBuilderTransaction(tx, TX_TYPE.spend)
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `namePreClaim` transaction
async function namePreClaim (accountId, domain, nonce, options) {
  let { ttl, json, fee } = options

  try {
    // Validate `name`(check if `name` end on `.test`)
    validateName(domain)
    // Initialize `Ae`
    const txBuilder = initOfflineTxBuilder()

    // Generate `salt` and `commitmentId` and build `name` hash
    const _salt = salt()
    const commitmentId = await commitmentHash(domain, _salt)

    const params = {
      accountId,
      commitmentId,
      ttl,
      nonce
    }
    fee = txBuilder.calculateFee(fee, TX_TYPE.namePreClaim, { params })
    // Create `preclaim` transaction
    const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.namePreClaim)

    if (json) {
      print({ tx, txObject, salt: _salt })
    } else {
      printBuilderTransaction({ tx, txObject: { ...txObject, salt: _salt } }, TX_TYPE.namePreClaim)
    }
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `nameClaim` transaction
async function nameClaim (accountId, nameSalt, domain, nonce, options) {
  let { ttl, json, fee } = options
  const nameHash = `nm_${encodeBase58Check(Buffer.from(domain))}`

  try {
    // Validate `name`(check if `name` end on `.test`)
    validateName(domain)
    // Initialize `Ae`
    const txBuilder = initOfflineTxBuilder()
    const params = {
      accountId,
      nameSalt,
      name: nameHash,
      ttl,
      nonce
    }
    fee = txBuilder.calculateFee(fee, TX_TYPE.nameClaim, { params })
    // Build `claim` transaction's
    const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.nameClaim)

    if (json) {
      print({ tx, txObject })
    } else {
      printBuilderTransaction({ tx, txObject }, TX_TYPE.nameClaim)
    }
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

function classify (s) {
  const keys = {
    ak: 'account_pubkey',
    ok: 'oracle_pubkey',
    ct: 'contract_pubkey',
  }

  if (!s.match(/^[a-z]{2}_.+/)) {
    throw Error('Not a valid hash')
  }

  const klass = s.substr(0, 2)
  if (klass in keys) {
    return keys[klass]
  } else {
    throw Error(`Unknown class ${klass}`)
  }
}

// ## Build `nameUpdate` transaction
async function nameUpdate (accountId, nameId, nonce, pointers, options) {
  let { ttl, json, fee, nameTtl, clientTtl } = options
  try {
    // Initialize `Ae`
    const txBuilder = initOfflineTxBuilder()
    // Create `update` transaction
    pointers = pointers.map(id => Object.assign({}, { id, key: classify(id) }))
    const params = {
      nameId,
      accountId,
      nameTtl,
      pointers,
      clientTtl,
      ttl,
      nonce
    }
    fee = txBuilder.calculateFee(fee, TX_TYPE.nameUpdate, { params })
    // Build `claim` transaction's
    const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.nameUpdate)

    if (json) {
      print({ tx, txObject })
    } else {
      printBuilderTransaction({ tx, txObject }, TX_TYPE.nameUpdate)
    }
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `nameTransfer` transaction
async function nameTransfer (accountId, recipientId, nameId, nonce, options) {
  let { ttl, json, fee } = options
  try {
    // Initialize `Ae`
    const txBuilder = initOfflineTxBuilder()
    // Create `transfer` transaction
    const params = {
      accountId,
      recipientId,
      nameId,
      ttl,
      nonce
    }
    fee = txBuilder.calculateFee(fee, TX_TYPE.nameTransfer, { params })
    // Build `claim` transaction's
    const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.nameTransfer)

    if (json) {
      print({ tx, txObject })
    } else {
      printBuilderTransaction({ tx, txObject }, TX_TYPE.nameTransfer)
    }
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `nameRevoke` transaction
async function nameRevoke (accountId, nameId, nonce, options) {
  let { ttl, json, fee } = options
  try {
    // Initialize `Ae`
    const txBuilder = initOfflineTxBuilder()
    // Create `transfer` transaction
    const params = {
      accountId,
      nameId,
      ttl,
      nonce
    }
    fee = txBuilder.calculateFee(fee, TX_TYPE.nameRevoke, { params })
    // Build `claim` transaction's
    const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.nameRevoke)

    if (json) {
      print({ tx, txObject })
    } else {
      printBuilderTransaction({ tx, txObject }, TX_TYPE.nameRevoke)
    }
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `contractDeploy` transaction
async function contractDeploy (ownerId, contractPath, options) {
  let { ttl, json, nonce, fee, init = '()', gas } = options
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)
  try {
    // Get contract file
    const contractFile = readFile(path.resolve(process.cwd(), contractPath), 'utf-8')

    // Initialize `Ae`
    const txBuilder = await initTxBuilder(options)
    const chain = await initChain(options)
    // Build `deploy` transaction's
    await handleApiError(async () => {
      // Compile contract using `debug API`
      const { bytecode: code } = await chain.compileNodeContract(contractFile, { gas })
      // Prepare `callData`
      const callData = await chain.contractNodeEncodeCallData(code, 'sophia', 'init', init)
      // Create `contract-deploy` transaction
      const { tx, contractId } = await txBuilder.contractCreateTx({
        ...DEFAULT_CONTRACT_PARAMS,
        code,
        nonce,
        fee,
        ttl,
        gas,
        ownerId,
        callData
      })

      if (json) {
        print({ tx, contractId })
      } else {
        printUnderscored('Unsigned Contract Deploy TX', tx)
        printUnderscored('Contract ID', contractId)
      }
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `contractCall` transaction
async function contractCall (callerId, contractId, fn, returnType, args, options) {
  let { ttl, json, nonce, fee, gas } = options
  nonce = parseInt(nonce)
  try {
    // Prepare args
    args = args.filter(arg => arg !== '[object Object]')
    args = args.length ? `(${args.join(',')})` : '()'

    // Build `call` transaction's
    await handleApiError(async () => {
      // Initialize `Ae`
      const txBuilder = await initTxBuilder(options)
      const chain = await initChain(options)
      // Prepare `callData`
      const callData = await chain.contractNodeEncodeCallData(contractId, 'sophia-address', fn, args)
      // Create `contract-call` transaction
      const tx = await txBuilder.contractCallTx({
        ...DEFAULT_CONTRACT_PARAMS,
        callerId,
        nonce,
        ttl,
        fee,
        gas,
        callData,
        contractId
      })

      if (json)
        print({ tx })
      else
        printUnderscored('Unsigned Contract Call TX', tx)
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `oracleRegister` transaction
async function oracleRegister (accountId, queryFormat, responseFormat, options) {
  let { ttl, json, nonce, fee, queryFee, oracleTtl } = options
  queryFee = parseInt(queryFee)
  oracleTtl = BUILD_ORACLE_TTL(parseInt(oracleTtl))
  nonce = parseInt(nonce)

  try {
    // Initialize `TxBuilder`
    const client = await initTxBuilder(options)
    // Build `claim` transaction's
    await handleApiError(async () => {
      // Create `oracleRegister` transaction
      const oracleRegisterTx = await client.oracleRegisterTx({
        accountId,
        nonce,
        queryFormat,
        responseFormat,
        queryFee,
        oracleTtl,
        fee,
        ttl
      })
      if (json)
        print({ tx: oracleRegisterTx })
      else
        printUnderscored('Unsigned OracleRegister TX', oracleRegisterTx)
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `oraclePostQuery` transaction
async function oraclePostQuery (senderId, oracleId, query, options) {
  let { ttl, json, nonce, fee, queryFee, queryTtl, responseTtl } = options
  queryFee = parseInt(queryFee)
  queryTtl = BUILD_ORACLE_TTL(parseInt(queryTtl))
  responseTtl = BUILD_ORACLE_TTL(parseInt(responseTtl))
  nonce = parseInt(nonce)

  try {
    // Initialize `TxBuilder`
    const client = await initTxBuilder(options)
    // Build `claim` transaction's
    await handleApiError(async () => {
      // Create `oracleRegister` transaction
      const oraclePostQueryTx = await client.oraclePostQueryTx({
        oracleId,
        responseTtl,
        query,
        queryTtl,
        queryFee,
        senderId,
        nonce,
        fee,
        ttl
      })
      if (json) {
        print(oraclePostQueryTx)
      } else {
        printUnderscored('Unsigned OraclePostQuery TX', oraclePostQueryTx.tx)
        printUnderscored('Query ID', oraclePostQueryTx.queryId)
      }
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `oracleExtend` transaction
async function oracleExtend (callerId, oracleId, oracleTtl, options) {
  let { ttl, json, nonce, fee } = options
  oracleTtl = BUILD_ORACLE_TTL(parseInt(oracleTtl))
  nonce = parseInt(nonce)

  try {
    // Initialize `TxBuilder`
    const client = await initTxBuilder(options)
    // Build `claim` transaction's
    await handleApiError(async () => {
      // Create `oracleRegister` transaction
      const oracleExtendTx = await client.oracleExtendTx({
        oracleId,
        oracleTtl,
        callerId,
        nonce,
        fee,
        ttl
      })
      if (json) {
        print(oracleExtendTx)
      } else {
        printUnderscored('Unsigned OracleExtend TX', oracleExtendTx)
      }
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `oracleRespond` transaction
async function oracleRespond (callerId, oracleId, queryId, response, options) {
  let { ttl, json, nonce, fee, responseTtl } = options
  responseTtl = BUILD_ORACLE_TTL(parseInt(responseTtl))
  nonce = parseInt(nonce)

  try {
    // Initialize `TxBuilder`
    const client = await initTxBuilder(options)
    // Build `claim` transaction's
    await handleApiError(async () => {
      // Create `oracleRegister` transaction
      const oracleRespondTx = await client.oracleRespondTx({
        oracleId,
        responseTtl,
        callerId,
        queryId,
        response,
        nonce,
        fee,
        ttl
      })
      if (json) {
        print(oracleRespondTx)
      } else {
        printUnderscored('Unsigned OracleRespond TX', oracleRespondTx)
      }
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Verify 'transaction'
async function verify (txHash, options) {
  let { json } = options
  try {
    // Validate input
    if (!assertedType(txHash, 'tx')) throw new Error('Invalid transaction, must be lik \'tx_23didf2+f3sd...\'')
    // Initialize `Ae`
    const client = await initChain(options)
    // Call `getStatus` API and print it
    await handleApiError(async () => {
      const { validation, tx, signatures = [], txType: type } = await client.unpackAndVerify(txHash)
      if (json) {
        print({ validation, tx: tx, signatures, type })
        process.exit(1)
      }
      printValidation({ validation, tx: { ...tx, signatures: signatures.map(el => el.hash) }, txType: type })
      if (!validation.length) print(' ✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓ TX VALID ✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓')
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

export const Transaction = {
  spend,
  namePreClaim,
  nameClaim,
  nameUpdate,
  nameRevoke,
  nameTransfer,
  contractDeploy,
  contractCall,
  oracleRegister,
  oraclePostQuery,
  oracleExtend,
  oracleRespond,
  verify
}
