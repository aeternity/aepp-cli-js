// # æternity CLI `AENS` file
//
// This script initialize all `AENS` function

import { isAddressValid, getDefaultPointerKey } from '@aeternity/aepp-sdk';
import { initSdk, initSdkByWalletFile } from '../utils/cli';
import { print, printName, printTransaction } from '../utils/print';
import { isAvailable, updateNameStatus, validateName } from '../utils/helpers';
import CliError from '../utils/CliError';

// ## Claim `name` function
export async function preClaim(walletPath, name, options) {
  const {
    ttl, fee, nonce, waitMined, json,
  } = options;

  // Validate `name`(check if `name` end on `.chain`)
  // validateName(name)

  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name' available
  const nameEntry = await updateNameStatus(name, sdk);
  if (!isAvailable(nameEntry)) {
    throw new CliError('AENS name not available');
  }
  // Create `pre-claim` transaction
  const preClaimTx = await sdk.aensPreclaim(name, {
    ttl, fee, nonce, waitMined,
  });
  if (waitMined) {
    printTransaction(
      preClaimTx,
      json,
    );
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
  const nameEntry = await updateNameStatus(name, sdk);
  if (!isAvailable(nameEntry)) {
    throw new CliError('AENS name not available');
  }

  // Wait for next block and create `claimName` transaction
  const claimTx = await sdk.aensClaim(name, salt, {
    nonce, ttl, fee, waitMined, nameFee,
  });
  if (waitMined) {
    printTransaction(
      claimTx,
      json,
    );
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
  const nameEntry = await updateNameStatus(name, sdk);
  if (isAvailable(nameEntry)) {
    throw new CliError(`AENS name is ${nameEntry.status} and cannot be updated`);
  }

  // Create `updateName` transaction
  const updateTx = await sdk.aensUpdate(
    name,
    Object.fromEntries(addresses.map((address) => [getDefaultPointerKey(address), address])),
    {
      ttl, fee, nonce, waitMined, nameTtl, clientTtl, extendPointers,
    },
  );
  if (waitMined) {
    printTransaction(
      updateTx,
      json,
    );
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
  const nameEntry = await updateNameStatus(name, sdk);
  if (isAvailable(nameEntry)) {
    throw new CliError(`AENS name is ${nameEntry.status} and cannot be extended`);
  }

  // Create `updateName` transaction
  const updateTx = await sdk.aensUpdate(name, {}, {
    ttl, fee, nonce, waitMined, nameTtl, extendPointers: true,
  });
  if (waitMined) {
    printTransaction(
      updateTx,
      json,
    );
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
  const nameEntry = await updateNameStatus(name, sdk);
  if (isAvailable(nameEntry)) {
    throw new CliError('AENS name is available, nothing to transfer');
  }

  // Create `transferName` transaction
  const transferTX = await sdk.aensTransfer(name, address, {
    ttl, fee, nonce, waitMined,
  });
  if (waitMined) {
    printTransaction(
      transferTX,
      json,
    );
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
  const nameEntry = await updateNameStatus(name, sdk);
  if (isAvailable(nameEntry)) {
    throw new CliError('AENS name is available, nothing to revoke');
  }

  // Create `revokeName` transaction
  const revokeTx = await sdk.aensRevoke(name, {
    ttl, fee, nonce, waitMined,
  });
  if (waitMined) {
    printTransaction(
      revokeTx,
      json,
    );
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
  const nameEntry = await updateNameStatus(name, sdk);
  if (!isAvailable(nameEntry)) {
    throw new CliError('Auction do not start or already end');
  }

  // Wait for next block and create `claimName` transaction
  const nameBidTx = await sdk.aensBid(name, nameFee, {
    nonce, ttl, fee, waitMined,
  });
  if (waitMined) {
    printTransaction(
      nameBidTx,
      json,
    );
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
  const nameEntry = await updateNameStatus(name, sdk);
  if (!isAvailable(nameEntry)) {
    throw new CliError('AENS name not available');
  }

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

  printTransaction(
    updateTx,
    json,
  );
}

export async function lookUp(name, options) {
  const { json } = options;
  validateName(name);
  const sdk = initSdk(options);

  // Check if `name` is unavailable and we can revoke it
  printName(
    await updateNameStatus(name, sdk),
    json,
  );
}
