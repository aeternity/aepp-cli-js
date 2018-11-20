#!/usr/bin/env node
// # æternity CLI `chain` file
//
// This script initialize all `chain` function
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

import { initClient } from '../utils/cli'
import { handleApiError } from '../utils/errors'
import {print, printError, printTransaction, printUnderscored} from '../utils/print'

// ## Build `spend` transaction
async function spend (senderId, recipientId, amount, options) {
  let { ttl, json, nonce, fee, payload } = options
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)
  try {
    // Initialize `Ae`
    const client = await initClient(options)
    // Call `getStatus` API and print it
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

// ## Send 'transaction' to the chain
async function broadcast (signedTx, options) {
  let { json } = options
  try {
    // Initialize `Ae`
    const client = await initClient(options)
    // Call `getStatus` API and print it
    await handleApiError(async () => {
      const tx = await client.sendTransaction(signedTx)
      printTransaction(tx, json)
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

export const Transaction = {
  spend,
  broadcast
}
