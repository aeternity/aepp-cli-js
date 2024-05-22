import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { executeProgram, getSdk, WALLET_NAME } from './index.js';

const executeOracle = executeProgram.bind(null, 'oracle');

describe('Oracle Module', () => {
  const oracleFormat = 'string';
  const responseFormat = 'string';
  let aeSdk;
  let oracleId;
  let queryId;

  before(async () => {
    aeSdk = await getSdk();
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
    const oracle = await aeSdk.getOracleObject(oracleId);
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
    const oracle = await aeSdk.getOracleObject(oracleId);
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
    const oracle = await aeSdk.getOracleObject(oracleId);
    const query = await oracle.getQuery(queryId);
    query.decodedResponse.should.be.equal('Hi!');
  });
});
