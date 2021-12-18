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
import { before, describe, it } from 'mocha'
import { executeProgram, randomName, getSdk, WALLET_NAME } from './index'
import nameProgramFactory from '../src/commands/name'
import inspectProgramFactory from '../src/commands/inspect'
import accountProgramFactory from '../src/commands/account'

const executeName = (args) => executeProgram(nameProgramFactory, args)
const executeInspect = (args) => executeProgram(inspectProgramFactory, args)
const executeAccount = (args) => executeProgram(accountProgramFactory, args)

describe('CLI AENS Module', function () {
  const { publicKey } = Crypto.generateKeyPair()
  const name = randomName(12)
  const name2 = randomName(13)
  let wallet, salt

  before(async function () {
    // Spend tokens for wallet
    wallet = await getSdk()
  })

  it('Full claim', async function () {
    this.timeout(10000)
    const updateTx = await executeName([
      'full-claim',
      WALLET_NAME,
      '--password',
      'test',
      randomName(13),
      '--json'
    ])
    const address = await wallet.address()

    updateTx.blockHeight.should.be.gt(0)
    const isUpdated = !!updateTx.pointers.find(({ id }) => id === address)
    isUpdated.should.be.equal(true)
  })

  it('Full claim with options', async function () {
    this.timeout(10000)
    const updateTx = await executeName([
      'full-claim',
      WALLET_NAME,
      '--password',
      'test',
      randomName(13),
      '--json',
      '--nameTtl',
      50,
      '--nameFee',
      '3865700000000000000',
      '--clientTtl',
      50
    ])
    const address = await wallet.address()

    updateTx.blockHeight.should.be.gt(0)
    updateTx.tx.nameTtl.should.be.equal(50)
    updateTx.tx.clientTtl.should.be.equal(50)
    const isUpdated = !!updateTx.pointers.find(({ id }) => id === address)
    isUpdated.should.be.equal(true)
  })

  it('Pre Claim Name', async () => {
    const preClaim = await executeName([
      'pre-claim',
      WALLET_NAME,
      '--password',
      'test',
      name2,
      '--json'
    ])
    const nameResult = await executeInspect([name2, '--json'])
    salt = preClaim.salt

    preClaim.blockHeight.should.be.gt(0)
    preClaim.salt.should.be.a('number')
    preClaim.commitmentId.should.contain('cm')
    nameResult.name.should.be.equal(name2)
    nameResult.status.should.equal('AVAILABLE')
  })

  it('Claim Name', async function () {
    this.timeout(10000)
    const claim = await executeName([
      'claim',
      WALLET_NAME,
      '--password',
      'test',
      name2,
      salt,
      '--json'
    ])
    const nameResult = await executeInspect([name2, '--json'])

    claim.blockHeight.should.be.gt(0)
    claim.pointers.length.should.be.equal(0)
    nameResult.status.should.equal('CLAIMED')
  })

  it('Update Name', async () => {
    const updateTx = await executeName([
      'update',
      WALLET_NAME,
      name2,
      publicKey,
      '--password',
      'test',
      '--json'
    ])
    const nameResult = await executeInspect([name2, '--json'])

    updateTx.blockHeight.should.be.gt(0)
    const isUpdatedNode = !!nameResult.pointers.find(
      ({ id }) => id === publicKey
    )
    isUpdatedNode.should.be.equal(true)
    nameResult.status.should.equal('CLAIMED')
  })

  it('extend name ttl', async () => {
    const height = await wallet.height()
    const extendTx = await executeName([
      'extend',
      WALLET_NAME,
      name2,
      50,
      '--password',
      'test',
      '--json'
    ])

    const nameResult = await executeInspect([name2, '--json'])
    const isExtended = nameResult.ttl - 50 >= height
    isExtended.should.be.equal(true)
    extendTx.blockHeight.should.be.gt(0)
    nameResult.status.should.equal('CLAIMED')
  })

  it('Fail spend by name on invalid input', async () => {
    const amount = 100000009
    await executeAccount([
      'spend',
      WALLET_NAME,
      '--password',
      'test',
      'sdasdaasdas',
      amount,
      '--json'
    ]).should.be.rejectedWith('Invalid name or address')
  })

  it('Spend by name', async () => {
    const amount = 100000009
    const spendTx = await executeAccount([
      'spend',
      WALLET_NAME,
      '--password',
      'test',
      name2,
      amount,
      '--json'
    ])

    const nameObject = await wallet.aensQuery(name2)
    spendTx.tx.tx.recipientId.should.be.equal(nameObject.id)
    const balance = await wallet.getBalance(publicKey)
    balance.should.be.equal(`${amount}`)
  })

  it('Transfer name', async () => {
    const keypair = Crypto.generateKeyPair()

    const transferTx = await executeName([
      'transfer',
      WALLET_NAME,
      name2,
      keypair.publicKey,
      '--password',
      'test',
      '--json'
    ])

    transferTx.blockHeight.should.be.gt(0)
    await wallet.spend(1, keypair.publicKey, { denomination: 'ae' })
    const claim2 = await wallet.aensQuery(name2)
    const transferBack = await claim2.transfer(await wallet.address(), { onAccount: keypair })
    transferBack.blockHeight.should.be.gt(0)
  })

  it('Revoke Name', async () => {
    const revoke = await executeName([
      'revoke',
      WALLET_NAME,
      '--password',
      'test',
      name2,
      '--json'
    ])

    const nameResult = await executeInspect([name2, '--json'])

    revoke.blockHeight.should.be.gt(0)
    nameResult.status.should.equal('AVAILABLE')
  })

  describe('Name Auction', () => {
    const nameFee = '3665700000000000000'

    it('Open auction', async function () {
      this.timeout(10000)
      const keypair = Crypto.generateKeyPair()
      await wallet.spend('30000000000000000000000', keypair.publicKey)
      const preclaim = await wallet.aensPreclaim(name, { onAccount: keypair })
      const claim = await preclaim.claim({ onAccount: keypair })
      claim.blockHeight.should.be.gt(0)
    })

    it('Make bid', async () => {
      const bid = await executeName([
        'bid',
        WALLET_NAME,
        '--password',
        'test',
        name,
        nameFee,
        '--json'
      ])

      bid.tx.nameSalt.should.be.equal(0)
      bid.tx.nameFee.should.be.equal(nameFee)
    })

    it('Fail on open again', async function () {
      this.timeout(30000)
      const preClaim = await executeName([
        'pre-claim',
        WALLET_NAME,
        '--password',
        'test',
        name,
        '--json'
      ])
      await executeName([
        'claim',
        WALLET_NAME,
        '--password',
        'test',
        name,
        preClaim.salt,
        '--json'
      ]).should.be.rejectedWith('Giving up after 10 blocks mined')
    })
  })
})
