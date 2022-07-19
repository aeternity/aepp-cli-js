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

import fs from 'fs';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { generateKeyPair, AE_AMOUNT_FORMATS, formatAmount } from '@aeternity/aepp-sdk';
import { getSdk, executeProgram, WALLET_NAME } from './index';
import accountProgram from '../src/commands/account';

const executeAccount = (args) => executeProgram(accountProgram, args);
const walletName = 'test-artifacts/test-wallet.json';

describe('CLI Account Module', () => {
  let sig;
  let sigFromFile;
  const fileName = 'test-artifacts/message.txt';
  const fileData = 'Hello world!';
  const keypair = generateKeyPair();
  let sdk;

  before(async () => {
    fs.writeFileSync(fileName, fileData);
    sdk = await getSdk();
  });

  it('Create Wallet', async () => {
    await executeAccount(['create', walletName, '--password', 'test', '--overwrite']);
    fs.existsSync(walletName).should.equal(true);
    expect((await executeAccount(['address', walletName, '--password', 'test', '--json'])).publicKey)
      .to.be.a('string');
  });

  it('Create Wallet From Private Key', async () => {
    await executeAccount(['save', walletName, '--password', 'test', keypair.secretKey, '--overwrite']);
    fs.existsSync(walletName).should.equal(true);
    expect((await executeAccount(['address', walletName, '--password', 'test', '--json'])).publicKey)
      .to.equal(keypair.publicKey);
  });

  it('Check Wallet Address', async () => {
    expect((await executeAccount(['address', WALLET_NAME, '--password', 'test', '--json'])).publicKey)
      .to.equal(await sdk.address());
  });

  it('Check Wallet Address with Private Key', async () => {
    expect((await executeAccount(['address', walletName, '--password', 'test', '--privateKey', '--forcePrompt', '--json'])).secretKey)
      .to.equal(keypair.secretKey);
  });

  it('Check Wallet Balance', async () => {
    const balance = await sdk.getBalance(await sdk.address());
    expect((await executeAccount(['balance', WALLET_NAME, '--password', 'test', '--json'])).balance)
      .to.equal(balance);
  });

  it('Spend coins to another wallet', async () => {
    const amount = 100;
    const { publicKey } = generateKeyPair();
    await executeAccount(['spend', WALLET_NAME, '--password', 'test', publicKey, amount]);
    const receiverBalance = await sdk.getBalance(publicKey);
    (+receiverBalance).should.equal(amount);
  });

  it('Spend coins to another wallet using denomination', async () => {
    const amount = 1; // 1 AE
    const denomination = AE_AMOUNT_FORMATS.AE;
    const receiverKeys = generateKeyPair();
    await executeAccount(['spend', WALLET_NAME, '--password', 'test', '-D', denomination, receiverKeys.publicKey, amount]);
    const receiverBalance = await sdk.getBalance(receiverKeys.publicKey);
    receiverBalance.should.equal(
      formatAmount(amount, { denomination: AE_AMOUNT_FORMATS.AE }),
    );
  });

  it('Spend fraction of coins to account by name', async () => {
    const fraction = 0.0001;
    const { publicKey } = generateKeyPair();
    const balanceBefore = await sdk.getBalance(await sdk.address());
    await executeAccount(['transfer', WALLET_NAME, '--password', 'test', publicKey, fraction]);
    expect(+await sdk.getBalance(publicKey)).to.be.equal(balanceBefore * fraction);
  });

  it('Get account nonce', async () => {
    const { nextNonce } = await sdk.api.getAccountNextNonce(await sdk.address());
    expect((await executeAccount(['nonce', WALLET_NAME, '--password', 'test', '--json'])).nextNonce)
      .to.equal(nextNonce);
  });

  it('Generate accounts', async () => {
    const accounts = await executeAccount(['generate', 2, '--forcePrompt', '--json']);
    accounts.length.should.be.equal(2);
  });

  it('Sign message', async () => {
    const data = 'Hello world';
    const signedMessage = await executeAccount(['sign-message', WALLET_NAME, data, '--json', '--password', 'test']);
    const signedUsingSDK = Array.from(await sdk.signMessage(data));
    sig = signedMessage.signatureHex;
    signedMessage.data.should.be.equal(data);
    signedMessage.address.should.be.equal(await sdk.address());
    Array.isArray(signedMessage.signature).should.be.equal(true);
    signedMessage.signature.toString().should.be.equal(signedUsingSDK.toString());
    signedMessage.signatureHex.should.be.a('string');
  });

  it('Sign message using file', async () => {
    const {
      data, signature, signatureHex, address,
    } = await executeAccount(['sign-message', WALLET_NAME, '--json', '--filePath', fileName, '--password', 'test']);
    const signedUsingSDK = Array.from(await sdk.signMessage(data));
    sigFromFile = signatureHex;
    signature.toString().should.be.equal(signedUsingSDK.toString());
    data.toString().should.be.equal(Array.from(Buffer.from(fileData)).toString());
    address.should.be.equal(await sdk.address());
    Array.isArray(signature).should.be.equal(true);
    signatureHex.should.be.a('string');
  });

  it('verify message', async () => {
    const data = 'Hello world';
    const verify = await executeAccount(['verify-message', WALLET_NAME, sig, data, '--json', '--password', 'test']);
    verify.isCorrect.should.be.equal(true);
    const verifyFromFile = await executeAccount(['verify-message', WALLET_NAME, sigFromFile, '--json', '--password', 'test', '--filePath', fileName]);
    verifyFromFile.isCorrect.should.be.equal(true);
  });
});
