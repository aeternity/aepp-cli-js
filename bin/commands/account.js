// # æternity CLI `account` file
//
// This script initialize all `account` function
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

import { Crypto, AmountFormatter } from '@aeternity/aepp-sdk'

import { generateSecureWallet, generateSecureWalletFromPrivKey } from '../utils/account'
import { HASH_TYPES } from '../utils/constant'
import { initClientByWalletFile } from '../utils/cli'
import { print, printTransaction, printUnderscored } from '../utils/print'
import { checkPref, readFile } from '../utils/helpers'
import { PROMPT_TYPE, prompt } from '../utils/prompt'

// ## `Sign message` function
// this function allow you to `sign` arbitrary data
async function signMessage (walletPath, data = [], options) {
  const { json, filePath } = options
  const dataForSign = filePath ? readFile(filePath) : data.reduce((acc, el, i) => `${acc}${i === 0 ? el : ' ' + el}`, '')
  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Account` flavor with this `keyPair`
  if (dataForSign.length >= 0xFD) throw new Error('Message too long!')
  const client = await initClientByWalletFile(walletPath, { ...options, accountOnly: true })
  const signedMessage = await client.signMessage(dataForSign)
  const address = await client.address()
  const result = {
    data: typeof dataForSign !== 'string' ? Array.from(dataForSign) : dataForSign,
    address,
    signature: Array.from(signedMessage),
    signatureHex: Buffer.from(signedMessage).toString('hex')
  }
  if (json) {
    print(result)
  } else {
    printUnderscored('Unsigned', result.data)
    printUnderscored('Signing account address', result.address)
    printUnderscored('Signature', result.signature)
    printUnderscored('Signature Hex', result.signatureHex)
  }
}

// ## `Verify` function
// this function allow you to `verify` signed data
async function verifyMessage (walletPath, hexSignature, data = [], options) {
  const { json, filePath } = options
  const dataForVerify = filePath ? readFile(filePath) : data.reduce((acc, el, i) => `${acc}${i === 0 ? el : ' ' + el}`, '')
  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Account` flavor with this `keyPair`
  if (dataForVerify.length >= 0xFD) throw new Error('Message too long!')
  const client = await initClientByWalletFile(walletPath, { ...options, accountOnly: true })
  const isCorrect = await client.verifyMessage(dataForVerify, hexSignature)
  const result = {
    data: typeof dataForVerify !== 'string' ? Array.from(dataForVerify) : dataForVerify,
    isCorrect
  }
  if (json) {
    print(result)
  } else {
    printUnderscored('Valid signature', isCorrect)
    printUnderscored('Data', dataForVerify)
  }
}

