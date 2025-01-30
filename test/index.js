import { use } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { before, after } from 'mocha';
import mockFs from 'mock-fs';
import { AeSdk, MemoryAccount, Node, CompilerHttpNode } from '@aeternity/aepp-sdk';
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

const secretKey = 'sk_2CuofqWZHrABCrM7GY95YSQn8PyFvKQadnvFnpwhjUnDCFAWmf';
export const networkId = 'ae_dev';
const account = MemoryAccount.generate();
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
  await aeSdk.spend(5e20, account.address);
})();

export async function getSdk() {
  await spendPromise;
  const tempAccount = MemoryAccount.generate();
  const aeSdk = new AeSdkWithEnv({
    accounts: [new MemoryAccount(tempAccount.secretKey)],
  });
  await Promise.all([
    executeProgram(
      'account',
      'create',
      WALLET_NAME,
      '--password',
      'test',
      tempAccount.secretKey,
      '--overwrite',
    ),
    aeSdk.spend(5e19, tempAccount.address, { onAccount: account }),
  ]);
  return aeSdk;
}
