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

function printContractCreateTransaction(tx) {
  printUnderscored('Owner', tx.ownerId ?? 'N/A');
  printUnderscored('Amount', tx.amount ?? 'N/A');
  printUnderscored('Deposit', tx.deposit ?? 'N/A');
  printUnderscored('Gas', tx.gas ?? 'N/A');
  printUnderscored('Gas Price', tx.gasPrice ?? 'N/A');
  printUnderscored('Bytecode', tx.code);
  printUnderscored('Call data', tx.callData);

  printUnderscored('Fee', tx.fee ?? 'N/A');
  printUnderscored('Nonce', tx.nonce ?? 'N/A');
  printUnderscored('TTL', tx.ttl ?? 'N/A');
  printUnderscored('Version', tx.version ?? 'N/A');
  printUnderscored('VM Version', tx.vmVersion ?? 'N/A');
  printUnderscored('ABI Version', tx.abiVersion ?? 'N/A');
}

function printContractCallTransaction(tx) {
  printUnderscored('Caller Account', tx.callerId ?? 'N/A');
  printUnderscored('Contract Hash', tx.contractId ?? 'N/A');
  printUnderscored('Amount', tx.amount ?? 0);
  printUnderscored('Gas', tx.gas ?? 0);
  printUnderscored('Gas Price', tx.gasPrice ?? 0);
  printUnderscored('Call data', tx.callData);

  printUnderscored('Fee', tx.fee ?? 'N/A');
  printUnderscored('Nonce', tx.nonce ?? 'N/A');
  printUnderscored('TTL', tx.ttl ?? 'N/A');
  printUnderscored('Version', tx.version ?? 0);
  printUnderscored('ABI Version', tx.abiVersion ?? 0);
}

function printSpendTransaction(tx) {
  printUnderscored('Sender account', tx.senderId ?? 'N/A');
  printUnderscored('Recipient account', tx.recipientId ?? 'N/A');
  printUnderscored('Amount', tx.amount ?? 'N/A');
  printUnderscored('Payload', tx.payload ?? 'N/A');

  printUnderscored('Fee', tx.fee ?? 'N/A');
  printUnderscored('Nonce', tx.nonce ?? 'N/A');
  printUnderscored('TTL', tx.ttl ?? 'N/A');
  printUnderscored('Version', tx.version ?? 'N/A');
}

function printNamePreclaimTransaction(tx) {
  printUnderscored('Account', tx.accountId ?? 'N/A');
  printUnderscored('Commitment', tx.commitmentId ?? 'N/A');
  printUnderscored('Salt', tx?.salt ?? 'N/A');

  printUnderscored('Fee', tx.fee ?? 'N/A');
  printUnderscored('Nonce', tx.nonce ?? 'N/A');
  printUnderscored('TTL', tx.ttl ?? 'N/A');
  printUnderscored('Version', tx.version ?? 'N/A');
}

function printNameClaimTransaction(tx) {
  printUnderscored('Account', tx.accountId ?? 'N/A');
  printUnderscored('Name', tx.name ?? 'N/A');
  printUnderscored('Name Fee', tx.nameFee ?? 'N/A');
  printUnderscored('Name Salt', tx.nameSalt ?? 'N/A');

  printUnderscored('Fee', tx.fee ?? 'N/A');
  printUnderscored('Nonce', tx.nonce ?? 'N/A');
  printUnderscored('TTL', tx.ttl ?? 'N/A');
  printUnderscored('Version', tx.version ?? 'N/A');
}

function printNameUpdateTransaction(tx) {
  printUnderscored('Account', tx.accountId ?? 'N/A');
  printUnderscored('Client TTL', tx.clientTtl ?? 'N/A');
  printUnderscored('Name ID', tx.nameId ?? 'N/A');
  printUnderscored('Name TTL', tx.nameTtl ?? 'N/A');
  const { pointers } = tx;
  if (pointers?.length) pointers.forEach(({ key, id }) => printUnderscored(`Pointer ${key}`, id));
  else printUnderscored('Pointers', 'N/A');

  printUnderscored('Fee', tx.fee ?? 'N/A');
  printUnderscored('Nonce', tx.nonce ?? 'N/A');
  printUnderscored('TTL', tx.ttl ?? 'N/A');
  printUnderscored('Version', tx.version ?? 'N/A');
}

