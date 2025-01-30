import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { executeProgram, getSdk } from './index.js';
import { expectToMatchLines } from './utils.js';

const executeChain = executeProgram.bind(null, 'chain');

describe('Chain Module', () => {
  let aeSdk;

  before(async () => {
    aeSdk = await getSdk();
    for (let i = 0; i < 5; i += 1) {
      await aeSdk.spend(0, aeSdk.address);
    }
  });

  it('prints top', async () => {
    const resJson = await executeChain('top', '--json');
    expect(resJson.hash).to.be.a('string');
    expect(resJson.height).to.be.a('number');

    const res = await executeChain('top');
    expectToMatchLines(res, [
      `<<--------------- ${resJson.hash.startsWith('mh_') ? 'MicroBlock' : 'KeyBlock'} --------------->>`,
      `Block hash               ${resJson.hash}`,
      `Block height             ${resJson.height}`,
      `State hash               ${resJson.stateHash}`,
      `Nonce                    ${resJson.nonce ?? 'N/A'}`,
      `Miner                    ${resJson.miner ?? 'N/A'}`,
      `Time                     ${new Date(resJson.time).toString()}`,
      `Previous block hash      ${resJson.prevHash}`,
      `Previous key block hash  ${resJson.prevKeyHash}`,
      `Version                  6`,
      `Target                   ${resJson.target ?? 'N/A'}`,
      `Transactions             0`,
    ]);
  });

  it('prints status', async () => {
    const resJson = await executeChain('status', '--json');
    expect(resJson).to.eql({
      difficulty: resJson.difficulty,
      genesisKeyBlockHash: resJson.genesisKeyBlockHash,
      hashrate: 0,
      listening: true,
      networkId: 'ae_dev',
      nodeRevision: '57bc00b760dbb3ccd10be51f447e33cb3a2f56e3',
      nodeVersion: '7.3.0-rc3',
      peerConnections: { inbound: 0, outbound: 0 },
      peerCount: 0,
      peerPubkey: resJson.peerPubkey,
      pendingTransactionsCount: 0,
      protocols: [
        { effectiveAtHeight: 1, version: 6 },
        { effectiveAtHeight: 0, version: 1 },
      ],
      solutions: 0,
      syncProgress: 100,
      syncing: false,
      topBlockHeight: resJson.topBlockHeight,
      topKeyBlockHash: resJson.topKeyBlockHash,
      uptime: resJson.uptime,
    });

    const res = await executeChain('status');
    expectToMatchLines(res, [
      `Difficulty                  ${resJson.difficulty}`,
      `Node version                7.3.0-rc3`,
      `Consensus protocol version  6 (Ceres)`,
      `Node revision               57bc00b760dbb3ccd10be51f447e33cb3a2f56e3`,
      `Genesis hash                ${resJson.genesisKeyBlockHash}`,
      `Network ID                  ae_dev`,
      `Listening                   true`,
      `Peer count                  0`,
      `Pending transactions count  0`,
      `Solutions                   0`,
      `Syncing                     false`,
    ]);
  });

  it('plays by limit', async () => {
    const res = await executeChain('play', '--limit', '4');
    const blockCount = (output) => (output.match(/(Key|Micro)Block/g) || []).length;
    expect(blockCount(res)).to.be.equal(4);
  });

  it('plays by height', async () => {
    const res = await executeChain('play', '--height', (await aeSdk.getHeight()) - 4);
    const heights = res
      .split('\n')
      .filter((l) => l.includes('Block height'))
      .map((l) => +l.split(' ').at(-1));
    expect(new Set(heights).size).to.be.equal(5);
  });

  it('calculates ttl', async () => {
    const height = await aeSdk.getHeight();
    const resJson = await executeChain('ttl', 10, '--json');
    expect(resJson).to.eql({
      absoluteTtl: 10,
      relativeTtl: 10 - height,
    });

    const res = await executeChain('ttl', 10);
    expectToMatchLines(res, [`Absolute TTL  10`, `Relative TTL  ${resJson.relativeTtl}`]);
  });
});
