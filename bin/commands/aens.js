#!/usr/bin/env node
// # æternity CLI `AENS` file
//
// This script initialize all `AENS` function
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

import { initChain, initClientByWalletFile } from '../utils/cli'
import { print, printName, printTransaction } from '../utils/print'
import { isAvailable, updateNameStatus, validateName } from '../utils/helpers'
import { Crypto, getDefaultPointerKey } from '@aeternity/aepp-sdk'

// ## Claim `name` function
async function preClaim (walletPath, domain, options) {
  const { ttl, fee, nonce, waitMined, json } = options

  // Validate `name`(check if `name` end on `.test`)
  // validateName(domain)

  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const client = await initClientByWalletFile(walletPath, options)

  // Check if that `name' available
  const name = await updateNameStatus(domain)(client)
  if (!isAvailable(name)) {
    throw new Error('Domain not available')
  }
  // Create `pre-claim` transaction
  const preClaimTx = await client.aensPreclaim(domain, { ttl, fee, nonce, waitMined })
  if (waitMined) {
    printTransaction(
      preClaimTx,
      json
    )
  } else {
    print('Transaction send to the chain. Tx hash: ' + preClaimTx.hash)
  }
}

// ## Claim `name` function
async function claim (walletPath, domain, salt, options) {
  const { ttl, fee, nonce, waitMined, json, nameFee } = options
  // Validate `name`
  // validateName(domain)

  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const client = await initClientByWalletFile(walletPath, options)

  // Check if that `name' available
  const name = await updateNameStatus(domain)(client)
  if (!isAvailable(name)) {
    throw new Error('Domain not available')
  }

  // Wait for next block and create `claimName` transaction
  const claimTx = await client.aensClaim(domain, salt, { nonce, ttl, fee, waitMined, nameFee })
  if (waitMined) {
    printTransaction(
      claimTx,
      json
    )
  } else {
    print('Transaction send to the chain. Tx hash: ' + claimTx.hash)
  }
}

// ##Update `name` function
async function updateName (walletPath, domain, addresses, options) {
  const { ttl, fee, nonce, waitMined, json, nameTtl, clientTtl, extendPointers = false } = options

  // Validate `address`
  const invalidAddresses = addresses.filter(address => !Crypto.isAddressValid(address))
  if (invalidAddresses.length) throw new Error(`Addresses "[${invalidAddresses}]" is not valid`)
  // Validate `name`
  validateName(domain)
  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const client = await initClientByWalletFile(walletPath, options)

  // Check if that `name` is unavailable and we can update it
  const name = await updateNameStatus(domain)(client)
  if (isAvailable(name)) {
    throw new Error(`Domain is ${name.status} and cannot be updated`)
  }

  // Create `updateName` transaction
  const updateTx = await client.aensUpdate(
    domain,
    Object.fromEntries(addresses.map(address => [getDefaultPointerKey(address), address])),
    { ttl, fee, nonce, waitMined, nameTtl, clientTtl, extendPointers }
  )
  if (waitMined) {
    printTransaction(
      updateTx,
      json
    )
  } else {
    print('Transaction send to the chain. Tx hash: ' + updateTx.hash)
  }
}

// ##Extend `name` ttl  function
async function extendName (walletPath, domain, nameTtl, options) {
  const { ttl, fee, nonce, waitMined, json } = options

  // Validate `name`
  validateName(domain)
  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const client = await initClientByWalletFile(walletPath, options)

  // Check if that `name` is unavailable and we can update it
  const name = await updateNameStatus(domain)(client)
  if (isAvailable(name)) {
    throw new Error(`Domain is ${name.status} and cannot be extended`)
  }

  // Create `updateName` transaction
  const updateTx = await client.aensUpdate(domain, [], { ttl, fee, nonce, waitMined, nameTtl, extendPointers: true })
  if (waitMined) {
    printTransaction(
      updateTx,
      json
    )
  } else {
    print('Transaction send to the chain. Tx hash: ' + updateTx.hash)
  }
}

