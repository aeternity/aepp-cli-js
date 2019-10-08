





  

```js
#!/usr/bin/env node

```







# æternity CLI `account` file

This script initialize all `account` function


  

```js
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

import { generateKeyPair } from '@aeternity/aepp-sdk/es/utils/crypto'
import { generateSecureWallet, generateSecureWalletFromPrivKey } from '../utils/account'
import { HASH_TYPES } from '../utils/constant'
import { initClientByWalletFile } from '../utils/cli'
import { handleApiError } from '../utils/errors'
import { print, printError, printTransaction, printUnderscored } from '../utils/print'
import { checkPref } from '../utils/helpers'
import { PROMPT_TYPE, prompt } from '../utils/prompt'


```







## `Sign` function
this function allow you to `sign` transaction's


  

```js
async function sign (walletPath, tx, options) {
  const { json } = options
  try {

```







Validate `tx` hash


  

```js
    if (tx.slice(0, 2) !== 'tx') { throw new Error('Invalid transaction hash') }


```







Get `keyPair` by `walletPath`, decrypt using password and initialize `Account` flavor with this `keyPair`


  

```js
    const client = await initClientByWalletFile(walletPath, { ...options, accountOnly: true })

    await handleApiError(async () => {
      const signedTx = await client.signTransaction(tx)
      if (json) {
        print({ signedTx })
      } else {
        printUnderscored('Signing account address', await client.address())
        printUnderscored('Network ID', client.networkId || client.nodeNetworkId || 'ae_mainnet') // TODO add getNetworkId function to SDK
        printUnderscored('Unsigned', tx)
        printUnderscored('Signed', signedTx)
      }
      process.exit(0)
    })
  } catch (e) {
    printError(e.message)
  }
}


```







## `Spend` function
this function allow you to `send` token's to another `account`


  

```js
async function spend (walletPath, receiver, amount, options) {
  let { ttl, json, nonce, fee, payload = '' } = options
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)
  fee = parseInt(fee)
  try {
    checkPref(receiver, HASH_TYPES.account)

```







Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`


  

```js
    const client = await initClientByWalletFile(walletPath, options)

    await handleApiError(async () => {
      let tx = await client.spend(amount, receiver, { ttl, nonce, payload, fee })

```







if waitMined false


  

```js
      if (typeof tx !== 'object') {
        tx = await client.tx(tx)
      } else {
        !json && print('Transaction mined')
      }
      json
        ? print({ tx })
        : printTransaction(tx, json)
      process.exit(0)
    })
  } catch (e) {
    printError(e.message)
  }
}


```







## `Transfer` function
this function allow you to `send` % of balance to another `account`


  

```js
async function transferFunds (walletPath, receiver, percentage, options) {
  let { ttl, json, nonce, fee, payload = '', excludeFee } = options
  ttl = parseInt(ttl)
  nonce = parseInt(nonce)
  fee = parseInt(fee)
  percentage = parseFloat(percentage)
  try {
    checkPref(receiver, HASH_TYPES.account)

```







Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`


  

```js
    const client = await initClientByWalletFile(walletPath, options)

    await handleApiError(async () => {
      let tx = await client.transferFunds(percentage, receiver, { ttl, nonce, payload, fee, excludeFee })

```







if waitMined false


  

```js
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
      process.exit(0)
    })
  } catch (e) {
    printError(e.message)
  }
}


```







## Get `balance` function
This function allow you retrieve account `balance`


  

```js
async function getBalance (walletPath, options) {
  const { height, hash } = options
  try {

```







Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`


  

```js
    const { client, keypair } = await initClientByWalletFile(walletPath, options, true)
    await handleApiError(
      async () => {
        const nonce = await client.getAccountNonce(keypair.publicKey)
        printUnderscored('Balance', await client.balance(keypair.publicKey, { height: +height, hash }))
        printUnderscored('ID', await client.address())
        printUnderscored('Nonce', nonce)
        process.exit(0)
      }
    )
  } catch (e) {
    printError(e.message)
  }
}


```







## Get `address` function
This function allow you retrieve account `public` and `private` keys


  

```js
async function getAddress (walletPath, options) {
  const { privateKey, forcePrompt = false, json } = options
  try {

```







Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`


  

```js
    const { client, keypair } = await initClientByWalletFile(walletPath, { ...options, accountOnly: true }, true)

    await handleApiError(
      async () => {
        if (json) {
          if (privateKey) {
            if (forcePrompt || await prompt(PROMPT_TYPE.confirm, { message: 'Are you sure you want print your secret key?' })) {
              printUnderscored('Secret Key', keypair.secretKey)
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
        process.exit(0)
      }
    )
  } catch (e) {
    printError(e.message)
  }
}


```







## Get `nonce` function
This function allow you retrieve account `nonce`


  

```js
async function getAccountNonce (walletPath, options) {
  const { json } = options
  try {

```







Get `keyPair` by `walletPath`, decrypt using password and initialize `Ae` client with this `keyPair`


  

```js
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
        process.exit(0)
      }
    )
  } catch (e) {
    printError(e.message)
  }
}


```







## Create secure `wallet` file
This function allow you to generate `keypair` and write it to secure `ethereum` like key-file


  

```js
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
    process.exit(0)
  } catch (e) {
    printError(e.message)
  }
}


```







## Create secure `wallet` file from `private-key`
This function allow you to generate `keypair` from `private-key` and write it to secure `ethereum` like key-file


  

```js
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
    process.exit(0)
  } catch (e) {
    printError(e.message)
  }
}


```







## Create secure `wallet` file from `private-key`
This function allow you to generate `keypair` from `private-key` and write it to secure `ethereum` like key-file


  

```js
async function generateKeyPairs (count = 1, { forcePrompt, json }) {
  try {
    if (!Number.isInteger(+count)) {
      throw new Error('Count must be an Number')
    }
    if (forcePrompt || await prompt(PROMPT_TYPE.confirm, { message: 'Are you sure you want print your secret key?' })) {
      const accounts = Array.from(Array(parseInt(count))).map(_ => generateKeyPair(false))
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
      process.exit(0)
    }
    process.exit(0)
  } catch (e) {
    printError(e.message)
    process.exit(1)
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
  generateKeyPairs
}


```




