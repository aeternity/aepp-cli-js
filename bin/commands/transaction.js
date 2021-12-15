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

import { Crypto, SCHEMA, TxBuilder, TxBuilderHelper, verifyTransaction, Node } from '@aeternity/aepp-sdk'
import { initOfflineTxBuilder, initTxBuilder } from '../utils/cli'
import { print, printBuilderTransaction, printUnderscored, printValidation } from '../utils/print'
import { validateName } from '../utils/helpers'
import { BUILD_ORACLE_TTL, ORACLE_VM_VERSION } from '../utils/constant'

const { TX_TYPE } = SCHEMA

// ## Build `spend` transaction
async function spend (senderId, recipientId, amount, nonce, options) {
  let { ttl, json, fee, payload } = options
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)
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
  json
    ? print({ tx: tx.tx, params: tx.txObject })
    : printBuilderTransaction(tx, TX_TYPE.spend)
}

// ## Build `namePreClaim` transaction
async function namePreClaim (accountId, domain, nonce, options) {
  let { ttl, json, fee } = options

  // Validate `name`(check if `name` end on `.test`)
  validateName(domain)
  // Initialize `Ae`
  const txBuilder = initOfflineTxBuilder()

  // Generate `salt` and `commitmentId` and build `name` hash
  const _salt = Crypto.salt()
  const commitmentId = await TxBuilderHelper.commitmentHash(domain, _salt)

  const params = {
    accountId,
    commitmentId,
    ttl,
    nonce
  }
  fee = txBuilder.calculateFee(fee, TX_TYPE.namePreClaim, { params })
  // Create `preclaim` transaction
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.namePreClaim)

  json
    ? print({ tx, txObject, salt: _salt })
    : printBuilderTransaction({ tx, txObject: { ...txObject, salt: _salt } }, TX_TYPE.namePreClaim)
}

// ## Build `nameClaim` transaction
async function nameClaim (accountId, nameSalt, domain, nonce, options) {
  const vsn = 2
  let { ttl, json, fee, nameFee } = options
  const nameHash = `nm_${Crypto.encodeBase58Check(Buffer.from(domain))}`

  // Validate `name`(check if `name` end on `.test`)
  validateName(domain)
  // Initialize `Ae`
  const txBuilder = initOfflineTxBuilder()
  nameFee = nameFee || TxBuilderHelper.getMinimumNameFee(domain)
  const params = {
    nameFee,
    accountId,
    nameSalt,
    name: nameHash,
    ttl,
    nonce
  }
  fee = txBuilder.calculateFee(fee, TX_TYPE.nameClaim, { params, vsn })
  // Build `claim` transaction's
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.nameClaim, { vsn })

  json
    ? print({ tx, txObject })
    : printBuilderTransaction({ tx, txObject }, TX_TYPE.nameClaim)
}

function classify (s) {
  const keys = {
    ak: 'account_pubkey',
    ok: 'oracle_pubkey',
    ct: 'contract_pubkey'
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

  json
    ? print({ tx, txObject })
    : printBuilderTransaction({ tx, txObject }, TX_TYPE.nameUpdate)
}

// ## Build `nameTransfer` transaction
async function nameTransfer (accountId, recipientId, nameId, nonce, options) {
  let { ttl, json, fee } = options
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

  json
    ? print({ tx, txObject })
    : printBuilderTransaction({ tx, txObject }, TX_TYPE.nameTransfer)
}

// ## Build `nameRevoke` transaction
async function nameRevoke (accountId, nameId, nonce, options) {
  let { ttl, json, fee } = options
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

  json
    ? print({ tx, txObject })
    : printBuilderTransaction({ tx, txObject }, TX_TYPE.nameRevoke)
}

// ## Build `contractDeploy` transaction
async function contractDeploy (ownerId, contractByteCode, initCallData, nonce, options) {
  const { json } = options
  // Initialize `Ae`
  const txBuilder = await initTxBuilder(options)
  // Build `deploy` transaction's
  // Create `contract-deploy` transaction
  const { tx, contractId, txObject } = await txBuilder.contractCreateTx({
    ...options,
    code: contractByteCode,
    ownerId,
    nonce: +nonce, // TODO: remove after fixing https://github.com/aeternity/aepp-sdk-js/issues/1370
    callData: initCallData
  })

  if (json) {
    print({ tx, contractId, txObject })
  } else {
    printUnderscored('Unsigned Contract Deploy TX', tx)
    printUnderscored('Contract ID', contractId)
  }
}

// ## Build `contractCall` transaction
async function contractCall (callerId, contractId, callData, nonce, options) {
  const { json } = options
  // Build `call` transaction's
  // Initialize `Ae`
  const txBuilder = await initTxBuilder(options)
  // Create `contract-call` transaction
  const tx = await txBuilder.contractCallTx({
    ...options,
    callerId,
    nonce,
    callData,
    contractId
  })

  json
    ? print({ tx })
    : printUnderscored('Unsigned Contract Call TX', tx)
}

// ## Build `oracleRegister` transaction
async function oracleRegister (accountId, queryFormat, responseFormat, nonce, options) {
  let { ttl, json, fee, queryFee, oracleTtl } = options
  queryFee = parseInt(queryFee)
  oracleTtl = BUILD_ORACLE_TTL(parseInt(oracleTtl))
  nonce = parseInt(nonce)

  const txBuilder = initOfflineTxBuilder()
  // Create `transfer` transaction
  const params = {
    accountId,
    ttl,
    fee,
    nonce,
    oracleTtl,
    queryFee,
    queryFormat,
    responseFormat,
    abiVersion: ORACLE_VM_VERSION
  }
  fee = txBuilder.calculateFee(fee, TX_TYPE.oracleRegister, { params })
  // Build `claim` transaction's
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.oracleRegister)
  json
    ? print({ tx, txObject })
    : printBuilderTransaction({ tx, txObject }, TX_TYPE.oracleRegister)
}

