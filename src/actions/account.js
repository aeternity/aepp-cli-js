// # æternity CLI `account` file
//
// This script initialize all `account` function

import fs from 'fs-extra';
import {
  generateKeyPair, encode, Encoding, verifyMessage as _verifyMessage,
} from '@aeternity/aepp-sdk';
import { writeWallet } from '../utils/account';
import { initSdkByWalletFile, getAccountByWalletFile } from '../utils/cli';
import { print, printTransaction, printUnderscored } from '../utils/print';
import { PROMPT_TYPE, prompt } from '../utils/prompt';

// ## `Sign message` function
// this function allow you to `sign` arbitrary data
export async function signMessage(walletPath, data = [], options) {
  const { json, filePath, password } = options;
  const dataForSign = filePath ? await fs.readFile(filePath) : data.join(' ');
  const { account } = await getAccountByWalletFile(walletPath, password);
  const signedMessage = await account.signMessage(dataForSign);
  const result = {
    data: typeof dataForSign !== 'string' ? Array.from(dataForSign) : dataForSign,
    address: account.address,
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
export async function verifyMessage(walletPath, hexSignature, dataArray = [], options) {
  const { json, filePath, password } = options;
  const data = filePath ? await fs.readFile(filePath) : dataArray.join(' ');
  const { account } = await getAccountByWalletFile(walletPath, password);
  const isCorrect = _verifyMessage(data, Buffer.from(hexSignature, 'hex'), account.address);
  if (json) {
    print({ data, isCorrect });
  } else {
    printUnderscored('Valid signature', isCorrect);
    printUnderscored('Data', data);
  }
}

// ## `Sign` function
// this function allow you to `sign` transaction's
export async function sign(walletPath, tx, { networkId: networkIdOpt, json, ...options }) {
  const sdk = await initSdkByWalletFile(walletPath, options);
  const networkId = networkIdOpt ?? await sdk.api.getNetworkId();
  const signedTx = await sdk.signTransaction(tx, { networkId });
  const { address } = sdk;
  if (json) {
    print({ signedTx, address, networkId });
  } else {
    printUnderscored('Signing account address', address);
    printUnderscored('Network ID', networkId);
    // TODO: remove unsigned tx because it is already accepted in arguments
    printUnderscored('Unsigned', tx);
    printUnderscored('Signed', signedTx);
  }
}

// ## `Spend` function
// this function allow you to `send` coins to another `account`
export async function spend(
  walletPath,
  receiverNameOrAddress,
  { amount, fraction },
  {
    ttl, json, nonce, fee, payload, ...options
  },
) {
  const sdk = await initSdkByWalletFile(walletPath, options);

  const tx = await sdk[amount != null ? 'spend' : 'transferFunds'](
    amount ?? fraction / 100,
    receiverNameOrAddress,
    {
      ttl, nonce, payload: encode(Buffer.from(payload), Encoding.Bytearray), fee,
    },
  );

  if (!json) print('Transaction mined');
  printTransaction(tx, json);
}

// ## Get `address` function
// This function allow you retrieve account `public` and `private` keys
export async function getAddress(walletPath, options) {
  const {
    privateKey, forcePrompt = false, json, password,
  } = options;
  const { account, keypair } = await getAccountByWalletFile(walletPath, password);
  const printPrivateKey = privateKey && (forcePrompt
    || await prompt(PROMPT_TYPE.confirm, { message: 'Are you sure you want print your secret key?' }));

  if (json) {
    print({
      publicKey: account.address,
      ...printPrivateKey && { secretKey: keypair.secretKey },
    });
  } else {
    printUnderscored('Address', account.address);
    if (printPrivateKey) printUnderscored('Secret Key', keypair.secretKey);
  }
}

// ## Create secure `wallet` file
// This function allow you to generate `keypair` and write it to secure `ethereum` like key-file
export async function createSecureWallet(walletPath, { password, overwrite, json }) {
  const { secretKey } = generateKeyPair(true);
  const { publicKey, path } = await writeWallet(walletPath, secretKey, password, overwrite);
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
export async function createSecureWalletByPrivKey(
  walletPath,
  secretKey,
  { password, overwrite, json },
) {
  secretKey = Buffer.from(secretKey.trim(), 'hex');
  const { publicKey, path } = await writeWallet(walletPath, secretKey, password, overwrite);
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
