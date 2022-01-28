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

import { initChain } from '../utils/cli';
import {
  printBlock, print, printUnderscored, printTransaction, printValidation,
} from '../utils/print';
import { getBlock } from '../utils/helpers';

// ## Retrieve `node` version
export async function version(options) {
  const { json } = options;
  // Initialize `Ae`
  const client = await initChain(options);
  // Call `getStatus` API and print it
  const status = await client.api.getStatus();
  const { consensusProtocolVersion } = client.getNodeInfo();
  if (json) {
    print(status);
    return;
  }
  const FORKS = {
    3: 'Fortuna',
    4: 'Lima',
    5: 'Iris',
  };
  printUnderscored('Difficulty', status.difficulty);
  printUnderscored('Node version', status.nodeVersion);
  printUnderscored('Consensus protocol version', `${consensusProtocolVersion} (${FORKS[consensusProtocolVersion]})`);
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
  const client = await initChain(options);
  // Call `getStatus` API and print it
  const { networkId } = await client.api.getStatus();
  if (json) print({ networkId });
  else printUnderscored('Network ID', networkId);
}

// ## Retrieve `ttl` version
export async function ttl(absoluteTtl, options) {
  const { json } = options;
  // Initialize `Ae`
  const client = await initChain(options);
  // Call `topBlock` API and calculate relative `ttl`
  const height = await client.height();
  if (json) {
    print({ absoluteTtl, relativeTtl: +height + +absoluteTtl });
  } else {
    printUnderscored('Absolute TTL', absoluteTtl);
    printUnderscored('Relative TTL', +height + +absoluteTtl);
  }
}

// ## Retrieve `TOP` block
export async function top(options) {
  const { json } = options;
  // Initialize `Ae`
  const client = await initChain(options);
  // Call `getTopBlock` API and print it
  printBlock(await client.topBlock(), json);
}

// # Play by `limit`
async function playWithLimit(limit, blockHash, client, json) {
  if (!limit) return;
  const block = await getBlock(blockHash, client);

  await new Promise((resolve) => { setTimeout(resolve, 1000); });
  printBlock(block, json);
  await playWithLimit(limit - 1, block.prevHash, client, json);
}

// # Play by `height`
async function playWithHeight(height, blockHash, client, json) {
  const block = await getBlock(blockHash, client);
  if (parseInt(block.height) < height) return;

  await new Promise((resolve) => { setTimeout(resolve, 1000); });
  printBlock(block, json);
  await playWithHeight(height, block.prevHash, client, json);
}

// ## This function `Play`(print all block) from `top` block to some condition(reach some `height` or `limit`)
export async function play(options) {
  let { height, limit, json } = options;
  limit = parseInt(limit);
  height = parseInt(height);
  const client = await initChain(options);

  // Get top block from `node`. It is a start point for play.
  const topBlock = await client.topBlock();

  if (height && height > parseInt(topBlock.height)) {
    throw new Error('Height is bigger then height of top block');
  }

  printBlock(topBlock, json);

  // Play by `height` or by `limit` using `top` block as start point
  if (height) await playWithHeight(height, topBlock.prevHash, client, json);
  else await playWithLimit(limit - 1, topBlock.prevHash, client, json);
}

// ## Send 'transaction' to the chain
export async function broadcast(signedTx, options) {
  const { json, waitMined, verify } = options;
  // Initialize `Ae`
  const client = await initChain(options);
  // Call `getStatus` API and print it
  try {
    const tx = await client.sendTransaction(signedTx, { waitMined: !!waitMined, verify: !!verify });
    if (waitMined) printTransaction(tx, json);
    else print(`Transaction send to the chain. Tx hash: ${tx.hash}`);
  } catch (e) {
    if (e.verifyTx) {
      const validation = await e.verifyTx();
      if (validation.length) {
        printValidation({ validation, transaction: signedTx });
        return;
      }
    }
    if (e.code === 'TX_VERIFICATION_ERROR') {
      printValidation(e);
      return;
    }
    throw e;
  }
}
