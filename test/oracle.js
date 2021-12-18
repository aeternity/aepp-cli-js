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

import { Crypto } from '@aeternity/aepp-sdk'
import { before, describe, it } from 'mocha'
import { executeProgram, plan, ready, WALLET_NAME } from './index'
import oracleProgramFactory from '../src/commands/oracle'

const executeOracle = args => executeProgram(oracleProgramFactory, args)
plan(10000000000000)

describe('CLI Oracle Module', function () {
  const oracleFormat = 'string'
  const responseFormat = 'string'
  let wallet
  let oracleId
  let queryId

  before(async function () {
    // Spend tokens for wallet
    wallet = await ready()
  })

  it('Oracle create', async () => {
    const oracleCreate = await executeOracle([
      'create', WALLET_NAME, '--password', 'test', oracleFormat, responseFormat, '--json'
    ])
    oracleCreate.blockHeight.should.be.gt(0)
    oracleCreate.queryFormat.should.be.equal(oracleFormat)
    oracleCreate.responseFormat.should.be.equal(responseFormat)
    oracleId = oracleCreate.id
  })

  it('Oracle extend', async () => {
    const oracle = await wallet.getOracleObject(oracleId)
    const oracleExtend = await executeOracle([
      'extend', WALLET_NAME, '--password', 'test', oracleId, 100, '--json'
    ])
    oracleExtend.blockHeight.should.be.gt(0)
    oracleExtend.ttl.should.be.gte(oracle.ttl + 100)
  })

  it('Oracle create query', async () => {
    const oracleQuery = await executeOracle([
      'create-query', WALLET_NAME, '--password', 'test', oracleId, 'Hello?', '--json'
    ])
    oracleQuery.blockHeight.should.be.gt(0)
    oracleQuery.decodedQuery.should.be.equal('Hello?')
    oracleQuery.id.split('_')[0].should.be.equal('oq')
    queryId = oracleQuery.id
    const oracle = await wallet.getOracleObject(oracleId)
    oracle.queries.length.should.be.equal(1)
  })

  it('Oracle respond to query', async () => {
    const oracleQueryResponse = await executeOracle([
      'respond-query', WALLET_NAME, '--password', 'test', oracleId, queryId, 'Hi!', '--json'
    ])
    oracleQueryResponse.blockHeight.should.be.gt(0)
    const oracle = await wallet.getOracleObject(oracleId)
    const query = await oracle.getQuery(queryId)
    query.decodedResponse.should.be.equal('Hi!')
  })

  it('Get non existed Oracle', async () => {
    const fakeOracleId = Crypto.generateKeyPair().publicKey.replace('ak_', 'ok_')
    await executeOracle(['get', fakeOracleId, '--json'])
      .should.be.rejectedWith('error: Oracle not found')
    await executeOracle(['get', 'oq_d1sadasdasda', '--json'])
      .should.be.rejectedWith('Encoded string have a wrong type: oq (expected: ok)')
  })

  it('Get existed Oracle', async () => {
    const oracle = await executeOracle(['get', oracleId, '--json'])
    oracle.id.should.be.a('string')
    oracle.id.split('_')[0].should.be.equal('ok')
  })
})
