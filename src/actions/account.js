import fs from 'fs-extra';
import {
  generateKeyPair, verifyMessage as _verifyMessage, getAddressFromPriv, dump,
} from '@aeternity/aepp-sdk';
import { getFullPath } from '../utils/helpers.js';
import CliError from '../utils/CliError.js';
import { initSdkByWalletFile, AccountCli } from '../utils/cli.js';
import { print, printUnderscored } from '../utils/print.js';
import { PROMPT_TYPE, prompt } from '../utils/prompt.js';

export async function signMessage(walletPath, data = [], options) {
  const { json, filePath, password } = options;
  const dataForSign = filePath ? await fs.readFile(filePath) : data.join(' ');
  const account = await AccountCli.read(walletPath, password);
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

export async function verifyMessage(address, hexSignature, dataArray = [], options) {
  const { json, filePath } = options;
  const data = filePath ? await fs.readFile(filePath) : dataArray.join(' ');
  const isCorrect = _verifyMessage(data, Buffer.from(hexSignature, 'hex'), address);
  if (json) {
    print({ data, isCorrect });
  } else {
    printUnderscored('Valid signature', isCorrect);
    printUnderscored('Data', data);
  }
}

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

export async function getAddress(walletPath, options) {
  const {
    privateKey, forcePrompt = false, json, password,
  } = options;
  const account = await AccountCli.read(walletPath, password);
  const printPrivateKey = privateKey && (forcePrompt
    || await prompt(PROMPT_TYPE.confirm, { message: 'Are you sure you want print your secret key?' }));

  const secretKey = printPrivateKey && await account.getSecretKey();
  if (json) {
    print({
      publicKey: account.address,
      ...printPrivateKey && { secretKey },
    });
  } else {
    printUnderscored('Address', account.address);
    if (printPrivateKey) printUnderscored('Secret Key', secretKey);
  }
}

export async function createWallet(
  walletPath,
  secretKey = generateKeyPair().secretKey,
  { password, overwrite, json },
) {
  secretKey = Buffer.from(secretKey, 'hex');
  walletPath = getFullPath(walletPath);
  if (!overwrite && await fs.exists(walletPath) && !await prompt(PROMPT_TYPE.askOverwrite)) {
    throw new CliError(`Wallet already exist at ${walletPath}`);
  }
  password ??= await prompt(PROMPT_TYPE.askPassword);
  await fs.outputJson(walletPath, await dump(walletPath, password, secretKey));
  const publicKey = getAddressFromPriv(secretKey);
  if (json) {
    print({ publicKey, path: walletPath });
  } else {
    printUnderscored('Address', publicKey);
    printUnderscored('Path', walletPath);
  }
}
