// # æternity CLI `contract` file
//
// This script initialize all `contract` function

import { ORACLE_TTL_TYPES } from '@aeternity/aepp-sdk';
import { initSdk, initSdkByWalletFile } from '../utils/cli';
import { decode } from '../utils/helpers';
import {
  print, printOracle, printQueries, printTransaction,
} from '../utils/print';
import CliError from '../utils/CliError';

function ensureTtlANumber(ttl, name) {
  if (isNaN(+ttl)) throw new CliError(`${name} TTL should be a number`);
}

// ## Create Oracle
export async function createOracle(walletPath, queryFormat, responseFormat, options) {
  const {
    ttl, fee, nonce, waitMined, json, oracleTtl, queryFee,
  } = options;

  ensureTtlANumber(oracleTtl, 'Oracle');
  const sdk = await initSdkByWalletFile(walletPath, options);
  // Register Oracle
  const oracle = await sdk.registerOracle(queryFormat, responseFormat, {
    ttl,
    waitMined,
    nonce,
    fee,
    ...oracleTtl && {
      oracleTtlType: ORACLE_TTL_TYPES.delta,
      oracleTtlValue: oracleTtl,
    },
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

  ensureTtlANumber(oracleTtl, 'Oracle');
  decode(oracleId, 'ok');
  const sdk = await initSdkByWalletFile(walletPath, options);
  const oracle = await sdk.getOracleObject(oracleId);
  const extended = await oracle.extendOracle({
    ttl,
    waitMined,
    nonce,
    fee,
    ...oracleTtl && {
      oracleTtlType: ORACLE_TTL_TYPES.delta,
      oracleTtlValue: oracleTtl,
    },
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
    ttl, fee, nonce, waitMined, json, queryTtl, queryFee, responseTtl,
  } = options;

  decode(oracleId, 'ok');
  const sdk = await initSdkByWalletFile(walletPath, options);

  ensureTtlANumber(queryTtl, 'Query');
  ensureTtlANumber(responseTtl, 'Response');
  const oracle = await sdk.getOracleObject(oracleId);
  const oracleQuery = await oracle.postQuery(query, {
    ttl,
    waitMined,
    nonce,
    fee,
    ...queryTtl && {
      queryTtlType: ORACLE_TTL_TYPES.delta,
      queryTtlValue: queryTtl,
    },
    ...responseTtl && {
      responseTtlType: ORACLE_TTL_TYPES.delta,
      responseTtlValue: responseTtl,
    },
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
  ensureTtlANumber(responseTtl, 'Response');
  const sdk = await initSdkByWalletFile(walletPath, options);

  const oracle = await sdk.getOracleObject(oracleId);
  const queryResponse = await oracle.respondToQuery(queryId, response, {
    ttl,
    waitMined,
    nonce,
    fee,
    ...responseTtl && {
      responseTtlType: ORACLE_TTL_TYPES.delta,
      responseTtlValue: responseTtl,
    },
  });
  if (waitMined) {
    printTransaction(queryResponse, json);
  } else {
    print('Transaction send to the chain. Tx hash: ', queryResponse);
  }
}

// ## Get oracle
export async function queryOracle(oracleId, { json, ...options }) {
  decode(oracleId, 'ok');
  const sdk = initSdk(options);
  const oracle = await sdk.api.getOracleByPubkey(oracleId);
  const { oracleQueries: queries } = await sdk.api.getOracleQueriesByPubkey(oracleId);
  if (json) print({ ...oracle, queries });
  else {
    printOracle(oracle, json);
    printQueries(queries, json);
  }
}
