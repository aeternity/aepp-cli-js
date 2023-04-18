// # Utils `print` Module
// That script contains helper function for `console` print
import { Encoding, unpackTx } from '@aeternity/aepp-sdk';
import { decode } from './helpers';

// ## Row width
const WIDTH = 40;

// ## CONSOLE PRINT HELPERS

// Calculate tabs length
function getTabs(tabs) {
  if (!tabs) return '';
  return ' '.repeat(tabs * 4);
}

const JsonStringifyEs = (object, spaced) => JSON.stringify(
  object,
  (key, value) => {
    if (typeof value === 'bigint') return `${value}`;
    if (value instanceof Map) return [...value.entries()];
    return value;
  },
  spaced ? 2 : undefined,
);

// Print helper
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

// Print `underscored`
export function printUnderscored(key, val) {
  print([
    key,
    '_'.repeat(WIDTH - key.length),
    typeof val !== 'object' ? val : JsonStringifyEs(val),
  ].join(' '));
}

// ## TX
export function printValidation({ validation, transaction }) {
  print('---------------------------------------- TX DATA ↓↓↓ \n');
  const { tx, txType: type } = unpackTx(transaction);
  Object.entries({ ...tx, type }).forEach(([key, value]) => printUnderscored(key, value));
  print('\n---------------------------------------- ERRORS ↓↓↓ \n');
  validation.forEach(({ message, checkedKeys }) => {
    printUnderscored(checkedKeys.join(', '), message);
  });
}

//
// Print base `tx` info
function printTxBase(tx = {}, tabs = '') {
  printUnderscored(`${tabs}Tx hash`, tx.hash);
  printUnderscored(`${tabs}Block hash`, tx.blockHash);
  printUnderscored(`${tabs}Block height`, tx.blockHeight);
  printUnderscored(`${tabs}Signatures`, tx.signatures);

  printUnderscored(`${tabs}Tx Type`, tx?.tx?.type ?? 'N/A');
}

// Print `contract_create_tx` info
function printContractCreateTransaction(tx = {}, tabs = '') {
  printUnderscored(`${tabs}Owner`, tx?.tx?.ownerId ?? 'N/A');
  printUnderscored(`${tabs}Amount`, tx?.tx?.amount ?? 'N/A');
  printUnderscored(`${tabs}Deposit`, tx?.tx?.deposit ?? 'N/A');
  printUnderscored(`${tabs}Gas`, tx?.tx?.gas ?? 'N/A');
  printUnderscored(`${tabs}Gas Price`, tx?.tx?.gasPrice ?? 'N/A');
  printUnderscored(`${tabs}Bytecode`, tx.tx.code);
  printUnderscored(`${tabs}Call data`, tx.tx.callData);

  printUnderscored(`${tabs}Fee`, tx?.tx?.fee ?? 'N/A');
  printUnderscored(`${tabs}Nonce`, tx?.tx?.nonce ?? 'N/A');
  printUnderscored(`${tabs}TTL`, tx?.tx?.ttl ?? 'N/A');
  printUnderscored(`${tabs}Version`, tx?.tx?.version ?? 'N/A');
  printUnderscored(`${tabs}VM Version`, tx?.tx?.vmVersion ?? 'N/A');
  printUnderscored(`${tabs}ABI Version`, tx?.tx?.abiVersion ?? 'N/A');
}

// Print `contract_call_tx` info
function printContractCallTransaction(tx = {}, tabs = '') {
  printUnderscored(`${tabs}Caller Account`, tx?.tx?.callerId ?? 'N/A');
  printUnderscored(`${tabs}Contract Hash`, tx?.tx?.contractId ?? 'N/A');
  printUnderscored(`${tabs}Amount`, tx?.tx?.amount ?? 0);
  printUnderscored(`${tabs}Gas`, tx?.tx?.gas ?? 0);
  printUnderscored(`${tabs}Gas Price`, tx?.tx?.gasPrice ?? 0);
  printUnderscored(`${tabs}Call data`, tx.tx.callData);

  printUnderscored(`${tabs}Fee`, tx?.tx?.fee ?? 'N/A');
  printUnderscored(`${tabs}Nonce`, tx?.tx?.nonce ?? 'N/A');
  printUnderscored(`${tabs}TTL`, tx?.tx?.ttl ?? 'N/A');
  printUnderscored(`${tabs}Version`, tx?.tx?.version ?? 0);
  printUnderscored(`${tabs}ABI Version`, tx?.tx?.abiVersion ?? 0);
}

