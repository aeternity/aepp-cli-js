import { verifyTransaction, ConsensusProtocolVersion } from '@aeternity/aepp-sdk';
import { initSdk } from '../utils/cli.js';
import {
  printBlock, print, printUnderscored, printTransaction, printValidation,
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
  printUnderscored('Difficulty', st.difficulty);
  printUnderscored('Node version', st.nodeVersion);
  printUnderscored('Consensus protocol version', `${consensusProtocolVersion} (${ConsensusProtocolVersion[consensusProtocolVersion]})`);
  printUnderscored('Node revision', st.nodeRevision);
  printUnderscored('Genesis hash', st.genesisKeyBlockHash);
  printUnderscored('Network ID', st.networkId);
  printUnderscored('Listening', st.listening);
  printUnderscored('Peer count', st.peerCount);
  printUnderscored('Pending transactions count', st.pendingTransactionsCount);
  printUnderscored('Solutions', st.solutions);
  printUnderscored('Syncing', st.syncing);
}

export async function ttl(_absoluteTtl, { json, ...options }) {
  const aeSdk = initSdk(options);
  const height = await aeSdk.getHeight();
  const absoluteTtl = +_absoluteTtl;
  const relativeTtl = absoluteTtl - height;
  if (json) {
    print({ absoluteTtl, relativeTtl });
  } else {
    printUnderscored('Absolute TTL', absoluteTtl);
    printUnderscored('Relative TTL', relativeTtl);
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
    block = await getBlock(block.prevHash, aeSdk); // eslint-disable-line no-await-in-loop
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
