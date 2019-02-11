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

import { describe, it } from 'mocha'

import { configure, BaseAe, execute, parseBlock, KEY_PAIR, WALLET_NAME, ready } from './index'
import { decodeBase64Check, generateKeyPair } from '@aeternity/aepp-sdk/es/utils/crypto'
import fs from 'fs'

const testContract = `contract Identity =
  type state = ()
  function main(x : int, y: int) = x + y
`

function randomName () {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36) + '.test'
}

async function signAndPost (tx, assert) {
  const signedRes = await execute(['account', 'sign', WALLET_NAME, tx, '--password', 'test'])
  const signed = parseBlock(signedRes)
  let signedTx = Object.entries(signed)[0][1]

  let res
  if (assert) {
    res = await execute(['tx', 'broadcast', signedTx])
    res.indexOf('Transaction send to the chain').should.be.equal(0)
  } else {
    res = await execute(['tx', 'broadcast', signedTx, '--waitMined'])
  }

  return res
}

describe('CLI Transaction Module', function () {
  configure(this)
  const oracleId = 'ok_' + KEY_PAIR.publicKey.slice(3)
  let wallet
  let salt
  let queryId
  let contractId
  let name = randomName()

  before(async function () {
    wallet = await ready(this)
    fs.writeFileSync('contractTest', testContract)
  })
  after(async function () {
    if (fs.existsSync('contractTest')) { fs.unlinkSync('contractTest') }
  })

  it('Build spend tx offline and send the chain', async () => {
    const amount = 100
    const receiverKeys = generateKeyPair()
    const receiver = await BaseAe()
    receiver.setKeypair(receiverKeys)

    const { transaction_hash } = parseBlock(await execute(['tx', 'spend', KEY_PAIR.publicKey, KEY_PAIR.publicKey, amount]))
    await signAndPost(transaction_hash, true)
  })

  it('Build preclaim tx offline and send the chain', async () => {
    const { preclaim_tx, salt: _salt } = parseBlock(await execute(['tx', 'name-preclaim', KEY_PAIR.publicKey, name]))
    salt = _salt
    const res = (parseBlock(await signAndPost(preclaim_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
  })

  it('Build claim tx offline and send the chain', async () => {
    const { claim_tx } = parseBlock(await execute(['tx', 'name-claim', KEY_PAIR.publicKey, salt, name]))
    const res = (parseBlock(await signAndPost(claim_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
  })

  it('Build update tx offline and send the chain', async () => {
    const { update_tx } = parseBlock(await execute(['tx', 'name-update', KEY_PAIR.publicKey, name, KEY_PAIR.publicKey]))
    const res = (parseBlock(await signAndPost(update_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
  })

  it('Build transfer tx offline and send the chain', async () => {
    const { transfer_tx } = parseBlock(await execute(['tx', 'name-transfer', KEY_PAIR.publicKey, KEY_PAIR.publicKey, name]))
    const res = (parseBlock(await signAndPost(transfer_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
  })

  it('Build revoke tx offline and send the chain', async () => {
    const { revoke_tx } = parseBlock(await execute(['tx', 'name-revoke', KEY_PAIR.publicKey, name]))
    const res = (parseBlock(await signAndPost(revoke_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
  })

  it('Build contract create tx offline and send the chain', async () => {
    const { contract_deploy_tx, contract_id } = parseBlock(await execute(['tx', 'contract-deploy', KEY_PAIR.publicKey, 'contractTest']))
    contractId = contract_id
    const res = (parseBlock(await signAndPost(contract_deploy_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
  })

  it('Build contract call tx offline and send the chain', async () => {
    const { contract_call_tx } = parseBlock(await execute(['tx', 'contract-call', KEY_PAIR.publicKey, contractId, 'main', 'int', 2, 3]))
    const res = (parseBlock(await signAndPost(contract_call_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
  })

  it('Build oracle register tx offline and send the chain', async () => {
    const { oracleregister_tx } = parseBlock(await execute(['tx', 'oracle-register', KEY_PAIR.publicKey, '{city: "str"}', '{tmp:""num}'], true))
    const res = (parseBlock(await signAndPost(oracleregister_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
  })
  it('Build oracle extend  tx offline and send the chain', async () => {
    const oracleCurrentTtl = await wallet.getOracle(oracleId)
    const { oracleextend_tx } = parseBlock(await execute(['tx', 'oracle-extend', KEY_PAIR.publicKey, oracleId, 100], true))
    const res = (parseBlock(await signAndPost(oracleextend_tx)))
    const oracleTtl = await wallet.getOracle(oracleId)
    const isExtended = +oracleTtl.ttl === +oracleCurrentTtl.ttl + 100
    const isMined = !isNaN(res['block_height'])
    isExtended.should.be.equal(true)
    isMined.should.be.equal(true)
  })
  it('Build oracle post query tx offline and send the chain', async () => {
    const { oraclepostquery_tx } = parseBlock(await execute(['tx', 'oracle-post-query', KEY_PAIR.publicKey, oracleId, '{city: "Berlin"}'], true))
    const res = (parseBlock(await signAndPost(oraclepostquery_tx)))
    const { oracleQueries: queries } = await wallet.getOracleQueries(oracleId)
    queryId = queries[0].id
    const isMined = !isNaN(res['block_height'])
    const hasQuery = !!queries.length
    isMined.should.be.equal(true)
    hasQuery.should.be.equal(true)
  })
  it('Build oracle respond tx offline and send the chain', async () => {
    const response = '{tmp: 10}'
    const { oraclerespond_tx } = parseBlock(await execute(['tx', 'oracle-respond', KEY_PAIR.publicKey, oracleId, queryId, response], true))
    const res = (parseBlock(await signAndPost(oraclerespond_tx)))
    const { oracleQueries: queries } = await wallet.getOracleQueries(oracleId)
    const responseQuery = decodeBase64Check(queries[0].response.slice(3)).toString()
    const isMined = !isNaN(res['block_height'])
    const hasQuery = !!queries.length
    isMined.should.be.equal(true)
    hasQuery.should.be.equal(true)
    response.should.be.equal(responseQuery)
  })
})