// Print `spend_tx` info
function printSpendTransaction(tx = {}, tabs = '') {
  printUnderscored(`${tabs}Sender account`, tx?.tx?.senderId ?? 'N/A');
  printUnderscored(`${tabs}Recipient account`, tx?.tx?.recipientId ?? 'N/A');
  printUnderscored(`${tabs}Amount`, tx?.tx?.amount ?? 'N/A');
  printUnderscored(`${tabs}Payload`, tx?.tx?.payload ?? 'N/A');

  printUnderscored(`${tabs}Fee`, tx?.tx?.fee ?? 'N/A');
  printUnderscored(`${tabs}Nonce`, tx?.tx?.nonce ?? 'N/A');
  printUnderscored(`${tabs}TTL`, tx?.tx?.ttl ?? 'N/A');
  printUnderscored(`${tabs}Version`, tx?.tx?.version ?? 'N/A');
}

// Print `pre_claim_tx` info
function printNamePreclaimTransaction(tx = {}, tabs = '') {
  printUnderscored(`${tabs}Account`, tx?.tx?.accountId ?? 'N/A');
  printUnderscored(`${tabs}Commitment`, tx?.tx?.commitmentId ?? 'N/A');
  printUnderscored(`${tabs}Salt`, tx?.salt ?? 'N/A');

  printUnderscored(`${tabs}Fee`, tx?.tx?.fee ?? 'N/A');
  printUnderscored(`${tabs}Nonce`, tx?.tx?.nonce ?? 'N/A');
  printUnderscored(`${tabs}TTL`, tx?.tx?.ttl ?? 'N/A');
  printUnderscored(`${tabs}Version`, tx?.tx?.version ?? 'N/A');
}

// Print `claim_tx` info
function printNameClaimTransaction(tx = {}, tabs = '') {
  printUnderscored(`${tabs}Account`, tx?.tx?.accountId ?? 'N/A');
  printUnderscored(`${tabs}Name`, tx?.tx?.name ?? 'N/A');
  printUnderscored(`${tabs}Name Fee`, tx?.tx?.nameFee ?? 'N/A');
  printUnderscored(`${tabs}Name Salt`, tx?.tx?.nameSalt ?? 'N/A');

  printUnderscored(`${tabs}Fee`, tx?.tx?.fee ?? 'N/A');
  printUnderscored(`${tabs}Nonce`, tx?.tx?.nonce ?? 'N/A');
  printUnderscored(`${tabs}TTL`, tx?.tx?.ttl ?? 'N/A');
  printUnderscored(`${tabs}Version`, tx?.tx?.version ?? 'N/A');
}

// Print `update_name_tx` info
function printNameUpdateTransaction(tx = {}, tabs = '') {
  printUnderscored(`${tabs}Account`, tx?.tx?.accountId ?? 'N/A');
  printUnderscored(`${tabs}Client TTL`, tx?.tx?.clientTtl ?? 'N/A');
  printUnderscored(`${tabs}Name ID`, tx?.tx?.nameId ?? 'N/A');
  printUnderscored(`${tabs}Name TTL`, tx?.tx?.nameTtl ?? 'N/A');
  const pointers = tx?.tx?.pointers;
  if (pointers?.length) pointers.forEach(({ key, id }) => printUnderscored(`Pointer ${key}`, id));
  else printUnderscored('Pointers', 'N/A');

  printUnderscored(`${tabs}Fee`, tx?.tx?.fee ?? 'N/A');
  printUnderscored(`${tabs}Nonce`, tx?.tx?.nonce ?? 'N/A');
  printUnderscored(`${tabs}TTL`, tx?.tx?.ttl ?? 'N/A');
  printUnderscored(`${tabs}Version`, tx?.tx?.version ?? 'N/A');
}