// ## Build `oraclePostQuery` transaction
async function oraclePostQuery (senderId, oracleId, query, nonce, options) {
  let { ttl, json, fee, queryFee, queryTtl, responseTtl } = options
  queryFee = parseInt(queryFee)
  queryTtl = BUILD_ORACLE_TTL(parseInt(queryTtl))
  responseTtl = BUILD_ORACLE_TTL(parseInt(responseTtl))
  nonce = parseInt(nonce)

  const txBuilder = initOfflineTxBuilder()
  // Create `transfer` transaction
  const params = {
    senderId,
    ttl,
    fee,
    nonce,
    oracleId,
    query,
    queryFee,
    queryTtl,
    responseTtl
  }
  fee = txBuilder.calculateFee(fee, TX_TYPE.oracleQuery, { params })
  // Build `claim` transaction's
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.oracleQuery)

  json
    ? print({ tx, txObject })
    : printBuilderTransaction({ tx, txObject }, TX_TYPE.oracleQuery)
}

// ## Build `oracleExtend` transaction
async function oracleExtend (callerId, oracleId, oracleTtl, nonce, options) {
  let { ttl, json, fee } = options
  oracleTtl = BUILD_ORACLE_TTL(parseInt(oracleTtl))
  nonce = parseInt(nonce)

  const txBuilder = initOfflineTxBuilder()
  // Create `transfer` transaction
  const params = {
    callerId,
    oracleId,
    oracleTtl,
    fee,
    nonce,
    ttl
  }
  fee = txBuilder.calculateFee(fee, TX_TYPE.oracleExtend, { params })
  // Build `claim` transaction's
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.oracleExtend)

  json
    ? print({ tx, txObject })
    : printBuilderTransaction({ tx, txObject }, TX_TYPE.oracleExtend)
}

// ## Build `oracleRespond` transaction
async function oracleRespond (callerId, oracleId, queryId, response, nonce, options) {
  let { ttl, json, fee, responseTtl } = options
  responseTtl = BUILD_ORACLE_TTL(parseInt(responseTtl))
  nonce = parseInt(nonce)

  const txBuilder = initOfflineTxBuilder()
  // Create `transfer` transaction
  const params = {
    oracleId,
    responseTtl,
    callerId,
    queryId,
    response,
    nonce,
    fee,
    ttl
  }
  fee = txBuilder.calculateFee(fee, TX_TYPE.oracleResponse, { params })
  // Build `claim` transaction's
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.oracleResponse)

  json
    ? print({ tx, txObject })
    : printBuilderTransaction({ tx, txObject }, TX_TYPE.oracleResponse)
}

// ## Verify 'transaction'
async function verify (transaction, options) {
  const { json } = options
  // Validate input
  TxBuilderHelper.decode(transaction, 'tx')
  // Call `getStatus` API and print it
  const validation = await verifyTransaction(transaction, await Node(options))
  const { tx, txType: type } = TxBuilder.unpackTx(transaction)
  if (json) {
    print({ validation, tx, type })
    return
  }
  printValidation({ validation, transaction })
  if (!validation.length) print(' ✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓ TX VALID ✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓')
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
