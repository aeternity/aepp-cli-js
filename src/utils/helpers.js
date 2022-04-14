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
// # Utils `helpers` Module
// That script contains base helper function

import fs from 'fs';
import { TxBuilderHelper } from '@aeternity/aepp-sdk';
import { HASH_TYPES } from './constant';

export function readFile(filePath, encoding = null) {
  try {
    return fs.readFileSync(
      filePath,
      encoding,
    );
  } catch (e) {
    switch (e.code) {
      case 'ENOENT':
        throw new Error('File not found');
      default:
        throw e;
    }
  }
}

export function readJSONFile(filePath) {
  return JSON.parse(readFile(filePath));
}

// ## Method which retrieve block info by hash
// if it's `MICRO_BLOCK` call `getMicroBlockHeaderByHash` and `getMicroBlockTransactionsByHash`
//
// if it's `BLOCK` call `getKeyBlockByHash`
export async function getBlock(hash, client) {
  const type = hash.split('_')[0];
  switch (type) {
    case HASH_TYPES.block:
      return client.api.getKeyBlockByHash(hash);
    case HASH_TYPES.micro_block:
      return {
        ...await client.api.getMicroBlockHeaderByHash(hash),
        ...await client.api.getMicroBlockTransactionsByHash(hash),
      };
    default:
      throw new Error(`Unknown block hash type: ${type}`);
  }
}

// ## Method which validate `hash`
export function checkPref(hash, hashType) {
  if (hash.length < 3 || hash.indexOf('_') === -1) {
    throw new Error('Invalid input, likely you forgot to escape the $ sign (use \\_)');
  }

  /* block and micro block check */
  if (Array.isArray(hashType)) {
    const res = hashType.find((ht) => hash.slice(0, 3) === `${ht}_`);
    if (res) return;
    throw new Error('Invalid block hash, it should be like: mh_.... or kh._...');
  }

  if (hash.slice(0, 3) !== `${hashType}_`) {
    const msg = {
      [HASH_TYPES.transaction]: 'Invalid transaction hash, it should be like: th_....',
      [HASH_TYPES.account]: 'Invalid account address, it should be like: ak_....',
    }[hashType] || `Invalid hash, it should be like: ${hashType}_....`;
    throw new Error(msg);
  }
}

// ## AENS helpers methods

// Get `name` status
export async function updateNameStatus(name, client) {
  try {
    return { ...await client.getName(name), status: 'CLAIMED' };
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
  TxBuilderHelper.ensureNameValid(name);
}
