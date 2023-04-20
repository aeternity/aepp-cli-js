// # Utils `account` Module
// That script contains helper function's for work with `account`
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
import path from 'path';
import {
  generateKeyPairFromSecret, getAddressFromPriv, dump, recover, encode, Encoding,
} from '@aeternity/aepp-sdk';
import { PROMPT_TYPE, prompt } from './prompt';
import CliError from './CliError';

export async function writeWallet(name, secretKey, output, password, overwrite) {
  const walletPath = path.resolve(process.cwd(), path.join(output, name));
  if (!overwrite && await fs.exists(walletPath) && !await prompt(PROMPT_TYPE.askOverwrite)) {
    throw new CliError(`Wallet already exist at ${walletPath}`);
  }
  password ??= await prompt(PROMPT_TYPE.askPassword);
  await fs.outputJson(walletPath, await dump(name, password, secretKey));
  const { publicKey } = generateKeyPairFromSecret(secretKey);
  return { publicKey: encode(publicKey, Encoding.AccountAddress), path: walletPath };
}

// Get account file by path, decrypt it using password and return `keypair`
export async function getWalletByPathAndDecrypt(walletPath, password) {
  const keyFile = await fs.readJson(path.resolve(process.cwd(), walletPath));

  password ??= await prompt(PROMPT_TYPE.askPassword);

  const privKey = await recover(password, keyFile);

  return {
    secretKey: privKey,
    publicKey: getAddressFromPriv(privKey),
  };
}
