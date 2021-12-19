// # Utils `account` Module
// That script contains helper function's for work with `account`
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
import fs from 'fs';
import path from 'path';
import { Crypto, Keystore } from '@aeternity/aepp-sdk';
import { readJSONFile } from './helpers';
import { PROMPT_TYPE, prompt } from './prompt';

// Helper function which check if `account file` exist and `ask for overwriting`
export async function askForOverwrite(name, output) {
  return fs.existsSync(path.join(name, output))
    ? prompt(PROMPT_TYPE.askOverwrite)
    : true;
}

// Generate `keypair` encrypt it using password and write to `ethereum` keystore file
export async function generateSecureWallet(name, { output = '', password, overwrite }) {
  if (!overwrite && !(await askForOverwrite(name, output))) return;
  password = password || await prompt(PROMPT_TYPE.askPassword);
  const { secretKey, publicKey } = Crypto.generateKeyPair(true);

  fs.writeFileSync(path.join(output, name), JSON.stringify(await Keystore.dump(name, password, secretKey)));

  return { publicKey: Crypto.aeEncodeKey(publicKey), path: path.resolve(process.cwd(), path.join(output, name)) };
}

// Generate `keypair` from `PRIVATE KEY` encrypt it using password and to `ethereum` keystore file
export async function generateSecureWalletFromPrivKey(name, priv, { output = '', password, overwrite }) {
  if (!overwrite && !(await askForOverwrite(name, output))) return;
  password = password || await prompt(PROMPT_TYPE.askPassword);

  const hexStr = Buffer.from(priv.trim(), 'hex');
  const keys = Crypto.generateKeyPairFromSecret(hexStr);

  const encryptedKeyPair = await Keystore.dump(name, password, keys.secretKey);

  fs.writeFileSync(path.join(output, name), JSON.stringify(encryptedKeyPair));

  return { publicKey: Crypto.aeEncodeKey(keys.publicKey), path: path.resolve(process.cwd(), path.join(output, name)) };
}

// Get account file by path, decrypt it using password and return `keypair`
export async function getWalletByPathAndDecrypt(walletPath, password) {
  const keyFile = readJSONFile(path.resolve(process.cwd(), walletPath));

  password ||= await prompt(PROMPT_TYPE.askPassword);

  const privKey = await Keystore.recover(password, keyFile);

  return {
    secretKey: privKey,
    publicKey: Crypto.getAddressFromPriv(privKey),
  };
}
