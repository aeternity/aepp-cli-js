// # æternity CLI `AENS` file
//
// This script initialize all `AENS` function

import { isAddressValid, getDefaultPointerKey } from '@aeternity/aepp-sdk';
import { initSdkByWalletFile } from '../utils/cli.js';
import { print, printTransaction } from '../utils/print.js';
import { getNameEntry, validateName } from '../utils/helpers.js';
import CliError from '../utils/CliError.js';

async function ensureNameStatus(name, sdk, status, operation) {
  const nameEntry = await getNameEntry(name, sdk);
  if (nameEntry.status !== status) {
    throw new CliError(`AENS name is ${nameEntry.status} and cannot be ${operation}`);
  }
}

// ## Claim `name` function
export async function preClaim(walletPath, name, options) {
  const {
    ttl, fee, nonce, waitMined, json,
  } = options;

  // Validate `name`(check if `name` end on `.chain`)
  // validateName(name)

  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name' available
  await ensureNameStatus(name, sdk, 'AVAILABLE', 'preclaimed');
  // Create `pre-claim` transaction
  const preClaimTx = await sdk.aensPreclaim(name, {
    ttl, fee, nonce, waitMined,
  });
  if (waitMined) {
    await printTransaction(preClaimTx, json, sdk);
  } else {
    print(`Transaction send to the chain. Tx hash: ${preClaimTx.hash}`);
  }
}

// ## Claim `name` function
export async function claim(walletPath, name, salt, options) {
  const {
    ttl, fee, nonce, waitMined, json, nameFee,
  } = options;
  // Validate `name`
  // validateName(name)

  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name' available
  await ensureNameStatus(name, sdk, 'AVAILABLE', 'claimed');

  // Wait for next block and create `claimName` transaction
  const claimTx = await sdk.aensClaim(name, salt, {
    nonce, ttl, fee, waitMined, nameFee,
  });
  if (waitMined) {
    await printTransaction(claimTx, json, sdk);
  } else {
    print(`Transaction send to the chain. Tx hash: ${claimTx.hash}`);
  }
}

// ##Update `name` function
export async function updateName(walletPath, name, addresses, options) {
  const {
    ttl, fee, nonce, waitMined, json, nameTtl, clientTtl, extendPointers = false,
  } = options;

  // Validate `address`
  const invalidAddresses = addresses.filter((address) => !isAddressValid(address));
  if (invalidAddresses.length) throw new CliError(`Addresses "[${invalidAddresses}]" is not valid`);
  // Validate `name`
  validateName(name);
  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name` is unavailable and we can update it
  await ensureNameStatus(name, sdk, 'CLAIMED', 'updated');

  // Create `updateName` transaction
  const updateTx = await sdk.aensUpdate(
    name,
    Object.fromEntries(addresses.map((address) => [getDefaultPointerKey(address), address])),
    {
      ttl, fee, nonce, waitMined, nameTtl, clientTtl, extendPointers,
    },
  );
  if (waitMined) {
    await printTransaction(updateTx, json, sdk);
  } else {
    print(`Transaction send to the chain. Tx hash: ${updateTx.hash}`);
  }
}

// ##Extend `name` ttl  function
export async function extendName(walletPath, name, nameTtl, options) {
  const {
    ttl, fee, nonce, waitMined, json,
  } = options;

  // Validate `name`
  validateName(name);
  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name` is unavailable and we can update it
  await ensureNameStatus(name, sdk, 'CLAIMED', 'extended');

  // Create `updateName` transaction
  const updateTx = await sdk.aensUpdate(name, {}, {
    ttl, fee, nonce, waitMined, nameTtl, extendPointers: true,
  });
  if (waitMined) {
    await printTransaction(updateTx, json, sdk);
  } else {
    print(`Transaction send to the chain. Tx hash: ${updateTx.hash}`);
  }
}

// ##Transfer `name` function
export async function transferName(walletPath, name, address, options) {
  const {
    ttl, fee, nonce, waitMined, json,
  } = options;

  // Validate `address`
  if (!isAddressValid(address)) throw new CliError(`Address "${address}" is not valid`);
  // Validate `name`
  validateName(name);
  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name` is unavailable and we can transfer it
  await ensureNameStatus(name, sdk, 'CLAIMED', 'transferred');

  // Create `transferName` transaction
  const transferTX = await sdk.aensTransfer(name, address, {
    ttl, fee, nonce, waitMined,
  });
  if (waitMined) {
    await printTransaction(transferTX, json, sdk);
  } else {
    print(`Transaction send to the chain. Tx hash: ${transferTX.hash}`);
  }
}

// ## Revoke `name` function
export async function revokeName(walletPath, name, options) {
  const {
    ttl, fee, nonce, waitMined, json,
  } = options;

  // Validate `name`
  validateName(name);
  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if `name` is unavailable and we can revoke it
  await ensureNameStatus(name, sdk, 'CLAIMED', 'revoked');

  // Create `revokeName` transaction
  const revokeTx = await sdk.aensRevoke(name, {
    ttl, fee, nonce, waitMined,
  });
  if (waitMined) {
    await printTransaction(revokeTx, json, sdk);
  } else {
    print(`Transaction send to the chain. Tx hash: ${revokeTx.hash}`);
  }
}

export async function nameBid(walletPath, name, nameFee, options) {
  const {
    ttl, fee, nonce, waitMined, json,
  } = options;
  // Validate `name`
  validateName(name);

  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name' available
  await ensureNameStatus(name, sdk, 'AUCTION', 'bidded');

  // Wait for next block and create `claimName` transaction
  const nameBidTx = await sdk.aensBid(name, nameFee, {
    nonce, ttl, fee, waitMined,
  });
  if (waitMined) {
    await printTransaction(nameBidTx, json, sdk);
  } else {
    print(`Transaction send to the chain. Tx hash: ${nameBidTx.hash}`);
  }
}

export async function fullClaim(walletPath, name, options) {
  let {
    ttl, fee, nonce, nameFee, json, nameTtl, clientTtl,
  } = options;
  validateName(name);
  if (name.split('.')[0] < 13) throw new CliError('Full name claiming works only with name longer then 12 symbol (not trigger auction)');

  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name' available
  await ensureNameStatus(name, sdk, 'AVAILABLE', 'claimed');

  // Wait for next block and create `claimName` transaction
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
