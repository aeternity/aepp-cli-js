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

import { before, describe, it } from 'mocha'
import { configure, BaseAe, executeProgram, parseBlock, ready, genAccount } from './index'
import chainProgramFactory from '../../bin/commands/chain'

const executeChain = args => executeProgram(chainProgramFactory, args)

describe('CLI Chain Module', function () {
  let wallet
  configure(this)

  before(async function () {
    // Spend tokens for wallet
    wallet = await ready(this)
  })
  it('TOP', async () => {
    const res = await executeChain(['top', '--json'])
    res.should.be.a('object')
    res.hash.should.be.a('string')
    res.height.should.be.a('number')
  })
  it('STATUS', async () => {
    const wallet = await BaseAe()
    await wallet.addAccount(genAccount(), { select: true })

    const { nodeVersion } = await wallet.api.getStatus()
    const res = await executeChain(['status', '--json'])
    res.nodeVersion.should.equal(nodeVersion)
  })
  it('PLAY', async () => {
    const res = await executeChain(['play', '--limit', '4'])
    res.split('<<------------------------------------->>').length.should.equal(5)

    const parsed = res.split('<<------------------------------------->>').map(parseBlock)
    parsed[0].previous_block_hash_.should.equal(parsed[1].block_hash_)
    parsed[1].previous_block_hash_.should.equal(parsed[2].block_hash_)
    parsed[2].previous_block_hash_.should.equal(parsed[3].block_hash_)
  })
  it('TTL', async () => {
    const { relativeTtl } = await executeChain(['ttl', 10, '--json'])
    const height = await wallet.height()
    const isValid = [relativeTtl + 1, relativeTtl, relativeTtl - 1].includes(height + 10)
    isValid.should.equal(true)
  })
  it('NETWORK ID', async () => {
    const nodeNetworkId = wallet.getNetworkId()
    const { networkId } = await executeChain(['network_id', '--json'])
    nodeNetworkId.should.equal(networkId)
  })
})
