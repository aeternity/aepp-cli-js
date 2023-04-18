import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { executeProgram, getSdk } from './index';
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
<<--------------- ${resJson.hash.startsWith('mh_') ? 'MicroBlock' : 'KeyBlock'} --------------->>
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

  it('plays by limit', async () => {
    const res = await executeChain(['play', '--limit', '4']);
    const blockCount = (output) => (output.match(/(Key|Micro)Block/g) || []).length;
    expect(blockCount(res)).to.be.equal(4);
  });

  it('plays by height', async () => {
    const res = await executeChain(['play', '--height', await sdk.getHeight() - 4]);
    const heights = res
      .split('\n')
      .filter((l) => l.includes('Block height'))
      .map((l) => +l.split(' ').at(-1));
    expect(new Set(heights).size).to.be.equal(5);
  });

  it('calculates ttl', async () => {
    const height = await sdk.getHeight();
    const resJson = await executeChain(['ttl', 10, '--json']);
    expect(resJson).to.eql({
      absoluteTtl: 10,
      relativeTtl: 10 - height,
    });

    const res = await executeChain(['ttl', 10]);
    expect(res).to.equal(`
Absolute TTL ____________________________ 10
Relative TTL ____________________________ ${resJson.relativeTtl}
    `.trim());
  });

  it('prints network id', async () => {
    const nodeNetworkId = await sdk.api.getNetworkId();
    const { networkId } = await executeChain(['network_id', '--json']);
    nodeNetworkId.should.equal(networkId);
  });
});
