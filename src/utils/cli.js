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
  Universal, Node, Transaction, TxBuilder, ChainNode, MemoryAccount,
} from '@aeternity/aepp-sdk';
import { getWalletByPathAndDecrypt } from './account';

// ## Merge options with parent options.
export function getCmdFromArguments([options, commander]) {
  return { ...options, ...commander.parent.opts() };
}

// Create `Universal` sdk
export async function initSdk({
  url, keypair, compilerUrl, force: ignoreVersion, native: nativeMode = true, networkId, accounts = [],
}) {
  return Universal({
    nodes: [{ name: 'test-node', instance: await Node({ url, ignoreVersion }) }],
    compilerUrl,
    nativeMode,
    networkId,
    accounts: [...keypair ? [MemoryAccount({ keypair })] : [], ...accounts],
  });
}
// Create `TxBuilder` sdk
export async function initTxBuilder({
  url, force: ignoreVersion, native: nativeMode = true, showWarning = true,
}) {
  return Transaction({
    nodes: [{ name: 'test-node', instance: await Node({ url, ignoreVersion }) }],
    nativeMode,
    ignoreVersion,
    showWarning,
  });
}
// Create `OfflineTxBuilder` sdk
export function initOfflineTxBuilder() {
  return TxBuilder;
}
// Create `ChainNode` sdk
export async function initChain({ url, force: ignoreVersion }) {
  return ChainNode({
    nodes: [{ name: 'test-node', instance: await Node({ url, ignoreVersion }) }],
    ignoreVersion,
  });
}

// ## Get account files and decrypt it using password
// After that create `Universal` sdk using this `keyPair`
//
// We use `getWalletByPathAndDecrypt` from `utils/account` to get `keypair` from file
export async function initSdkByWalletFile(walletPath, options, returnKeyPair = false) {
  const {
    password, accountOnly = false, networkId, debug = true,
  } = options;

  const keypair = await getWalletByPathAndDecrypt(walletPath, password);
  const accounts = [MemoryAccount({ ...options, keypair, networkId })];

  const sdk = accountOnly
    ? accounts[0]
    : await initSdk({ ...options, accounts, debug });
  if (returnKeyPair) {
    return { sdk, keypair };
  }
  return sdk;
}