// Print `transfer_name_tx` info
function printNameTransferTransaction(tx = {}, tabs = '') {
  printUnderscored(`${tabs}Account`, tx?.tx?.accountId ?? 'N/A');
  printUnderscored(`${tabs}Recipient`, tx?.tx?.recipientId ?? 'N/A');
  printUnderscored(`${tabs}Name ID`, tx?.tx?.nameId ?? 'N/A');

  printUnderscored(`${tabs}Fee`, tx?.tx?.fee ?? 'N/A');
  printUnderscored(`${tabs}Nonce`, tx?.tx?.nonce ?? 'N/A');
  printUnderscored(`${tabs}TTL`, tx?.tx?.ttl ?? 'N/A');
  printUnderscored(`${tabs}Version`, tx?.tx?.version ?? 'N/A');
}

// Print `revoke_name_tx` info
function printNameRevokeTransaction(tx = {}, tabs = '') {
  printUnderscored(`${tabs}Account`, tx?.tx?.accountId ?? 'N/A');
  printUnderscored(`${tabs}Name ID`, tx?.tx?.nameId ?? 'N/A');

  printUnderscored(`${tabs}Fee`, tx?.tx?.fee ?? 'N/A');
  printUnderscored(`${tabs}Nonce`, tx?.tx?.nonce ?? 'N/A');
  printUnderscored(`${tabs}TTL`, tx?.tx?.ttl ?? 'N/A');
  printUnderscored(`${tabs}Version`, tx?.tx?.version ?? 'N/A');
}

// Print `oracle-register-tx` info
function printOracleRegisterTransaction(tx = {}, tabs = '') {
  printUnderscored(`${tabs}Account`, tx?.tx?.accountId ?? 'N/A');
  printUnderscored(`${tabs}Oracle ID`, tx?.tx?.accountId?.replace(/^\w{2}_/, 'ok_') ?? 'N/A');

  printUnderscored(`${tabs}Fee`, tx?.tx?.fee ?? 'N/A');
  printUnderscored(`${tabs}Query Fee`, tx?.tx?.queryFee ?? 'N/A');
  printUnderscored(`${tabs}Oracle Ttl`, tx?.tx?.oracleTtl ?? 'N/A');
  printUnderscored(`${tabs}Query Format`, tx?.tx?.queryFormat ?? 'N/A');
  printUnderscored(`${tabs}Response Format`, tx?.tx?.responseFormat ?? 'N/A');
  printUnderscored(`${tabs}Nonce`, tx?.tx?.nonce ?? 'N/A');
  printUnderscored(`${tabs}TTL`, tx?.tx?.ttl ?? 'N/A');
}

// Print `oracle-post-query` info
function printOraclePostQueryTransaction(tx = {}, tabs = '') {
  printUnderscored(`${tabs}Account`, tx?.tx?.senderId ?? 'N/A');
  printUnderscored(`${tabs}Oracle ID`, tx?.tx?.oracleId?.replace(/^\w{2}_/, 'ok_') ?? 'N/A');
  printUnderscored(`${tabs}Query ID`, tx?.id ?? 'N/A');
  printUnderscored(`${tabs}Query`, tx?.tx?.query ?? 'N/A');

  printUnderscored(`${tabs}Fee`, tx?.tx?.fee ?? 'N/A');
  printUnderscored(`${tabs}Query Fee`, tx?.tx?.queryFee ?? 'N/A');
  printUnderscored(`${tabs}Query Ttl`, tx?.tx?.queryTtl ?? 'N/A');
  printUnderscored(`${tabs}Response Ttl`, tx?.tx?.responseTtl ?? 'N/A');
  printUnderscored(`${tabs}Nonce`, tx?.tx?.nonce ?? 'N/A');
  printUnderscored(`${tabs}TTL`, tx?.tx?.ttl ?? 'N/A');
}

// Print `oracle-extend` info
function printOracleExtendTransaction(tx = {}, tabs = '') {
  printUnderscored(`${tabs}Oracle ID`, tx?.tx?.oracleId?.replace(/^\w{2}_/, 'ok_') ?? 'N/A');

  printUnderscored(`${tabs}Fee`, tx?.tx?.fee ?? 'N/A');
  printUnderscored(`${tabs}Oracle Ttl`, tx?.tx?.oracleTtl ?? 'N/A');
  printUnderscored(`${tabs}Nonce`, tx?.tx?.nonce ?? 'N/A');
  printUnderscored(`${tabs}TTL`, tx?.tx?.ttl ?? 'N/A');
}

