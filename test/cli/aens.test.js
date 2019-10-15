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

import { configure, plan, ready, execute as exec, WALLET_NAME } from './index'
import { generateKeyPair } from '@aeternity/aepp-sdk/es/utils/crypto'
import MemoryAccount from '@aeternity/aepp-sdk/es/account/memory'

plan(10000000000000)

const execute = (arg) => exec(arg, { withNetworkId: true })

function randomName (length, namespace = '.aet') {
  return randomString(length).toLowerCase() + namespace
}

function randomString (len, charSet) {
  charSet = charSet || 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let randomString = ''
  for (let i = 0; i < len; i++) {
    const randomPoz = Math.floor(Math.random() * charSet.length)
    randomString += charSet.substring(randomPoz, randomPoz + 1)
  }
  return randomString
}

describe('CLI AENS Module', function () {
  configure(this)
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
    const { publicKey } = generateKeyPair()
    const updateTx = JSON.parse(await execute(['name', 'update', WALLET_NAME, '--password', 'test', name2, publicKey, '--json']))
    const nameResult = JSON.parse(await execute(['inspect', name2, '--json']))

    updateTx.blockHeight.should.be.gt(0)
    const isUpdatedNode = !!nameResult.pointers.find(({ id }) => id === publicKey)
    isUpdatedNode.should.be.equal(true)
    nameResult.status.should.equal('CLAIMED')
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
