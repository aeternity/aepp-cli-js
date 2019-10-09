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

import { exit, initChain, initClientByWalletFile } from '../utils/cli'
import { printError, print, printUnderscored, printName, printTransaction } from '../utils/print'
import { handleApiError } from '../utils/errors'
import { isAvailable, updateNameStatus, validateName } from '../utils/helpers'

// ## Claim `name` function
async function preClaim (walletPath, domain, options) {
  const { ttl, fee, nonce, waitMined, json } = options

  try {
    // Validate `name`(check if `name` end on `.test`)
    validateName(domain)

    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const client = await initClientByWalletFile(walletPath, options)

    await handleApiError(async () => {
      // Check if that `name' available
      const name = await updateNameStatus(domain)(client)
      if (!isAvailable(name)) {
        print('Domain not available')
        exit(1)
      }
      // Create `pre-claim` transaction
      printTransaction(
        await client.aensPreclaim(domain, { ttl, fee, nonce, waitMined }),
        json
      )
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## Claim `name` function
async function claim (walletPath, domain, salt, options) {
  const { ttl, fee, nonce, waitMined, json, nameFee } = options
  try {
    // Validate `name`
    validateName(domain)

    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const client = await initClientByWalletFile(walletPath, options)

    await handleApiError(async () => {
      // Check if that `name' available
      const name = await updateNameStatus(domain)(client)
      if (!isAvailable(name)) {
        print('Domain not available')
        exit(1)
      }

      // Wait for next block and create `claimName` transaction
      printTransaction(
        await client.aensClaim(domain, salt, { nonce, ttl, fee, waitMined, nameFee }),
        json
      )
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ##Transfer `name` function
async function transferName (walletPath, domain, address, options) {
  // Parse options(`ttl`, `nameTtl` and `nonce`)
  const ttl = parseInt(options.ttl)
  const nameTtl = parseInt(options.nameTtl)
  const nonce = parseInt(options.nonce)

  if (!address) {
    program.outputHelp()
    process.exit(1)
  }
  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const client = await initClientByWalletFile(walletPath, options)

    await handleApiError(async () => {
      // Check if that `name` is unavailable and we can transfer it
      const name = await updateNameStatus(domain)(client)
      if (isAvailable(name)) {
        print('Domain is available, nothing to transfer')
        process.exit(1)
      }

      // Create `transferName` transaction
      const transferTX = await client.aensTransfer(name.id, address, { ttl, nameTtl, nonce })
      print('Transfer Success')
      printUnderscored('Transaction hash', transferTX.hash)
      process.exit(0)
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ##Update `name` function
async function updateName (walletPath, domain, address, options) {
  // Parse options(`ttl`, `nameTtl` and `nonce``)
  const ttl = parseInt(options.ttl)
  const nameTtl = parseInt(options.nameTtl)
  const nonce = parseInt(options.nonce)

  if (!address) {
    program.outputHelp()
    process.exit(1)
  }

  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const client = await initClientByWalletFile(walletPath, options)

    await handleApiError(async () => {
      // Check if that `name` is unavailable and we can update it
      const name = await updateNameStatus(domain)(client)
      if (isAvailable(name)) {
        print(`Domain is ${name.status} and cannot be transferred`)
        process.exit(1)
      }

      // Create `updateName` transaction
      const updateNameTx = await client.aensUpdate(name.id, address, { ttl, nameTtl, nonce })
      print('Update Success')
      printUnderscored('Transaction Hash', updateNameTx.hash)
      process.exit(0)
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ##Revoke `name` function
async function revokeName (walletPath, domain, options) {
  // Parse options(`ttl` and `nonce`)
  const ttl = parseInt(options.ttl)
  const nonce = parseInt(options.nonce)

  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const client = await initClientByWalletFile(walletPath, options)

    await handleApiError(async () => {
      // Check if `name` is unavailable and we can revoke it
      const name = await updateNameStatus(domain)(client)
      if (isAvailable(name)) {
        print('Domain is available, nothing to revoke')
        process.exit(1)
      }

      // Create `revokeName` transaction
      const revokeTx = await client.aensRevoke(name.id, { ttl, nonce })
      print('Revoke Success')
      printUnderscored('Transaction hash', revokeTx.hash)
      process.exit(0)
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

async function lookUp (domain, options) {
  const { json } = options
  try {
    validateName(domain)
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const client = await initChain(options)

    await handleApiError(async () => {
      // Check if `name` is unavailable and we can revoke it
      printName(
        await updateNameStatus(domain)(client),
        json
      )
      process.exit(0)
    })
  } catch (e) {
    printError(e.message)
    process.exit(0)
  }
}

export const AENS = {
  preClaim,
  revokeName,
  updateName,
  claim,
  transferName,
  lookUp
}