// Print `oracle-response` info
function printOracleResponseTransaction(tx = {}, tabs = '') {
  printUnderscored(`${tabs}Oracle ID`, tx?.tx?.oracleId?.replace(/^\w{2}_/, 'ok_') ?? 'N/A');
  printUnderscored(`${tabs}Query`, tx?.tx?.queryId ?? 'N/A');

  printUnderscored(`${tabs}Fee`, tx?.tx?.fee ?? 'N/A');
  printUnderscored(`${tabs}Response`, tx?.tx?.response ?? 'N/A');
  printUnderscored(`${tabs}Response Ttl`, tx?.tx?.responseTtl ?? 'N/A');
  printUnderscored(`${tabs}Nonce`, tx?.tx?.nonce ?? 'N/A');
  printUnderscored(`${tabs}TTL`, tx?.tx?.ttl ?? 'N/A');
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

// ## BLOCK

function replaceAt(str, index, replacement) {
  return str.substring(0, index) + replacement + str.substring(index + replacement.length);
}

function printTxInfo(tx, tabs) {
  const type = tx?.tx?.type;
  TX_TYPE_PRINT_MAP[replaceAt(type, 0, type[0].toUpperCase())](tx, tabs);
}

// Function which print `tx`
// Get type of `tx` to now which `print` method to use
export function printTransaction(tx, json, tabs = 0, skipBase = false) {
  if (json) {
    print(tx);
    return;
  }
  const tabsString = getTabs(tabs);
  if (!skipBase) printTxBase({ ...tx, ...tx.tx ? tx.tx : {} }, tabsString);
  printTxInfo({ ...tx, ...tx.tx ? tx.tx : {} }, tabsString);
}

export function printBlockTransactions(ts, json, tabs = 0) {
  if (json) {
    print(ts);
    return;
  }
  const tabsString = getTabs(tabs);
  ts.forEach((tx) => {
    print(`${tabsString}<<--------------- Transaction --------------->>`);
    printTransaction(tx, false, tabs);
  });
}

export function printBlock(block, json, isRoot = false) {
  if (json) {
    print(block);
    return;
  }
  const encoding = block.hash.split('_')[0];
  const tabs = !isRoot && encoding === Encoding.MicroBlockHash ? 1 : 0;
  const tabString = getTabs(tabs);

  const reverseEncoding = Object.fromEntries(Object.entries(Encoding).map(([k, v]) => [v, k]));
  const name = reverseEncoding[encoding].replace('Hash', '');
  print(`${tabString}<<--------------- ${name} --------------->>`);

  printUnderscored(`${tabString}Block hash`, block.hash);
  printUnderscored(`${tabString}Block height`, block.height);
  printUnderscored(`${tabString}State hash`, block.stateHash);
  printUnderscored(`${tabString}Nonce`, block.nonce ?? 'N/A');
  printUnderscored(`${tabString}Miner`, block.miner ?? 'N/A');
  printUnderscored(`${tabString}Time`, new Date(block.time).toString());
  printUnderscored(`${tabString}Previous block hash`, block.prevHash);
  printUnderscored(`${tabString}Previous key block hash`, block.prevKeyHash);
  printUnderscored(`${tabString}Version`, block.version);
  printUnderscored(`${tabString}Target`, block.target ?? 'N/A');
  const txCount = block.transactions?.length ?? 0;
  printUnderscored(`${tabString}Transactions`, txCount);
  if (txCount) printBlockTransactions(block.transactions, false, tabs + 1);
}

// ##OTHER
//

// Print `oracle`
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
// Print `oracle`
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

// Print `name`
export function printName(name, json) {
  if (json) {
    print(name);
    return;
  }
  printUnderscored('Status', name.status ?? 'N/A');
  printUnderscored('Name hash', name.id ?? 'N/A');
  if (name.pointers?.length) name.pointers.forEach(({ key, id }) => printUnderscored(`Pointer ${key}`, id));
  else printUnderscored('Pointers', 'N/A');
  printUnderscored('TTL', name.ttl ?? 0);
}