// ## `Sign` function
// this function allow you to `sign` transaction's
async function sign (walletPath, tx, options) {
  const { json } = options
  // Validate `tx` hash
  if (tx.slice(0, 2) !== 'tx') { throw new Error('Invalid transaction hash') }

  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Account` flavor with this `keyPair`
  const client = await initClientByWalletFile(walletPath, { ...options, accountOnly: true })

  const signedTx = await client.signTransaction(tx)
  const address = await client.address()
  const networkId = client.getNetworkId()
  if (json) {
    print({ signedTx, address, networkId })
  } else {
    printUnderscored('Signing account address', address)
    printUnderscored('Network ID', networkId)
    printUnderscored('Unsigned', tx)
    printUnderscored('Signed', signedTx)
  }
}

// ## `Spend` function
// this function allow you to `send` token's to another `account`
async function spend (walletPath, receiverNameOrAddress, amount, options) {
  const { ttl, json, nonce, fee, payload = '', denomination = AmountFormatter.AE_AMOUNT_FORMATS.AETTOS } = options
  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const client = await initClientByWalletFile(walletPath, options)

  let tx = await client.spend(amount, receiverNameOrAddress, { ttl, nonce, payload, fee, denomination })
  // if waitMined false
  if (typeof tx !== 'object') {
    tx = await client.tx(tx)
  } else {
    !json && print('Transaction mined')
  }
  json
    ? print({ tx })
    : printTransaction(tx, json)
}

// ## `Transfer` function
// this function allow you to `send` % of balance to another `account`
async function transferFunds (walletPath, receiver, percentage, options) {
  const { ttl, json, nonce, fee, payload = '', excludeFee } = options
  percentage = parseFloat(percentage)
  checkPref(receiver, HASH_TYPES.account)
  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const client = await initClientByWalletFile(walletPath, options)

  let tx = await client.transferFunds(percentage, receiver, { ttl, nonce, payload, fee, excludeFee })
  // if waitMined false
  if (typeof tx !== 'object') {
    tx = await client.tx(tx)
  } else {
    !json && print('Transaction mined')
  }
  if (json) {
    print({ tx })
  } else {
    printTransaction(tx, json)
  }
}

// ## Get `balance` function
// This function allow you retrieve account `balance`
async function getBalance (walletPath, options) {
  const { height, hash, json } = options
  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const { client, keypair } = await initClientByWalletFile(walletPath, options, true)
  const nonce = await client.getAccountNonce(keypair.publicKey)
  const balance = await client.balance(keypair.publicKey, { height: +height, hash })
  const address = await client.address()
  if (json) {
    print({ address, nonce, balance })
  } else {
    printUnderscored('Balance', balance)
    printUnderscored('ID', address)
    printUnderscored('Nonce', nonce)
  }
}

// ## Get `address` function
// This function allow you retrieve account `public` and `private` keys
async function getAddress (walletPath, options) {
  const { privateKey, forcePrompt = false, json } = options
  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const { client, keypair } = await initClientByWalletFile(walletPath, { ...options, accountOnly: true }, true)

  if (json) {
    if (privateKey) {
      if (forcePrompt || await prompt(PROMPT_TYPE.confirm, { message: 'Are you sure you want print your secret key?' })) {
        print({ publicKey: await client.address(), secretKey: keypair.secretKey })
      }
    } else {
      print({ publicKey: await client.address() })
    }
  } else {
    printUnderscored('Address', await client.address())
    if (privateKey) {
      if (forcePrompt || await prompt(PROMPT_TYPE.confirm, { message: 'Are you sure you want print your secret key?' })) {
        printUnderscored('Secret Key', keypair.secretKey)
      }
    }
  }
}

// ## Get `nonce` function
// This function allow you retrieve account `nonce`
async function getAccountNonce (walletPath, options) {
  const { json } = options
  // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
  const { client, keypair } = await initClientByWalletFile(walletPath, options, true)

  const nonce = await client.getAccountNonce(keypair.publicKey)
  if (json) {
    print({
      id: keypair.publicKey,
      nonce: nonce - 1,
      nextNonce: nonce
    })
  } else {
    printUnderscored('ID', keypair.publicKey)
    printUnderscored('Nonce', nonce - 1)
    printUnderscored('Next Nonce', nonce)
  }
}

// ## Create secure `wallet` file
// This function allow you to generate `keypair` and write it to secure `ethereum` like key-file
async function createSecureWallet (walletPath, { output, password, overwrite, json }) {
  const { publicKey, path } = await generateSecureWallet(walletPath, { output, password, overwrite })
  if (json) {
    print({
      publicKey,
      path
    })
  } else {
    printUnderscored('Address', publicKey)
    printUnderscored('Path', path)
  }
}

// ## Create secure `wallet` file from `private-key`
// This function allow you to generate `keypair` from `private-key` and write it to secure `ethereum` like key-file
async function createSecureWalletByPrivKey (walletPath, priv, { output, password, overwrite, json }) {
  const { publicKey, path } = await generateSecureWalletFromPrivKey(walletPath, priv, { output, password, overwrite })
  if (json) {
    print({
      publicKey,
      path
    })
  } else {
    printUnderscored('Address', publicKey)
    printUnderscored('Path', path)
  }
}

// ## Create secure `wallet` file from `private-key`
// This function allow you to generate `keypair` from `private-key` and write it to secure `ethereum` like key-file
async function generateKeyPairs (count = 1, { forcePrompt, json }) {
  if (!Number.isInteger(+count)) {
    throw new Error('Count must be an Number')
  }
  if (forcePrompt || await prompt(PROMPT_TYPE.confirm, { message: 'Are you sure you want print your secret key?' })) {
    const accounts = Array.from(Array(parseInt(count))).map(_ => Crypto.generateKeyPair(false))
    if (json) {
      print(JSON.stringify(accounts, null, 2))
    } else {
      accounts.forEach((acc, i) => {
        printUnderscored('Account index', i)
        printUnderscored('Public Key', acc.publicKey)
        printUnderscored('Secret Key', acc.secretKey)
        print('')
      })
    }
  }
}

export const Account = {
  spend,
  getBalance,
  getAddress,
  getAccountNonce,
  createSecureWallet,
  createSecureWalletByPrivKey,
  sign,
  transferFunds,
  generateKeyPairs,
  signMessage,
  verifyMessage
}
