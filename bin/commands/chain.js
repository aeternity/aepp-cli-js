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

import { initChain } from '../utils/cli'
import { handleApiError } from '../utils/errors'
import { printBlock, print, printBlockTransactions, printError, printUnderscored } from '../utils/print'
import { getBlock } from '../utils/helpers'

// ## Retrieve `node` version
async function version (options) {
  try {
    // Initialize `Ae`
    const client = await initChain(options)
    // Call `getStatus` API and print it
    await handleApiError(async () => {
      const { nodeVersion, nodeRevision, genesisKeyBlockHash, networkId } = await client.api.getStatus()
      print(`Node version______________  ${nodeVersion}`)
      print(`Node revision ____________  ${nodeRevision}`)
      print(`Genesis hash______________  ${genesisKeyBlockHash}`)
      print(`Network ID________________  ${networkId}`)
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Retrieve `ttl` version
async function ttl (absoluteTtl, options) {
  const { json } = options
  try {
    // Initialize `Ae`
    const client = await initChain(options)
    // Call `topBlock` API and calculate relative `ttl`
    await handleApiError(async () => {
      const height = await client.height()
      if (json) {
        print({ absoluteTtl, relativeTtl: +height + absoluteTtl })
        process.exit(1)
      }
      printUnderscored('Absolute TTL', absoluteTtl)
      printUnderscored('Relative TTL', +height + absoluteTtl)
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Retrieve `TOP` block
async function top (options) {
  const { json } = options
  try {
    // Initialize `Ae`
    const client = await initChain(options)
    // Call `getTopBlock` API and print it
    await handleApiError(
      async () => printBlock(await client.topBlock(), json)
    )
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## Retrieve `mempool`
async function mempool (options) {
  const { json } = options
  try {
    // Initialize `Ae`
    const client = await initChain(options)

    await handleApiError(async () => {
      // Get `mempool` from `API`
      const { transactions } = await client.mempool()

      printUnderscored('Mempool', '')
      printUnderscored('Pending Transactions Count', transactions.length)
      // If we have `transaction's` in `mempool` print them
      if (transactions && transactions.length) {
        printBlockTransactions(transactions, json)
      }
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// ## This function `Play`(print all block) from `top` block to some condition(reach some `height` or `limit`)
async function play (options) {
  let { height, limit, json } = options
  limit = parseInt(limit)
  height = parseInt(height)
  try {
    const client = await initChain(options)

    await handleApiError(async () => {
      // Get top block from `node`. It is a start point for play.
      const top = await client.topBlock()

      if (height && height > parseInt(top.height)) {
        printError('Height is bigger then height of top block')
        process.exit(1)
      }

      printBlock(top, json)

      // Play by `height` or by `limit` using `top` block as start point
      height
        ? await playWithHeight(height, top.prevHash)(client, json)
        : await playWithLimit(--limit, top.prevHash)(client, json)
    })
  } catch (e) {
    printError(e.message)
    process.exit(1)
  }
}

// # Play by `limit`
function playWithLimit (limit, blockHash) {
  return async (client, json) => {
    if (!limit) return

    let block = await getBlock(blockHash)(client)

    setTimeout(async () => {
      printBlock(block, json)
      await playWithLimit(--limit, block.prevHash)(client, json)
    }, 1000)
  }
}

// # Play by `height`
function playWithHeight (height, blockHash) {
  return async (client, json) => {
    let block = await getBlock(blockHash)(client)
    if (parseInt(block.height) < height) return

    setTimeout(async () => {
      printBlock(block, json)
      await playWithHeight(height, block.prevHash)(client, json)
    }, 1000)
  }
}

export const Chain = {
  mempool,
  top,
  version,
  play,
  ttl
}
