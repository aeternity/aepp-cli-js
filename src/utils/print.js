import { Encoding, unpackTx, AbiVersion, VmVersion } from '@aeternity/aepp-sdk';
import {
  decode,
  formatCoins,
  formatTtl as formatTtlUnbound,
  formatSeconds,
  formatBlocks,
} from './helpers.js';

const JsonStringifyEs = (object, spaced) =>
  JSON.stringify(
    object,
    (key, value) => {
      if (typeof value === 'bigint') return `${value}`;
      if (value instanceof Map) return [...value.entries()];
      return value;
    },
    spaced ? 2 : undefined,
  );

export function print(msg, obj) {
  if (typeof msg === 'object') {
    console.log(JsonStringifyEs(msg, true));
    return;
  }
  if (obj) {
    console.log(msg);
    console.log(JsonStringifyEs(obj, true));
  } else {
    console.log(msg);
  }
}

export function printTable(data) {
  const firstColumnWidth = Math.max(...data.map(([key]) => key.length));
  for (const [key, val] of data) {
    console.log(
      key.padEnd(firstColumnWidth + 1),
      typeof val !== 'object' ? val : JsonStringifyEs(val),
    );
  }
}

export function printValidation({ validation, transaction }) {
  print('---------------------------------------- TX DATA ↓↓↓ \n');
  printTable(Object.entries(unpackTx(transaction)));

  print('\n---------------------------------------- ERRORS ↓↓↓ \n');
  printTable(validation.map(({ message, checkedKeys }) => [checkedKeys.join(', '), message]));
}

function txFieldRow(tx, verboseName, field, handleValue = (a) => a) {
  if (!(field in tx)) return;
  return [verboseName, tx[field] == null ? 'N/A' : handleValue(tx[field])];
}

function printTransactionSync(_tx, json, currentHeight) {
  if (json) {
    print(_tx);
    return;
  }
  const tx = { ..._tx, ..._tx.tx };
  const formatTtl = (ttl) => (currentHeight ? formatTtlUnbound(ttl, currentHeight) : ttl);
  const formatTtlObject = ({ type, value }) => {
    switch (type) {
      case 'delta':
        return formatTtl(+value + +tx.blockHeight);
      case 'block':
        return formatTtl(value);
      default:
        throw new Error(`Unknown ttl type: ${type}`);
    }
  };

  const table = [
    // meta
    ['Transaction hash', tx.hash],
    ['Block hash', tx.blockHash],
    txFieldRow(tx, 'Block height', 'blockHeight', formatTtl),
    ['Signatures', tx.signatures],
    ['Transaction type', `${tx.type} (ver. ${tx.version})`],
    // sender
    txFieldRow(tx, 'Account address', 'accountId'),
    txFieldRow(tx, 'Sender address', 'senderId'),
    txFieldRow(tx, 'Recipient address', 'recipientId'),
    txFieldRow(tx, 'Owner address', 'ownerId'),
    txFieldRow(tx, 'Caller address', 'callerId'),
    // name
    txFieldRow(tx, 'Name ID', 'nameId'),
    txFieldRow(tx, 'Name TTL', 'nameTtl', formatBlocks),
    txFieldRow(tx, 'Name', 'name'),
    txFieldRow(tx, 'Name fee', 'nameFee', formatCoins),
    txFieldRow(tx, 'Name salt', 'nameSalt'),
    txFieldRow(tx, 'Name salt', 'salt'),
  ];

  if ('pointers' in tx) {
    if (tx.pointers.length === 0) table.push(['Pointers', 'N/A']);
    else tx.pointers.forEach(({ key, id }) => table.push([`Pointer ${key}`, id]));
  }

  table.push(
    txFieldRow(tx, 'Client TTL', 'clientTtl', formatSeconds),
    txFieldRow(tx, 'Commitment', 'commitmentId'),
    // contract
    txFieldRow(tx, 'Contract address', 'contractId'),
    txFieldRow(tx, 'Gas', 'gas', (gas) => `${gas} (${formatCoins(tx.gasPrice * BigInt(gas))})`),
    txFieldRow(tx, 'Gas price', 'gasPrice', formatCoins),
    txFieldRow(tx, 'Bytecode', 'code'),
    txFieldRow(tx, 'Call data', 'callData'),
    // oracle
    txFieldRow(tx, 'Oracle ID', 'oracleId'),
    txFieldRow(tx, 'Oracle TTL', 'oracleTtl', formatTtlObject),
    txFieldRow(tx, 'VM version', 'vmVersion', (v) => `${v} (${VmVersion[v]})`),
    txFieldRow(tx, 'ABI version', 'abiVersion', (v) => `${v} (${AbiVersion[v]})`),
    // spend
    txFieldRow(tx, 'Amount', 'amount', formatCoins),
    txFieldRow(tx, 'Payload', 'payload'),
    // oracle query
    txFieldRow(tx, 'Query', 'query'),
    txFieldRow(tx, 'Query ID', 'queryId'),
    ...('query' in tx ? [txFieldRow(tx, 'Query ID', 'id')] : []),
    txFieldRow(tx, 'Query fee', 'queryFee', formatCoins),
    txFieldRow(tx, 'Query TTL', 'queryTtl', formatTtlObject),
    txFieldRow(tx, 'Query format', 'queryFormat'),
    // oracle response
    txFieldRow(tx, 'Response', 'response'),
    txFieldRow(tx, 'Response TTL', 'responseTtl', formatTtlObject),
    txFieldRow(tx, 'Response format', 'responseFormat'),
    // common fields
    txFieldRow(tx, 'Fee', 'fee', formatCoins),
    txFieldRow(tx, 'Nonce', 'nonce'),
    txFieldRow(tx, 'TTL', 'ttl', formatTtl),
  );

  printTable(table.filter(Boolean));
}

