import { Encoding, unpackTx as _unpackTx, Tag } from '@aeternity/aepp-sdk';
import { initSdk } from '../utils/cli.js';
import {
  print,
  printBlock,
  printBlockTransactions,
  printOracle,
  printQueries,
  printTable,
  printTransaction,
} from '../utils/print.js';
import {
  checkPref,
  getBlock,
  getNameEntry,
  formatCoins,
  formatTtl,
  validateName,
} from '../utils/helpers.js';

function printEntries(object) {
  printTable(Object.entries(object));
}

async function getBlockByHash(hash, { json, ...options }) {
  checkPref(hash, [Encoding.KeyBlockHash, Encoding.MicroBlockHash]);
  const aeSdk = initSdk(options);
  printBlock(await getBlock(hash, aeSdk), json, true);
}

async function getTransactionByHash(hash, { json, ...options }) {
  checkPref(hash, Encoding.TxHash);
  const aeSdk = initSdk(options);
  await printTransaction(await aeSdk.api.getTransactionByHash(hash), json, aeSdk);
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
  const aeSdk = initSdk(options);
  const { nonce } = await aeSdk.api.getAccountByPubkey(hash);
  const balance = await aeSdk.getBalance(hash);
  const { transactions } = await aeSdk.api.getPendingAccountTransactionsByPubkey(hash);
  if (json) {
    print({
      hash,
      balance,
      nonce,
      transactions,
    });
  } else {
    printTable([
      ['Account ID', hash],
      ['Account balance', formatCoins(balance)],
      ['Account nonce', nonce],
    ]);
    print(transactions.length ? 'Pending transactions:' : 'No pending transactions');
    printBlockTransactions(transactions);
  }
}

async function getBlockByHeight(height, { json, ...options }) {
  const aeSdk = initSdk(options);
  printBlock(await aeSdk.api.getKeyBlockByHeight(+height), json);
}

async function getName(name, { json, ...options }) {
  validateName(name);
  const aeSdk = initSdk(options);
  const nameEntry = await getNameEntry(name, aeSdk);

  if (json) {
    print(nameEntry);
    return;
  }

  const height = await aeSdk.getHeight({ cached: true });
  const details = [
    ['Status', nameEntry.status],
    ['Name hash', nameEntry.id],
  ];
  switch (nameEntry.status) {
    case 'CLAIMED':
      details.push(['Owner', nameEntry.owner]);
      if (nameEntry.pointers?.length) {
        nameEntry.pointers.forEach(({ key, id }) => details.push([`Pointer ${key}`, id]));
      } else details.push(['Pointers', 'N/A']);
      details.push(['TTL', formatTtl(nameEntry.ttl, height)]);
      break;
    case 'AUCTION':
      details.push(
        ['Highest bidder', nameEntry.highestBidder],
        ['Highest bid', formatCoins(nameEntry.highestBid)],
        ['Ends at height', formatTtl(nameEntry.endsAt, height)],
        ['Started at height', formatTtl(nameEntry.startedAt, height)],
      );
      break;
    case 'AVAILABLE':
      break;
    default:
      throw new Error(`Unknown name status: ${nameEntry.status}`);
  }
  printTable(details);
}

async function getContract(contractId, { json, ...options }) {
  const aeSdk = initSdk(options);
  const contract = await aeSdk.api.getContract(contractId);
  if (json) print(contract);
  else printEntries(contract);
}

async function getOracle(oracleId, { json, ...options }) {
  const aeSdk = initSdk(options);
  const oracle = await aeSdk.api.getOracleByPubkey(oracleId);
  oracle.queries = (await aeSdk.api.getOracleQueriesByPubkey(oracleId)).oracleQueries;
  if (json) {
    print(oracle);
    return;
  }
  printOracle(oracle);
  printQueries(oracle.queries);
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
