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
import { encodeBase58Check, salt } from '@aeternity/aepp-sdk/es/utils/crypto'
import { commitmentHash } from '@aeternity/aepp-sdk/es/tx/builder/helpers'
import { initChain, initTxBuilder } from '../utils/cli'
import { handleApiError } from '../utils/errors'
import { print, printError, printTransaction, printUnderscored } from '../utils/print'
import { isAvailable, readFile, updateNameStatus, validateName } from '../utils/helpers'
import { VM_VERSION, AMOUNT, DEPOSIT, GAS_PRICE, BUILD_ORACLE_TTL } from '../utils/constant'

// Default transaction build param's
const DEFAULT_CONTRACT_PARAMS = { vmVersion: VM_VERSION, amount: AMOUNT, deposit: DEPOSIT, gasPrice: GAS_PRICE }

// ## Build `spend` transaction
async function spend (senderId, recipientId, amount, options) {
  let { ttl, json, nonce, fee, payload } = options
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)
  try {
    // Initialize `Ae`
    const client = await initTxBuilder(options)
    // Build `spend` transaction
    await handleApiError(async () => {
      const tx = await client.spendTx({ senderId, recipientId, amount, ttl, nonce, fee, payload })
      if (json)
        print({ tx })
      else
        printUnderscored('Unsigned Spend TX', tx)
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `namePreClaim` transaction
async function namePreClaim (accountId, domain, options) {
  let { ttl, json, nonce, fee } = options
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)

  try {
    // Validate `name`(check if `name` end on `.test`)
    validateName(domain)
    // Initialize `Ae`
    const client = await initTxBuilder(options)
    // Build `claim` transaction's
    await handleApiError(async () => {
      // Check if that `name' available
      const name = await updateNameStatus(domain)(client)
      if (!isAvailable(name)) {
        print('Domain not available')
        process.exit(1)
      }

      // Generate `salt` and `commitmentId` and build `name` hash
      const _salt = salt()
      const commitmentId = await commitmentHash(domain, _salt)

      // Create `preclaim` transaction
      const preclaimTx = await client.namePreclaimTx({ accountId, nonce, commitmentId, ttl, fee })

      if (json) {
        print({ tx: preclaimTx, salt: _salt, commitmentId })
      } else {
        printUnderscored('Unsigned Preclaim TX', preclaimTx)
        printUnderscored('Salt', _salt)
        printUnderscored('Commitment ID', commitmentId)
      }
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `nameClaim` transaction
async function nameClaim (accountId, nameSalt, domain, options) {
  let { ttl, json, nonce, fee } = options
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)
  nameSalt = parseInt(nameSalt)

  try {
    // Validate `name`(check if `name` end on `.test`)
    validateName(domain)
    // Initialize `Ae`
    const client = await initTxBuilder(options)
    // Build `claim` transaction's
    await handleApiError(async () => {
      // Check if that `name' available
      const name = await updateNameStatus(domain)(client)
      if (!isAvailable(name)) {
        print('Domain not available')
        process.exit(1)
      }

      // Build `name` hash
      const nameHash = `nm_${encodeBase58Check(Buffer.from(domain))}`

      // Create `preclaim` transaction
      const claimTx = await client.nameClaimTx({ accountId, nameSalt, nonce, name: nameHash, ttl, fee })

      if (json)
        print({ tx: claimTx })
      else
        printUnderscored('Unsigned Claim TX', claimTx)
    })
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
async function nameUpdate (accountId, domain, pointers, options) {
  let { ttl, json, nonce, fee, nameTtl, clientTtl } = options
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)
  nameTtl = parseInt(nameTtl)
  clientTtl = parseInt(clientTtl)
  try {
    // Validate `name`(check if `name` end on `.test`)
    validateName(domain)
    // Initialize `Ae`
    const client = await initTxBuilder(options)
    // Build `claim` transaction's
    await handleApiError(async () => {
      // Check if that `name' available
      const name = await updateNameStatus(domain)(client)
      if (isAvailable(name)) {
        print('Domain is available. You need to claim it before update')
        process.exit(1)
      }

      pointers = pointers.map(id => Object.assign({}, { id, key: classify(id) }))
      // Create `update` transaction
      const updateTx = await client.nameUpdateTx({
        accountId,
        nonce,
        nameId: name.id,
        nameTtl,
        pointers,
        clientTtl,
        fee,
        ttl
      })

      if (json)
        print({ tx: updateTx })
      else
        printUnderscored('Unsigned Update TX', updateTx)
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `nameTransfer` transaction
async function nameTransfer (accountId, recipientId, domain, options) {
  let { ttl, json, nonce, fee } = options
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)
  try {
    // Validate `name`(check if `name` end on `.test`)
    validateName(domain)
    // Initialize `Ae`
    const client = await initTxBuilder(options)
    // Build `claim` transaction's
    await handleApiError(async () => {
      // Check if that `name' available
      const name = await updateNameStatus(domain)(client)
      if (isAvailable(name)) {
        print('Domain is available. You need to claim it before transfer')
        process.exit(1)
      }

      // Create `transfer` transaction
      const transferTx = await client.nameTransferTx({ accountId, nonce, nameId: name.id, recipientId, fee, ttl })

      if (json)
        print({ tx: transferTx })
      else
        printUnderscored('Unsigned Transfer TX', transferTx)
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Build `nameRevoke` transaction
async function nameRevoke (accountId, domain, options) {
  let { ttl, json, nonce, fee } = options
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)
  try {
    // Validate `name`(check if `name` end on `.test`)
    validateName(domain)
    // Initialize `Ae`
    const client = await initTxBuilder(options)
    // Build `claim` transaction's
    await handleApiError(async () => {
      // Check if that `name' available
      const name = await updateNameStatus(domain)(client)
      if (isAvailable(name)) {
        print('Domain is available. Nothing to revoke')
        process.exit(1)
      }

      // Create `revoke` transaction
      const revokeTx = await client.nameRevokeTx({ accountId, nonce, nameId: name.id, fee, ttl })

      if (json)
        print({ tx: revokeTx })
      else
        printUnderscored('Unsigned Revoke TX', revokeTx)
    })
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

// ## Send 'transaction' to the chain
async function broadcast (signedTx, options) {
  let { json, waitMined, verify } = options
  try {
    // Initialize `Ae`
    const client = await initChain(options)
    // Call `getStatus` API and print it
    await handleApiError(async () => {
      try {
        const tx = await client.sendTransaction(signedTx, { waitMined: !!waitMined, verify: !!verify })
        waitMined ? printTransaction(tx, json) : print('Transaction send to the chain. Tx hash: ' + tx.hash)
      } catch (e) {
        printValidation(e.errorData)
      }
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

function printValidation ({ validation, tx, txType }) {
  print('----------------------------- TX DATA -------------------------------')
  Object.entries({ ...{ type: txType }, ...tx }).forEach(([key, value]) => printUnderscored(key, value))
  validation
    .reduce(
      (acc, { msg, txKey, type }) => {
        type === 'error' ? acc[0].push({ msg, txKey }) : acc[1].push({ msg, txKey })
        return acc
      },
      [[], []]
    )
    .forEach((el, i) => {
      if (el.length) {
        i === 0
          ? print('\n------------------------------ ERRORS ------------------------------\n')
          : print('\n----------------------------- WARNINGS -----------------------------\n')
        el
          .forEach(({ msg, txKey }) => {
            printUnderscored(txKey, msg)
          })
      }
    })
}

export const Transaction = {
  spend,
  namePreClaim,
  nameClaim,
  nameUpdate,
  nameRevoke,
  nameTransfer,
  broadcast,
  contractDeploy,
  contractCall,
  oracleRegister,
  oraclePostQuery,
  oracleExtend,
  oracleRespond
}
