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

import { Crypto, MemoryAccount } from '@aeternity/aepp-sdk'
import fs from 'fs'
import { after, before, describe, it } from 'mocha'
import { BaseAe, configure, execute, parseBlock, randomString, ready } from './index'

const WALLET_NAME = 'txWallet'
const testContract = `
@compiler >= 6

contract Identity =
  entrypoint test(x : int, y: int) = x + y
`

function randomName (length = 18, namespace = '.chain') {
  return randomString(length).toLowerCase() + namespace
}

async function signAndPost (tx, assert) {
  const { signedTx } = JSON.parse(await execute(['account', 'sign', WALLET_NAME, tx, '--password', 'test', '--json'], { withNetworkId: true }))
  return assert
    ? (await execute(['chain', 'broadcast', signedTx, '--no-waitMined'])).should.contain('Transaction send to the chain')
    : execute(['chain', 'broadcast', signedTx])
}

describe('CLI Transaction Module', function () {
  configure(this)
  const TX_KEYS = Crypto.generateKeyPair()
  const oracleId = 'ok_' + TX_KEYS.publicKey.slice(3)
  let wallet
  let salt
  let queryId
  let contractId
  const name = randomName().toLowerCase()
  let nonce
  let nameId
  let compilerCLI

  before(async function () {
    compilerCLI = await ready(this)
    const GENESIS = await BaseAe()
    await GENESIS.spend('100000000000000000000000000', TX_KEYS.publicKey)
    await execute(['account', 'save', WALLET_NAME, '--password', 'test', TX_KEYS.secretKey, '--overwrite'])
    wallet = await BaseAe()
    await wallet.addAccount(MemoryAccount({ keypair: TX_KEYS }))
    fs.writeFileSync('contractTest', testContract)
    nonce = await wallet.getAccountNonce()
  })
  after(async function () {
    if (fs.existsSync('contractTest')) { fs.unlinkSync('contractTest') }
    if (fs.existsSync(WALLET_NAME)) { fs.unlinkSync(WALLET_NAME) }
  })

  it('Build spend tx offline and send on-chain', async () => {
    const amount = 100

    const { tx } = JSON.parse(await execute(['tx', 'spend', TX_KEYS.publicKey, TX_KEYS.publicKey, amount, nonce, '--json']))
    await signAndPost(tx, true)
    nonce += 1
  })

  it('Build preclaim tx offline and send on-chain', async () => {
    const { tx, salt: nameSalt } = JSON.parse(await execute(['tx', 'name-preclaim', TX_KEYS.publicKey, name, nonce, '--json']))
    salt = nameSalt
    const res = (parseBlock(await signAndPost(tx)))
    const isMined = !isNaN(res.block_height_)
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build claim tx offline and send on-chain', async () => {
    const { tx } = JSON.parse(await execute(['tx', 'name-claim', TX_KEYS.publicKey, salt, name, nonce, '--json']))
    const res = (parseBlock(await signAndPost(tx)))
    const isMined = !isNaN(res.block_height_)
    isMined.should.be.equal(true)
    const { id } = await wallet.aensQuery(name)
    nameId = id
    nonce += 1
  })

  it('Build update tx offline and send on-chain', async () => {
    const { tx } = JSON.parse(await execute(['tx', 'name-update', TX_KEYS.publicKey, nameId, nonce, TX_KEYS.publicKey, '--json']))
    const res = (parseBlock(await signAndPost(tx)))
    const isMined = !isNaN(res.block_height_)
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build transfer tx offline and send on-chain', async () => {
    const { tx } = JSON.parse(await execute(['tx', 'name-transfer', TX_KEYS.publicKey, TX_KEYS.publicKey, nameId, nonce, '--json']))
    const res = (parseBlock(await signAndPost(tx)))
    const isMined = !isNaN(res.block_height_)
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build revoke tx offline and send on-chain', async () => {
    const { tx } = JSON.parse(await execute(['tx', 'name-revoke', TX_KEYS.publicKey, nameId, nonce, '--json']))
    const res = (parseBlock(await signAndPost(tx)))
    const isMined = !isNaN(res.block_height_)
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build contract create tx offline and send on-chain', async () => {
    const { bytecode } = await compilerCLI.contractCompile(testContract)
    const callData = await compilerCLI.contractEncodeCall(testContract, 'init', [])
    const { tx, contractId: cId } = JSON.parse(await execute(['tx', 'contract-deploy', TX_KEYS.publicKey, bytecode, callData, nonce, '--json']))
    contractId = cId
    const res = (parseBlock(await signAndPost(tx)))
    const isMined = !isNaN(res.block_height_)
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build contract call tx offline and send on-chain', async () => {
    const callData = await compilerCLI.contractEncodeCall(testContract, 'test', ['1', '2'])
    const { tx } = JSON.parse(await execute(['tx', 'contract-call', TX_KEYS.publicKey, contractId, callData, nonce, '--json']))
    const res = (parseBlock(await signAndPost(tx)))
    const isMined = !isNaN(res.block_height_)
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build oracle register tx offline and send on-chain', async () => {
    const result = await execute(['tx', 'oracle-register', TX_KEYS.publicKey, '{city: "str"}', '{tmp:""num}', nonce, '--json'], { withOutReject: true })
    const { tx } = JSON.parse(result)
    const res = (parseBlock(await signAndPost(tx)))
    const isMined = !isNaN(res.block_height_)
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build oracle extend  tx offline and send on-chain', async () => {
    const oracleCurrentTtl = await wallet.api.getOracleByPubkey(oracleId)
    const { tx } = JSON.parse(await execute(['tx', 'oracle-extend', TX_KEYS.publicKey, oracleId, 100, nonce, '--json'], { withOutReject: true }))
    const res = (parseBlock(await signAndPost(tx)))
    const oracleTtl = await wallet.api.getOracleByPubkey(oracleId)
    const isExtended = +oracleTtl.ttl === +oracleCurrentTtl.ttl + 100
    const isMined = !isNaN(res.block_height_)
    isExtended.should.be.equal(true)
    isMined.should.be.equal(true)
    nonce += 1
  })

  it('Build oracle post query tx offline and send on-chain', async () => {
    const { tx } = JSON.parse(await execute(['tx', 'oracle-post-query', TX_KEYS.publicKey, oracleId, '{city: "Berlin"}', nonce, '--json'], { withOutReject: true }))
    const res = (parseBlock(await signAndPost(tx)))
    const { oracleQueries: queries } = await wallet.api.getOracleQueriesByPubkey(oracleId)
    queryId = queries[0].id
    const isMined = !isNaN(res.block_height_)
    const hasQuery = !!queries.length
    isMined.should.be.equal(true)
    hasQuery.should.be.equal(true)
    nonce += 1
  })

  it('Build oracle respond tx offline and send on-chain', async () => {
    const response = '{tmp: 10}'
    const { tx } = JSON.parse(await execute(['tx', 'oracle-respond', TX_KEYS.publicKey, oracleId, queryId, response, nonce, '--json'], { withOutReject: true }))
    const res = (parseBlock(await signAndPost(tx)))
    const { oracleQueries: queries } = await wallet.api.getOracleQueriesByPubkey(oracleId)
    const responseQuery = Crypto.decodeBase64Check(queries[0].response.slice(3)).toString()
    const isMined = !isNaN(res.block_height_)
    const hasQuery = !!queries.length
    isMined.should.be.equal(true)
    hasQuery.should.be.equal(true)
    response.should.be.equal(responseQuery)
    nonce += 1
  })
})
