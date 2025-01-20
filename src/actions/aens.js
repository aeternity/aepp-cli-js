import {
  isAddressValid,
  getDefaultPointerKey,
  isAuctionName,
  Name,
  Tag,
  genSalt,
  commitmentHash,
} from '@aeternity/aepp-sdk';
import { initSdkByWalletFile } from '../utils/cli.js';
import { printTransaction } from '../utils/print.js';
import { getNameEntry, validateName } from '../utils/helpers.js';
import CliError from '../utils/CliError.js';

async function ensureNameStatus(name, aeSdk, status, operation) {
  const nameEntry = await getNameEntry(name, aeSdk);
  if (nameEntry.status !== status) {
    throw new CliError(`AENS name is ${nameEntry.status} and cannot be ${operation}`);
  }
}

export async function preClaim(walletPath, name, options) {
  const { ttl, fee, nonce, json } = options;
  validateName(name);
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, aeSdk, 'AVAILABLE', 'preclaimed');
  // TODO: replace with Name:preclaim when it returns salt
  const salt = genSalt();
  const tx = await aeSdk.buildTx({
    _isInternalBuild: true,
    accountId: aeSdk.address,
    tag: Tag.NamePreclaimTx,
    nonce,
    ttl,
    fee,
    commitmentId: commitmentHash(name, salt),
  });
  const res = await aeSdk.sendTransaction(tx);
  res.salt = salt;
  await printTransaction(res, json, aeSdk);
}

export async function claim(walletPath, name, salt, options) {
  const { ttl, fee, nonce, json, nameFee } = options;
  validateName(name);
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, aeSdk, 'AVAILABLE', 'claimed');
  // TODO: replace with Name:claim after it accepts salt
  const tx = await aeSdk.buildTx({
    _isInternalBuild: true,
    accountId: aeSdk.address,
    tag: Tag.NameClaimTx,
    name,
    nameSalt: salt,
    nonce,
    ttl,
    fee,
    nameFee,
  });
  const res = await aeSdk.sendTransaction(tx);
  const nameObj = new Name(name, aeSdk.getContext());
  Object.assign(res, await nameObj.getState());
  await printTransaction(res, json, aeSdk);
}

export async function updateName(walletPath, name, addresses, options) {
  const { ttl, fee, nonce, json, nameTtl, clientTtl, extendPointers = false } = options;
  const invalidAddresses = addresses.filter((address) => !isAddressValid(address));
  if (invalidAddresses.length) throw new CliError(`Addresses "[${invalidAddresses}]" is not valid`);
  validateName(name);
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, aeSdk, 'CLAIMED', 'updated');
  const nameObj = new Name(name, aeSdk.getContext());
  const res = await nameObj.update(
    Object.fromEntries(addresses.map((address) => [getDefaultPointerKey(address), address])),
    {
      ttl,
      fee,
      nonce,
      nameTtl,
      clientTtl,
      extendPointers,
    },
  );
  await printTransaction(res, json, aeSdk);
}

export async function extendName(walletPath, name, nameTtl, options) {
  const { ttl, fee, nonce, json } = options;
  validateName(name);
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, aeSdk, 'CLAIMED', 'extended');
  const nameObj = new Name(name, aeSdk.getContext());
  const res = await nameObj.update(
    {},
    {
      ttl,
      fee,
      nonce,
      nameTtl,
      extendPointers: true,
    },
  );
  await printTransaction(res, json, aeSdk);
}

export async function transferName(walletPath, name, address, options) {
  const { ttl, fee, nonce, json } = options;
  if (!isAddressValid(address)) throw new CliError(`Address "${address}" is not valid`);
  validateName(name);
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, aeSdk, 'CLAIMED', 'transferred');
  const nameObj = new Name(name, aeSdk.getContext());
  const res = await nameObj.transfer(address, {
    ttl,
    fee,
    nonce,
  });
  await printTransaction(res, json, aeSdk);
}

export async function revokeName(walletPath, name, options) {
  const { ttl, fee, nonce, json } = options;
  validateName(name);
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, aeSdk, 'CLAIMED', 'revoked');
  const nameObj = new Name(name, aeSdk.getContext());
  const res = await nameObj.revoke({ ttl, fee, nonce });
  await printTransaction(res, json, aeSdk);
}

export async function nameBid(walletPath, name, nameFee, options) {
  const { ttl, fee, nonce, json } = options;
  validateName(name);
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, aeSdk, 'AUCTION', 'bidded');
  const nameObj = new Name(name, aeSdk.getContext());
  const res = await nameObj.bid(nameFee, { nonce, ttl, fee });
  await printTransaction(res, json, aeSdk);
}

export async function fullClaim(walletPath, name, options) {
  let { ttl, fee, nonce, nameFee, json, nameTtl, clientTtl } = options;
  validateName(name);
  if (name.split('.')[0] < 13)
    throw new CliError(
      'Full name claiming works only with name longer then 12 symbol (not trigger auction)',
    );
  const aeSdk = await initSdkByWalletFile(walletPath, options);
  await ensureNameStatus(name, aeSdk, 'AVAILABLE', 'claimed');
  nonce = nonce && +nonce;
  const nameObj = new Name(name, aeSdk.getContext());
  await nameObj.preclaim(name, { nonce, ttl, fee });

  nonce = nonce && nonce + 1;
  const claimRes = await nameObj.claim({
    nonce,
    ttl,
    fee,
    nameFee,
  });

  if (isAuctionName(name)) {
    await printTransaction(claimRes, json, aeSdk);
    return;
  }

  nonce = nonce && nonce + 1;
  const updateRes = await nameObj.update(
    { account_pubkey: aeSdk.address },
    {
      nonce,
      ttl,
      fee,
      nameTtl,
      clientTtl,
    },
  );
  Object.assign(updateRes, await nameObj.getState());
  await printTransaction(updateRes, json, aeSdk);
}
