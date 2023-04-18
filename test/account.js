import fs from 'fs-extra';
import { before, describe, it } from 'mocha';
import { expect, assert } from 'chai';
import { stub } from 'sinon';
import { generateKeyPair } from '@aeternity/aepp-sdk';
import { getSdk, executeProgram, WALLET_NAME } from './index';
import accountProgram from '../src/commands/account';
import * as promptModule from '../src/utils/prompt';

const executeAccount = (args) => executeProgram(accountProgram, args);
const walletName = 'test-artifacts/test-wallet.json';

describe('Account Module', () => {
  let sig;
  let sigFromFile;
  const fileName = 'test-artifacts/message.txt';
  const fileData = 'Hello world!';
  const keypair = generateKeyPair();
  let sdk;

  before(async () => {
    await fs.outputFile(fileName, fileData);
    sdk = await getSdk();
  });

  it('Create Wallet', async () => {
    await executeAccount(['create', walletName, '--password', 'test', '--overwrite']);
    expect(await fs.exists(walletName)).to.be.equal(true);
    expect((await executeAccount(['address', walletName, '--password', 'test', '--json'])).publicKey)
      .to.be.a('string');
  });

  it('Create Wallet From Private Key', async () => {
    await executeAccount(['save', walletName, '--password', 'test', keypair.secretKey, '--overwrite']);
    expect(await fs.exists(walletName)).to.be.equal(true);
    expect((await executeAccount(['address', walletName, '--password', 'test', '--json'])).publicKey)
      .to.equal(keypair.publicKey);
  });

  it('Check Wallet Address', async () => {
    expect((await executeAccount(['address', WALLET_NAME, '--password', 'test', '--json'])).publicKey)
      .to.equal(sdk.address);
  });

  it('Check Wallet Address with Private Key', async () => {
    expect((await executeAccount(['address', walletName, '--password', 'test', '--privateKey', '--forcePrompt', '--json'])).secretKey)
      .to.equal(keypair.secretKey);
  });

  it('asks for password if it not provided', async () => {
    const stubbedPrompt = stub(promptModule, 'prompt');
    stubbedPrompt.throwsException(new Error('stubbed'));
    await expect(executeAccount(['create', 'test-artifacts/test-wallet-1.json']))
      .to.be.eventually.rejectedWith('stubbed');
    assert(stubbedPrompt.alwaysCalledWith(promptModule.PROMPT_TYPE.askPassword));
    stubbedPrompt.restore();
  });

  it('don\'t asks for password if it is empty', async () => {
    const name = 'test-artifacts/test-wallet-2.json';
    await executeAccount(['create', name, '--password', '', '--overwrite']);
    expect((await executeAccount(['address', name, '--password', '', '--json'])).publicKey)
      .to.be.a('string');
  });

  it('Spend coins to another wallet', async () => {
    const amount = 100;
    const { publicKey } = generateKeyPair();
    const resJson = await executeAccount([
      'spend', WALLET_NAME, '--password', 'test', publicKey, amount, '--json',
    ]);
    const receiverBalance = await sdk.getBalance(publicKey);
    expect(+receiverBalance).to.be.equal(amount);

    expect(resJson).to.eql({
      blockHash: resJson.blockHash,
      blockHeight: resJson.blockHeight,
      hash: resJson.hash,
      rawTx: resJson.rawTx,
      signatures: [resJson.signatures[0]],
      tx: {
        amount: '100',
        fee: '16660000000000',
        nonce: 1,
        payload: 'ba_Xfbg4g==',
        recipientId: resJson.tx.recipientId,
        senderId: resJson.tx.senderId,
        type: 'SpendTx',
        version: 1,
      },
    });

    const res = await executeAccount([
      'spend', WALLET_NAME, '--password', 'test', publicKey, amount,
    ]);
    const lineEndings = res.split('\n').map((l) => l.split(' ').at(-1));
    expect(res).to.be.equal(`
Transaction mined
Tx hash _________________________________ ${lineEndings[1]}
Block hash ______________________________ ${lineEndings[2]}
Block height ____________________________ ${lineEndings[3]}
Signatures ______________________________ ${lineEndings[4]}
Tx Type _________________________________ SpendTx
Sender account __________________________ ${resJson.tx.senderId}
Recipient account _______________________ ${resJson.tx.recipientId}
Amount __________________________________ 100
Payload _________________________________ ba_Xfbg4g==
Fee _____________________________________ 16660000000000
Nonce ___________________________________ 2
TTL _____________________________________ N/A
Version _________________________________ 1
    `.trim());
  });

  it('Spend coins to another wallet in ae', async () => {
    const receiverKeys = generateKeyPair();
    const { tx: { fee } } = await executeAccount([
      'spend', WALLET_NAME, '--password', 'test', '--json',
      receiverKeys.publicKey, '1ae', '--fee', '0.02ae',
    ]);
    expect(await sdk.getBalance(receiverKeys.publicKey)).to.be.equal('1000000000000000000');
    expect(fee).to.be.equal('20000000000000000');
  });

  it('Spend percent of coins to account', async () => {
    const { publicKey } = generateKeyPair();
    const balanceBefore = await sdk.getBalance(sdk.address);
    await executeAccount(['spend', WALLET_NAME, '--password', 'test', publicKey, '42%']);
    expect(+await sdk.getBalance(publicKey)).to.be.equal(balanceBefore * 0.42);
  });

  it('Generate accounts', async () => {
    const accounts = await executeAccount(['generate', 2, '--json']);
    accounts.length.should.be.equal(2);
  });

  it('Sign message', async () => {
    const data = 'Hello world';
    const signedMessage = await executeAccount(['sign-message', WALLET_NAME, data, '--json', '--password', 'test']);
    const signedUsingSDK = Array.from(await sdk.signMessage(data));
    sig = signedMessage.signatureHex;
    signedMessage.data.should.be.equal(data);
    signedMessage.address.should.be.equal(sdk.address);
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
    address.should.be.equal(sdk.address);
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
