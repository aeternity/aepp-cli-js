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
import { Universal, Node, Transaction, TxBuilder, ChainNode, MemoryAccount, ContractCompilerAPI } from '@aeternity/aepp-sdk'
import { getWalletByPathAndDecrypt } from './account'

// ## Merge options with parent options.
export function getCmdFromArguments ([options, commander]) {
  return { ...options, ...commander.parent.opts() }
}

// Create `Universal` client
async function initClient ({ url, keypair, internalUrl, compilerUrl, force: ignoreVersion, native: nativeMode = true, networkId, accounts = [] }) {
  return Universal({
    nodes: [{ name: 'test-node', instance: await Node({ url, internalUrl, ignoreVersion }) }],
    process,
    internalUrl,
    compilerUrl,
    nativeMode,
    networkId,
    accounts: [...keypair ? [MemoryAccount({ keypair })] : [], ...accounts]
  })
}
// Create `TxBuilder` client
export async function initTxBuilder ({ url, internalUrl, force: ignoreVersion, native: nativeMode = true, showWarning = true }) {
  return Transaction({
    nodes: [{ name: 'test-node', instance: await Node({ url, internalUrl, ignoreVersion }) }],
    nativeMode,
    ignoreVersion,
    showWarning
  })
}
// Create `OfflineTxBuilder` client
export function initOfflineTxBuilder () {
  return TxBuilder
}
// Create `ChainNode` client
export async function initChain ({ url, internalUrl, force: ignoreVersion }) {
  return ChainNode({
    nodes: [{ name: 'test-node', instance: await Node({ url, internalUrl, ignoreVersion }) }],
    ignoreVersion
  })
}

export async function initCompiler ({ url, internalUrl, compilerUrl, ignoreVersion }) {
  return ContractCompilerAPI({ compilerUrl, ignoreVersion })
}

// ## Get account files and decrypt it using password
// After that create `Universal` client using this `keyPair`
//
// We use `getWalletByPathAndDecrypt` from `utils/account` to get `keypair` from file
export async function initClientByWalletFile (walletPath, options, returnKeyPair = false) {
  const { password, accountOnly = false, networkId, debug = true } = options

  const keypair = await getWalletByPathAndDecrypt(walletPath, password)
  const accounts = [MemoryAccount({ ...options, keypair, networkId })]

  const client = accountOnly
    ? accounts[0]
    : await initClient({ ...options, accounts, debug })
  if (returnKeyPair) {
    return { client, keypair }
  }
  return client
}
