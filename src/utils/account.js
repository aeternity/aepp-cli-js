// # Utils `account` Module
// That script contains helper function's for work with `account`
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
