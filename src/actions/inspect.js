import { Encoding, unpackTx as _unpackTx, Tag } from '@aeternity/aepp-sdk';
import { initSdk } from '../utils/cli.js';
import {
  print,
  printBlock,
  printBlockTransactions,
  printOracle, printQueries,
  printTransaction,
  printUnderscored,
} from '../utils/print.js';
import {
  checkPref, getBlock, getNameEntry, formatCoins, formatTtl, validateName,
} from '../utils/helpers.js';

function printEntries(object) {
  Object.entries(object).forEach((entry) => printUnderscored(...entry));
}

async function getBlockByHash(hash, { json, ...options }) {
  checkPref(hash, [Encoding.KeyBlockHash, Encoding.MicroBlockHash]);
  const sdk = initSdk(options);
  printBlock(await getBlock(hash, sdk), json, true);
}

async function getTransactionByHash(hash, { json, ...options }) {
  checkPref(hash, Encoding.TxHash);
  const sdk = initSdk(options);
  await printTransaction(await sdk.api.getTransactionByHash(hash), json, sdk);
}

async function unpackTx(encodedTx, { json }) {
  checkPref(encodedTx, Encoding.Transaction);
  const txUnpacked = _unpackTx(encodedTx);
  if (json) print(txUnpacked);
  // TODO: use printTransaction instead
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
    printUnderscored('Account balance', formatCoins(balance));
    printUnderscored('Account nonce', nonce);
    print(transactions.length ? 'Pending transactions:' : 'No pending transactions');
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
  const nameEntry = await getNameEntry(name, sdk);

  if (json) {
    print(nameEntry);
    return;
  }

  const height = await sdk.getHeight({ cached: true });
  printUnderscored('Status', nameEntry.status);
  printUnderscored('Name hash', nameEntry.id);
  switch (nameEntry.status) {
    case 'CLAIMED':
      printUnderscored('Owner', nameEntry.owner);
      if (nameEntry.pointers?.length) {
        nameEntry.pointers.forEach(({ key, id }) => printUnderscored(`Pointer ${key}`, id));
      } else printUnderscored('Pointers', 'N/A');
      printUnderscored('TTL', formatTtl(nameEntry.ttl, height));
      break;
    case 'AUCTION':
      printUnderscored('Highest bidder', nameEntry.highestBidder);
      printUnderscored('Highest bid', formatCoins(nameEntry.highestBid));
      printUnderscored('Ends at height', formatTtl(nameEntry.endsAt, height));
      printUnderscored('Started at height', formatTtl(nameEntry.startedAt, height));
      break;
    case 'AVAILABLE':
      break;
    default:
      throw new Error(`Unknown name status: ${nameEntry.status}`);
  }
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

export default async function inspect(hash, option) {
  if (!isNaN(hash)) {
    await getBlockByHeight(hash, option);
    return;
  }

  const [pref] = hash.split('_');
  switch (pref) {
    case Encoding.KeyBlockHash:
    case Encoding.MicroBlockHash:
      await getBlockByHash(hash, option);
      break;
    case Encoding.AccountAddress:
      await getAccountByHash(hash, option);
      break;
    case Encoding.TxHash:
      await getTransactionByHash(hash, option);
      break;
    case Encoding.Transaction:
      await unpackTx(hash, option);
      break;
    case Encoding.ContractAddress:
      await getContract(hash, option);
      break;
    case Encoding.OracleAddress:
      await getOracle(hash, option);
      break;
    default:
      await getName(hash, option);
      break;
  }
}
