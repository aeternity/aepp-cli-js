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

import fs from 'fs'
import { after, before, describe, it } from 'mocha'
import { expect } from 'chai'

import { configure, plan, ready, executeProgram, BaseAe, KEY_PAIR, WALLET_NAME, genAccount } from './index'
import accountProgramFactory from '../../src/commands/account'
import { Crypto, AmountFormatter } from '@aeternity/aepp-sdk'

const executeAccount = (...args) => executeProgram(accountProgramFactory, ...args)
const walletName = 'test.wallet'

plan(1000000000)

describe('CLI Account Module', function () {
  configure(this)
  let sig
  let sigFromFile
  const fileName = 'testData'
  const fileData = 'Hello world!'
  let wallet

  before(async function () {
    // Spend tokens for wallet
    fs.writeFileSync(fileName, fileData)
    wallet = await ready(this)
  })
  after(function () {
    // Remove wallet files
    if (fs.existsSync(fileName)) { fs.unlinkSync(fileName) }
    if (fs.existsSync(walletName)) { fs.unlinkSync(walletName) }
    if (fs.existsSync(`${walletName}.pub`)) { fs.unlinkSync(`${walletName}.pub`) }
  })

  it('Create Wallet', async () => {
    // create wallet
    await executeAccount(['create', walletName, '--password', 'test', '--overwrite'])

    // check for wallet files
    fs.existsSync(walletName).should.equal(true)
    // fs.existsSync(walletName).should.equal(true)

    // check if wallet files valid
    expect((await executeAccount(['address', walletName, '--password', 'test', '--json'])).publicKey)
      .to.be.a('string')
  })
  it('Create Wallet From Private Key', async () => {
    // create wallet
    await executeAccount(['save', walletName, '--password', 'test', KEY_PAIR.secretKey, '--overwrite'])

    // check for wallet files
    fs.existsSync(walletName).should.equal(true)

    // check if wallet valid
    expect((await executeAccount(['address', walletName, '--password', 'test', '--json'])).publicKey)
      .to.equal(KEY_PAIR.publicKey)
  })
  it('Check Wallet Address', async () => {
    expect((await executeAccount(['address', WALLET_NAME, '--password', 'test', '--json'])).publicKey)
      .to.equal(KEY_PAIR.publicKey)
  })
  it('Check Wallet Address with Private Key', async () => {
    expect((await executeAccount(['address', WALLET_NAME, '--password', 'test', '--privateKey', '--forcePrompt', '--json'])).secretKey)
      .to.equal(KEY_PAIR.secretKey)
  })
  it('Check Wallet Balance', async () => {
    const balance = await wallet.balance(await wallet.address())
    expect((await executeAccount(['balance', WALLET_NAME, '--password', 'test', '--json'])).balance)
      .to.equal(balance)
  })
  it('Spend coins to another wallet', async () => {
    const amount = 100
    const receiver = await BaseAe()
    await receiver.addAccount(genAccount(), { select: true })

    // send coins
    await executeAccount(['spend', WALLET_NAME, '--password', 'test', await receiver.address(), amount], { withNetworkId: true })
    const receiverBalance = await receiver.getBalance(await receiver.address())
    await parseInt(receiverBalance).should.equal(amount)
  })
  it('Spend coins to another wallet using denomination', async () => {
    const amount = 1 // 1 AE
    const denomination = AmountFormatter.AE_AMOUNT_FORMATS.AE
    const receiverKeys = Crypto.generateKeyPair()
    const receiver = await BaseAe()
    // send coins
    await executeAccount(['spend', WALLET_NAME, '--password', 'test', '-D', denomination, receiverKeys.publicKey, amount], { withNetworkId: true })
    const receiverBalance = await receiver.getBalance(receiverKeys.publicKey)
    receiverBalance.should.equal(AmountFormatter.formatAmount(amount, { denomination: AmountFormatter.AE_AMOUNT_FORMATS.AE }))
  })
  it('Get account nonce', async () => {
    const nonce = await wallet.getAccountNonce(await wallet.address())
    expect((await executeAccount(['nonce', WALLET_NAME, '--password', 'test', '--json'])).nextNonce)
      .to.equal(nonce)
  })
  it('Generate accounts', async () => {
    const accounts = await executeAccount(['generate', 2, '--forcePrompt', '--json'])
    accounts.length.should.be.equal(2)
  })
  it('Sign message', async () => {
    const data = 'Hello world'
    const signedMessage = await executeAccount(['sign-message', WALLET_NAME, data, '--json', '--password', 'test'])
    const signedUsingSDK = Array.from(await wallet.signMessage(data))
    sig = signedMessage.signatureHex
    signedMessage.data.should.be.equal(data)
    signedMessage.address.should.be.equal(await wallet.address())
    Array.isArray(signedMessage.signature).should.be.equal(true)
    signedMessage.signature.toString().should.be.equal(signedUsingSDK.toString())
    signedMessage.signatureHex.should.be.a('string')
  })
  it('Sign message using file', async () => {
    const { data, signature, signatureHex, address } = await executeAccount(['sign-message', WALLET_NAME, '--json', '--filePath', fileName, '--password', 'test'])
    const signedUsingSDK = Array.from(await wallet.signMessage(data))
    sigFromFile = signatureHex
    signature.toString().should.be.equal(signedUsingSDK.toString())
    data.toString().should.be.equal(Array.from(Buffer.from(fileData)).toString())
    address.should.be.equal(await wallet.address())
    Array.isArray(signature).should.be.equal(true)
    signatureHex.should.be.a('string')
  })
  it('verify message', async () => {
    const data = 'Hello world'
    const verify = await executeAccount(['verify-message', WALLET_NAME, sig, data, '--json', '--password', 'test'])
    verify.isCorrect.should.be.equal(true)
    const verifyFromFile = await executeAccount(['verify-message', WALLET_NAME, sigFromFile, '--json', '--password', 'test', '--filePath', fileName])
    verifyFromFile.isCorrect.should.be.equal(true)
  })
})
