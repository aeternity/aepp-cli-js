// # æternity CLI `inspect` file
//
// This script initialize all `inspect` function
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

import { Encoding, unpackTx as _unpackTx, Tag } from '@aeternity/aepp-sdk';
import { initSdk } from '../utils/cli';
import {
  print,
  printBlock,
  printBlockTransactions,
  printName, printOracle, printQueries,
  printTransaction,
  printUnderscored,
} from '../utils/print';
import {
  checkPref, getBlock, updateNameStatus, validateName,
} from '../utils/helpers';
import CliError from '../utils/CliError';

function printEntries(object) {
  Object.entries(object).forEach((entry) => printUnderscored(...entry));
}

// ## Inspect helper function's
async function getBlockByHash(hash, { json, ...options }) {
  checkPref(hash, [Encoding.KeyBlockHash, Encoding.MicroBlockHash]);
  const sdk = initSdk(options);
  printBlock(await getBlock(hash, sdk), json, true);
}

async function getTransactionByHash(hash, { json, ...options }) {
  checkPref(hash, Encoding.TxHash);
  const sdk = initSdk(options);
  printTransaction(await sdk.api.getTransactionByHash(hash), json);
}

async function unpackTx(encodedTx, { json }) {
  checkPref(encodedTx, Encoding.Transaction);
  const txUnpacked = _unpackTx(encodedTx);
  if (json) print(txUnpacked);
  else printEntries({ 'Tx Type': Tag[txUnpacked.tag], ...txUnpacked });
}

async function getAccountByHash(hash, { json, ...options }) {
  checkPref(hash, Encoding.AccountAddress);
  const sdk = initSdk(options);
  const { nonce } = await sdk.api.getAccountByPubkey(hash);
  const balance = await sdk.getBalance(hash);
  const { transactions } = await sdk.api.getPendingAccountTransactionsByPubkey(hash);
  if (json) {
    print({
      hash,
      balance,
      nonce,
      transactions,
    });
  } else {
    printUnderscored('Account ID', hash);
    printUnderscored('Account balance', balance);
    printUnderscored('Account nonce', nonce);
    print('Pending transactions:');
    printBlockTransactions(transactions);
  }
}

async function getBlockByHeight(height, { json, ...options }) {
  const sdk = initSdk(options);
  printBlock(await sdk.api.getKeyBlockByHeight(+height), json);
}

async function getName(name, { json, ...options }) {
  validateName(name);
  const sdk = initSdk(options);
  printName(await updateNameStatus(name, sdk), json);
}

async function getContract(contractId, { json, ...options }) {
  const sdk = initSdk(options);
  const contract = await sdk.api.getContract(contractId);
  if (json) print(contract);
  else printEntries(contract);
}

async function getOracle(oracleId, { json, ...options }) {
  const sdk = initSdk(options);
  const oracle = await sdk.api.getOracleByPubkey(oracleId);
  oracle.queries = (await sdk.api.getOracleQueriesByPubkey(oracleId)).oracleQueries;
  if (json) {
    print(oracle);
    return;
  }
  printOracle(oracle);
  if (oracle.queries) printQueries(oracle.queries);
}

// ## Inspect function
// That function get the param(`hash`, `height` or `name`) and show you info about it
export default async function inspect(hash, option) {
  if (!hash) throw new CliError('Hash argument is required');

  // Get `block` by `height`
  if (!isNaN(hash)) {
    await getBlockByHeight(hash, option);
    return;
  }

  const [pref] = hash.split('_');
  switch (pref) {
    // Get `block` or `micro_block` by `hash`
    case Encoding.KeyBlockHash:
    case Encoding.MicroBlockHash:
      await getBlockByHash(hash, option);
      break;
    // Get `account` by `hash`
    case Encoding.AccountAddress:
      await getAccountByHash(hash, option);
      break;
    // Get `transaction` by `hash`
    case Encoding.TxHash:
      await getTransactionByHash(hash, option);
      break;
    case Encoding.Transaction:
      await unpackTx(hash, option);
      break;
    // Get `contract` by `contractId`
    case Encoding.ContractAddress:
      await getContract(hash, option);
      break;
    case Encoding.OracleAddress:
      await getOracle(hash, option);
      break;
    // Get `name`
    default:
      await getName(hash, option);
      break;
  }
}
