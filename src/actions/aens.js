import { isAddressValid, getDefaultPointerKey } from '@aeternity/aepp-sdk';
import { initSdkByWalletFile } from '../utils/cli.js';
import { printTransaction } from '../utils/print.js';
import { getNameEntry, validateName } from '../utils/helpers.js';
import CliError from '../utils/CliError.js';

async function ensureNameStatus(name, sdk, status, operation) {
  const nameEntry = await getNameEntry(name, sdk);
  if (nameEntry.status !== status) {
    throw new CliError(`AENS name is ${nameEntry.status} and cannot be ${operation}`);
  }
}

export async function preClaim(walletPath, name, options) {
  const {
    ttl, fee, nonce, json,
  } = options;
  validateName(name);
  const sdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, sdk, 'AVAILABLE', 'preclaimed');
  const preClaimTx = await sdk.aensPreclaim(name, { ttl, fee, nonce });
  await printTransaction(preClaimTx, json, sdk);
}

export async function claim(walletPath, name, salt, options) {
  const {
    ttl, fee, nonce, json, nameFee,
  } = options;
  validateName(name);
  const sdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, sdk, 'AVAILABLE', 'claimed');
  const claimTx = await sdk.aensClaim(name, salt, {
    nonce, ttl, fee, nameFee,
  });
  await printTransaction(claimTx, json, sdk);
}

export async function updateName(walletPath, name, addresses, options) {
  const {
    ttl, fee, nonce, json, nameTtl, clientTtl, extendPointers = false,
  } = options;
  const invalidAddresses = addresses.filter((address) => !isAddressValid(address));
  if (invalidAddresses.length) throw new CliError(`Addresses "[${invalidAddresses}]" is not valid`);
  validateName(name);
  const sdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, sdk, 'CLAIMED', 'updated');
  const updateTx = await sdk.aensUpdate(
    name,
    Object.fromEntries(addresses.map((address) => [getDefaultPointerKey(address), address])),
    {
      ttl, fee, nonce, nameTtl, clientTtl, extendPointers,
    },
  );
  await printTransaction(updateTx, json, sdk);
}

export async function extendName(walletPath, name, nameTtl, options) {
  const {
    ttl, fee, nonce, json,
  } = options;
  validateName(name);
  const sdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, sdk, 'CLAIMED', 'extended');
  const updateTx = await sdk.aensUpdate(name, {}, {
    ttl, fee, nonce, nameTtl, extendPointers: true,
  });
  await printTransaction(updateTx, json, sdk);
}

export async function transferName(walletPath, name, address, options) {
  const {
    ttl, fee, nonce, json,
  } = options;
  if (!isAddressValid(address)) throw new CliError(`Address "${address}" is not valid`);
  validateName(name);
  const sdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, sdk, 'CLAIMED', 'transferred');
  const transferTX = await sdk.aensTransfer(name, address, { ttl, fee, nonce });
  await printTransaction(transferTX, json, sdk);
}

export async function revokeName(walletPath, name, options) {
  const {
    ttl, fee, nonce, json,
  } = options;
  validateName(name);
  const sdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, sdk, 'CLAIMED', 'revoked');
  const revokeTx = await sdk.aensRevoke(name, { ttl, fee, nonce });
  await printTransaction(revokeTx, json, sdk);
}

export async function nameBid(walletPath, name, nameFee, options) {
  const {
    ttl, fee, nonce, json,
  } = options;
  validateName(name);
  const sdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, sdk, 'AUCTION', 'bidded');
  const nameBidTx = await sdk.aensBid(name, nameFee, { nonce, ttl, fee });
  await printTransaction(nameBidTx, json, sdk);
}

export async function fullClaim(walletPath, name, options) {
  let {
    ttl, fee, nonce, nameFee, json, nameTtl, clientTtl,
  } = options;
  validateName(name);
  if (name.split('.')[0] < 13) throw new CliError('Full name claiming works only with name longer then 12 symbol (not trigger auction)');
  const sdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, sdk, 'AVAILABLE', 'claimed');
  nonce = nonce && +nonce;
  const preclaim = await sdk.aensPreclaim(name, { nonce, ttl, fee });

  nonce = nonce && nonce + 1;
  const nameInstance = await preclaim.claim({
    nonce, ttl, fee, nameFee,
  });

  nonce = nonce && nonce + 1;
  const updateTx = await nameInstance.update(
    { account_pubkey: sdk.address },
    {
      nonce, ttl, fee, nameTtl, clientTtl,
    },
  );
  await printTransaction(updateTx, json, sdk);
}
