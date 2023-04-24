import fs from 'fs-extra';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { generateKeyPair } from '@aeternity/aepp-sdk';
import { getSdk, executeProgram, WALLET_NAME } from './index';
import accountProgram from '../src/commands/account';

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

  it('Check Wallet Balance', async () => {
    const balance = await sdk.getBalance(sdk.address);
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

  it('Spend coins to another wallet in ae', async () => {
    const receiverKeys = generateKeyPair();
    const { tx: { tx: { fee } } } = await executeAccount([
      'spend', WALLET_NAME, '--password', 'test', '--json',
      receiverKeys.publicKey, '1ae', '--fee', '0.02ae',
    ]);
    expect(await sdk.getBalance(receiverKeys.publicKey)).to.be.equal('1000000000000000000');
    expect(fee).to.be.equal('20000000000000000');
  });

  it('Spend fraction of coins to account by name', async () => {
    const fraction = 0.000001;
    const { publicKey } = generateKeyPair();
    const balanceBefore = await sdk.getBalance(sdk.address);
    await executeAccount(['transfer', WALLET_NAME, '--password', 'test', publicKey, fraction]);
    expect(+await sdk.getBalance(publicKey)).to.be.equal(balanceBefore * fraction);
  });

  it('Get account nonce', async () => {
    const { nextNonce } = await sdk.api.getAccountNextNonce(sdk.address);
    expect((await executeAccount(['nonce', WALLET_NAME, '--password', 'test', '--json'])).nextNonce)
      .to.equal(nextNonce);
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
