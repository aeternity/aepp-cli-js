import { Encoding, ORACLE_TTL_TYPES, Oracle, OracleClient } from '@aeternity/aepp-sdk';
import { initSdkByWalletFile } from '../utils/cli.js';
import { decode } from '../utils/helpers.js';
import { printTransaction } from '../utils/print.js';
import CliError from '../utils/CliError.js';

function ensureTtlANumber(ttl, name) {
  if (isNaN(+ttl)) throw new CliError(`${name} TTL should be a number`);
}

async function getStateAndQueries(oracle, node) {
  const [state, { oracleQueries }] = await Promise.all([
    oracle.getState(),
    // TODO: replace with an Oracle method
    node.getOracleQueriesByPubkey(oracle.address),
  ]);
  return {
    ...state,
    queries: oracleQueries,
  };
}

export async function createOracle(walletPath, queryFormat, responseFormat, options) {
  const { ttl, fee, nonce, json, oracleTtl, queryFee } = options;

  ensureTtlANumber(oracleTtl, 'Oracle');
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  const context = aeSdk.getContext();
  const oracle = new Oracle(context.onAccount, context);
  const res = await oracle.register(queryFormat, responseFormat, {
    ttl,
    nonce,
    fee,
    oracleTtlType: ORACLE_TTL_TYPES.delta,
    oracleTtlValue: oracleTtl,
    queryFee,
  });
  Object.assign(res, await getStateAndQueries(oracle, aeSdk.api));
  await printTransaction(res, json, aeSdk);
}

export async function extendOracle(walletPath, oracleTtl, options) {
  const { ttl, fee, nonce, json } = options;

  ensureTtlANumber(oracleTtl, 'Oracle');
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  const context = aeSdk.getContext();
  const oracle = new Oracle(context.onAccount, context);
  const res = await oracle.extendTtl({
    ttl,
    nonce,
    fee,
    oracleTtlType: ORACLE_TTL_TYPES.delta,
    oracleTtlValue: oracleTtl,
  });
  Object.assign(res, await getStateAndQueries(oracle, aeSdk.api));
  await printTransaction(res, json, aeSdk);
}

export async function createOracleQuery(walletPath, oracleId, query, options) {
  const { ttl, fee, nonce, json, queryTtl, queryFee, responseTtl } = options;

  decode(oracleId, Encoding.OracleAddress);
  const aeSdk = await initSdkByWalletFile(walletPath, options);

  ensureTtlANumber(queryTtl, 'Query');
  ensureTtlANumber(responseTtl, 'Response');
  const oracle = new OracleClient(oracleId, aeSdk.getContext());
  const { queryId, ...res } = await oracle.postQuery(query, {
    ttl,
    nonce,
    fee,
    queryTtlType: ORACLE_TTL_TYPES.delta,
    queryTtlValue: queryTtl,
    responseTtlType: ORACLE_TTL_TYPES.delta,
    responseTtlValue: responseTtl,
    queryFee,
  });
  Object.assign(res, await oracle.getQuery(queryId));
  await printTransaction(res, json, aeSdk);
}

export async function respondToQuery(walletPath, queryId, response, options) {
  const { ttl, fee, nonce, json, responseTtl } = options;

  decode(queryId, Encoding.OracleQueryId);
  ensureTtlANumber(responseTtl, 'Response');
  const aeSdk = await initSdkByWalletFile(walletPath, options);

  const context = aeSdk.getContext();
  const oracle = new Oracle(context.onAccount, context);
  const res = await oracle.respondToQuery(queryId, response, {
    ttl,
    nonce,
    fee,
    responseTtlType: ORACLE_TTL_TYPES.delta,
    responseTtlValue: responseTtl,
  });
  Object.assign(res, await getStateAndQueries(oracle, aeSdk.api));
  await printTransaction(res, json, aeSdk);
}