// ##Transfer `name` function
async function transferName (walletPath, domain, address, options) {
  const { ttl, fee, nonce, waitMined, json } = options

  // Validate `address`
  if (!Crypto.isAddressValid(address)) throw new Error(`Address "${address}" is not valid`)
  // Validate `name`
  validateName(domain)
  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const client = await initClientByWalletFile(walletPath, options)

  // Check if that `name` is unavailable and we can transfer it
  const name = await updateNameStatus(domain)(client)
  if (isAvailable(name)) {
    throw new Error('Domain is available, nothing to transfer')
  }

  // Create `transferName` transaction
  const transferTX = await client.aensTransfer(domain, address, { ttl, fee, nonce, waitMined })
  if (waitMined) {
    printTransaction(
      transferTX,
      json
    )
  } else {
    print('Transaction send to the chain. Tx hash: ' + transferTX.hash)
  }
}

// ## Revoke `name` function
async function revokeName (walletPath, domain, options) {
  const { ttl, fee, nonce, waitMined, json } = options

  // Validate `name`
  validateName(domain)
  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const client = await initClientByWalletFile(walletPath, options)

  // Check if `name` is unavailable and we can revoke it
  const name = await updateNameStatus(domain)(client)
  if (isAvailable(name)) {
    throw new Error('Domain is available, nothing to revoke')
  }

  // Create `revokeName` transaction
  const revokeTx = await client.aensRevoke(domain, { ttl, fee, nonce, waitMined })
  if (waitMined) {
    printTransaction(
      revokeTx,
      json
    )
  } else {
    print('Transaction send to the chain. Tx hash: ' + revokeTx.hash)
  }
}

async function nameBid (walletPath, domain, nameFee, options) {
  const { ttl, fee, nonce, waitMined, json } = options
  // Validate `name`
  validateName(domain)

  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const client = await initClientByWalletFile(walletPath, options)

  // Check if that `name' available
  const name = await updateNameStatus(domain)(client)
  if (!isAvailable(name)) {
    throw new Error('Auction do not start or already end')
  }

  // Wait for next block and create `claimName` transaction
  const nameBidTx = await client.aensBid(domain, nameFee, { nonce, ttl, fee, waitMined })
  if (waitMined) {
    printTransaction(
      nameBidTx,
      json
    )
  } else {
    print('Transaction send to the chain. Tx hash: ' + nameBidTx.hash)
  }
}

async function fullClaim (walletPath, domain, options) {
  let { ttl, fee, nonce, nameFee, json, nameTtl, clientTtl } = options
  // Validate `name`
  validateName(domain)
  const [aensName, namespace] = domain.split('.')
  if (namespace === 'chain' && aensName.length < 13) throw new Error('Full name claiming works only with name longer then 12 symbol(Not trigger auction)')

  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const client = await initClientByWalletFile(walletPath, options)

  // Check if that `name' available
  const name = await updateNameStatus(domain)(client)
  if (!isAvailable(name)) {
    throw new Error('Domain not available')
  }

  // Wait for next block and create `claimName` transaction
  if (nonce) {
    nonce = parseInt(nonce)
  }
  const preclaim = await client.aensPreclaim(domain, { nonce, ttl, fee })
  nonce += 1
  const claim = await preclaim.claim({ nonce, ttl, fee, nameFee })
  nonce += 1
  const updateTx = await claim.update([await client.address()], { nonce, ttl, fee, nameTtl, clientTtl })
  nonce += 1

  printTransaction(
    updateTx,
    json
  )
}

async function lookUp (domain, options) {
  const { json } = options
  validateName(domain)
  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const client = await initChain(options)

  // Check if `name` is unavailable and we can revoke it
  printName(
    await updateNameStatus(domain)(client),
    json
  )
}

export const AENS = {
  preClaim,
  revokeName,
  updateName,
  extendName,
  claim,
  transferName,
  nameBid,
  fullClaim,
  lookUp
}
