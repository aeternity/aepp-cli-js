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

import { configure, plan, ready, execute as exec, WALLET_NAME, randomString } from './index'
import { generateKeyPair } from '@aeternity/aepp-sdk/es/utils/crypto'
import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'

plan(10000000000000)

const execute = (arg) => exec(arg, { withNetworkId: true })

function randomName (length, namespace = '.chain') {
  return randomString(length).toLowerCase() + namespace
}

describe('CLI AENS Module', function () {
  configure(this)
  const { publicKey } = generateKeyPair()
  let wallet
  let nameAuctionsSupported
  let name
  let name2
  let salt

  before(async function () {
    // Spend tokens for wallet
    try {
      wallet = await ready(this)
      const { version } = wallet.getNodeInfo()
      const [majorVersion] = version.split('.')
      nameAuctionsSupported = +majorVersion === 5 && version !== '5.0.0-rc.1'
      name = randomName(12, nameAuctionsSupported ? '.chain' : '.test')
      name2 = randomName(13, nameAuctionsSupported ? '.chain' : '.test')
    } catch (e) {
      console.log(e.toString())
    }
  })

  it('Full claim', async () => {
    const name = randomName(13)
    const updateTx = JSON.parse(await execute(['name', 'full-claim', WALLET_NAME, '--password', 'test', name, '--json']))
    const address = await wallet.address()

    updateTx.blockHeight.should.be.gt(0)
    const isUpdated = !!updateTx.pointers.find(({ id }) => id === address)
    isUpdated.should.be.equal(true)
  })
  it('Full claim with options', async () => {
    const name = randomName(13)
    const updateTx = JSON.parse(await execute(['name', 'full-claim', WALLET_NAME, '--password', 'test', name, '--json', '--nameTtl', 50, '--nameFee', '3865700000000000000', '--clientTtl', 50]))
    const address = await wallet.address()

    updateTx.blockHeight.should.be.gt(0)
    updateTx.tx.nameTtl.should.be.equal(50)
    updateTx.tx.clientTtl.should.be.equal(50)
    const isUpdated = !!updateTx.pointers.find(({ id }) => id === address)
    isUpdated.should.be.equal(true)
  })

  it('Pre Claim Name', async () => {
    const preClaim = JSON.parse(await execute(['name', 'pre-claim', WALLET_NAME, '--password', 'test', name2, '--json']))
    const nameResult = JSON.parse(await execute(['inspect', name2, '--json']))
    salt = preClaim.salt

    preClaim.blockHeight.should.be.gt(0)
    preClaim.salt.should.be.a('number')
    preClaim.commitmentId.indexOf('cm').should.not.be.equal(-1)
    nameResult.name.should.be.equal(name2)
    nameResult.status.should.equal('AVAILABLE')
  })

  it('Claim Name', async () => {
    const claim = JSON.parse(await execute(['name', 'claim', WALLET_NAME, '--password', 'test', name2, salt, '--json']))
    const nameResult = JSON.parse(await execute(['inspect', name2, '--json']))

    claim.blockHeight.should.be.gt(0)
    claim.pointers.length.should.be.equal(0)
    nameResult.status.should.equal('CLAIMED')
  })
  it('Update Name', async () => {
    const updateTx = JSON.parse(await execute(['name', 'update', WALLET_NAME, name2, publicKey, '--password', 'test', '--json']))
    const nameResult = JSON.parse(await execute(['inspect', name2, '--json']))

    updateTx.blockHeight.should.be.gt(0)
    const isUpdatedNode = !!nameResult.pointers.find(({ id }) => id === publicKey)
    isUpdatedNode.should.be.equal(true)
    nameResult.status.should.equal('CLAIMED')
  })
  it('extend name ttl', async () => {
    const height = await wallet.height()
    const extendTx = JSON.parse(await execute(['name', 'extend', WALLET_NAME, name2, 50, '--password', 'test', '--json']))
    const nameResult = JSON.parse(await execute(['inspect', name2, '--json']))
    const isExtended = (nameResult.ttl - 50) >= height
    isExtended.should.be.equal(true)
    extendTx.blockHeight.should.be.gt(0)
    nameResult.status.should.equal('CLAIMED')
  })
  it('Fail spend by name on invalid input', async () => {
    const amount = 100000009
    const error = await execute(['account', 'spend', WALLET_NAME, '--password', 'test', 'sdasdaasdas', amount, '--json'])
    error.indexOf('AENS: Invalid name domain').should.not.be.equal(-1)
  })
  it('Spend by name', async () => {
    const amount = 100000009
    const spendTx = JSON.parse(await execute(['account', 'spend', WALLET_NAME, '--password', 'test', name2, amount, '--json']))
    const nameObject = await wallet.aensQuery(name2)
    spendTx.tx.tx.recipientId.should.be.equal(nameObject.id)
    const balance = await wallet.getBalance(publicKey)
    balance.should.be.equal(`${amount}`)
  })
  it('Transfer name', async () => {
    const keypair = generateKeyPair()
    await wallet.addAccount(MemoryAccount({ keypair }))

    const transferTx = JSON.parse(await execute(['name', 'transfer', WALLET_NAME, name2, keypair.publicKey, '--password', 'test', '--json']))
    transferTx.blockHeight.should.be.gt(0)
    await wallet.spend(1, keypair.publicKey, { denomination: 'ae' })
    const claim2 = await wallet.aensQuery(name2)
    const transferBack = await claim2.transfer(await wallet.address(), { onAccount: keypair.publicKey })
    transferBack.blockHeight.should.be.gt(0)
  })
  it('Revoke Name', async () => {
    const revoke = JSON.parse(await execute(['name', 'revoke', WALLET_NAME, '--password', 'test', name2, '--json']))
    const nameResult = JSON.parse(await execute(['inspect', name2, '--json']))

    revoke.blockHeight.should.be.gt(0)
    nameResult.status.should.equal('AVAILABLE')
  })
  describe('Name Auction', () => {
    const nameFee = '3665700000000000000'
    it('Open auction', async () => {
      const account = MemoryAccount({ keypair: generateKeyPair() })
      await wallet.addAccount(account)
      await wallet.spend('30000000000000000000000', await account.address())
      const preclaim = await wallet.aensPreclaim(name, { onAccount: await account.address() })
      const claim = await preclaim.claim({ onAccount: await account.address() })
      claim.blockHeight.should.be.gt(0)
    })
    it('Make bid', async () => {
      const bid = JSON.parse(await execute(['name', 'bid', WALLET_NAME, '--password', 'test', name, nameFee, '--json']))
      bid.tx.nameSalt.should.be.equal(0)
      bid.tx.nameFee.should.be.equal(nameFee)
    })
    it('Fail on open  again', async () => {
      const preClaim = JSON.parse(await execute(['name', 'pre-claim', WALLET_NAME, '--password', 'test', name, '--json']))
      const claim = await execute(['name', 'claim', WALLET_NAME, '--password', 'test', name, preClaim.salt, '--json'])
      claim.indexOf('Giving up after 10 blocks mined').should.not.be.equal(-1)
    })
  })
})
