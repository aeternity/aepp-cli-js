import {
  Tag, ORACLE_TTL_TYPES,
  Node, genSalt, unpackTx, commitmentHash, buildContractId, verifyTransaction,
  getDefaultPointerKey, buildTx, encode, Encoding, VmVersion, AbiVersion,
} from '@aeternity/aepp-sdk';
import { print, printUnderscored, printValidation } from '../utils/print.js';
import { validateName, decode } from '../utils/helpers.js';

function buildAndPrintTx(params, json, extraKeys = {}) {
  const tx = buildTx(params);
  const txObject = unpackTx(tx);

  if (json) {
    print({ tx, txObject, ...extraKeys });
    return;
  }
  printUnderscored('Transaction type', Tag[params.tag]);
  print('Summary');
  // TODO: print the same way as transactions from node
  Object
    .entries({ ...txObject, ...extraKeys })
    .forEach(([key, value]) => printUnderscored(`    ${key.toUpperCase()}`, value));
  print('Output');
  printUnderscored('    Encoded', tx);
  print('This is an unsigned transaction. Use `account sign` and `tx broadcast` to submit the transaction to the network, or verify that it will be accepted with `tx verify`.');
}

export function spend(senderId, recipientId, amount, nonce, { json, payload, ...options }) {
  const params = {
    tag: Tag.SpendTx,
    ...options,
    payload: encode(Buffer.from(payload), Encoding.Bytearray),
    senderId,
    recipientId,
    amount,
    nonce,
  };
  buildAndPrintTx(params, json);
}

export function namePreClaim(accountId, name, nonce, { json, ...options }) {
  validateName(name);
  const salt = genSalt();
  const commitmentId = commitmentHash(name, salt);
  const params = {
    tag: Tag.NamePreclaimTx,
    ...options,
    accountId,
    commitmentId,
    nonce,
  };
  buildAndPrintTx(params, json, { salt });
}

export function nameClaim(accountId, nameSalt, name, nonce, { json, ...options }) {
  validateName(name);
  const params = {
    tag: Tag.NameClaimTx,
    ...options,
    accountId,
    nameSalt,
    name,
    nonce,
  };
  buildAndPrintTx(params, json);
}

export function nameUpdate(accountId, nameId, nonce, pointers, { json, ...options }) {
  const params = {
    tag: Tag.NameUpdateTx,
    ...options,
    nameId,
    accountId,
    pointers: pointers.map((id) => ({ id, key: getDefaultPointerKey(id) })),
    nonce,
  };
  buildAndPrintTx(params, json);
}

export function nameTransfer(accountId, recipientId, nameId, nonce, { json, ...options }) {
  const params = {
    tag: Tag.NameTransferTx,
    ...options,
    accountId,
    recipientId,
    nameId,
    nonce,
  };
  buildAndPrintTx(params, json);
}

export function nameRevoke(accountId, nameId, nonce, { json, ...options }) {
  const params = {
    tag: Tag.NameRevokeTx,
    ...options,
    accountId,
    nameId,
    nonce,
  };
  buildAndPrintTx(params, json);
}

export function contractDeploy(ownerId, code, callData, nonce, { json, gas, ...options }) {
  const params = {
    tag: Tag.ContractCreateTx,
    ...options,
    gasLimit: gas,
    code,
    ownerId,
    nonce,
    callData,
    // TODO: remove after updating sdk to 14
    ctVersion: { vmVersion: VmVersion.Fate3, abiVersion: AbiVersion.Fate },
  };
  buildAndPrintTx(params, json, {
    contractId: buildContractId(ownerId, nonce),
  });
}

export function contractCall(callerId, contractId, callData, nonce, { json, gas, ...options }) {
  const params = {
    tag: Tag.ContractCallTx,
    ...options,
    gasLimit: gas,
    callerId,
    nonce,
    callData,
    contractId,
  };
  buildAndPrintTx(params, json);
}

export function oracleRegister(accountId, queryFormat, responseFormat, nonce, {
  json, oracleTtl, ...options
}) {
  const params = {
    tag: Tag.OracleRegisterTx,
    ...options,
    accountId,
    nonce,
    oracleTtlType: ORACLE_TTL_TYPES.delta,
    oracleTtlValue: oracleTtl,
    queryFormat,
    responseFormat,
  };
  buildAndPrintTx(params, json);
}

export function oraclePostQuery(senderId, oracleId, query, nonce, {
  json, queryTtl, responseTtl, ...options
}) {
  const params = {
    tag: Tag.OracleQueryTx,
    ...options,
    senderId,
    nonce,
    oracleId,
    query,
    queryTtlType: ORACLE_TTL_TYPES.delta,
    queryTtlValue: queryTtl,
    responseTtlType: ORACLE_TTL_TYPES.delta,
    responseTtlValue: responseTtl,
  };
  buildAndPrintTx(params, json);
}

export function oracleExtend(oracleId, oracleTtl, nonce, { json, ...options }) {
  const params = {
    tag: Tag.OracleExtendTx,
    ...options,
    oracleId,
    oracleTtlType: ORACLE_TTL_TYPES.delta,
    oracleTtlValue: oracleTtl,
    nonce,
  };
  buildAndPrintTx(params, json);
}

export function oracleRespond(oracleId, queryId, response, nonce, {
  json, responseTtl, ...options
}) {
  const params = {
    tag: Tag.OracleResponseTx,
    ...options,
    oracleId,
    responseTtlType: ORACLE_TTL_TYPES.delta,
    responseTtlValue: responseTtl,
    queryId,
    response,
    nonce,
  };
  buildAndPrintTx(params, json);
}

export async function verify(transaction, { json, ...options }) {
  decode(transaction, 'tx');
  const validation = await verifyTransaction(transaction, new Node(options.url));
  const { tag, ...tx } = unpackTx(transaction);
  if (json) {
    print({ validation, tx, type: Tag[tag] });
    return;
  }
  printValidation({ validation, transaction });
  if (!validation.length) print(' ✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓ TX VALID ✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓✓');
}
