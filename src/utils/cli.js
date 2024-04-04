// # Utils `cli` Module
// That script contains helper function's for work with `cli`
import {
  AeSdk, Node, MemoryAccount, CompilerCli, CompilerHttpNode,
} from '@aeternity/aepp-sdk';
import { getWalletByPathAndDecrypt } from './account.js';

export function initSdk({
  url, keypair, compilerUrl, force: ignoreVersion, networkId, accounts = [],
} = {}) {
  return new AeSdk({
    /* eslint-disable no-underscore-dangle */
    _expectedMineRate: process.env._EXPECTED_MINE_RATE,
    _microBlockCycle: process.env._MICRO_BLOCK_CYCLE,
    /* eslint-enable no-underscore-dangle */
    nodes: url ? [{ name: 'test-node', instance: new Node(url, { ignoreVersion }) }] : [],
    ...compilerUrl && {
      onCompiler: compilerUrl === 'cli' ? new CompilerCli() : new CompilerHttpNode(compilerUrl),
    },
    networkId,
    accounts: [...keypair ? [new MemoryAccount(keypair.secretKey)] : [], ...accounts],
  });
}

export async function getAccountByWalletFile(walletPath, password) {
  const keypair = await getWalletByPathAndDecrypt(walletPath, password);
  return { account: new MemoryAccount(keypair.secretKey), keypair };
}

// ## Get account files and decrypt it using password
// After that create sdk instance using this `keyPair`
//
// We use `getWalletByPathAndDecrypt` from `utils/account` to get `keypair` from file
export async function initSdkByWalletFile(walletPath, { password, ...options }) {
  return initSdk({
    ...options,
    accounts: walletPath ? [(await getAccountByWalletFile(walletPath, password)).account] : [],
  });
}
