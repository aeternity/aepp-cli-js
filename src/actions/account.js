import fs from 'fs-extra';
import { parse } from 'path';
import { MemoryAccount, verifyMessage as _verifyMessage } from '@aeternity/aepp-sdk';
import { dump } from '../utils/keystore.js';
import { getFullPath } from '../utils/helpers.js';
import CliError from '../utils/CliError.js';
import { initSdkByWalletFile, AccountCli } from '../utils/cli.js';
import { print, printTable } from '../utils/print.js';
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
    printTable([
      ['Unsigned', result.data],
      ['Signing account address', result.address],
      ['Signature', result.signature],
      ['Signature Hex', result.signatureHex],
    ]);
  }
}

export async function verifyMessage(address, hexSignature, dataArray = [], options) {
  const { json, filePath } = options;
  const data = filePath ? await fs.readFile(filePath) : dataArray.join(' ');
  const isCorrect = _verifyMessage(data, Buffer.from(hexSignature, 'hex'), address);
  if (json) {
    print({ data, isCorrect });
  } else {
    printTable([
      ['Valid signature', isCorrect],
      ['Data', data],
    ]);
  }
}

export async function sign(walletPath, tx, { networkId: networkIdOpt, json, ...options }) {
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  const networkId = networkIdOpt ?? (await aeSdk.api.getNetworkId());
  const signedTx = await aeSdk.signTransaction(tx, { networkId });
  const { address } = aeSdk;
  if (json) {
    print({ signedTx, address, networkId });
  } else {
    printTable([
      ['Signing account address', address],
      ['Network ID', networkId],
      // TODO: remove unsigned tx because it is already accepted in arguments
      ['Unsigned', tx],
      ['Signed', signedTx],
    ]);
  }
}

export async function getAddress(walletPath, options) {
  const { forcePrompt = false, json, password } = options;
  const account = await AccountCli.read(walletPath, password);
  const secretKey =
    options.secretKey &&
    (forcePrompt ||
      (await prompt(PROMPT_TYPE.confirm, {
        message: 'Are you sure you want print your secret key?',
      }))) &&
    (await account.getSecretKey());

  if (json) {
    print({
      publicKey: account.address,
      ...(secretKey && { secretKey }),
    });
  } else {
    printTable([['Address', account.address], ...(secretKey ? [['Secret Key', secretKey]] : [])]);
  }
}

export async function createWallet(
  walletPath,
  secretKey = MemoryAccount.generate().secretKey,
  { password, overwrite, json },
) {
  walletPath = getFullPath(walletPath);
  if (!overwrite && (await fs.exists(walletPath)) && !(await prompt(PROMPT_TYPE.askOverwrite))) {
    throw new CliError(`Wallet already exist at ${walletPath}`);
  }
  password ??= await prompt(PROMPT_TYPE.askPassword);
  await fs.outputJson(walletPath, await dump(parse(walletPath).name, password, secretKey));
  const { address } = new MemoryAccount(secretKey);
  if (json) {
    print({ publicKey: address, path: walletPath });
  } else {
    printTable([
      ['Address', address],
      ['Path', walletPath],
    ]);
  }
}
