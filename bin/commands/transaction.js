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

import { encodeBase58Check, salt } from '@aeternity/aepp-sdk/es/utils/crypto'
import { initClient, initTxBuilder } from '../utils/cli'
import { handleApiError } from '../utils/errors'
import { print, printError, printTransaction, printUnderscored } from '../utils/print'
import { isAvailable, updateNameStatus, validateName } from '../utils/helpers'

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
        print({tx})
      else
        printUnderscored('Transaction Hash', tx)
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
      const commitmentId = await client.commitmentHash(domain, _salt)
      const nameHash = `nm_${encodeBase58Check(Buffer.from(domain))}`

      // Create `preclaim` transaction
      const preclaimTx = await client.namePreclaimTx({ accountId, nonce, commitmentId, ttl, fee })

      if (json) {
        print({ tx: preclaimTx, salt: _salt, commitmentId })
      }
      else {
        printUnderscored('Preclaim TX', preclaimTx)
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
        printUnderscored('Claim TX', claimTx)
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
      const updateTx = await client.nameUpdateTx({ accountId, nonce, nameId: name.id, nameTtl, pointers, clientTtl, fee, ttl })

      if (json)
        print({ tx: updateTx })
      else
        printUnderscored('Update TX', updateTx)
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
        printUnderscored('Transfer TX', transferTx)
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
        printUnderscored('Revoke TX', revokeTx)
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Send 'transaction' to the chain
async function broadcast (signedTx, options) {
  let { json, waitMined } = options
  try {
    // Initialize `Ae`
    const client = await initClient(options)
    // Call `getStatus` API and print it
    await handleApiError(async () => {
      const tx = await client.sendTransaction(signedTx, { waitMined })
      waitMined ? printTransaction(tx, json) : print('Transaction send to the chain')
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
  broadcast
}
