import fs from 'fs-extra';
import {
  AeSdk,
  Node,
  MemoryAccount,
  CompilerCli,
  CompilerHttpNode,
  getExecutionCost,
  unpackTx,
  Tag,
  encode,
  Encoding,
} from '@aeternity/aepp-sdk';
import { recover } from './keystore.js';
import { PROMPT_TYPE, prompt } from './prompt.js';
import { getFullPath } from './helpers.js';

export function getCompilerByUrl(url) {
  if (url === 'cli8') return new CompilerCli();
  return new CompilerHttpNode(url);
}

export function initSdk({
  url,
  keypair,
  compilerUrl,
  force: ignoreVersion,
  networkId,
  accounts = [],
} = {}) {
  return new AeSdk({
    nodes: url ? [{ name: 'test-node', instance: new Node(url, { ignoreVersion }) }] : [],
    ...(compilerUrl && { onCompiler: getCompilerByUrl(compilerUrl) }),
    networkId,
    accounts: [...(keypair ? [new MemoryAccount(keypair.secretKey)] : []), ...accounts],
  });
}

export class AccountCli extends MemoryAccount {
  #keyFile;

  #password;

  #account;

  constructor(keyFile, password) {
    super(encode(Buffer.alloc(32), Encoding.AccountSecretKey));
    this.#keyFile = keyFile;
    this.#password = password;
    this.address = keyFile.public_key;
  }

  async #getAccount() {
    this.#account ??= new MemoryAccount(
      await recover(this.#password ?? (await prompt(PROMPT_TYPE.askPassword)), this.#keyFile),
    );
    return this.#account;
  }

  async getSecretKey() {
    return (await this.#getAccount()).secretKey;
  }

  async sign(data) {
    const account = await this.#getAccount();
    return account.sign(data);
  }

  async signTransaction(transaction, options) {
    const cost = Number(getExecutionCost(transaction)) / 1e18;
    const txType = Tag[unpackTx(transaction).tag];
    console.warn(`Cost of ${txType} execution ≈ ${cost}ae`);
    return super.signTransaction(transaction, options);
  }

  static async read(path, password) {
    const keyFile = await fs.readJson(getFullPath(path));
    return new AccountCli(keyFile, password);
  }
}

export async function initSdkByWalletFile(walletPath, { password, ...options }) {
  return initSdk({
    ...options,
    accounts: walletPath ? [await AccountCli.read(walletPath, password)] : [],
  });
}
