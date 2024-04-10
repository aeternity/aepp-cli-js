// # Utils `cli` Module
// That script contains helper function's for work with `cli`
import fs from 'fs-extra';
import {
  AeSdk, Node, MemoryAccount, CompilerCli, CompilerCli8, CompilerHttpNode, recover, sign,
} from '@aeternity/aepp-sdk';
import { PROMPT_TYPE, prompt } from './prompt.js';
import { getFullPath } from './helpers.js';

export function getCompilerByUrl(url) {
  if (url === 'cli') return new CompilerCli();
  if (url === 'cli8') return new CompilerCli8();
  return new CompilerHttpNode(url);
}

export function initSdk({
  url, keypair, compilerUrl, force: ignoreVersion, networkId, accounts = [],
} = {}) {
  return new AeSdk({
    /* eslint-disable no-underscore-dangle */
    _expectedMineRate: process.env._EXPECTED_MINE_RATE,
    _microBlockCycle: process.env._MICRO_BLOCK_CYCLE,
    /* eslint-enable no-underscore-dangle */
    nodes: url ? [{ name: 'test-node', instance: new Node(url, { ignoreVersion }) }] : [],
    ...compilerUrl && { onCompiler: getCompilerByUrl(compilerUrl) },
    networkId,
    accounts: [...keypair ? [new MemoryAccount(keypair.secretKey)] : [], ...accounts],
  });
}

export class AccountCli extends MemoryAccount {
  #keyFile;

  #password;

  #secretKey;

  constructor(keyFile, password) {
    super(Buffer.alloc(64));
    this.#keyFile = keyFile;
    this.#password = password;
    this.address = keyFile.public_key;
  }

  async getSecretKey() {
    this.#secretKey ??= await recover(
      this.#password ?? await prompt(PROMPT_TYPE.askPassword),
      this.#keyFile,
    );
    return this.#secretKey;
  }

  async sign(data) {
    const secretKey = await this.getSecretKey();
    return sign(data, Buffer.from(secretKey, 'hex'));
  }

  // Get account file by path, decrypt it using password and return AccountCli
  static async read(path, password) {
    const keyFile = await fs.readJson(getFullPath(path));
    return new AccountCli(keyFile, password);
  }
}

// ## Get account files and decrypt it using password
// After that create sdk instance using this `keyPair`
export async function initSdkByWalletFile(walletPath, { password, ...options }) {
  return initSdk({
    ...options,
    accounts: walletPath ? [await AccountCli.read(walletPath, password)] : [],
  });
}
