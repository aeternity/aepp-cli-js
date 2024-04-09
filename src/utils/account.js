// # Utils `account` Module
// That script contains helper function's for work with `account`
import fs from 'fs-extra';
import { getAddressFromPriv, recover } from '@aeternity/aepp-sdk';
import { PROMPT_TYPE, prompt } from './prompt.js';
import { getFullPath } from './helpers.js';

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
