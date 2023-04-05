// # Utils `cli` Module
// That script contains helper function's for work with `cli`
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
import {
  AeSdk, Node, MemoryAccount, CompilerCli, CompilerHttpNode,
} from '@aeternity/aepp-sdk';
import { getWalletByPathAndDecrypt } from './account';

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
