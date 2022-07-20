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
import { executeProgram, parseBlock, getSdk } from './index';
import chainProgram from '../src/commands/chain';

const executeChain = (args) => executeProgram(chainProgram, args);

describe('Chain Module', () => {
  let sdk;

  before(async () => {
    sdk = await getSdk();
  });

  it('TOP', async () => {
    const res = await executeChain(['top', '--json']);
    res.should.be.a('object');
    res.hash.should.be.a('string');
    res.height.should.be.a('number');
  });

  it('STATUS', async () => {
    const res = await executeChain(['status', '--json']);
    res.nodeVersion.should.equal((await sdk.api.getStatus()).nodeVersion);
  });

  it('PLAY', async () => {
    const res = await executeChain(['play', '--limit', '4']);
    res.split('<<------------------------------------->>').length.should.equal(5);

    const parsed = res.split('<<------------------------------------->>').map(parseBlock);
    parsed[0].previousBlockHash.should.equal(parsed[1].blockHash);
    parsed[1].previousBlockHash.should.equal(parsed[2].blockHash);
    parsed[2].previousBlockHash.should.equal(parsed[3].blockHash);
  }).timeout(10000);

  it('TTL', async () => {
    const { relativeTtl } = await executeChain(['ttl', 10, '--json']);
    const height = await sdk.height();
    const isValid = [relativeTtl + 1, relativeTtl, relativeTtl - 1].includes(height + 10);
    isValid.should.equal(true);
  });

  it('NETWORK ID', async () => {
    const nodeNetworkId = await sdk.getNetworkId();
    const { networkId } = await executeChain(['network_id', '--json']);
    nodeNetworkId.should.equal(networkId);
  });
});
