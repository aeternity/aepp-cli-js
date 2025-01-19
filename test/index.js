import { expect, use, should } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { before, after } from 'mocha';
import mockFs from 'mock-fs';
import { AeSdk, MemoryAccount, Node, generateKeyPair, CompilerHttpNode } from '@aeternity/aepp-sdk';
import executeProgram, { url, compilerUrl } from '../scripts/execute-program.js';

export { default as executeProgram } from '../scripts/execute-program.js';

before(() => {
  mockFs({
    'test-artifacts': {},
    'test/contracts': mockFs.load('test/contracts'),
  });
});

after(() => {
  mockFs.restore();
});

use(chaiAsPromised);
should();

const secretKey =
  '9ebd7beda0c79af72a42ece3821a56eff16359b6df376cf049aee995565f022f840c974b97164776454ba119d84edc4d6058a8dec92b6edc578ab2d30b4c4200';
export const networkId = 'ae_dev';
const keypair = generateKeyPair();
export const WALLET_NAME = 'test-artifacts/wallet.json';

class AeSdkWithEnv extends AeSdk {
  constructor(params = {}) {
    params.accounts ??= [new MemoryAccount(secretKey)];
    super({
      onCompiler: new CompilerHttpNode(compilerUrl),
      nodes: [{ name: 'test', instance: new Node(url) }],
      ...params,
    });
  }
}

const spendPromise = (async () => {
  const aeSdk = new AeSdkWithEnv();
  await aeSdk.spend(5e20, keypair.publicKey);
})();

export async function getSdk() {
  await spendPromise;
  const tempKeyPair = generateKeyPair();
  const aeSdk = new AeSdkWithEnv({
    accounts: [new MemoryAccount(tempKeyPair.secretKey)],
  });
  await Promise.all([
    executeProgram(
      'account',
      'create',
      WALLET_NAME,
      '--password',
      'test',
      tempKeyPair.secretKey,
      '--overwrite',
    ),
    aeSdk.spend(5e19, tempKeyPair.publicKey, {
      onAccount: new MemoryAccount(keypair.secretKey),
    }),
  ]);
  return aeSdk;
}

export function randomName(length = 18) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const random = new Array(length)
    .fill()
    .map(() => chars[Math.floor(Math.random() * chars.length)])
    .join('');
  return `${random}.chain`;
}

export function expectToMatchLines(value, testLines) {
  try {
    const valueLines = value.split('\n');
    testLines.forEach((test) => {
      if (typeof test === 'string') return expect(valueLines.shift()).to.be.equal(test);
      if (test instanceof RegExp) return expect(valueLines.shift()).to.be.match(test);
      throw new Error(`Unexpected test line: ${test}`);
    });
    expect(valueLines.join('\n')).to.be.equal('');
  } catch (error) {
    const stackItems = error.stack.split('\n');
    stackItems.splice(1, 3);
    error.stack = stackItems.join('\n');
    error.message += `\nWhole value:\n${value}`;
    throw error;
  }
}
