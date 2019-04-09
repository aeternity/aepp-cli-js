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
import * as R from 'ramda'

import Ae from '@aeternity/aepp-sdk/es/ae/universal'
import Tx from '@aeternity/aepp-sdk/es/tx/tx'
import TxBuilder from '@aeternity/aepp-sdk/es/tx/builder'
import Chain from '@aeternity/aepp-sdk/es/chain/node'
import Account from '@aeternity/aepp-sdk/es/account/memory'
import { getWalletByPathAndDecrypt } from './account'
import ContractCompilerAPI from '@aeternity/aepp-sdk/es/contract/compiler'

// ## Merge options with parent options.
export function getCmdFromArguments (args) {
  return R.merge(
    R.head(args),
    R.head(args).parent
  )
}

// Create `Ae` client
export async function initClient ({ url, keypair, internalUrl, compilerUrl, force: forceCompatibility, native: nativeMode = true, networkId }) {
  return Ae({ url, process, keypair, internalUrl, compilerUrl, forceCompatibility, nativeMode, networkId })
}
// Create `TxBuilder` client
export async function initTxBuilder ({ url, internalUrl, force: forceCompatibility, native: nativeMode = true, showWarning = true }) {
  return Tx({ url, internalUrl, forceCompatibility, nativeMode, showWarning })
}
// Create `OfflineTxBuilder` client
export function initOfflineTxBuilder () {
  return TxBuilder
}
// Create `Chain` client
export async function initChain ({ url, internalUrl, compilerUrl, force: forceCompatibility }) {
  return Chain({ url, internalUrl, compilerUrl, forceCompatibility })
}

// Create `Chain` client
export async function initCompiler ({ url, internalUrl, compilerUrl, force: forceCompatibility }) {
  return ContractCompilerAPI({ compilerUrl })
}

// ## Get account files and decrypt it using password
// After that create`Ae` client using this `keyPair`
//
// We use `getWalletByPathAndDecrypt` from `utils/account` to get `keypair` from file
export async function initClientByWalletFile (walletPath, options, returnKeyPair = false) {
  const { password, privateKey, accountOnly = false, networkId } = options
  const keypair = await getWalletByPathAndDecrypt(walletPath, { password, privateKey })

  const client = accountOnly
    ? await Account(R.merge(options, { keypair, networkId }))
    : await initClient(R.merge(options, { keypair }))
  // const client = accountOnly ? await Account({ keypair, networkId }) : await initClient(R.merge(options, { keypair }))
  if (returnKeyPair)
    return { client, keypair }
  return client
}

// ## Initialize commander executable commands
export function initExecCommands (program) {
  return (cmds) => cmds.forEach(({ name, desc }) => program.command(name, desc))
}

// ## Check if `command` is `EXECUTABLE`
export function isExecCommand (cmd, execCommands) {
  return execCommands.find(({ name }) => cmd === name)
}
