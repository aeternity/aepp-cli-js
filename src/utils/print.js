import {
  Encoding, unpackTx, AbiVersion, VmVersion,
} from '@aeternity/aepp-sdk';
import {
  decode, formatCoins, formatTtl as formatTtlUnbound, timeAgo,
} from './helpers.js';

const ROW_WIDTH = 40;

const JsonStringifyEs = (object, spaced) => JSON.stringify(
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

export function printUnderscored(key, val) {
  print([
    key,
    '_'.repeat(ROW_WIDTH - key.length),
    typeof val !== 'object' ? val : JsonStringifyEs(val),
  ].join(' '));
}

export function printValidation({ validation, transaction }) {
  print('---------------------------------------- TX DATA ↓↓↓ \n');
  const tx = unpackTx(transaction);
  // TODO: print the same way as transaction by hash
  Object.entries(tx).forEach(([key, value]) => printUnderscored(key, value));
  print('\n---------------------------------------- ERRORS ↓↓↓ \n');
  validation.forEach(({ message, checkedKeys }) => {
    printUnderscored(checkedKeys.join(', '), message);
  });
}

function printTxField(tx, verboseName, field, handleValue = (a) => a) {
  if (!(field in tx)) return;
  printUnderscored(verboseName, tx[field] == null ? 'N/A' : handleValue(tx[field]));
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
      case 'delta': return formatTtl(+value + +tx.blockHeight);
      case 'block': return formatTtl(value);
      default: throw new Error(`Unknown ttl type: ${type}`);
    }
  };
  const formatTtlSeconds = (seconds) => {
    const date = new Date();
    date.setSeconds(date.getSeconds() + seconds);
    return `${seconds} (${timeAgo(date).replace('in ', '')})`;
  };

  // meta
  printUnderscored('Transaction hash', tx.hash);
  printUnderscored('Block hash', tx.blockHash);
  printTxField(tx, 'Block height', 'blockHeight', formatTtl);
  printUnderscored('Signatures', tx.signatures);
  printUnderscored('Transaction type', `${tx.type} (ver. ${tx.version})`);
  // sender
  printTxField(tx, 'Account address', 'accountId');
  printTxField(tx, 'Sender address', 'senderId');
  printTxField(tx, 'Recipient address', 'recipientId');
  printTxField(tx, 'Owner address', 'ownerId');
  printTxField(tx, 'Caller address', 'callerId');
  // name
  printTxField(tx, 'Name ID', 'nameId');
  printTxField(tx, 'Name TTL', 'nameTtl', formatTtl);
  printTxField(tx, 'Name', 'name');
  printTxField(tx, 'Name fee', 'nameFee', formatCoins);
  printTxField(tx, 'Name salt', 'nameSalt');
  if ('pointers' in tx) {
    if (tx.pointers.length === 0) printUnderscored('Pointers', 'N/A');
    else tx.pointers.forEach(({ key, id }) => printUnderscored(`Pointer ${key}`, id));
  }
  printTxField(tx, 'Client TTL', 'clientTtl', formatTtlSeconds);
  printTxField(tx, 'Commitment', 'commitmentId');
  // contract
  printTxField(tx, 'Contract address', 'contractId');
  printTxField(tx, 'Gas', 'gas', (gas) => `${gas} (${formatCoins(tx.gasPrice * BigInt(gas))})`);
  printTxField(tx, 'Gas price', 'gasPrice', formatCoins);
  printTxField(tx, 'Bytecode', 'code');
  printTxField(tx, 'Call data', 'callData');
  // oracle
  printTxField(tx, 'Oracle ID', 'oracleId');
  printTxField(tx, 'Oracle TTL', 'oracleTtl', formatTtlObject);
  printTxField(tx, 'VM version', 'vmVersion', (v) => `${v} (${VmVersion[v]})`);
  printTxField(tx, 'ABI version', 'abiVersion', (v) => `${v} (${AbiVersion[v]})`);
  // spend
  printTxField(tx, 'Amount', 'amount', formatCoins);
  printTxField(tx, 'Payload', 'payload');
  // oracle query
  printTxField(tx, 'Query', 'query');
  printTxField(tx, 'Query ID', 'queryId');
  printTxField(tx, 'Query fee', 'queryFee', formatCoins);
  printTxField(tx, 'Query TTL', 'queryTtl', formatTtlObject);
  printTxField(tx, 'Query format', 'queryFormat');
  // oracle response
  printTxField(tx, 'Response', 'response');
  printTxField(tx, 'Response TTL', 'responseTtl', formatTtlObject);
  printTxField(tx, 'Response format', 'responseFormat');
  // common fields
  printTxField(tx, 'Fee', 'fee', formatCoins);
  printTxField(tx, 'Nonce', 'nonce');
  printTxField(tx, 'TTL', 'ttl', formatTtl);
}

export async function printTransaction(tx, json, sdk) {
  const height = await sdk.getHeight({ cache: true });
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

  printUnderscored('Block hash', block.hash);
  printUnderscored('Block height', block.height);
  printUnderscored('State hash', block.stateHash);
  printUnderscored('Nonce', block.nonce ?? 'N/A');
  printUnderscored('Miner', block.miner ?? 'N/A');
  printUnderscored('Time', new Date(block.time).toString());
  printUnderscored('Previous block hash', block.prevHash);
  printUnderscored('Previous key block hash', block.prevKeyHash);
  printUnderscored('Version', block.version);
  printUnderscored('Target', block.target ?? 'N/A');
  const txCount = block.transactions?.length ?? 0;
  printUnderscored('Transactions', txCount);
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
  printUnderscored('Oracle ID', oracle.id ?? 'N/A');
  printUnderscored('Oracle Query Fee', oracle.queryFee ?? 'N/A');
  printUnderscored('Oracle Query Format', oracle.queryFormat ?? 'N/A');
  printUnderscored('Oracle Response Format', oracle.responseFormat ?? 'N/A');
  printUnderscored('Ttl', oracle.ttl ?? 'N/A');
}

export function printQueries(queries = [], json) {
  if (json) {
    print(queries);
    return;
  }
  print('');
  print('--------------------------------- QUERIES ------------------------------------');
  queries.forEach((q) => {
    printUnderscored('Oracle ID', q.oracleId ?? 'N/A');
    printUnderscored('Query ID', q.id ?? 'N/A');
    printUnderscored('Fee', q.fee ?? 'N/A');
    printUnderscored('Query', q.query ?? 'N/A');
    printUnderscored('Query decoded', decode(q.query, Encoding.OracleQuery).toString() ?? 'N/A');
    printUnderscored('Response', q.response ?? 'N/A');
    printUnderscored('Response decoded', decode(q.response, Encoding.OracleResponse).toString() ?? 'N/A');
    printUnderscored('Response Ttl', q.responseTtl ?? 'N/A');
    printUnderscored('Sender Id', q.senderId ?? 'N/A');
    printUnderscored('Sender Nonce', q.senderNonce ?? 'N/A');
    printUnderscored('Ttl', q.ttl ?? 'N/A');
    print('------------------------------------------------------------------------------');
  });
}
