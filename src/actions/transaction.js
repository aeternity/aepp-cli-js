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
import { initOfflineTxBuilder } from '../utils/cli';
import { print, printUnderscored, printValidation } from '../utils/print';
import { validateName } from '../utils/helpers';
import { BUILD_ORACLE_TTL, ORACLE_VM_VERSION } from '../utils/constant';

const { TX_TYPE, TX_SERIALIZATION_SCHEMA } = SCHEMA;
const vmAbi = Object.fromEntries(
  Object.entries(SCHEMA.PROTOCOL_VM_ABI[SCHEMA.PROTOCOL_VERSIONS.IRIS])
    .map(([txType, { vmVersion, abiVersion }]) => [
      txType, { vmVersion: vmVersion[0], abiVersion: abiVersion[0] },
    ]),
);

// Print `Buider Transaction`
function buildAndPrintTx(txType, params, json, extraKeys = {}) {
  // Initialize `Ae`
  const txBuilder = initOfflineTxBuilder();
  const vsn = Math.max(...Object.keys(TX_SERIALIZATION_SCHEMA[txType]).map((a) => +a));

  // TODO: move to SDK side
  switch (txType) {
    case TX_TYPE.contractCreate:
      params.ctVersion = vmAbi[TX_TYPE.contractCreate];
      break;
    case TX_TYPE.contractCall:
      params.abiVersion = vmAbi[TX_TYPE.contractCall].abiVersion;
      break;
    default:
  }

  params.fee = txBuilder.calculateFee(params.fee, txType, { params, vsn });
  const { tx, txObject } = txBuilder.buildTx(params, txType, { vsn });

  if (json) {
    print({ tx, txObject, ...extraKeys });
    return;
  }
  printUnderscored('Transaction type', txType);
  print('Summary');
  Object
    .entries({ ...txObject, ...extraKeys })
    .forEach(([key, value]) => printUnderscored(`    ${key.toUpperCase()}`, value));
  print('Output');
  printUnderscored('    Encoded', tx);
  print('This is an unsigned transaction. Use `account sign` and `tx broadcast` to submit the transaction to the network, or verify that it will be accepted with `tx verify`.');
}

// ## Build `spend` transaction
export function spend(senderId, recipientId, amount, nonce, { json, ...options }) {
  // Build params
  const params = {
    ...options,
    senderId,
    recipientId,
    amount,
    nonce,
  };
  buildAndPrintTx(TX_TYPE.spend, params, json);
}

// ## Build `namePreClaim` transaction
export function namePreClaim(accountId, name, nonce, { json, ...options }) {
  // Validate `name`(check if `name` end on `.chain`)
  validateName(name);

  // Generate `salt` and `commitmentId` and build `name` hash
  const salt = Crypto.salt();
  const commitmentId = TxBuilderHelper.commitmentHash(name, salt);

  const params = {
    ...options,
    accountId,
    commitmentId,
    nonce,
  };
  buildAndPrintTx(TX_TYPE.namePreClaim, params, json, { salt });
}

// ## Build `nameClaim` transaction
export function nameClaim(accountId, nameSalt, name, nonce, { json, ...options }) {
  // Validate `name`(check if `name` end on `.chain`)
  validateName(name);
  const params = {
    ...options,
    accountId,
    nameSalt,
    name,
    nonce,
  };
  buildAndPrintTx(TX_TYPE.nameClaim, params, json);
}

// ## Build `nameUpdate` transaction
export function nameUpdate(accountId, nameId, nonce, pointers, { json, ...options }) {
  const params = {
    ...options,
    nameId,
    accountId,
    pointers: pointers.map((id) => ({ id, key: getDefaultPointerKey(id) })),
    nonce,
  };
  buildAndPrintTx(TX_TYPE.nameUpdate, params, json);
}

// ## Build `nameTransfer` transaction
export function nameTransfer(accountId, recipientId, nameId, nonce, { json, ...options }) {
  // Create `transfer` transaction
  const params = {
    ...options,
    accountId,
    recipientId,
    nameId,
    nonce,
  };
  buildAndPrintTx(TX_TYPE.nameTransfer, params, json);
}

// ## Build `nameRevoke` transaction
export function nameRevoke(accountId, nameId, nonce, { json, ...options }) {
  const params = {
    ...options,
    accountId,
    nameId,
    nonce,
  };
  buildAndPrintTx(TX_TYPE.nameRevoke, params, json);
}

// ## Build `contractDeploy` transaction
export function contractDeploy(ownerId, code, callData, nonce, { json, ...options }) {
  const params = {
    ...options,
    code,
    ownerId,
    nonce,
    callData,
  };
  buildAndPrintTx(TX_TYPE.contractCreate, params, json, {
    contractId: TxBuilderHelper.buildContractId(ownerId, nonce),
  });
}

// ## Build `contractCall` transaction
export function contractCall(callerId, contractId, callData, nonce, { json, ...options }) {
  const params = {
    ...options,
    callerId,
    nonce,
    callData,
    contractId,
  };
  buildAndPrintTx(TX_TYPE.contractCall, params, json);
}

// ## Build `oracleRegister` transaction
export function oracleRegister(accountId, queryFormat, responseFormat, nonce, {
  json, queryFee, oracleTtl, ...options
}) {
  const params = {
    ...options,
    accountId,
    nonce,
    oracleTtl: BUILD_ORACLE_TTL(parseInt(oracleTtl)),
    queryFee: parseInt(queryFee),
    queryFormat,
    responseFormat,
    abiVersion: ORACLE_VM_VERSION,
  };
  buildAndPrintTx(TX_TYPE.oracleRegister, params, json);
}

// ## Build `oraclePostQuery` transaction
export function oraclePostQuery(senderId, oracleId, query, nonce, {
  json, queryFee, queryTtl, responseTtl, ...options
}) {
  const params = {
    ...options,
    senderId,
    nonce,
    oracleId,
    query,
    queryFee: parseInt(queryFee),
    queryTtl: BUILD_ORACLE_TTL(parseInt(queryTtl)),
    responseTtl: BUILD_ORACLE_TTL(parseInt(responseTtl)),
  };
  buildAndPrintTx(TX_TYPE.oracleQuery, params, json);
}

// ## Build `oracleExtend` transaction
export function oracleExtend(callerId, oracleId, oracleTtl, nonce, { json, ...options }) {
  const params = {
    ...options,
    callerId,
    oracleId,
    oracleTtl: BUILD_ORACLE_TTL(parseInt(oracleTtl)),
    nonce,
  };
  buildAndPrintTx(TX_TYPE.oracleExtend, params, json);
}

// ## Build `oracleRespond` transaction
export function oracleRespond(callerId, oracleId, queryId, response, nonce, {
  json, responseTtl, ...options
}) {
  const params = {
    ...options,
    oracleId,
    responseTtl: BUILD_ORACLE_TTL(parseInt(responseTtl)),
    callerId,
    queryId,
    response,
    nonce,
  };
  buildAndPrintTx(TX_TYPE.oracleResponse, params, json);
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
