// # æternity CLI `transaction` file
//
// This script initialize all `transaction` function
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

import {
  Crypto, SCHEMA, TxBuilder, TxBuilderHelper, verifyTransaction, Node, getDefaultPointerKey,
} from '@aeternity/aepp-sdk';
import { initOfflineTxBuilder, initTxBuilder } from '../utils/cli';
import {
  print, printBuilderTransaction, printUnderscored, printValidation,
} from '../utils/print';
import { validateName } from '../utils/helpers';
import { BUILD_ORACLE_TTL, ORACLE_VM_VERSION } from '../utils/constant';

const { TX_TYPE } = SCHEMA;

// ## Build `spend` transaction
export async function spend(senderId, recipientId, amount, nonce, options) {
  let {
    ttl, json, fee, payload,
  } = options;
  ttl = parseInt(ttl);
  nonce = parseInt(nonce);
  // Initialize `Ae`
  const txBuilder = initOfflineTxBuilder();
  // Build params
  const params = {
    senderId,
    recipientId,
    amount,
    ttl,
    nonce,
    fee,
    payload,
  };
  // calculate fee
  fee = txBuilder.calculateFee(fee, TX_TYPE.spend, { params });
  // Build `spend` transaction
  const tx = txBuilder.buildTx({ ...params, fee }, TX_TYPE.spend);
  // Print Result
  if (json) print({ tx: tx.tx, params: tx.txObject });
  else printBuilderTransaction(tx, TX_TYPE.spend);
}

// ## Build `namePreClaim` transaction
export async function namePreClaim(accountId, domain, nonce, options) {
  let { ttl, json, fee } = options;

  // Validate `name`(check if `name` end on `.chain`)
  validateName(domain);
  // Initialize `Ae`
  const txBuilder = initOfflineTxBuilder();

  // Generate `salt` and `commitmentId` and build `name` hash
  const salt = Crypto.salt();
  const commitmentId = await TxBuilderHelper.commitmentHash(domain, salt);

  const params = {
    accountId,
    commitmentId,
    ttl,
    nonce,
  };
  fee = txBuilder.calculateFee(fee, TX_TYPE.namePreClaim, { params });
  // Create `preclaim` transaction
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.namePreClaim);

  if (json) print({ tx, txObject, salt });
  else printBuilderTransaction({ tx, txObject: { ...txObject, salt } }, TX_TYPE.namePreClaim);
}

// ## Build `nameClaim` transaction
export async function nameClaim(accountId, nameSalt, domain, nonce, options) {
  const vsn = 2;
  let {
    ttl, json, fee, nameFee,
  } = options;
  const nameHash = `nm_${Crypto.encodeBase58Check(Buffer.from(domain))}`;

  // Validate `name`(check if `name` end on `.chain`)
  validateName(domain);
  // Initialize `Ae`
  const txBuilder = initOfflineTxBuilder();
  nameFee = nameFee || TxBuilderHelper.getMinimumNameFee(domain);
  const params = {
    nameFee,
    accountId,
    nameSalt,
    name: nameHash,
    ttl,
    nonce,
  };
  fee = txBuilder.calculateFee(fee, TX_TYPE.nameClaim, { params, vsn });
  // Build `claim` transaction's
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.nameClaim, { vsn });

  if (json) print({ tx, txObject });
  else printBuilderTransaction({ tx, txObject }, TX_TYPE.nameClaim);
}

// ## Build `nameUpdate` transaction
export async function nameUpdate(accountId, nameId, nonce, pointers, {
  ttl, json, fee, nameTtl, clientTtl,
}) {
  // Initialize `Ae`
  const txBuilder = initOfflineTxBuilder();
  // Create `update` transaction
  pointers = pointers.map((id) => ({ id, key: getDefaultPointerKey(id) }));
  const params = {
    nameId,
    accountId,
    nameTtl,
    pointers,
    clientTtl,
    ttl,
    nonce,
  };
  fee = txBuilder.calculateFee(fee, TX_TYPE.nameUpdate, { params });
  // Build `claim` transaction's
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.nameUpdate);

  if (json) print({ tx, txObject });
  else printBuilderTransaction({ tx, txObject }, TX_TYPE.nameUpdate);
}

// ## Build `nameTransfer` transaction
export async function nameTransfer(accountId, recipientId, nameId, nonce, { ttl, json, fee }) {
  // Initialize `Ae`
  const txBuilder = initOfflineTxBuilder();
  // Create `transfer` transaction
  const params = {
    accountId,
    recipientId,
    nameId,
    ttl,
    nonce,
  };
  fee = txBuilder.calculateFee(fee, TX_TYPE.nameTransfer, { params });
  // Build `claim` transaction's
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.nameTransfer);

  if (json) print({ tx, txObject });
  else printBuilderTransaction({ tx, txObject }, TX_TYPE.nameTransfer);
}

// ## Build `nameRevoke` transaction
export async function nameRevoke(accountId, nameId, nonce, { ttl, json, fee }) {
  // Initialize `Ae`
  const txBuilder = initOfflineTxBuilder();
  // Create `transfer` transaction
  const params = {
    accountId,
    nameId,
    ttl,
    nonce,
  };
  fee = txBuilder.calculateFee(fee, TX_TYPE.nameRevoke, { params });
  // Build `claim` transaction's
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.nameRevoke);

  if (json) print({ tx, txObject });
  else printBuilderTransaction({ tx, txObject }, TX_TYPE.nameRevoke);
}

