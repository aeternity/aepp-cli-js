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

import { Crypto } from '@aeternity/aepp-sdk'
import fs from 'fs'
import { after, before, describe, it } from 'mocha'
import { expect } from 'chai'
import { executeProgram, parseBlock, randomName, getSdk, networkId } from './index'
import txProgramFactory from '../src/commands/tx'
import accountProgramFactory from '../src/commands/account'
import chainProgramFactory from '../src/commands/chain'

const executeTx = (args) => executeProgram(txProgramFactory, args)

const WALLET_NAME = 'txWallet'
const testContract = `
@compiler >= 6

contract Identity =
  entrypoint test(x : int, y: int) = x + y
`

describe('CLI Transaction Module', function () {
  const TX_KEYS = Crypto.generateKeyPair()
  const oracleId = 'ok_' + TX_KEYS.publicKey.slice(3)
  let sdk
  let salt
  let queryId
  let contractId
  const name = randomName()
  let nonce = 1
  let nameId

  before(async function () {
    sdk = await getSdk()
    await sdk.spend(1e24, TX_KEYS.publicKey)
    await executeProgram(accountProgramFactory, ['save', WALLET_NAME, '--password', 'test', TX_KEYS.secretKey, '--overwrite'])
  })

  after(async function () {
    if (fs.existsSync(WALLET_NAME)) fs.unlinkSync(WALLET_NAME)
  })

  async function signAndPost (tx) {
    const { signedTx } = await executeProgram(
      accountProgramFactory,
      ['sign', WALLET_NAME, tx, '--password', 'test', '--json', '--networkId', networkId]
    )
    const { blockHeight } = parseBlock(await executeProgram(chainProgramFactory, ['broadcast', signedTx]))
    expect(+blockHeight).to.be.above(0)
    nonce += 1
  }

  it('Build spend tx offline and send on-chain', async () => {
    const amount = 100
    const { tx } = await executeTx(['spend', TX_KEYS.publicKey, TX_KEYS.publicKey, amount, nonce, '--json'])
    await signAndPost(tx)
  })

  it('Build preclaim tx offline and send on-chain', async () => {
    const { tx, salt: nameSalt } = await executeTx(['name-preclaim', TX_KEYS.publicKey, name, nonce, '--json'])
    salt = nameSalt
    await signAndPost(tx)
  })

  it('Build claim tx offline and send on-chain', async function () {
    this.timeout(10000)
    const { tx } = await executeTx(['name-claim', TX_KEYS.publicKey, salt, name, nonce, '--json'])
    await signAndPost(tx)
    nameId = (await sdk.aensQuery(name)).id
  })

  it('Build update tx offline and send on-chain', async () => {
    const { tx } = await executeTx(['name-update', TX_KEYS.publicKey, nameId, nonce, TX_KEYS.publicKey, '--json'])
    await signAndPost(tx)
  })

  it('Build transfer tx offline and send on-chain', async () => {
    const { tx } = await executeTx(['name-transfer', TX_KEYS.publicKey, TX_KEYS.publicKey, nameId, nonce, '--json'])
    await signAndPost(tx)
  })

  it('Build revoke tx offline and send on-chain', async () => {
    const { tx } = await executeTx(['name-revoke', TX_KEYS.publicKey, nameId, nonce, '--json'])
    await signAndPost(tx)
  })

  it('Build contract create tx offline and send on-chain', async () => {
    const { bytecode } = await sdk.contractCompile(testContract)
    const callData = await sdk.contractEncodeCallDataAPI(testContract, 'init', [])
    const { tx, contractId: cId } = await executeTx(['contract-deploy', TX_KEYS.publicKey, bytecode, callData, nonce, '--json'])
    contractId = cId
    await signAndPost(tx)
  })

  it('Build contract call tx offline and send on-chain', async () => {
    const callData = await sdk.contractEncodeCallDataAPI(testContract, 'test', ['1', '2'])
    const { tx } = await executeTx(['contract-call', TX_KEYS.publicKey, contractId, callData, nonce, '--json'])
    await signAndPost(tx)
  })

  it('Build oracle register tx offline and send on-chain', async () => {
    const { tx } = await executeTx(['oracle-register', TX_KEYS.publicKey, '{city: "str"}', '{tmp:""num}', nonce, '--json'])
    await signAndPost(tx)
  })

  it('Build oracle extend  tx offline and send on-chain', async () => {
    const oracleCurrentTtl = await sdk.api.getOracleByPubkey(oracleId)
    const { tx } = await executeTx(['oracle-extend', TX_KEYS.publicKey, oracleId, 100, nonce, '--json'])
    await signAndPost(tx)
    const oracleTtl = await sdk.api.getOracleByPubkey(oracleId)
    const isExtended = +oracleTtl.ttl === +oracleCurrentTtl.ttl + 100
    isExtended.should.be.equal(true)
  })

  it('Build oracle post query tx offline and send on-chain', async () => {
    const { tx } = await executeTx(['oracle-post-query', TX_KEYS.publicKey, oracleId, '{city: "Berlin"}', nonce, '--json'])
    await signAndPost(tx)
    const { oracleQueries: queries } = await sdk.api.getOracleQueriesByPubkey(oracleId)
    queryId = queries[0].id
    const hasQuery = !!queries.length
    hasQuery.should.be.equal(true)
  })

  it('Build oracle respond tx offline and send on-chain', async () => {
    const response = '{tmp: 10}'
    const { tx } = await executeTx(['oracle-respond', TX_KEYS.publicKey, oracleId, queryId, response, nonce, '--json'])
    await signAndPost(tx)
    const { oracleQueries: queries } = await sdk.api.getOracleQueriesByPubkey(oracleId)
    const responseQuery = Crypto.decodeBase64Check(queries[0].response.slice(3)).toString()
    const hasQuery = !!queries.length
    hasQuery.should.be.equal(true)
    response.should.be.equal(responseQuery)
  })
})
