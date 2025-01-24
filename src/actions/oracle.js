import { Encoding, ORACLE_TTL_TYPES } from '@aeternity/aepp-sdk';
import { initSdkByWalletFile } from '../utils/cli.js';
import { decode } from '../utils/helpers.js';
import { printTransaction } from '../utils/print.js';
import CliError from '../utils/CliError.js';

function ensureTtlANumber(ttl, name) {
  if (isNaN(+ttl)) throw new CliError(`${name} TTL should be a number`);
}

export async function createOracle(walletPath, queryFormat, responseFormat, options) {
  const { ttl, fee, nonce, json, oracleTtl, queryFee } = options;

  ensureTtlANumber(oracleTtl, 'Oracle');
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  const oracle = await aeSdk.registerOracle(queryFormat, responseFormat, {
    ttl,
    nonce,
    fee,
    oracleTtlType: ORACLE_TTL_TYPES.delta,
    oracleTtlValue: oracleTtl,
    queryFee,
  });
  await printTransaction(oracle, json, aeSdk);
}

export async function extendOracle(walletPath, oracleTtl, options) {
  const { ttl, fee, nonce, json } = options;

  ensureTtlANumber(oracleTtl, 'Oracle');
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  const oracle = await aeSdk.getOracleObject(aeSdk.address.replace('ak_', 'ok_'));
  const extended = await oracle.extendOracle({
    ttl,
    nonce,
    fee,
    oracleTtlType: ORACLE_TTL_TYPES.delta,
    oracleTtlValue: oracleTtl,
  });
  await printTransaction(extended, json, aeSdk);
}

export async function createOracleQuery(walletPath, oracleId, query, options) {
  const { ttl, fee, nonce, json, queryTtl, queryFee, responseTtl } = options;

  decode(oracleId, Encoding.OracleAddress);
  const aeSdk = await initSdkByWalletFile(walletPath, options);

  ensureTtlANumber(queryTtl, 'Query');
  ensureTtlANumber(responseTtl, 'Response');
  const oracle = await aeSdk.getOracleObject(oracleId);
  const oracleQuery = await oracle.postQuery(query, {
    ttl,
    nonce,
    fee,
    queryTtlType: ORACLE_TTL_TYPES.delta,
    queryTtlValue: queryTtl,
    responseTtlType: ORACLE_TTL_TYPES.delta,
    responseTtlValue: responseTtl,
    queryFee,
  });
  await printTransaction(oracleQuery, json, aeSdk);
}

export async function respondToQuery(walletPath, queryId, response, options) {
  const { ttl, fee, nonce, json, responseTtl } = options;

  decode(queryId, Encoding.OracleQueryId);
  ensureTtlANumber(responseTtl, 'Response');
  const aeSdk = await initSdkByWalletFile(walletPath, options);

  const oracle = await aeSdk.getOracleObject(aeSdk.address.replace('ak_', 'ok_'));
  const queryResponse = await oracle.respondToQuery(queryId, response, {
    ttl,
    nonce,
    fee,
    responseTtlType: ORACLE_TTL_TYPES.delta,
    responseTtlValue: responseTtl,
  });
  await printTransaction(queryResponse, json, aeSdk);
}