export async function printTransaction(tx, json, aeSdk) {
  const height = await aeSdk.getHeight({ cache: true });
  printTransactionSync(tx, json, height);
}

export function printBlockTransactions(ts) {
  ts.forEach((tx) => {
    print('<<--------------- Transaction --------------->>');
    // TODO: consider using async version
    printTransactionSync(tx, false);
  });
}

export function printBlock(block, json, isRoot = false) {
  if (json) {
    print(block);
    return;
  }
  const encoding = block.hash.split('_')[0];
  if (!isRoot && encoding === Encoding.MicroBlockHash) console.group();

  const reverseEncoding = Object.fromEntries(Object.entries(Encoding).map(([k, v]) => [v, k]));
  const name = reverseEncoding[encoding].replace('Hash', '');
  print(`<<--------------- ${name} --------------->>`);

  const txCount = block.transactions?.length ?? 0;
  printTable([
    ['Block hash', block.hash],
    ['Block height', block.height],
    ['State hash', block.stateHash],
    ['Nonce', block.nonce ?? 'N/A'],
    ['Miner', block.miner ?? 'N/A'],
    ['Time', new Date(block.time).toString()],
    ['Previous block hash', block.prevHash],
    ['Previous key block hash', block.prevKeyHash],
    ['Version', block.version],
    ['Target', block.target ?? 'N/A'],
    ['Transactions', txCount],
  ]);
  if (txCount) {
    console.group();
    printBlockTransactions(block.transactions);
    console.groupEnd();
  }
  if (!isRoot && encoding === Encoding.MicroBlockHash) console.groupEnd();
}

export function printOracle(oracle, json) {
  if (json) {
    print(oracle);
    return;
  }
  printTable([
    ['Oracle ID', oracle.id ?? 'N/A'],
    ['Oracle Query Fee', oracle.queryFee ?? 'N/A'],
    ['Oracle Query Format', oracle.queryFormat ?? 'N/A'],
    ['Oracle Response Format', oracle.responseFormat ?? 'N/A'],
    ['Ttl', oracle.ttl ?? 'N/A'],
  ]);
}

export function printQueries(queries = [], json) {
  if (json) {
    print(queries);
    return;
  }
  print('');
  print('--------------------------------- QUERIES ------------------------------------');
  queries.forEach((q) => {
    printTable([
      ['Oracle ID', q.oracleId ?? 'N/A'],
      ['Query ID', q.id ?? 'N/A'],
      ['Fee', q.fee ?? 'N/A'],
      ['Query', q.query ?? 'N/A'],
      ['Query decoded', decode(q.query, Encoding.OracleQuery).toString() ?? 'N/A'],
      ['Response', q.response ?? 'N/A'],
      ['Response decoded', decode(q.response, Encoding.OracleResponse).toString() ?? 'N/A'],
      ['Response Ttl', q.responseTtl ?? 'N/A'],
      ['Sender Id', q.senderId ?? 'N/A'],
      ['Sender Nonce', q.senderNonce ?? 'N/A'],
      ['Ttl', q.ttl ?? 'N/A'],
    ]);
    print('------------------------------------------------------------------------------');
  });
}
