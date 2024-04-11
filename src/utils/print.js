import { Encoding, unpackTx } from '@aeternity/aepp-sdk';
import { decode } from './helpers.js';

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
  const { tx, txType: type } = unpackTx(transaction);
  Object.entries({ ...tx, type }).forEach(([key, value]) => printUnderscored(key, value));
  print('\n---------------------------------------- ERRORS ↓↓↓ \n');
  validation.forEach(({ message, checkedKeys }) => {
    printUnderscored(checkedKeys.join(', '), message);
  });
}

function printTxField(tx, verboseName, field, handleValue = (a) => a) {
  if (!(field in tx)) return;
  printUnderscored(verboseName, tx[field] == null ? 'N/A' : handleValue(tx[field]));
}

export function printTransaction(_tx, json) {
  if (json) {
    print(_tx);
    return;
  }
  const tx = { ..._tx, ..._tx.tx };

  printUnderscored('Tx hash', tx.hash);
  printUnderscored('Block hash', tx.blockHash);
  printUnderscored('Block height', tx.blockHeight);
  printUnderscored('Signatures', tx.signatures);
  printUnderscored('Tx Type', tx.type);

  printTxField(tx, 'Account', 'accountId');
  printTxField(tx, 'Client TTL', 'clientTtl');
  printTxField(tx, 'Sender account', 'senderId');
  printTxField(tx, 'Recipient account', 'recipientId');
  printTxField(tx, 'Name ID', 'nameId');
  printTxField(tx, 'Name TTL', 'nameTtl');
  printTxField(tx, 'Name', 'name');
  printTxField(tx, 'Name Fee', 'nameFee');
  printTxField(tx, 'Name Salt', 'nameSalt');
  printTxField(tx, 'Owner', 'ownerId');
  printTxField(tx, 'Caller Account', 'callerId');
  printTxField(tx, 'Contract Address', 'contractId');
  printTxField(tx, 'Oracle ID', 'oracleId', (id) => id.replace(/^\w{2}_/, 'ok_'));
  printTxField(tx, 'Query', 'query');
  if ('pointers' in tx) {
    if (tx.pointers.length === 0) printUnderscored('Pointers', 'N/A');
    else tx.pointers.forEach(({ key, id }) => printUnderscored(`Pointer ${key}`, id));
  }
  printTxField(tx, 'Amount', 'amount');
  printTxField(tx, 'Payload', 'payload');
  printTxField(tx, 'Deposit', 'deposit');
  printTxField(tx, 'Gas', 'gas');
  printTxField(tx, 'Gas Price', 'gasPrice');
  printTxField(tx, 'Bytecode', 'code');
  printTxField(tx, 'Call data', 'callData');
  printTxField(tx, 'Commitment', 'commitmentId');
  printTxField(tx, 'Salt', 'salt');
  printTxField(tx, 'Query', 'queryId');
  printTxField(tx, 'Fee', 'fee');
  printTxField(tx, 'Response', 'response');
  printTxField(tx, 'Query Fee', 'queryFee');
  printTxField(tx, 'Oracle Ttl', 'oracleTtl');
  printTxField(tx, 'Query Ttl', 'queryTtl');
  printTxField(tx, 'Response Ttl', 'responseTtl');
  printTxField(tx, 'Query Format', 'queryFormat');
  printTxField(tx, 'Response Format', 'responseFormat');
  printTxField(tx, 'Nonce', 'nonce');
  printTxField(tx, 'TTL', 'ttl');
  printTxField(tx, 'Version', 'version');
  printTxField(tx, 'VM Version', 'vmVersion');
  printTxField(tx, 'ABI Version', 'abiVersion');
}

export function printBlockTransactions(ts) {
  ts.forEach((tx) => {
    print('<<--------------- Transaction --------------->>');
    printTransaction(tx, false);
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
