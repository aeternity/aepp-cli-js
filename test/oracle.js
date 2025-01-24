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

    const res = await executeOracle('extend', WALLET_NAME, '--password', 'test', 42);
    expectToMatchLines(res, [
      /Transaction hash ________________________ th_\w+/,
      /Block hash ______________________________ mh_\w+/,
      /Block height ____________________________ \d+ \(about now\)/,
      /Signatures ______________________________ \["sg_\w+"\]/,
      'Transaction type ________________________ OracleExtendTx (ver. 1)',
      `Oracle ID _______________________________ ${oracleId}`,
      /Oracle TTL ______________________________ \d+ \(in 2 hours\)/,
      'ABI version _____________________________ 0 (NoAbi)',
      'Query fee _______________________________ 0ae',
      'Query format ____________________________ <query-format>',
      'Response format _________________________ <response-format>',
      /Fee _____________________________________ 0.00001\d+ae/,
      /Nonce ___________________________________ \d+/,
      /TTL _____________________________________ \d+ \(in [56] minutes\)/,
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
      '--queryTtl',
      42,
      '--responseTtl',
      21,
    );
    expectToMatchLines(res, [
      /Transaction hash ________________________ th_\w+/,
      /Block hash ______________________________ mh_\w+/,
      /Block height ____________________________ \d+ \(about now\)/,
      /Signatures ______________________________ \["sg_\w+"\]/,
      'Transaction type ________________________ OracleQueryTx (ver. 1)',
      `Sender address __________________________ ${aeSdk.address}`,
      `Oracle ID _______________________________ ${oracleId}`,
      'Query ___________________________________ Hello?2',
      /Query ID ________________________________ oq_\w+/,
      'Query fee _______________________________ 0ae',
      `Query TTL _______________________________ ${resJson.ttl + 1} (in 2 hours)`,
      'Response ________________________________ or_Xfbg4g==',
      `Response TTL ____________________________ ${resJson.blockHeight + +resJson.responseTtl.value + 1} (in 1 hour)`,
      /Fee _____________________________________ 0.00001\d+ae/,
      /Nonce ___________________________________ \d+/,
      /TTL _____________________________________ \d+ \(in [56] minutes\)/,
    ]);
    queryId2 = res.match(/Query ID _+ (\w+)/)[1];
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
            value: '21',
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
      '--responseTtl',
      21,
    );
    expectToMatchLines(res, [
      /Transaction hash ________________________ th_\w+/,
      /Block hash ______________________________ mh_\w+/,
      /Block height ____________________________ \d+ \(about now\)/,
      /Signatures ______________________________ \["sg_\w+"\]/,
      'Transaction type ________________________ OracleRespondTx (ver. 1)',
      `Oracle ID _______________________________ ${oracleId}`,
      'ABI version _____________________________ 0 (NoAbi)',
      `Query ID ________________________________ ${queryId2}`,
      'Query fee _______________________________ 0ae',
      'Query format ____________________________ <query-format>',
      'Response ________________________________ Hi!2',
      /Response TTL ____________________________ \d+ \(in 1 hour\)/,
      'Response format _________________________ <response-format>',
      /Fee _____________________________________ 0.000016\d+ae/,
      /Nonce ___________________________________ \d+/,
      /TTL _____________________________________ \d+ \(in [56] minutes\)/,
    ]);
  });
});
