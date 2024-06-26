import fs from 'fs-extra';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import prompts from 'prompts';
import { resolve } from 'path';
import { generateKeyPair } from '@aeternity/aepp-sdk';
import { getSdk, executeProgram, WALLET_NAME } from './index.js';

const executeAccount = executeProgram.bind(null, 'account');
const walletName = 'test-artifacts/test-wallet.json';

describe('Account Module', () => {
  let sig;
  let sigFromFile;
  const fileName = 'test-artifacts/message.txt';
  const fileData = 'Hello world!';
  const keypair = generateKeyPair();
  let aeSdk;

  before(async () => {
    await fs.outputFile(fileName, fileData);
    aeSdk = await getSdk();
  });

  it('Create Wallet', async () => {
    const createRes = await executeAccount('create', walletName, '--password', 'test');
    expect(await fs.exists(walletName)).to.be.equal(true);
    const resJson = await executeAccount('address', walletName, '--json');
    expect(resJson.publicKey).to.be.a('string');
    expect(createRes).to.be.equal(`
Address _________________________________ ${resJson.publicKey}
Path ____________________________________ ${resolve(walletName)}
    `.trim());
    const res = await executeAccount('address', walletName);
    expect(res).to.be.equal(`
Address _________________________________ ${resJson.publicKey}
    `.trim());
  });

  it('Create Wallet From Private Key', async () => {
    await executeAccount('create', walletName, '--password', 'test', keypair.secretKey, '--overwrite');
    expect(await fs.exists(walletName)).to.be.equal(true);
    expect((await executeAccount('address', walletName, '--json')).publicKey)
      .to.equal(keypair.publicKey);
  });

  it('Check Wallet Address', async () => {
    expect((await executeAccount('address', WALLET_NAME, '--json')).publicKey)
      .to.equal(aeSdk.address);
  });

  it('Check Wallet Address with Private Key', async () => {
    const resJson = await executeAccount('address', walletName, '--password', 'test', '--privateKey', '--forcePrompt', '--json');
    expect(resJson.secretKey).to.equal(keypair.secretKey);
    const res = await executeAccount('address', walletName, '--password', 'test', '--privateKey', '--forcePrompt');
    expect(res).to.be.equal(`
Address _________________________________ ${keypair.publicKey}
Secret Key ______________________________ ${keypair.secretKey}
    `.trim());
  });

  it('asks for password if it not provided', async () => {
    const walletPath = 'test-artifacts/test-wallet-1.json';
    prompts.inject(['test-password', 'y', 'test-password']);
    const { publicKey } = await executeAccount('create', walletPath, '--json');
    expect(await executeAccount('address', walletPath, '--privateKey')).to.include(publicKey);
  });

  it('don\'t asks for password if provided password is empty string', async () => {
    const name = 'test-artifacts/test-wallet-2.json';
    await executeAccount('create', name, '--password', '');
    prompts.inject(['y']);
    expect((await executeAccount('address', name, '--password', '', '--privateKey', '--json')).publicKey)
      .to.be.a('string');
  });

  it('Sign message', async () => {
    const data = 'Hello world';
    const signedMessage = await executeAccount('sign-message', WALLET_NAME, data, '--json', '--password', 'test');
    const signedUsingSDK = Array.from(await aeSdk.signMessage(data));
    sig = signedMessage.signatureHex;
    signedMessage.data.should.be.equal(data);
    signedMessage.address.should.be.equal(aeSdk.address);
    Array.isArray(signedMessage.signature).should.be.equal(true);
    signedMessage.signature.toString().should.be.equal(signedUsingSDK.toString());
    signedMessage.signatureHex.should.be.a('string');
  });

  it('Sign message using file', async () => {
    const {
      data, signature, signatureHex, address,
    } = await executeAccount('sign-message', WALLET_NAME, '--json', '--filePath', fileName, '--password', 'test');
    const signedUsingSDK = Array.from(await aeSdk.signMessage(data));
    sigFromFile = signatureHex;
    signature.toString().should.be.equal(signedUsingSDK.toString());
    data.toString().should.be.equal(Array.from(Buffer.from(fileData)).toString());
    address.should.be.equal(aeSdk.address);
    Array.isArray(signature).should.be.equal(true);
    signatureHex.should.be.a('string');
  });

  it('verify message', async () => {
    const data = 'Hello world';
    const verify = await executeAccount('verify-message', aeSdk.address, sig, data, '--json');
    verify.isCorrect.should.be.equal(true);
    const verifyFromFile = await executeAccount('verify-message', aeSdk.address, sigFromFile, '--json', '--filePath', fileName);
    verifyFromFile.isCorrect.should.be.equal(true);
  });
});
