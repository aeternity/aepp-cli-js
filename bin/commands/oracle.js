#!/usr/bin/env node
// # æternity CLI `contract` file
//
// This script initialize all `contract` function
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
import { handleApiError } from '../utils/errors'
import { printError, print, printTransaction, printOracle, printQueries } from '../utils/print'
import { BUILD_ORACLE_TTL } from '../utils/constant';
import { assertedType } from '@aeternity/aepp-sdk/es/utils/crypto';


// ## Create Oracle
async function createOracle (walletPath, queryFormat, responseFormat, options) {
  const { ttl, fee, nonce, waitMined, json, oracleTtl, queryFee } = options

  try {
    const client = await initClientByWalletFile(walletPath, options)
    await handleApiError(async () => {
      // Register Oracle
      const oracle = await client.registerOracle(
        queryFormat,
        responseFormat,
        { ttl,
          waitMined,
          nonce,
          fee,
          oracleTtl: isNaN(parseInt(oracleTtl)) ? oracleTtl : BUILD_ORACLE_TTL(oracleTtl),
          queryFee
        }
      )
      if (waitMined) {
        printTransaction(
          oracle,
          json
        )
      } else {
        print('Transaction send to the chain. Tx hash: ', oracle)
      }
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## Extend Oracle
async function extendOracle (walletPath, oracleId, oracleTtl, options) {
  const { ttl, fee, nonce, waitMined, json } = options

  try {
    if (isNaN(+oracleTtl)) throw new Error('Oracle Ttl should be a number')
    if (!assertedType(oracleId, 'ok', true)) throw new Error('Invalid oracleId')
    const client = await initClientByWalletFile(walletPath, options)
    await handleApiError(async () => {
      const oracle = await client.getOracleObject(oracleId)
      const extended = await oracle.extendOracle(
        BUILD_ORACLE_TTL(oracleTtl),
        { ttl,
          waitMined,
          nonce,
          fee,
        }
      )
      if (waitMined) {
        printTransaction(
          extended,
          json
        )
      } else {
        print('Transaction send to the chain. Tx hash: ', extended)
      }
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## Create Oracle Query
async function createOracleQuery (walletPath, oracleId, query, options) {
  const { ttl, fee, nonce, waitMined, json, queryTll, queryFee, responseTtl  } = options

  try {
    if (!assertedType(oracleId, 'ok', true)) throw new Error('Invalid oracleId')
    const client = await initClientByWalletFile(walletPath, options)

    await handleApiError(async () => {
      const oracle = await client.getOracleObject(oracleId)
      const oracleQuery = await oracle.postQuery(query, {
        ttl,
        waitMined,
        nonce,
        fee,
        queryTll: isNaN(parseInt(queryTll)) ? queryTll : BUILD_ORACLE_TTL(queryTll),
        responseTtl: isNaN(parseInt(responseTtl)) ? responseTtl : BUILD_ORACLE_TTL(responseTtl),
        queryFee
      })
      if (waitMined) {
        printTransaction(
          oracleQuery,
          json
        )
      } else {
        print('Transaction send to the chain. Tx hash: ', oracleQuery)
      }
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## Respond to Oracle Query
async function respondToQuery (walletPath, oracleId, queryId, response, options) {
  const { ttl, fee, nonce, waitMined, json, responseTtl  } = options

  try {
    if (!assertedType(oracleId, 'ok', true)) throw new Error('Invalid oracleId')
    if (!assertedType(queryId, 'oq', true)) throw new Error('Invalid queryId')
    const client = await initClientByWalletFile(walletPath, options)

    await handleApiError(async () => {
      const oracle = await client.getOracleObject(oracleId)
      const queryResponse = await oracle.respondToQuery(queryId, response, {
        ttl,
        waitMined,
        nonce,
        fee,
        responseTtl: isNaN(parseInt(responseTtl)) ? responseTtl : BUILD_ORACLE_TTL(responseTtl)
      })
      if (waitMined) {
        printTransaction(
          queryResponse,
          json
        )
      } else {
        print('Transaction send to the chain. Tx hash: ', queryResponse)
      }
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## Get oracle
async function queryOracle (oracleId, options) {
  try {
    if (!assertedType(oracleId, 'ok', true)) throw new Error('Invalid oracleId')
    const client = await initChain(options)
    await handleApiError(async () => {
      const oracle = await client.getOracle(oracleId)
      const { oracleQueries: queries } = await client.getOracleQueries(oracleId)
      printOracle(oracle, options.json)
      printQueries(queries, options.json)
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

export const Oracle = {
  createOracle,
  extendOracle,
  queryOracle,
  createOracleQuery,
  respondToQuery
}
