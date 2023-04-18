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

import { verifyTransaction, ConsensusProtocolVersion } from '@aeternity/aepp-sdk';
import { initSdk } from '../utils/cli';
import {
  printBlock, print, printUnderscored, printTransaction, printValidation,
} from '../utils/print';
import { getBlock } from '../utils/helpers';

// ## Retrieve `node` version
export async function version(options) {
  const { json } = options;
  // Initialize `Ae`
  const sdk = initSdk(options);
  // Call `getStatus` API and print it
  const status = await sdk.api.getStatus();
  const { consensusProtocolVersion } = await sdk.getNodeInfo();
  if (json) {
    print(status);
    return;
  }
  printUnderscored('Difficulty', status.difficulty);
  printUnderscored('Node version', status.nodeVersion);
  printUnderscored('Consensus protocol version', `${consensusProtocolVersion} (${ConsensusProtocolVersion[consensusProtocolVersion]})`);
  printUnderscored('Node revision', status.nodeRevision);
  printUnderscored('Genesis hash', status.genesisKeyBlockHash);
  printUnderscored('Network ID', status.networkId);
  printUnderscored('Listening', status.listening);
  printUnderscored('Peer count', status.peerCount);
  printUnderscored('Pending transactions count', status.pendingTransactionsCount);
  printUnderscored('Solutions', status.solutions);
  printUnderscored('Syncing', status.syncing);
}

// ## Retrieve `node` version
export async function getNetworkId(options) {
  const { json } = options;
  // Initialize `Ae`
  const sdk = initSdk(options);
  // Call `getStatus` API and print it
  const { networkId } = await sdk.api.getStatus();
  if (json) print({ networkId });
  else printUnderscored('Network ID', networkId);
}

// ## Retrieve `ttl` version
export async function ttl(_absoluteTtl, { json, ...options }) {
  // Initialize `Ae`
  const sdk = initSdk(options);
  const height = await sdk.getHeight();
  const absoluteTtl = +_absoluteTtl;
  const relativeTtl = absoluteTtl - height;
  if (json) {
    print({ absoluteTtl, relativeTtl });
  } else {
    printUnderscored('Absolute TTL', absoluteTtl);
    printUnderscored('Relative TTL', relativeTtl);
  }
}

// ## Retrieve `TOP` block
export async function top({ json, ...options }) {
  // Initialize `Ae`
  const sdk = initSdk(options);
  // Call `getTopBlock` API and print it
  printBlock(await sdk.api.getTopHeader(), json, true);
}

// ## This function `Play` (print all block) from `top` block to some condition (reach some `height` or `limit`)
export async function play(options) {
  let { height, limit, json } = options;
  limit = +limit;
  height = +height;
  const sdk = initSdk(options);

  // Get top block from `node`. It is a start point for play.
  let block = await sdk.api.getTopHeader();

  // Play by `height` or by `limit` using `top` block as start point
  while (height ? block.height >= height : limit) {
    if (!height) limit -= 1;
    printBlock(block, json);
    block = await getBlock(block.prevHash, sdk); // eslint-disable-line no-await-in-loop
  }
}

// ## Send 'transaction' to the chain
export async function broadcast(signedTx, options) {
  const { json, waitMined, verify } = options;
  // Initialize `Ae`
  const sdk = initSdk(options);

  if (verify) {
    const validation = await verifyTransaction(signedTx, sdk.api);
    if (validation.length) {
      printValidation({ validation, transaction: signedTx });
      return;
    }
  }

  const { txHash } = await sdk.api.postTransaction({ tx: signedTx });
  const tx = await (waitMined ? sdk.poll(txHash) : sdk.api.getTransactionByHash(txHash));

  printTransaction(tx, json);
  if (!waitMined && !json) print('Transaction send to the chain.');
}
