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

import { exit, initChain } from '../utils/cli'
import { handleApiError } from '../utils/errors'
import { printBlock, print, printError, printUnderscored, printTransaction, printValidation } from '../utils/print'
import { getBlock } from '../utils/helpers'

// ## Retrieve `node` version
async function version (options) {
  const { json } = options
  try {
    // Initialize `Ae`
    const client = await initChain(options)
    // Call `getStatus` API and print it
    await handleApiError(async () => {
      const status = await client.api.getStatus()
      const { consensusProtocolVersion } = client.getNodeInfo()
      if (json) {
        print(status)
        exit()
      }
      const FORKS = {
        3: 'Fortuna',
        4: 'Lima',
        5: 'Iris'
      }
      printUnderscored('Difficulty', status.difficulty)
      printUnderscored('Node version', status.nodeVersion)
      printUnderscored('Consensus protocol version', `${consensusProtocolVersion} (${FORKS[consensusProtocolVersion]})`)
      printUnderscored('Node revision', status.nodeRevision)
      printUnderscored('Genesis hash', status.genesisKeyBlockHash)
      printUnderscored('Network ID', status.networkId)
      printUnderscored('Listening', status.listening)
      printUnderscored('Peer count', status.peerCount)
      printUnderscored('Pending transactions count', status.pendingTransactionsCount)
      printUnderscored('Solutions', status.solutions)
      printUnderscored('Syncing', status.syncing)
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## Retrieve `node` version
async function getNetworkId (options) {
  const { json } = options
  try {
    // Initialize `Ae`
    const client = await initChain(options)
    // Call `getStatus` API and print it
    await handleApiError(async () => {
      const { networkId } = await client.api.getStatus()
      json ? print({ networkId }) : printUnderscored('Network ID', networkId)
      exit(0)
    })
  } catch (e) {
    printError(e.message)
    exit(1)
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
        print({ absoluteTtl, relativeTtl: +height + +absoluteTtl })
      } else {
        printUnderscored('Absolute TTL', absoluteTtl)
        printUnderscored('Relative TTL', +height + +absoluteTtl)
      }
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
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
    exit(1)
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
        exit(1)
      }

      printBlock(top, json)

      // Play by `height` or by `limit` using `top` block as start point
      height
        ? await playWithHeight(height, top.prevHash)(client, json)
        : await playWithLimit(--limit, top.prevHash)(client, json)
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// # Play by `limit`
function playWithLimit (limit, blockHash) {
  return async (client, json) => {
    if (!limit) return

    const block = await getBlock(blockHash)(client)

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        printBlock(block, json)
        resolve(await playWithLimit(--limit, block.prevHash)(client, json))
      }, 1000)
    })
  }
}

// # Play by `height`
function playWithHeight (height, blockHash) {
  return async (client, json) => {
    const block = await getBlock(blockHash)(client)
    if (parseInt(block.height) < height) return

    return new Promise((resolve, reject) => {
      setTimeout(async () => {
        printBlock(block, json)
        resolve(await playWithHeight(height, block.prevHash)(client, json))
      }, 1000)
    })
  }
}

// ## Send 'transaction' to the chain
async function broadcast (signedTx, options) {
  const { json, waitMined, verify } = options
  try {
    // Initialize `Ae`
    const client = await initChain(options)
    // Call `getStatus` API and print it
    await handleApiError(async () => {
      try {
        const tx = await client.sendTransaction(signedTx, { waitMined: !!waitMined, verify: !!verify })
        waitMined ? printTransaction(tx, json) : print('Transaction send to the chain. Tx hash: ' + tx.hash)
      } catch (e) {
        if (e.verifyTx) {
          const validation = await e.verifyTx()
          if (validation.length) {
            printValidation({ validation, transaction: signedTx })
            return
          }
        }
        if (e.code === 'TX_VERIFICATION_ERROR') {
          printValidation(e)
          return
        }
        throw e
      }
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

export const Chain = {
  top,
  version,
  play,
  ttl,
  getNetworkId,
  broadcast
}
