import fs from 'fs-extra';
import { before, describe, it } from 'mocha';
import { expect, should } from 'chai';
import prompts from 'prompts';
import { resolve } from 'path';
import { decode, MemoryAccount } from '@aeternity/aepp-sdk';
import { getSdk, executeProgram, WALLET_NAME } from './index.js';
import { expectToMatchLines, toMatch } from './utils.js';

should();
const executeAccount = executeProgram.bind(null, 'account');
const walletName = 'test-artifacts/test-wallet.json';

describe('Account Module', () => {
  let sig;
  let sigFromFile;
  const fileName = 'test-artifacts/message.txt';
  const fileData = 'Hello world!';
  const account = new MemoryAccount('sk_2Y8wfdohj4iVqL7hkTtJhVjjTKzwFh223djZCy4vGmiBLjsoAU');
  const secretKeyHex = Buffer.concat([decode(account.secretKey), decode(account.address)]).toString(
    'hex',
  );
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
    expectToMatchLines(createRes, [
      `Address  ${resJson.publicKey}`,
      `Path     ${resolve(walletName)}`,
    ]);
    const res = await executeAccount('address', walletName);
    expectToMatchLines(res, [`Address  ${resJson.publicKey}`]);
  });

  it('Create Wallet From Secret Key', async () => {
    await executeAccount(
      'create',
      walletName,
      '--password',
      'test',
      account.secretKey,
      '--overwrite',
    );
    const wallet = await fs.readJson(walletName);
    expect(wallet).to.eql({
      name: 'test-wallet',
      version: 1,
      public_key: account.address,
      id: toMatch(wallet.id, /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/),
      crypto: {
        secret_type: 'ed25519',
        symmetric_alg: 'xsalsa20-poly1305',
        ciphertext: toMatch(wallet.crypto.ciphertext, /[0-9a-f]{160}/),
        cipher_params: { nonce: toMatch(wallet.crypto.cipher_params.nonce, /[0-9a-f]{48}/) },
        kdf: 'argon2id',
        kdf_params: {
          memlimit_kib: 65536,
          opslimit: 3,
          parallelism: 4,
          salt: toMatch(wallet.crypto.kdf_params.salt, /[0-9a-f]{32}/),
        },
      },
    });
  });

  it('Create Wallet From Secret Key in hex', async () => {
    const createRes = await executeAccount(
      'create',
      walletName,
      '--password',
      'test',
      secretKeyHex,
      '--overwrite',
    );
    expectToMatchLines(createRes, [
      `Address  ${account.address}`,
      `Path     ${resolve(walletName)}`,
    ]);
  });

  it('Check Wallet Address', async () => {
    await fs.writeJson(walletName, {
      name: 'test-wallet',
      version: 1,
      public_key: account.address,
      id: '859f833a-598b-44fa-9bde-554fa4972cbb',
      crypto: {
        secret_type: 'ed25519',
        symmetric_alg: 'xsalsa20-poly1305',
        ciphertext:
          '5649321dd2f78f17dd5797de6599d9719b9996de8979ab5603dea3f5333f2e6a254af931ac49bfa69e76c7deac10f9673b5ecbe2db1c8f3b3cd221931c0bfc4e218bee89ac9f3c8bcf9db61794772de3',
        cipher_params: { nonce: 'c4fae7feefe3ac3fd7588e085c04810e4bacd9fd1652a917' },
        kdf: 'argon2id',
        kdf_params: {
          memlimit_kib: 65536,
          opslimit: 3,
          parallelism: 1,
          salt: '222aeeab076f4be7a69537c33d16a517',
        },
      },
    });
    expect((await executeAccount('address', walletName, '--json')).publicKey).to.equal(
      account.address,
    );
  });

  it('Check Wallet Address with Secret Key', async () => {
    const resJson = await executeAccount(
      'address',
      walletName,
      '--password',
      'test',
      '--secretKey',
      '--forcePrompt',
      '--json',
    );
    expect(resJson.secretKey).to.equal(account.secretKey);
    const res = await executeAccount(
      'address',
      walletName,
      '--password',
      'test',
      '--secretKey',
      '--forcePrompt',
    );
    expectToMatchLines(res, [
      `Address            ${account.address}`,
      `Secret Key         ${account.secretKey}`,
      `Secret Key in hex  ${secretKeyHex}`,
    ]);
  });

  it('asks for password if it not provided', async () => {
    const walletPath = 'test-artifacts/test-wallet-1.json';
    prompts.inject(['test-password', 'y', 'test-password']);
    const { publicKey } = await executeAccount('create', walletPath, '--json');
    expect(await executeAccount('address', walletPath, '--secretKey')).to.include(publicKey);
  });

  it("don't asks for password if provided password is empty string", async () => {
    const name = 'test-artifacts/test-wallet-2.json';
    await executeAccount('create', name, '--password', '');
    prompts.inject(['y']);
    expect(
      (await executeAccount('address', name, '--password', '', '--secretKey', '--json')).publicKey,
    ).to.be.a('string');
  });

  it('Sign message', async () => {
    const data = 'Hello world';
    const signedMessage = await executeAccount(
      'sign-message',
      WALLET_NAME,
      data,
      '--json',
      '--password',
      'test',
    );
    const signedUsingSDK = Array.from(await aeSdk.signMessage(data));
    sig = signedMessage.signatureHex;
    signedMessage.data.should.be.equal(data);
    signedMessage.address.should.be.equal(aeSdk.address);
    Array.isArray(signedMessage.signature).should.be.equal(true);
    signedMessage.signature.toString().should.be.equal(signedUsingSDK.toString());
    signedMessage.signatureHex.should.be.a('string');
  });

  it('Sign message using file', async () => {
    const { data, signature, signatureHex, address } = await executeAccount(
      'sign-message',
      WALLET_NAME,
      '--json',
      '--filePath',
      fileName,
      '--password',
      'test',
    );
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
    const verifyFromFile = await executeAccount(
      'verify-message',
      aeSdk.address,
      sigFromFile,
      '--json',
      '--filePath',
      fileName,
    );
    verifyFromFile.isCorrect.should.be.equal(true);
  });
});