// ## Build `contractDeploy` transaction
export async function contractDeploy(ownerId, contractByteCode, initCallData, nonce, { json, ...options }) {
  // Initialize `Ae`
  const txBuilder = await initTxBuilder(options);
  // Build `deploy` transaction's
  // Create `contract-deploy` transaction
  const { tx, contractId, txObject } = await txBuilder.contractCreateTx({
    ...options,
    code: contractByteCode,
    ownerId,
    nonce: +nonce, // TODO: remove after fixing https://github.com/aeternity/aepp-sdk-js/issues/1370
    callData: initCallData,
  });

  if (json) {
    print({ tx, contractId, txObject });
  } else {
    printUnderscored('Unsigned Contract Deploy TX', tx);
    printUnderscored('Contract ID', contractId);
  }
}

// ## Build `contractCall` transaction
export async function contractCall(callerId, contractId, callData, nonce, { json, ...options }) {
  // Build `call` transaction's
  // Initialize `Ae`
  const txBuilder = await initTxBuilder(options);
  // Create `contract-call` transaction
  const tx = await txBuilder.contractCallTx({
    ...options,
    callerId,
    nonce,
    callData,
    contractId,
  });

  if (json) print({ tx });
  else printUnderscored('Unsigned Contract Call TX', tx);
}

// ## Build `oracleRegister` transaction
export async function oracleRegister(accountId, queryFormat, responseFormat, nonce, {
  ttl, json, fee, queryFee, oracleTtl,
}) {
  queryFee = parseInt(queryFee);
  oracleTtl = BUILD_ORACLE_TTL(parseInt(oracleTtl));
  nonce = parseInt(nonce);

  const txBuilder = initOfflineTxBuilder();
  // Create `transfer` transaction
  const params = {
    accountId,
    ttl,
    fee,
    nonce,
    oracleTtl,
    queryFee,
    queryFormat,
    responseFormat,
    abiVersion: ORACLE_VM_VERSION,
  };
  fee = txBuilder.calculateFee(fee, TX_TYPE.oracleRegister, { params });
  // Build `claim` transaction's
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.oracleRegister);
  if (json) print({ tx, txObject });
  else printBuilderTransaction({ tx, txObject }, TX_TYPE.oracleRegister);
}

// ## Build `oraclePostQuery` transaction
export async function oraclePostQuery(senderId, oracleId, query, nonce, {
  ttl, json, fee, queryFee, queryTtl, responseTtl,
}) {
  queryFee = parseInt(queryFee);
  queryTtl = BUILD_ORACLE_TTL(parseInt(queryTtl));
  responseTtl = BUILD_ORACLE_TTL(parseInt(responseTtl));
  nonce = parseInt(nonce);

  const txBuilder = initOfflineTxBuilder();
  // Create `transfer` transaction
  const params = {
    senderId,
    ttl,
    fee,
    nonce,
    oracleId,
    query,
    queryFee,
    queryTtl,
    responseTtl,
  };
  fee = txBuilder.calculateFee(fee, TX_TYPE.oracleQuery, { params });
  // Build `claim` transaction's
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.oracleQuery);

  if (json) print({ tx, txObject });
  else printBuilderTransaction({ tx, txObject }, TX_TYPE.oracleQuery);
}

// ## Build `oracleExtend` transaction
export async function oracleExtend(callerId, oracleId, oracleTtl, nonce, { ttl, json, fee }) {
  oracleTtl = BUILD_ORACLE_TTL(parseInt(oracleTtl));
  nonce = parseInt(nonce);

  const txBuilder = initOfflineTxBuilder();
  // Create `transfer` transaction
  const params = {
    callerId,
    oracleId,
    oracleTtl,
    fee,
    nonce,
    ttl,
  };
  fee = txBuilder.calculateFee(fee, TX_TYPE.oracleExtend, { params });
  // Build `claim` transaction's
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.oracleExtend);

  if (json) print({ tx, txObject });
  else printBuilderTransaction({ tx, txObject }, TX_TYPE.oracleExtend);
}

// ## Build `oracleRespond` transaction
export async function oracleRespond(callerId, oracleId, queryId, response, nonce, {
  ttl, json, fee, responseTtl,
}) {
  responseTtl = BUILD_ORACLE_TTL(parseInt(responseTtl));
  nonce = parseInt(nonce);

  const txBuilder = initOfflineTxBuilder();
  // Create `transfer` transaction
  const params = {
    oracleId,
    responseTtl,
    callerId,
    queryId,
    response,
    nonce,
    fee,
    ttl,
  };
  fee = txBuilder.calculateFee(fee, TX_TYPE.oracleResponse, { params });
  // Build `claim` transaction's
  const { tx, txObject } = txBuilder.buildTx({ ...params, fee }, TX_TYPE.oracleResponse);

  if (json) print({ tx, txObject });
  else printBuilderTransaction({ tx, txObject }, TX_TYPE.oracleResponse);
}

// ## Verify 'transaction'
export async function verify(transaction, { json, ...options }) {
  // Validate input
  TxBuilderHelper.decode(transaction, 'tx');
  // Call `getStatus` API and print it
  const validation = await verifyTransaction(transaction, await Node(options));
  const { tx, txType: type } = TxBuilder.unpackTx(transaction);
  if (json) {
    print({ validation, tx, type });
    return;
  }
  printValidation({ validation, transaction });
  if (!validation.length) print(' ✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓ TX VALID ✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓');
}
