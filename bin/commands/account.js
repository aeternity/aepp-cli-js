#!/usr/bin/env node
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
import { exit, initClientByWalletFile } from '../utils/cli'
import { handleApiError } from '../utils/errors'
import { print, printError, printTransaction, printUnderscored } from '../utils/print'
import { checkPref, readFile } from '../utils/helpers'
import { PROMPT_TYPE, prompt } from '../utils/prompt'

// ## `Sign message` function
// this function allow you to `sign` arbitrary data
async function signMessage (walletPath, data = [], options) {
  const { json, filePath } = options
  const dataForSign = filePath ? readFile(filePath) : data.reduce((acc, el, i) => `${acc}${i === 0 ? el : ' ' + el}`, '')
  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Account` flavor with this `keyPair`
    if (dataForSign.length >= 0xFD) throw new Error('Message too long!')
    const client = await initClientByWalletFile(walletPath, { ...options, accountOnly: true })
    await handleApiError(async () => {
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
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## `Verify` function
// this function allow you to `verify` signed data
async function verifyMessage (walletPath, hexSignature, data = [], options) {
  const { json, filePath } = options
  const dataForVerify = filePath ? readFile(filePath) : data.reduce((acc, el, i) => `${acc}${i === 0 ? el : ' ' + el}`, '')
  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Account` flavor with this `keyPair`
    if (dataForVerify.length >= 0xFD) throw new Error('Message too long!')
    const client = await initClientByWalletFile(walletPath, { ...options, accountOnly: true })
    await handleApiError(async () => {
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
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## `Sign` function
// this function allow you to `sign` transaction's
async function sign (walletPath, tx, options) {
  const { json } = options
  try {
    // Validate `tx` hash
    if (tx.slice(0, 2) !== 'tx') { throw new Error('Invalid transaction hash') }

    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Account` flavor with this `keyPair`
    const client = await initClientByWalletFile(walletPath, { ...options, accountOnly: true })

    await handleApiError(async () => {
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
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## `Spend` function
// this function allow you to `send` token's to another `account`
async function spend (walletPath, receiverNameOrAddress, amount, options) {
  const { ttl, json, nonce, fee, payload = '', denomination = AmountFormatter.AE_AMOUNT_FORMATS.AETTOS } = options
  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const client = await initClientByWalletFile(walletPath, options)

    await handleApiError(async () => {
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
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## `Transfer` function
// this function allow you to `send` % of balance to another `account`
async function transferFunds (walletPath, receiver, percentage, options) {
  const { ttl, json, nonce, fee, payload = '', excludeFee } = options
  percentage = parseFloat(percentage)
  try {
    checkPref(receiver, HASH_TYPES.account)
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const client = await initClientByWalletFile(walletPath, options)

    await handleApiError(async () => {
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
      exit()
    })
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## Get `balance` function
// This function allow you retrieve account `balance`
async function getBalance (walletPath, options) {
  const { height, hash, json } = options
  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const { client, keypair } = await initClientByWalletFile(walletPath, options, true)
    await handleApiError(
      async () => {
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
        exit()
      }
    )
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## Get `address` function
// This function allow you retrieve account `public` and `private` keys
async function getAddress (walletPath, options) {
  const { privateKey, forcePrompt = false, json } = options
  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const { client, keypair } = await initClientByWalletFile(walletPath, { ...options, accountOnly: true }, true)

    await handleApiError(
      async () => {
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
        exit(1)
      }
    )
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## Get `nonce` function
// This function allow you retrieve account `nonce`
async function getAccountNonce (walletPath, options) {
  const { json } = options
  try {
    // Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`
    const { client, keypair } = await initClientByWalletFile(walletPath, options, true)

    await handleApiError(
      async () => {
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
        process.exit()
      }
    )
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## Create secure `wallet` file
// This function allow you to generate `keypair` and write it to secure `ethereum` like key-file
async function createSecureWallet (walletPath, { output, password, overwrite, json }) {
  try {
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
    exit()
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## Create secure `wallet` file from `private-key`
// This function allow you to generate `keypair` from `private-key` and write it to secure `ethereum` like key-file
async function createSecureWalletByPrivKey (walletPath, priv, { output, password, overwrite, json }) {
  try {
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
    exit()
  } catch (e) {
    printError(e.message)
    exit(1)
  }
}

// ## Create secure `wallet` file from `private-key`
// This function allow you to generate `keypair` from `private-key` and write it to secure `ethereum` like key-file
async function generateKeyPairs (count = 1, { forcePrompt, json }) {
  try {
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
    } else {
      exit()
    }
    exit()
  } catch (e) {
    printError(e.message)
    exit(1)
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
