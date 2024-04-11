// # Utils `helpers` Module
// That script contains base helper function

import BigNumber from 'bignumber.js';
import { resolve } from 'path';
import { Encoding, decode as _decode, produceNameId } from '@aeternity/aepp-sdk';
import CliError from './CliError.js';

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

// Get `name` entry
export async function getNameEntry(nameAsString, sdk) {
  const handle404 = (error) => {
    if (error.response?.status === 404) return undefined;
    throw error;
  };
  const [name, auction] = await Promise.all([
    sdk.api.getNameEntryByName(nameAsString).catch(handle404),
    sdk.api.getAuctionEntryByName(nameAsString).catch(handle404),
  ]);
  return {
    id: produceNameId(nameAsString),
    ...name ?? auction,
    status: (name && 'CLAIMED') || (auction && 'AUCTION') || 'AVAILABLE',
  };
}

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

const units = [
  ['year', 365 * 24 * 60 * 60 * 1000],
  ['month', 30.5 * 24 * 60 * 60 * 1000],
  ['day', 24 * 60 * 60 * 1000],
  ['hour', 60 * 60 * 1000],
  ['minute', 60 * 1000],
  ['second', 1000],
];

export function timeAgo(date) {
  const diff = Date.now() - date.getTime();
  // TODO: revisit linter settings, the below rule is not relevant because babel is not used
  // eslint-disable-next-line no-restricted-syntax
  for (const [name, size] of units) {
    const value = Math.floor(Math.abs(diff) / size);
    if (value > 0) {
      const plural = value > 1 ? 's' : '';
      const description = `${value} ${name}${plural}`;
      return diff > 0 ? `${description} ago` : `in ${description}`;
    }
  }
  return 'about now';
}

export const formatCoins = (coins) => `${new BigNumber(coins).shiftedBy(-18).toFixed()}ae`;

export const formatTtl = (ttl, height) => {
  const date = new Date();
  const diff = Math.abs(ttl - height) < 2 ? 0 : ttl - height;
  date.setMinutes(date.getMinutes() + diff * 3);
  return `${ttl} (${timeAgo(date)})`;
};
