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

import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { executeProgram, parseBlock, getSdk } from './index';
import chainProgram from '../src/commands/chain';

const executeChain = (args) => executeProgram(chainProgram, args);

describe('Chain Module', () => {
  let sdk;

  before(async () => {
    sdk = await getSdk();
  });

  it('prints top', async () => {
    const resJson = await executeChain(['top', '--json']);
    expect(resJson.hash).to.be.a('string');
    expect(resJson.height).to.be.a('number');

    const res = await executeChain(['top']);
    expect(res).to.equal(`
<<--------------- ${resJson.hash.startsWith('mh_') ? 'MicroBlockHash' : 'KeyBlockHash'} --------------->>
Block hash ______________________________ ${resJson.hash}
Block height ____________________________ ${resJson.height}
State hash ______________________________ ${resJson.stateHash}
Nonce ___________________________________ ${resJson.nonce ?? 'N/A'}
Miner ___________________________________ ${resJson.miner ?? 'N/A'}
Time ____________________________________ ${new Date(resJson.time).toString()}
Previous block hash _____________________ ${resJson.prevHash}
Previous key block hash _________________ ${resJson.prevKeyHash}
Version _________________________________ 5
Target __________________________________ ${resJson.target ?? 'N/A'}
Transactions ____________________________ 0
<<------------------------------------->>
    `.trim());
  });

  it('prints status', async () => {
    const resJson = await executeChain(['status', '--json']);
    expect(resJson).to.eql({
      difficulty: resJson.difficulty,
      genesisKeyBlockHash: resJson.genesisKeyBlockHash,
      listening: true,
      networkId: 'ae_devnet',
      nodeRevision: 'a42c1b1e84dabdad350005213a2a9334113a6832',
      nodeVersion: '6.8.1',
      peerConnections: { inbound: 0, outbound: 0 },
      peerCount: 0,
      peerPubkey: resJson.peerPubkey,
      pendingTransactionsCount: 0,
      protocols: [{ effectiveAtHeight: 1, version: 5 }, { effectiveAtHeight: 0, version: 1 }],
      solutions: 0,
      syncProgress: 100,
      syncing: false,
      topBlockHeight: resJson.topBlockHeight,
      topKeyBlockHash: resJson.topKeyBlockHash,
    });

    const res = await executeChain(['status']);
    expect(res).to.equal(`
Difficulty ______________________________ ${resJson.difficulty}
Node version ____________________________ 6.8.1
Consensus protocol version ______________ 5 (Iris)
Node revision ___________________________ a42c1b1e84dabdad350005213a2a9334113a6832
Genesis hash ____________________________ ${resJson.genesisKeyBlockHash}
Network ID ______________________________ ae_devnet
Listening _______________________________ true
Peer count ______________________________ 0
Pending transactions count ______________ 0
Solutions _______________________________ 0
Syncing _________________________________ false
    `.trim());
  });

  it('plays', async () => {
    const res = await executeChain(['play', '--limit', '4']);
    res.split('<<------------------------------------->>').length.should.equal(5);

    const parsed = res.split('<<------------------------------------->>').map(parseBlock);
    parsed[0].previousBlockHash.should.equal(parsed[1].blockHash);
    parsed[1].previousBlockHash.should.equal(parsed[2].blockHash);
    parsed[2].previousBlockHash.should.equal(parsed[3].blockHash);
  }).timeout(10000);

  it('calculates ttl', async () => {
    const { relativeTtl } = await executeChain(['ttl', 10, '--json']);
    const height = await sdk.getHeight();
    const isValid = [relativeTtl + 1, relativeTtl, relativeTtl - 1].includes(height + 10);
    isValid.should.equal(true);
  });

  it('prints network id', async () => {
    const nodeNetworkId = await sdk.api.getNetworkId();
    const { networkId } = await executeChain(['network_id', '--json']);
    nodeNetworkId.should.equal(networkId);
  });
});
