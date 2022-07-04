// # æternity CLI `AENS` file
//
// This script initialize all `AENS` function
/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
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

import { isAddressValid, getDefaultPointerKey } from '@aeternity/aepp-sdk';
import { initSdk, initSdkByWalletFile } from '../utils/cli';
import { print, printName, printTransaction } from '../utils/print';
import { isAvailable, updateNameStatus, validateName } from '../utils/helpers';

// ## Claim `name` function
export async function preClaim(walletPath, domain, options) {
  const {
    ttl, fee, nonce, waitMined, json,
  } = options;

  // Validate `name`(check if `name` end on `.chain`)
  // validateName(domain)

  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name' available
  const name = await updateNameStatus(domain, sdk);
  if (!isAvailable(name)) {
    throw new Error('Domain not available');
  }
  // Create `pre-claim` transaction
  const preClaimTx = await sdk.aensPreclaim(domain, {
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
export async function claim(walletPath, domain, salt, options) {
  const {
    ttl, fee, nonce, waitMined, json, nameFee,
  } = options;
  // Validate `name`
  // validateName(domain)

  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name' available
  const name = await updateNameStatus(domain, sdk);
  if (!isAvailable(name)) {
    throw new Error('Domain not available');
  }

  // Wait for next block and create `claimName` transaction
  const claimTx = await sdk.aensClaim(domain, salt, {
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
export async function updateName(walletPath, domain, addresses, options) {
  const {
    ttl, fee, nonce, waitMined, json, nameTtl, clientTtl, extendPointers = false,
  } = options;

  // Validate `address`
  const invalidAddresses = addresses.filter((address) => !isAddressValid(address));
  if (invalidAddresses.length) throw new Error(`Addresses "[${invalidAddresses}]" is not valid`);
  // Validate `name`
  validateName(domain);
  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name` is unavailable and we can update it
  const name = await updateNameStatus(domain, sdk);
  if (isAvailable(name)) {
    throw new Error(`Domain is ${name.status} and cannot be updated`);
  }

  // Create `updateName` transaction
  const updateTx = await sdk.aensUpdate(
    domain,
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
export async function extendName(walletPath, domain, nameTtl, options) {
  const {
    ttl, fee, nonce, waitMined, json,
  } = options;

  // Validate `name`
  validateName(domain);
  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name` is unavailable and we can update it
  const name = await updateNameStatus(domain, sdk);
  if (isAvailable(name)) {
    throw new Error(`Domain is ${name.status} and cannot be extended`);
  }

  // Create `updateName` transaction
  const updateTx = await sdk.aensUpdate(domain, {}, {
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
export async function transferName(walletPath, domain, address, options) {
  const {
    ttl, fee, nonce, waitMined, json,
  } = options;

  // Validate `address`
  if (!isAddressValid(address)) throw new Error(`Address "${address}" is not valid`);
  // Validate `name`
  validateName(domain);
  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name` is unavailable and we can transfer it
  const name = await updateNameStatus(domain, sdk);
  if (isAvailable(name)) {
    throw new Error('Domain is available, nothing to transfer');
  }

  // Create `transferName` transaction
  const transferTX = await sdk.aensTransfer(domain, address, {
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
export async function revokeName(walletPath, domain, options) {
  const {
    ttl, fee, nonce, waitMined, json,
  } = options;

  // Validate `name`
  validateName(domain);
  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if `name` is unavailable and we can revoke it
  const name = await updateNameStatus(domain, sdk);
  if (isAvailable(name)) {
    throw new Error('Domain is available, nothing to revoke');
  }

  // Create `revokeName` transaction
  const revokeTx = await sdk.aensRevoke(domain, {
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

export async function nameBid(walletPath, domain, nameFee, options) {
  const {
    ttl, fee, nonce, waitMined, json,
  } = options;
  // Validate `name`
  validateName(domain);

  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name' available
  const name = await updateNameStatus(domain, sdk);
  if (!isAvailable(name)) {
    throw new Error('Auction do not start or already end');
  }

  // Wait for next block and create `claimName` transaction
  const nameBidTx = await sdk.aensBid(domain, nameFee, {
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

export async function fullClaim(walletPath, domain, options) {
  let {
    ttl, fee, nonce, nameFee, json, nameTtl, clientTtl,
  } = options;
  validateName(domain);
  if (domain.split('.')[0] < 13) throw new Error('Full name claiming works only with name longer then 12 symbol (not trigger auction)');

  const sdk = await initSdkByWalletFile(walletPath, options);

  // Check if that `name' available
  const name = await updateNameStatus(domain, sdk);
  if (!isAvailable(name)) {
    throw new Error('Domain not available');
  }

  // Wait for next block and create `claimName` transaction
  nonce = nonce && +nonce;
  const preclaim = await sdk.aensPreclaim(domain, { nonce, ttl, fee });
  nonce = nonce && nonce + 1;
  const nameInstance = await preclaim.claim({
    nonce, ttl, fee, nameFee,
  });
  nonce = nonce && nonce + 1;
  const updateTx = await nameInstance.update(
    { account_pubkey: await sdk.address() },
    {
      nonce, ttl, fee, nameTtl, clientTtl,
    },
  );

  printTransaction(
    updateTx,
    json,
  );
}

export async function lookUp(domain, options) {
  const { json } = options;
  validateName(domain);
  const sdk = await initSdk(options);

  // Check if `name` is unavailable and we can revoke it
  printName(
    await updateNameStatus(domain, sdk),
    json,
  );
}
