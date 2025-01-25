import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { Encoding } from '@aeternity/aepp-sdk';
import { executeProgram, getSdk, WALLET_NAME } from './index.js';
import { toBeAbove0, toBeEncoded, expectToMatchLines, toMatch } from './utils.js';

const executeOracle = executeProgram.bind(null, 'oracle');

describe('Oracle Module', () => {
  const queryFormat = '<query-format>';
  const responseFormat = '<response-format>';
  let aeSdk;
  let oracleId;

  before(async () => {
    aeSdk = await getSdk();
  });

  it('creates', async () => {
    const resJson = await executeOracle(
      'create',
      WALLET_NAME,
      '--password',
      'test',
      queryFormat,
      responseFormat,
      '--json',
      '--oracleTtl',
      420,
    );
    oracleId = aeSdk.address.replace('ak_', 'ok_');
    expect(resJson).to.eql({
      abiVersion: '0',
      id: oracleId,
      queries: [],
      queryFee: '0',
      queryFormat,
      responseFormat,
      ttl: toBeAbove0(resJson.ttl),
      tx: {
        fee: toMatch(resJson.tx.fee, /1\d{13}/),
        ttl: toBeAbove0(resJson.tx.ttl),
        nonce: toBeAbove0(resJson.tx.nonce),
        queryFormat,
        responseFormat,
        queryFee: '0',
        oracleTtl: { type: 'delta', value: '420' },
        accountId: aeSdk.address,
        abiVersion: '0',
        version: 1,
        type: 'OracleRegisterTx',
      },
      blockHeight: toBeAbove0(resJson.blockHeight),
      blockHash: toBeEncoded(resJson.blockHash, Encoding.MicroBlockHash),
      hash: toBeEncoded(resJson.hash, Encoding.TxHash),
      encodedTx: toBeEncoded(resJson.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(resJson.signatures[0], Encoding.Signature)],
      rawTx: toBeEncoded(resJson.encodedTx, Encoding.Transaction),
    });
  });

  it('extends', async () => {
    const resJson = await executeOracle('extend', WALLET_NAME, '--password', 'test', 42, '--json');
    expect(resJson).to.eql({
      abiVersion: '0',
      id: oracleId,
      queries: [],
      queryFee: '0',
      queryFormat,
      responseFormat,
      ttl: toBeAbove0(resJson.ttl),
      tx: {
        fee: toMatch(resJson.tx.fee, /1\d{13}/),
        ttl: toBeAbove0(resJson.tx.ttl),
        nonce: toBeAbove0(resJson.tx.nonce),
        oracleTtl: { type: 'delta', value: '42' },
        oracleId,
        version: 1,
        type: 'OracleExtendTx',
      },
      blockHeight: toBeAbove0(resJson.blockHeight),
      blockHash: toBeEncoded(resJson.blockHash, Encoding.MicroBlockHash),
      hash: toBeEncoded(resJson.hash, Encoding.TxHash),
      encodedTx: toBeEncoded(resJson.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(resJson.signatures[0], Encoding.Signature)],
      rawTx: toBeEncoded(resJson.encodedTx, Encoding.Transaction),
    });

    const res = await executeOracle('extend', WALLET_NAME, '--password', 'test');
    expectToMatchLines(res, [
      /Transaction hash  th_\w+/,
      /Block hash        mh_\w+/,
      /Block height      \d+ \(about now\)/,
      /Signatures        \["sg_\w+"\]/,
      'Transaction type  OracleExtendTx (ver. 1)',
      `Oracle ID         ${oracleId}`,
      /Oracle TTL        \d+ \(in 1 day\)/,
      'ABI version       0 (NoAbi)',
      'Query fee         0ae',
      'Query format      <query-format>',
      'Response format   <response-format>',
      /Fee               0.00001\d+ae/,
      /Nonce             \d+/,
      /TTL               \d+ \(in [56] minutes\)/,
    ]);
  });

  let queryId1;
  let queryId2;

  it('creates query', async () => {
    const resJson = await executeOracle(
      'create-query',
      WALLET_NAME,
      '--password',
      'test',
      oracleId,
      'Hello?1',
      '--json',
      '--queryTtl',
      42,
      '--responseTtl',
      21,
    );
    expect(resJson).to.eql({
      senderId: aeSdk.address,
      senderNonce: toBeAbove0(resJson.tx.nonce).toString(),
      oracleId,
      query: 'ov_SGVsbG8/Mal6ZBg=',
      response: 'or_Xfbg4g==',
      ttl: resJson.blockHeight + +resJson.tx.queryTtl.value,
      responseTtl: { type: 'delta', value: '21' },
      fee: '0',
      decodedQuery: 'Hello?1',
      decodedResponse: '',
      tx: {
        fee: toMatch(resJson.tx.fee, /1\d{13}/),
        ttl: toBeAbove0(resJson.tx.ttl),
        senderId: aeSdk.address,
        nonce: toBeAbove0(resJson.tx.nonce),
        queryFee: '0',
        oracleId,
        query: 'Hello?1',
        queryTtl: { type: 'delta', value: '42' },
        responseTtl: { type: 'delta', value: '21' },
        version: 1,
        type: 'OracleQueryTx',
      },
      blockHeight: toBeAbove0(resJson.blockHeight),
      blockHash: toBeEncoded(resJson.blockHash, Encoding.MicroBlockHash),
      hash: toBeEncoded(resJson.hash, Encoding.TxHash),
      encodedTx: toBeEncoded(resJson.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(resJson.signatures[0], Encoding.Signature)],
      rawTx: toBeEncoded(resJson.encodedTx, Encoding.Transaction),
      id: toBeEncoded(resJson.id, Encoding.OracleQueryId),
    });
    queryId1 = resJson.id;

    const res = await executeOracle(
      'create-query',
      WALLET_NAME,
      '--password',
      'test',
      oracleId,
      'Hello?2',
    );
    expectToMatchLines(res, [
      /Transaction hash  th_\w+/,
      /Block hash        mh_\w+/,
      /Block height      \d+ \(about now\)/,
      /Signatures        \["sg_\w+"\]/,
      'Transaction type  OracleQueryTx (ver. 1)',
      `Sender address    ${aeSdk.address}`,
      `Oracle ID         ${oracleId}`,
      'Query             Hello?2',
      /Query ID          oq_\w+/,
      'Query fee         0ae',
      `Query TTL         ${resJson.ttl - 31} (in 27 minutes)`,
      'Response          or_Xfbg4g==',
      `Response TTL      ${resJson.blockHeight + +resJson.responseTtl.value - 10} (in 27 minutes)`,
      /Fee               0.00001\d+ae/,
      /Nonce             \d+/,
      /TTL               \d+ \(in [56] minutes\)/,
    ]);
    queryId2 = res.match(/Query ID\s+(\w+)/)[1];
  });

  it('responds to query', async () => {
    const resJson = await executeOracle(
      'respond-query',
      WALLET_NAME,
      '--password',
      'test',
      queryId1,
      'Hi!1',
      '--json',
      '--responseTtl',
      21,
    );
    expect(resJson).to.eql({
      abiVersion: '0',
      id: oracleId,
      queries: resJson.queries.map((query) => {
        const isFirst = query.id === queryId1;
        return {
          fee: '0',
          id: isFirst ? queryId1 : queryId2,
          oracleId,
          query: isFirst ? 'ov_SGVsbG8/Mal6ZBg=' : 'ov_SGVsbG8/MgomNr0=',
          response: isFirst ? 'or_SGkhMVTOsN8=' : 'or_Xfbg4g==',
          responseTtl: {
            type: 'delta',
            value: isFirst ? '21' : '10',
          },
          senderId: aeSdk.address,
          senderNonce: toBeAbove0(+query.senderNonce).toString(),
          ttl: toBeAbove0(query.ttl),
        };
      }),
      queryFee: '0',
      queryFormat,
      responseFormat,
      ttl: toBeAbove0(resJson.ttl),
      tx: {
        fee: toMatch(resJson.tx.fee, /1\d{13}/),
        ttl: toBeAbove0(resJson.tx.ttl),
        queryId: queryId1,
        nonce: toBeAbove0(resJson.tx.nonce),
        oracleId,
        response: 'Hi!1',
        responseTtl: { type: 'delta', value: '21' },
        version: 1,
        type: 'OracleRespondTx',
      },
      blockHeight: toBeAbove0(resJson.blockHeight),
      blockHash: toBeEncoded(resJson.blockHash, Encoding.MicroBlockHash),
      hash: toBeEncoded(resJson.hash, Encoding.TxHash),
      encodedTx: toBeEncoded(resJson.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(resJson.signatures[0], Encoding.Signature)],
      rawTx: toBeEncoded(resJson.encodedTx, Encoding.Transaction),
    });

    const res = await executeOracle(
      'respond-query',
      WALLET_NAME,
      '--password',
      'test',
      queryId2,
      'Hi!2',
    );
    expectToMatchLines(res, [
      /Transaction hash  th_\w+/,
      /Block hash        mh_\w+/,
      /Block height      \d+ \(about now\)/,
      /Signatures        \["sg_\w+"\]/,
      'Transaction type  OracleRespondTx (ver. 1)',
      `Oracle ID         ${oracleId}`,
      'ABI version       0 (NoAbi)',
      `Query ID          ${queryId2}`,
      'Query fee         0ae',
      'Query format      <query-format>',
      'Response          Hi!2',
      /Response TTL      \d+ \(in 27 minutes\)/,
      'Response format   <response-format>',
      /Fee               0.000016\d+ae/,
      /Nonce             \d+/,
      /TTL               \d+ \(in [56] minutes\)/,
    ]);
  });
});
