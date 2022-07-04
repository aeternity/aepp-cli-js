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
import { AeSdk, Node, MemoryAccount } from '@aeternity/aepp-sdk';
import { getWalletByPathAndDecrypt } from './account';

// ## Merge options with parent options.
export function getCmdFromArguments([options, commander]) {
  return { ...options, ...commander.parent.opts() };
}

class Sdk extends AeSdk {
  async getTransaction(txHash) {
    const [entry, info] = await Promise.all([
      this.api.getTransactionByHash(txHash),
      this.api.getTransactionInfoByHash(txHash).catch((error) => {
        if (error.details?.reason === 'Tx has no info') return {};
        throw error;
      }),
    ]);
    return { ...entry, ...info };
  }
}

export async function initSdk({
  url, keypair, compilerUrl, force: ignoreVersion, networkId, accounts = [],
} = {}) {
  const sdk = new Sdk({
    nodes: url ? [{ name: 'test-node', instance: new Node(url, { ignoreVersion }) }] : [],
    compilerUrl,
    networkId,
  });
  await Promise.all([...keypair ? [new MemoryAccount({ keypair })] : [], ...accounts]
    .map((account, idx) => sdk.addAccount(account, { select: idx === 0 })));
  return sdk;
}

export async function getAccountByWalletFile(walletPath, options) {
  const keypair = await getWalletByPathAndDecrypt(walletPath, options.password);
  const accounts = [new MemoryAccount({ ...options, keypair })];
  return { account: accounts[0], keypair };
}

// ## Get account files and decrypt it using password
// After that create sdk instance using this `keyPair`
//
// We use `getWalletByPathAndDecrypt` from `utils/account` to get `keypair` from file
export async function initSdkByWalletFile(walletPath, options) {
  const { account } = await getAccountByWalletFile(walletPath, options);
  return initSdk({ ...options, accounts: [account] });
}
