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

import { initSdk, initSdkByWalletFile } from '../utils/cli';
import { BUILD_ORACLE_TTL } from '../utils/constant';
import { decode } from '../utils/helpers';
import {
  print, printOracle, printQueries, printTransaction,
} from '../utils/print';

// ## Create Oracle
export async function createOracle(walletPath, queryFormat, responseFormat, options) {
  const {
    ttl, fee, nonce, waitMined, json, oracleTtl, queryFee,
  } = options;

  const sdk = await initSdkByWalletFile(walletPath, options);
  // Register Oracle
  const oracle = await sdk.registerOracle(queryFormat, responseFormat, {
    ttl,
    waitMined,
    nonce,
    fee,
    oracleTtl: isNaN(parseInt(oracleTtl))
      ? oracleTtl
      : BUILD_ORACLE_TTL(oracleTtl),
    queryFee,
  });
  if (waitMined) {
    printTransaction(oracle, json);
  } else {
    print('Transaction send to the chain. Tx hash: ', oracle);
  }
}

// ## Extend Oracle
export async function extendOracle(walletPath, oracleId, oracleTtl, options) {
  const {
    ttl, fee, nonce, waitMined, json,
  } = options;

  if (isNaN(+oracleTtl)) throw new Error('Oracle Ttl should be a number');
  decode(oracleId, 'ok');
  const sdk = await initSdkByWalletFile(walletPath, options);
  const oracle = await sdk.getOracleObject(oracleId);
  const extended = await oracle.extendOracle({
    ttl,
    waitMined,
    nonce,
    fee,
    ...BUILD_ORACLE_TTL(oracleTtl),
  });
  if (waitMined) {
    printTransaction(extended, json);
  } else {
    print('Transaction send to the chain. Tx hash: ', extended);
  }
}

// ## Create Oracle Query
export async function createOracleQuery(walletPath, oracleId, query, options) {
  const {
    ttl, fee, nonce, waitMined, json, queryTll, queryFee, responseTtl,
  } = options;

  decode(oracleId, 'ok');
  const sdk = await initSdkByWalletFile(walletPath, options);

  const oracle = await sdk.getOracleObject(oracleId);
  const oracleQuery = await oracle.postQuery(query, {
    ttl,
    waitMined,
    nonce,
    fee,
    queryTll: isNaN(parseInt(queryTll))
      ? queryTll
      : BUILD_ORACLE_TTL(queryTll),
    responseTtl: isNaN(parseInt(responseTtl))
      ? responseTtl
      : BUILD_ORACLE_TTL(responseTtl),
    queryFee,
  });
  if (waitMined) {
    printTransaction(oracleQuery, json);
  } else {
    print('Transaction send to the chain. Tx hash: ', oracleQuery);
  }
}

// ## Respond to Oracle Query
export async function respondToQuery(
  walletPath,
  oracleId,
  queryId,
  response,
  options,
) {
  const {
    ttl, fee, nonce, waitMined, json, responseTtl,
  } = options;

  decode(oracleId, 'ok');
  decode(queryId, 'oq');
  const sdk = await initSdkByWalletFile(walletPath, options);

  const oracle = await sdk.getOracleObject(oracleId);
  const queryResponse = await oracle.respondToQuery(queryId, response, {
    ttl,
    waitMined,
    nonce,
    fee,
    responseTtl: isNaN(parseInt(responseTtl))
      ? responseTtl
      : BUILD_ORACLE_TTL(responseTtl),
  });
  if (waitMined) {
    printTransaction(queryResponse, json);
  } else {
    print('Transaction send to the chain. Tx hash: ', queryResponse);
  }
}

// ## Get oracle
export async function queryOracle(oracleId, options) {
  decode(oracleId, 'ok');
  const sdk = await initSdk(options);
  const oracle = await sdk.api.getOracleByPubkey(oracleId);
  const { oracleQueries: queries } = await sdk.api.getOracleQueriesByPubkey(oracleId);
  if (options.json) {
    print({ ...oracle, queries });
  } else {
    printOracle(oracle, options.json);
    printQueries(queries, options.json);
  }
}
