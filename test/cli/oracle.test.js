/*
 * ISC License (ISC)
 * Copyright (c) 2021 aeternity developers
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

import { configure, plan, ready, execute as exec, WALLET_NAME } from './index'
import { Crypto } from '@aeternity/aepp-sdk'

plan(10000000000000)

const execute = (arg) => exec(arg, { withNetworkId: true })

describe('CLI Oracle Module', function () {
  configure(this)
  const oracleFormat = 'string'
  const responseFormat = 'string'
  let wallet
  let oracleId
  let queryId

  before(async function () {
    // Spend tokens for wallet
    wallet = await ready(this)
  })

  it('Oracle create', async () => {
    const oracleCreate = JSON.parse(await execute([
      'oracle', 'create', WALLET_NAME, '--password', 'test', oracleFormat, responseFormat, '--json'
    ]))
    oracleCreate.blockHeight.should.be.gt(0)
    oracleCreate.queryFormat.should.be.equal(oracleFormat)
    oracleCreate.responseFormat.should.be.equal(responseFormat)
    oracleId = oracleCreate.id
  })

  it('Oracle extend', async () => {
    const oracle = await wallet.getOracleObject(oracleId)
    const oracleExtend = JSON.parse(await execute([
      'oracle', 'extend', WALLET_NAME, '--password', 'test', oracleId, 100, '--json'
    ]))
    oracleExtend.blockHeight.should.be.gt(0)
    oracleExtend.ttl.should.be.gte(oracle.ttl + 100)
  })

  it('Oracle create query', async () => {
    const oracleQuery = JSON.parse(await execute([
      'oracle', 'create-query', WALLET_NAME, '--password', 'test', oracleId, 'Hello?', '--json'
    ]))
    oracleQuery.blockHeight.should.be.gt(0)
    oracleQuery.decodedQuery.should.be.equal('Hello?')
    oracleQuery.id.split('_')[0].should.be.equal('oq')
    queryId = oracleQuery.id
    const oracle = await wallet.getOracleObject(oracleId)
    oracle.queries.length.should.be.equal(1)
  })

  it('Oracle respond to query', async () => {
    const oracleQueryResponse = JSON.parse(await execute([
      'oracle', 'respond-query', WALLET_NAME, '--password', 'test', oracleId, queryId, 'Hi!', '--json'
    ]))
    oracleQueryResponse.blockHeight.should.be.gt(0)
    const oracle = await wallet.getOracleObject(oracleId)
    const query = await oracle.getQuery(queryId)
    query.decodedResponse.should.be.equal('Hi!')
  })

  it('Get non existed Oracle', async () => {
    const fakeOracleId = Crypto.generateKeyPair().publicKey.replace('ak_', 'ok_')
    await execute(['oracle', 'get', fakeOracleId, '--json'])
      .should.be.rejectedWith('API ERROR:')
    await execute(['oracle', 'get', 'oq_d1sadasdasda', '--json'])
      .should.be.rejectedWith('Invalid oracleId')
  })

  it('Get existed Oracle', async () => {
    const oracle = JSON.parse(await execute(['oracle', 'get', oracleId, '--json']))
    oracle.id.should.be.a('string')
    oracle.id.split('_')[0].should.be.equal('ok')
  })
})
