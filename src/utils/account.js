// # Utils `account` Module
// That script contains helper function's for work with `account`
import fs from 'fs-extra';
import {
  generateKeyPairFromSecret, getAddressFromPriv, dump, recover, encode, Encoding,
} from '@aeternity/aepp-sdk';
import { PROMPT_TYPE, prompt } from './prompt';
import { getFullPath } from './helpers';
import CliError from './CliError';

export async function writeWallet(walletPath, secretKey, password, overwrite) {
  const path = getFullPath(walletPath);
  if (!overwrite && await fs.exists(path) && !await prompt(PROMPT_TYPE.askOverwrite)) {
    throw new CliError(`Wallet already exist at ${path}`);
  }
  password ??= await prompt(PROMPT_TYPE.askPassword);
  await fs.outputJson(path, await dump(path, password, secretKey));
  const { publicKey } = generateKeyPairFromSecret(secretKey);
  return { publicKey: encode(publicKey, Encoding.AccountAddress), path };
}

// Get account file by path, decrypt it using password and return `keypair`
export async function getWalletByPathAndDecrypt(walletPath, password) {
  const keyFile = await fs.readJson(getFullPath(walletPath));

  password ??= await prompt(PROMPT_TYPE.askPassword);

  const privKey = await recover(password, keyFile);

  return {
    secretKey: privKey,
    publicKey: getAddressFromPriv(privKey),
  };
}
