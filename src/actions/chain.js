import { verifyTransaction, ConsensusProtocolVersion } from '@aeternity/aepp-sdk';
import { initSdk } from '../utils/cli.js';
import {
  printBlock,
  print,
  printTransaction,
  printValidation,
  printTable,
} from '../utils/print.js';
import { getBlock } from '../utils/helpers.js';

export async function status(options) {
  const { json } = options;
  const aeSdk = initSdk(options);
  const st = await aeSdk.api.getStatus();
  const { consensusProtocolVersion } = await aeSdk.getNodeInfo();
  if (json) {
    print(st);
    return;
  }
  printTable([
    ['Difficulty', st.difficulty],
    ['Node version', st.nodeVersion],
    [
      'Consensus protocol version',
      `${consensusProtocolVersion} (${ConsensusProtocolVersion[consensusProtocolVersion]})`,
    ],
    ['Node revision', st.nodeRevision],
    ['Genesis hash', st.genesisKeyBlockHash],
    ['Network ID', st.networkId],
    ['Listening', st.listening],
    ['Peer count', st.peerCount],
    ['Pending transactions count', st.pendingTransactionsCount],
    ['Solutions', st.solutions],
    ['Syncing', st.syncing],
  ]);
}

export async function ttl(_absoluteTtl, { json, ...options }) {
  const aeSdk = initSdk(options);
  const height = await aeSdk.getHeight();
  const absoluteTtl = +_absoluteTtl;
  const relativeTtl = absoluteTtl - height;
  if (json) {
    print({ absoluteTtl, relativeTtl });
  } else {
    printTable([
      ['Absolute TTL', absoluteTtl],
      ['Relative TTL', relativeTtl],
    ]);
  }
}

export async function top({ json, ...options }) {
  const aeSdk = initSdk(options);
  printBlock(await aeSdk.api.getTopHeader(), json, true);
}

export async function play(options) {
  let { height, limit, json } = options;
  limit = +limit;
  height = +height;
  const aeSdk = initSdk(options);
  let block = await aeSdk.api.getTopHeader();
  while (height ? block.height >= height : limit) {
    if (!height) limit -= 1;
    printBlock(block, json);
    block = await getBlock(block.prevHash, aeSdk);
  }
}

export async function broadcast(signedTx, options) {
  const { json, waitMined, verify } = options;
  const aeSdk = initSdk(options);

  if (verify) {
    const validation = await verifyTransaction(signedTx, aeSdk.api);
    if (validation.length) {
      printValidation({ validation, transaction: signedTx });
      return;
    }
  }

  const { txHash } = await aeSdk.api.postTransaction({ tx: signedTx });
  const tx = await (waitMined ? aeSdk.poll(txHash) : aeSdk.api.getTransactionByHash(txHash));

  await printTransaction(tx, json, aeSdk);
  if (!waitMined && !json) print('Transaction send to the chain.');
}
