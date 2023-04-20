// # Utils `helpers` Module
// That script contains base helper function

import { resolve } from 'path';
import { Encoding, decode as _decode } from '@aeternity/aepp-sdk';
import CliError from './CliError';

// ## Method which retrieve block info by hash
// if it's `MICRO_BLOCK` call `getMicroBlockHeaderByHash` and `getMicroBlockTransactionsByHash`
//
// if it's `BLOCK` call `getKeyBlockByHash`
export async function getBlock(hash, sdk) {
  const type = hash.split('_')[0];
  switch (type) {
    case Encoding.KeyBlockHash:
      return sdk.api.getKeyBlockByHash(hash);
    case Encoding.MicroBlockHash:
      return {
        ...await sdk.api.getMicroBlockHeaderByHash(hash),
        ...await sdk.api.getMicroBlockTransactionsByHash(hash),
      };
    default:
      throw new CliError(`Unknown block hash type: ${type}`);
  }
}

// ## Method which validate `hash`
// TODO: move to sdk side (combine with decode)
export function checkPref(hash, hashType) {
  if (hash.length < 3 || hash.indexOf('_') === -1) {
    throw new CliError('Invalid input, likely you forgot to escape the $ sign (use \\_)');
  }

  /* block and micro block check */
  if (Array.isArray(hashType)) {
    const res = hashType.find((ht) => hash.startsWith(`${ht}_`));
    if (res) return;
    throw new CliError('Invalid block hash, it should be like: mh_.... or kh._...');
  }

  if (!hash.startsWith(`${hashType}_`)) {
    const msg = {
      [Encoding.TxHash]: 'Invalid transaction hash, it should be like: th_....',
      [Encoding.AccountAddress]: 'Invalid account address, it should be like: ak_....',
    }[hashType] || `Invalid hash, it should be like: ${hashType}_....`;
    throw new CliError(msg);
  }
}

// ## AENS helpers methods

// Get `name` status
export async function updateNameStatus(name, sdk) {
  try {
    return { ...await sdk.getName(name), status: 'CLAIMED' };
  } catch (e) {
    if (e.response && e.response.status === 404) {
      return { name, status: 'AVAILABLE' };
    }
    throw e;
  }
}

// Check if `name` is `AVAILABLE`
export function isAvailable(name) { return name.status === 'AVAILABLE'; }

// Validate `name`
export function validateName(name) {
  if (typeof name !== 'string') throw new CliError('Name must be a string');
  if (!name.endsWith('.chain')) throw new CliError(`Name should end with .chain: ${name}`);
}

export function decode(data, requiredPrefix) {
  if (typeof data !== 'string') throw new CliError('Data must be a string');
  const prefix = data.split('_')[0];
  if (prefix !== requiredPrefix) {
    throw new CliError(`Encoded string have a wrong type: ${prefix} (expected: ${requiredPrefix})`);
  }
  return _decode(data);
}

export const getFullPath = (path) => resolve(process.cwd(), path);
