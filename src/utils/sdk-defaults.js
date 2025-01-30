import { buildTx, unpackTx, Tag, MemoryAccount } from '@aeternity/aepp-sdk';

const accountId = MemoryAccount.generate().address;
const nonce = 1;

const nameUpdateDefaults = unpackTx(
  buildTx({
    tag: Tag.NameUpdateTx,
    accountId,
    nonce,
    nameId: 'test.chain',
    pointers: [],
  }),
  Tag.NameUpdateTx,
);

export const nameTtl = nameUpdateDefaults.nameTtl;

export const nameClientTtl = nameUpdateDefaults.clientTtl;

const oracleRegisterDefaults = unpackTx(
  buildTx({
    tag: Tag.OracleRegisterTx,
    accountId,
    nonce,
    queryFormat: '<query-format>',
    responseFormat: '<response-format>',
  }),
  Tag.OracleRegisterTx,
);

export const oracleTtl = oracleRegisterDefaults.oracleTtlValue;

const oracleQueryDefaults = unpackTx(
  buildTx({
    tag: Tag.OracleQueryTx,
    senderId: accountId,
    nonce,
    oracleId: accountId.replace('ak_', 'ok_'),
    query: '<query>',
  }),
  Tag.OracleQueryTx,
);

export const queryTtl = oracleQueryDefaults.queryTtlValue;
export const responseTtl = oracleQueryDefaults.responseTtlValue;
