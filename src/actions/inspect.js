// # æternity CLI `inspect` file
//
// This script initialize all `inspect` function
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

import { HASH_TYPES } from '../utils/constant'
import { initChain } from '../utils/cli'
import {
  print,
  printBlock,
  printBlockTransactions,
  printError,
  printName, printOracle, printQueries,
  printTransaction,
  printUnderscored
} from '../utils/print'
import { checkPref, getBlock, updateNameStatus, validateName } from '../utils/helpers'
import { TxBuilder } from '@aeternity/aepp-sdk'

// ## Inspect function
// That function get the param(`hash`, `height` or `name`) and show you info about it
export async function inspect (hash, option) {
  if (!hash) throw new Error('Hash required')

  // Get `block` by `height`
  if (!isNaN(hash)) {
    await getBlockByHeight(hash, option)
    return
  }

  const [pref] = hash.split('_')
  switch (pref) {
    // Get `block` by `hash`
    case HASH_TYPES.block:
      await getBlockByHash(hash, option)
      break
    // Get `micro_block` by `hash`
    case HASH_TYPES.micro_block:
      await getBlockByHash(hash, option)
      break
    // Get `account` by `hash`
    case HASH_TYPES.account:
      await getAccountByHash(hash, option)
      break
    // Get `transaction` by `hash`
    case HASH_TYPES.transaction:
      await getTransactionByHash(hash, option)
      break
    case HASH_TYPES.rawTransaction:
      await unpackTx(hash, option)
      break
    // Get `contract` by `contractId`
    case HASH_TYPES.contract:
      await getContract(hash, option)
      break
    case HASH_TYPES.oracle:
      await getOracle(hash, option)
      break
    // Get `name`
    default:
      await getName(hash, option)
      break
  }
}

// ## Inspect helper function's
async function getBlockByHash (hash, options) {
  const { json } = options
  try {
    checkPref(hash, [HASH_TYPES.block, HASH_TYPES.micro_block])
    const client = await initChain(options)
    printBlock(await getBlock(hash, client), json)
  } catch (e) {
    printError(e.message)
  }
}

async function getTransactionByHash (hash, options) {
  const { json } = options
  try {
    checkPref(hash, HASH_TYPES.transaction)
    const client = await initChain(options)
    printTransaction(await client.tx(hash), json)
  } catch (e) {
    printError(e.message)
  }
}

async function unpackTx (hash, options = {}) {
  const { json } = options
  try {
    checkPref(hash, HASH_TYPES.rawTransaction)
    const { tx, txType: type } = TxBuilder.unpackTx(hash)
    if (json) {
      print({ tx: tx, type })
      return
    }
    printUnderscored('Tx Type', type)
    Object.entries(tx).forEach(entry => printUnderscored(...entry))
  } catch (e) {
    printError(e.message)
  }
}

async function getAccountByHash (hash, options) {
  const { json } = options
  try {
    checkPref(hash, HASH_TYPES.account)
    const client = await initChain(options)
    const { nonce } = await client.api.getAccountByPubkey(hash)
    const balance = await client.balance(hash)
    const transactions = (await client.api.getPendingAccountTransactionsByPubkey(hash)).transactions
    if (json) {
      print({
        hash,
        balance,
        nonce,
        transactions
      })
    } else {
      printUnderscored('Account ID', hash)
      printUnderscored('Account balance', balance)
      printUnderscored('Account nonce', nonce)
      print('Account Transactions: ')
      printBlockTransactions(transactions)
    }
  } catch (e) {
    printError(e.message)
  }
}

async function getBlockByHeight (height, options) {
  const { json } = options
  height = parseInt(height)
  try {
    const client = await initChain(options)

    printBlock(await client.api.getKeyBlockByHeight(height), json)
  } catch (e) {
    printError(e.message)
  }
}

async function getName (name, options) {
  const { json } = options
  validateName(name)
  const client = await initChain(options)
  try {
    printName(
      await updateNameStatus(name, client),
      json
    )
  } catch (e) {
    if (e.response && e.response.status === 404) {
      printName({ status: 'AVAILABLE' }, json)
    }
    throw e
  }
}

async function getContract (contractId, options) {
  const { json } = options
  try {
    const client = await initChain(options)

    printTransaction(await client.api.getContract(contractId), json)
  } catch (e) {
    printError(e.message)
  }
}

async function getOracle (oracleId, options) {
  const { json } = options
  try {
    const client = await initChain(options)

    // printTransaction(await client.api.getContract(contractId), json)
    printOracle(await client.api.getOracleByPubkey(oracleId), json)
    const { oracleQueries: queries } = await client.api.getOracleQueriesByPubkey(oracleId)
    if (queries) printQueries(queries, json)
  } catch (e) {
    printError(e.message)
  }
}
