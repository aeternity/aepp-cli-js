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

import { configure, BaseAe, execute, parseBlock, KEY_PAIR, networkId } from './index'
import { decodeBase64Check, generateKeyPair } from '@aeternity/aepp-sdk/es/utils/crypto'
import fs from 'fs'

const WALLET_NAME = 'txWallet'
const testContract = `contract Identity =
  type state = ()
  function main(x : int, y: int) = x + y
`

function randomName () {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36) + '.test'
}

async function signAndPost (tx, assert) {
  const signedRes = await execute(['account', 'sign', WALLET_NAME, tx, '--password', 'test'])
  const { signed } = parseBlock(signedRes)
  return assert
    ? (await execute(['chain', 'broadcast', signed])).indexOf('Transaction send to the chain').should.be.equal(0)
    : execute(['chain', 'broadcast', signed, '--waitMined'])
}

describe('CLI Transaction Module', function () {
  configure(this)
  const TX_KEYS = generateKeyPair()
  const oracleId = 'ok_' + TX_KEYS.publicKey.slice(3)
  let wallet
  let salt
  let queryId
  let contractId
  let name = randomName()
  let nonce
  let nameId

  before(async function () {
    const GENESIS = await BaseAe()
    await GENESIS.spend('100000000000000000000000', TX_KEYS.publicKey)
    await execute(['account', 'save', WALLET_NAME, '--password', 'test', TX_KEYS.secretKey, '--overwrite'])
    wallet = await BaseAe()
    wallet.setKeypair(TX_KEYS)
    fs.writeFileSync('contractTest', testContract)
    nonce = await wallet.getAccountNonce()
  })
  after(async function () {
    if (fs.existsSync('contractTest')) { fs.unlinkSync('contractTest') }
    if (fs.existsSync(WALLET_NAME)) { fs.unlinkSync(WALLET_NAME) }
  })

  it('Build spend tx offline and send the chain', async () => {
    const amount = 100

    const unsigned_spend_tx = parseBlock(await execute(['tx', 'spend', TX_KEYS.publicKey, TX_KEYS.publicKey, amount, nonce]))['___ encoded']
    await signAndPost(unsigned_spend_tx, true)
    nonce += 1
  })

  it('Build preclaim tx offline and send the chain', async () => {
    const resObj = parseBlock(await execute(['tx', 'name-preclaim', TX_KEYS.publicKey, name, nonce]))
    const unsigned_preclaim_tx = resObj['___ encoded']
    salt = resObj['___ salt']
    const res = (parseBlock(await signAndPost(unsigned_preclaim_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build claim tx offline and send the chain', async () => {
    const unsigned_claim_tx = parseBlock(await execute(['tx', 'name-claim', TX_KEYS.publicKey, salt, name, nonce]))['___ encoded']
    const res = (parseBlock(await signAndPost(unsigned_claim_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
    const { id } = await wallet.aensQuery(name)
    nameId = id
    nonce += 1
  })

  it('Build update tx offline and send the chain', async () => {
    const unsigned_update_tx = parseBlock(await execute(['tx', 'name-update', TX_KEYS.publicKey, nameId, nonce, TX_KEYS.publicKey]))['___ encoded']
    const res = (parseBlock(await signAndPost(unsigned_update_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build transfer tx offline and send the chain', async () => {
    const unsigned_transfer_tx = parseBlock(await execute(['tx', 'name-transfer', TX_KEYS.publicKey, TX_KEYS.publicKey, nameId, nonce]))['___ encoded']
    const res = (parseBlock(await signAndPost(unsigned_transfer_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build revoke tx offline and send the chain', async () => {
    const unsigned_revoke_tx = parseBlock(await execute(['tx', 'name-revoke', TX_KEYS.publicKey, nameId, nonce]))['___ encoded']
    const res = (parseBlock(await signAndPost(unsigned_revoke_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build contract create tx offline and send the chain', async () => {
    const { unsigned_contract_deploy_tx, contract_id } = parseBlock(await execute(['tx', 'contract-deploy', TX_KEYS.publicKey, 'contractTest']))
    contractId = contract_id
    const res = (parseBlock(await signAndPost(unsigned_contract_deploy_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build contract call tx offline and send the chain', async () => {
    const { unsigned_contract_call_tx } = parseBlock(await execute(['tx', 'contract-call', TX_KEYS.publicKey, contractId, 'main', 'int', 2, 3]))
    const res = (parseBlock(await signAndPost(unsigned_contract_call_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build oracle register tx offline and send the chain', async () => {
    const unsigned_oracleregister_tx = (parseBlock(await execute(['tx', 'oracle-register', TX_KEYS.publicKey, '{city: "str"}', '{tmp:""num}', nonce], true)))['___ encoded']
    const res = (parseBlock(await signAndPost(unsigned_oracleregister_tx)))
    const isMined = !isNaN(res['block_height'])
    isMined.should.be.equal(true)
    nonce += 1
  })
  it('Build oracle extend  tx offline and send the chain', async () => {
    const oracleCurrentTtl = await wallet.getOracle(oracleId)
    const unsigned_oracleextend_tx = parseBlock(await execute(['tx', 'oracle-extend', TX_KEYS.publicKey, oracleId, 100, nonce], true))['___ encoded']
    const res = (parseBlock(await signAndPost(unsigned_oracleextend_tx)))
    const oracleTtl = await wallet.getOracle(oracleId)
    const isExtended = +oracleTtl.ttl === +oracleCurrentTtl.ttl + 100
    const isMined = !isNaN(res['block_height'])
    isExtended.should.be.equal(true)
    isMined.should.be.equal(true)
    nonce += 1
  })
  it('Build oracle post query tx offline and send the chain', async () => {
    const unsigned_oraclepostquery_tx = parseBlock(await execute(['tx', 'oracle-post-query', TX_KEYS.publicKey, oracleId, '{city: "Berlin"}', nonce], true))['___ encoded']
    const res = (parseBlock(await signAndPost(unsigned_oraclepostquery_tx)))
    const { oracleQueries: queries } = await wallet.getOracleQueries(oracleId)
    queryId = queries[0].id
    const isMined = !isNaN(res['block_height'])
    const hasQuery = !!queries.length
    isMined.should.be.equal(true)
    hasQuery.should.be.equal(true)
    nonce += 1
  })
  it('Build oracle respond tx offline and send the chain', async () => {
    const response = '{tmp: 10}'
    const unsigned_oraclerespond_tx = parseBlock(await execute(['tx', 'oracle-respond', TX_KEYS.publicKey, oracleId, queryId, response, nonce], true))['___ encoded']
    const res = (parseBlock(await signAndPost(unsigned_oraclerespond_tx)))
    const { oracleQueries: queries } = await wallet.getOracleQueries(oracleId)
    const responseQuery = decodeBase64Check(queries[0].response.slice(3)).toString()
    const isMined = !isNaN(res['block_height'])
    const hasQuery = !!queries.length
    isMined.should.be.equal(true)
    hasQuery.should.be.equal(true)
    response.should.be.equal(responseQuery)
    nonce += 1
  })
})
