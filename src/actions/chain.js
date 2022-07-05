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

import { initSdk } from '../utils/cli';
import {
  printBlock, print, printUnderscored, printTransaction, printValidation,
} from '../utils/print';
import { getBlock } from '../utils/helpers';
import CliError from '../utils/CliError';

// ## Retrieve `node` version
export async function version(options) {
  const { json } = options;
  // Initialize `Ae`
  const sdk = await initSdk(options);
  // Call `getStatus` API and print it
  const status = await sdk.api.getStatus();
  const { consensusProtocolVersion } = sdk.getNodeInfo();
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
  const sdk = await initSdk(options);
  // Call `getStatus` API and print it
  const { networkId } = await sdk.api.getStatus();
  if (json) print({ networkId });
  else printUnderscored('Network ID', networkId);
}

// ## Retrieve `ttl` version
export async function ttl(absoluteTtl, options) {
  const { json } = options;
  // Initialize `Ae`
  const sdk = await initSdk(options);
  const height = await sdk.height();
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
  const sdk = await initSdk(options);
  // Call `getTopBlock` API and print it
  printBlock(await sdk.api.getTopHeader(), json);
}

// # Play by `limit`
async function playWithLimit(limit, blockHash, sdk, json) {
  if (!limit) return;
  const block = await getBlock(blockHash, sdk);

  await new Promise((resolve) => { setTimeout(resolve, 1000); });
  printBlock(block, json);
  await playWithLimit(limit - 1, block.prevHash, sdk, json);
}

// # Play by `height`
async function playWithHeight(height, blockHash, sdk, json) {
  const block = await getBlock(blockHash, sdk);
  if (parseInt(block.height) < height) return;

  await new Promise((resolve) => { setTimeout(resolve, 1000); });
  printBlock(block, json);
  await playWithHeight(height, block.prevHash, sdk, json);
}

// ## This function `Play`(print all block) from `top` block to some condition(reach some `height` or `limit`)
export async function play(options) {
  let { height, limit, json } = options;
  limit = parseInt(limit);
  height = parseInt(height);
  const sdk = await initSdk(options);

  // Get top block from `node`. It is a start point for play.
  const topHeader = await sdk.api.getTopHeader();

  if (height && height > parseInt(topHeader.height)) {
    throw new CliError('Height is bigger then height of top block');
  }

  printBlock(topHeader, json);

  // Play by `height` or by `limit` using `top` block as start point
  if (height) await playWithHeight(height, topHeader.prevHash, sdk, json);
  else await playWithLimit(limit - 1, topHeader.prevHash, sdk, json);
}

// ## Send 'transaction' to the chain
export async function broadcast(signedTx, options) {
  const { json, waitMined, verify } = options;
  // Initialize `Ae`
  const sdk = await initSdk(options);
  // Call `getStatus` API and print it
  try {
    const tx = await sdk.sendTransaction(signedTx, { waitMined: !!waitMined, verify: !!verify });
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