function printNameTransferTransaction(tx) {
  printUnderscored('Account', tx.accountId ?? 'N/A');
  printUnderscored('Recipient', tx.recipientId ?? 'N/A');
  printUnderscored('Name ID', tx.nameId ?? 'N/A');

  printUnderscored('Fee', tx.fee ?? 'N/A');
  printUnderscored('Nonce', tx.nonce ?? 'N/A');
  printUnderscored('TTL', tx.ttl ?? 'N/A');
  printUnderscored('Version', tx.version ?? 'N/A');
}

function printNameRevokeTransaction(tx) {
  printUnderscored('Account', tx.accountId ?? 'N/A');
  printUnderscored('Name ID', tx.nameId ?? 'N/A');

  printUnderscored('Fee', tx.fee ?? 'N/A');
  printUnderscored('Nonce', tx.nonce ?? 'N/A');
  printUnderscored('TTL', tx.ttl ?? 'N/A');
  printUnderscored('Version', tx.version ?? 'N/A');
}

function printOracleRegisterTransaction(tx) {
  printUnderscored('Account', tx.accountId ?? 'N/A');
  printUnderscored('Oracle ID', tx.accountId?.replace(/^\w{2}_/, 'ok_') ?? 'N/A');

  printUnderscored('Fee', tx.fee ?? 'N/A');
  printUnderscored('Query Fee', tx.queryFee ?? 'N/A');
  printUnderscored('Oracle Ttl', tx.oracleTtl ?? 'N/A');
  printUnderscored('Query Format', tx.queryFormat ?? 'N/A');
  printUnderscored('Response Format', tx.responseFormat ?? 'N/A');
  printUnderscored('Nonce', tx.nonce ?? 'N/A');
  printUnderscored('TTL', tx.ttl ?? 'N/A');
}

function printOraclePostQueryTransaction(tx) {
  printUnderscored('Account', tx.senderId ?? 'N/A');
  printUnderscored('Oracle ID', tx.oracleId?.replace(/^\w{2}_/, 'ok_') ?? 'N/A');
  printUnderscored('Query ID', tx?.id ?? 'N/A');
  printUnderscored('Query', tx.query ?? 'N/A');

  printUnderscored('Fee', tx.fee ?? 'N/A');
  printUnderscored('Query Fee', tx.queryFee ?? 'N/A');
  printUnderscored('Query Ttl', tx.queryTtl ?? 'N/A');
  printUnderscored('Response Ttl', tx.responseTtl ?? 'N/A');
  printUnderscored('Nonce', tx.nonce ?? 'N/A');
  printUnderscored('TTL', tx.ttl ?? 'N/A');
}

function printOracleExtendTransaction(tx) {
  printUnderscored('Oracle ID', tx.oracleId?.replace(/^\w{2}_/, 'ok_') ?? 'N/A');

  printUnderscored('Fee', tx.fee ?? 'N/A');
  printUnderscored('Oracle Ttl', tx.oracleTtl ?? 'N/A');
  printUnderscored('Nonce', tx.nonce ?? 'N/A');
  printUnderscored('TTL', tx.ttl ?? 'N/A');
}

function printOracleResponseTransaction(tx) {
  printUnderscored('Oracle ID', tx.oracleId?.replace(/^\w{2}_/, 'ok_') ?? 'N/A');
  printUnderscored('Query', tx.queryId ?? 'N/A');

  printUnderscored('Fee', tx.fee ?? 'N/A');
  printUnderscored('Response', tx.response ?? 'N/A');
  printUnderscored('Response Ttl', tx.responseTtl ?? 'N/A');
  printUnderscored('Nonce', tx.nonce ?? 'N/A');
  printUnderscored('TTL', tx.ttl ?? 'N/A');
}

const TX_TYPE_PRINT_MAP = {
  SpendTx: printSpendTransaction,
  ContractCreateTx: printContractCreateTransaction,
  ContractCallTx: printContractCallTransaction,
  NamePreclaimTx: printNamePreclaimTransaction,
  NameClaimTx: printNameClaimTransaction,
  NameTransferTx: printNameTransferTransaction,
  NameUpdateTx: printNameUpdateTransaction,
  NameRevokeTx: printNameRevokeTransaction,
  OracleRegisterTx: printOracleRegisterTransaction,
  OracleQueryTx: printOraclePostQueryTransaction,
  OracleExtendTx: printOracleExtendTransaction,
  OracleRespondTx: printOracleResponseTransaction,
};

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
  TX_TYPE_PRINT_MAP[tx.type[0].toUpperCase() + tx.type.slice(1)](tx);
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
