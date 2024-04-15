import { AbiVersion, generateKeyPair } from '@aeternity/aepp-sdk';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { executeProgram, getSdk, WALLET_NAME } from './index.js';

const executeOracle = executeProgram.bind(null, 'oracle');

describe('Oracle Module', () => {
  const oracleFormat = 'string';
  const responseFormat = 'string';
  let sdk;
  let oracleId;
  let queryId;

  before(async () => {
    sdk = await getSdk();
  });

  it('Oracle create', async () => {
    const oracleCreate = await executeOracle(
      'create',
      WALLET_NAME,
      '--password',
      'test',
      oracleFormat,
      responseFormat,
      '--json',
      '--oracleTtl',
      420,
    );
    expect(oracleCreate.ttl).to.be.equal(oracleCreate.blockHeight + 420);
    oracleCreate.blockHeight.should.be.gt(0);
    oracleCreate.queryFormat.should.be.equal(oracleFormat);
    oracleCreate.responseFormat.should.be.equal(responseFormat);
    oracleId = oracleCreate.id;
  });

  it('Oracle extend', async () => {
    const oracle = await sdk.getOracleObject(oracleId);
    const oracleExtend = await executeOracle('extend', WALLET_NAME, '--password', 'test', 42, '--json');
    oracleExtend.blockHeight.should.be.gt(0);
    expect(oracleExtend.ttl).to.be.equal(oracle.ttl + 42);
  });

  it('Oracle create query', async () => {
    const oracleQuery = await executeOracle(
      'create-query',
      WALLET_NAME,
      '--password',
      'test',
      oracleId,
      'Hello?',
      '--json',
      '--queryTtl',
      42,
      '--responseTtl',
      21,
    );
    expect(oracleQuery.ttl).to.be.equal(oracleQuery.blockHeight + 42);
    expect(oracleQuery.responseTtl).to.be.eql({ type: 'delta', value: '21' });
    oracleQuery.blockHeight.should.be.gt(0);
    oracleQuery.decodedQuery.should.be.equal('Hello?');
    oracleQuery.id.split('_')[0].should.be.equal('oq');
    queryId = oracleQuery.id;
    const oracle = await sdk.getOracleObject(oracleId);
    oracle.queries.length.should.be.equal(1);
  });

  it('Oracle respond to query', async () => {
    const oracleQueryResponse = await executeOracle(
      'respond-query',
      WALLET_NAME,
      '--password',
      'test',
      queryId,
      'Hi!',
      '--json',
      '--responseTtl',
      21,
    );
    expect(oracleQueryResponse.queries[0].ttl).to.be.equal(oracleQueryResponse.blockHeight + 21);
    oracleQueryResponse.blockHeight.should.be.gt(0);
    const oracle = await sdk.getOracleObject(oracleId);
    const query = await oracle.getQuery(queryId);
    query.decodedResponse.should.be.equal('Hi!');
  });

  it('Get non existing Oracle', async () => {
    const fakeOracleId = generateKeyPair().publicKey.replace('ak_', 'ok_');
    await executeOracle('get', fakeOracleId, '--json')
      .should.be.rejectedWith('error: Oracle not found');
    await executeOracle('get', 'oq_d1sadasdasda', '--json')
      .should.be.rejectedWith('Encoded string have a wrong type: oq (expected: ok)');
  });

  it('Get Oracle', async () => {
    const resJson = await executeOracle('get', oracleId, '--json');
    expect(resJson).to.eql({
      abiVersion: AbiVersion.NoAbi.toString(),
      id: oracleId,
      queries: [{
        fee: '0',
        id: queryId,
        oracleId,
        query: 'ov_SGVsbG8/0oNcUw==',
        response: 'or_SGkh73W+jw==',
        responseTtl: {
          type: 'delta',
          value: '21',
        },
        senderId: sdk.address,
        senderNonce: '3',
        ttl: resJson.queries[0].ttl,
      }],
      queryFee: '0',
      queryFormat: 'string',
      responseFormat: 'string',
      ttl: resJson.ttl,
    });

    const res = await executeOracle('get', oracleId);
    expect(res).to.equal(`
Oracle ID _______________________________ ${oracleId}
Oracle Query Fee ________________________ 0
Oracle Query Format _____________________ string
Oracle Response Format __________________ string
Ttl _____________________________________ ${resJson.ttl}

--------------------------------- QUERIES ------------------------------------
Oracle ID _______________________________ ${oracleId}
Query ID ________________________________ ${queryId}
Fee _____________________________________ 0
Query ___________________________________ ov_SGVsbG8/0oNcUw==
Query decoded ___________________________ Hello?
Response ________________________________ or_SGkh73W+jw==
Response decoded ________________________ Hi!
Response Ttl ____________________________ {"type":"delta","value":"21"}
Sender Id _______________________________ ${sdk.address}
Sender Nonce ____________________________ 3
Ttl _____________________________________ ${resJson.queries[0].ttl}
------------------------------------------------------------------------------
    `.trim());
  });
});
