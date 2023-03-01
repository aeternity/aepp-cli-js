// # æternity CLI `account` file
//
// This script initialize all `account` function
/*
 * ISC License (ISC)
 * Copyright (c) 2022 aeternity developers
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

import fs from 'fs-extra';
import { generateKeyPair } from '@aeternity/aepp-sdk';
import CliError from '../utils/CliError';
import { writeWallet } from '../utils/account';
import { initSdkByWalletFile, getAccountByWalletFile } from '../utils/cli';
import { print, printTransaction, printUnderscored } from '../utils/print';
import { decode } from '../utils/helpers';
import { PROMPT_TYPE, prompt } from '../utils/prompt';

// ## `Sign message` function
// this function allow you to `sign` arbitrary data
export async function signMessage(walletPath, data = [], options) {
  const { json, filePath } = options;
  const dataForSign = filePath ? await fs.readFile(filePath) : data.join(' ');
  const { account } = await getAccountByWalletFile(walletPath, options);
  const signedMessage = await account.signMessage(dataForSign);
  const address = await account.address();
  const result = {
    data: typeof dataForSign !== 'string' ? Array.from(dataForSign) : dataForSign,
    address,
    signature: Array.from(signedMessage),
    signatureHex: Buffer.from(signedMessage).toString('hex'),
  };
  if (json) {
    print(result);
  } else {
    printUnderscored('Unsigned', result.data);
    printUnderscored('Signing account address', result.address);
    printUnderscored('Signature', result.signature);
    printUnderscored('Signature Hex', result.signatureHex);
  }
}

// ## `Verify` function
// this function allow you to `verify` signed data
export async function verifyMessage(walletPath, hexSignature, data = [], options) {
  const { json, filePath } = options;
  const dataForVerify = filePath ? await fs.readFile(filePath) : data.join(' ');
  const { account } = await getAccountByWalletFile(walletPath, options);
  const isCorrect = await account.verifyMessage(dataForVerify, hexSignature);
  const result = {
    data: typeof dataForVerify !== 'string' ? Array.from(dataForVerify) : dataForVerify,
    isCorrect,
  };
  if (json) {
    print(result);
  } else {
    printUnderscored('Valid signature', isCorrect);
    printUnderscored('Data', dataForVerify);
  }
}

// ## `Sign` function
// this function allow you to `sign` transaction's
export async function sign(walletPath, tx, options) {
  const { json } = options;
  // Validate `tx` hash
  decode(tx, 'tx');

  const { account } = await getAccountByWalletFile(walletPath, options);

  const signedTx = await account.signTransaction(tx);
  const address = await account.address();
  const networkId = account.getNetworkId();
  if (json) {
    print({ signedTx, address, networkId });
  } else {
    printUnderscored('Signing account address', address);
    printUnderscored('Network ID', networkId);
    printUnderscored('Unsigned', tx);
    printUnderscored('Signed', signedTx);
  }
}

// ## `Spend` function
// this function allow you to `send` token's to another `account`
export async function spend(walletPath, receiverNameOrAddress, amount, options) {
  const {
    ttl, json, nonce, fee, payload = '',
  } = options;
  const sdk = await initSdkByWalletFile(walletPath, options);

  let tx = await sdk.spend(amount, receiverNameOrAddress, {
    ttl, nonce, payload, fee,
  });
  // if waitMined false
  if (typeof tx !== 'object') {
    tx = await sdk.api.getTransactionByHash(tx);
  } else if (!json) {
    print('Transaction mined');
  }
  if (json) print({ tx });
  else printTransaction(tx, json);
}

// ## `Transfer` function
// this function allow you to `send` % of balance to another `account`
export async function transferFunds(walletPath, receiver, fraction, options) {
  const {
    ttl, json, nonce, fee, payload = '',
  } = options;
  const sdk = await initSdkByWalletFile(walletPath, options);

  let tx = await sdk.transferFunds(fraction, receiver, {
    ttl, nonce, payload, fee,
  });
  // if waitMined false
  if (typeof tx !== 'object') {
    tx = await sdk.api.getTransactionByHash(tx);
  } else if (!json) {
    print('Transaction mined');
  }
  if (json) {
    print({ tx });
  } else {
    printTransaction(tx, json);
  }
}

// ## Get `balance` function
// This function allow you retrieve account `balance`
export async function getBalance(walletPath, options) {
  const { height, hash, json } = options;
  const sdk = await initSdkByWalletFile(walletPath, options);
  const address = await sdk.address();
  const { nextNonce: nonce } = await sdk.api.getAccountNextNonce(address);
  const balance = await sdk.getBalance(address, { height: height && +height, hash });
  if (json) {
    print({ address, nonce, balance });
  } else {
    printUnderscored('Balance', balance);
    printUnderscored('ID', address);
    printUnderscored('Nonce', nonce);
  }
}

// ## Get `address` function
// This function allow you retrieve account `public` and `private` keys
export async function getAddress(walletPath, options) {
  const { privateKey, forcePrompt = false, json } = options;
  const { account, keypair } = await getAccountByWalletFile(walletPath, options);
  const printPrivateKey = privateKey && (forcePrompt
    || await prompt(PROMPT_TYPE.confirm, { message: 'Are you sure you want print your secret key?' }));

  if (json) {
    print({
      publicKey: await account.address(),
      ...printPrivateKey && { secretKey: keypair.secretKey },
    });
  } else {
    printUnderscored('Address', await account.address());
    if (printPrivateKey) printUnderscored('Secret Key', keypair.secretKey);
  }
}

// ## Get `nonce` function
// This function allow you retrieve account `nonce`
export async function getAccountNonce(walletPath, options) {
  const { json } = options;
  const sdk = await initSdkByWalletFile(walletPath, options);
  const address = await sdk.address();
  const { nextNonce: nonce } = await sdk.api.getAccountNextNonce(address);
  if (json) {
    print({
      id: address,
      nonce: nonce - 1,
      nextNonce: nonce,
    });
  } else {
    printUnderscored('ID', address);
    printUnderscored('Nonce', nonce - 1);
    printUnderscored('Next Nonce', nonce);
  }
}

// ## Create secure `wallet` file
// This function allow you to generate `keypair` and write it to secure `ethereum` like key-file
export async function createSecureWallet(walletPath, {
  output, password, overwrite, json,
}) {
  const { secretKey } = generateKeyPair(true);
  const { publicKey, path } = await writeWallet(walletPath, secretKey, output, password, overwrite);
  if (json) {
    print({
      publicKey,
      path,
    });
  } else {
    printUnderscored('Address', publicKey);
    printUnderscored('Path', path);
  }
}

// ## Create secure `wallet` file from `private-key`
// This function allow you to generate `keypair` from `private-key` and write it to secure `ethereum` like key-file
export async function createSecureWalletByPrivKey(walletPath, secretKey, {
  output, password, overwrite, json,
}) {
  secretKey = Buffer.from(secretKey.trim(), 'hex');
  const { publicKey, path } = await writeWallet(walletPath, secretKey, output, password, overwrite);
  if (json) {
    print({
      publicKey,
      path,
    });
  } else {
    printUnderscored('Address', publicKey);
    printUnderscored('Path', path);
  }
}

// ## Create secure `wallet` file from `private-key`
// This function allow you to generate `keypair` from `private-key` and write it to secure `ethereum` like key-file
export async function generateKeyPairs(count = 1, { forcePrompt, json }) {
  if (!Number.isInteger(+count)) {
    throw new CliError('Count must be an Number');
  }
  if (forcePrompt || await prompt(PROMPT_TYPE.confirm, { message: 'Are you sure you want print your secret key?' })) {
    const accounts = Array.from(Array(+count)).map(() => generateKeyPair(false));
    if (json) {
      print(accounts);
    } else {
      accounts.forEach((acc, i) => {
        printUnderscored('Account index', i);
        printUnderscored('Public Key', acc.publicKey);
        printUnderscored('Secret Key', acc.secretKey);
        print('');
      });
    }
  }
}
