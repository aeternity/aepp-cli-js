import { decode, encode, Encoding, buildTxHash, Contract } from '@aeternity/aepp-sdk';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { executeProgram, getSdk, networkId, WALLET_NAME } from './index.js';
import { randomName, expectToMatchLines } from './utils.js';

const executeTx = executeProgram.bind(null, 'tx');

const testContract = `
@compiler >= 6

contract Identity =
  entrypoint test(x : int, y: int) = x + y
`;

describe('Transaction Module', () => {
  let aeSdk;
  let oracleId;
  let salt;
  let queryId;
  let contractId;
  const name = randomName();
  let nonce = 0;
  let nameId;

  before(async () => {
    aeSdk = await getSdk();
    oracleId = encode(decode(aeSdk.address, Encoding.AccountAddress), Encoding.OracleAddress);
  });

  it('builds tx', async () => {
    const amount = 100;

    const args = ['spend', aeSdk.address, aeSdk.address, amount, nonce];
    const responseJson = await executeTx(...args, '--json');
    expect(responseJson.tx).to.satisfy((s) => s.startsWith(Encoding.Transaction));
    expect(responseJson).to.eql({
      tx: responseJson.tx,
      txObject: {
        version: 1,
        amount: '100',
        fee: '16660000000000',
        nonce,
        payload: 'ba_Xfbg4g==',
        recipientId: aeSdk.address,
        senderId: aeSdk.address,
        tag: 12,
        ttl: 0,
      },
    });

    const response = await executeTx(...args);
    expectToMatchLines(response, [
      `Transaction type  SpendTx`,
      `Summary           `,
      `    TAG           12`,
      `    VERSION       1`,
      `    SENDERID      ${aeSdk.address}`,
      `    RECIPIENTID   ${aeSdk.address}`,
      `    AMOUNT        ${amount}`,
      `    FEE           16660000000000`,
      `    TTL           0`,
      `    NONCE         ${nonce}`,
      `    PAYLOAD       ba_Xfbg4g==`,
      `Output            `,
      `    Encoded       ${responseJson.tx}`,
      `This is an unsigned transaction. Use \`account sign\` and \`tx broadcast\` to submit the transaction to the network, or verify that it will be accepted with \`tx verify\`.`,
    ]);
  });

  it('signs tx', async () => {
    const { tx } = await executeTx('spend', aeSdk.address, aeSdk.address, 100, nonce, '--json');

    const args = ['sign', WALLET_NAME, tx, '--password', 'test', '--networkId', networkId];
    const responseJson = await executeProgram('account', ...args, '--json');
    expect(responseJson.signedTx).to.satisfy((s) => s.startsWith(Encoding.Transaction));
    expect(responseJson).to.eql({
      address: aeSdk.address,
      networkId: 'ae_dev',
      signedTx: responseJson.signedTx,
    });

    const response = await executeProgram('account', ...args);
    expectToMatchLines(response, [
      `Signing account address  ${aeSdk.address}`,
      'Network ID               ae_dev',
      `Unsigned                 ${tx}`,
      `Signed                   ${responseJson.signedTx}`,
    ]);
  });

  async function signAndPostAndInspect(txEncoded) {
    const { signedTx } = await executeProgram(
      'account',
      'sign',
      WALLET_NAME,
      txEncoded,
      '--password',
      'test',
      '--json',
      '--networkId',
      networkId,
    );
    const broadcast = await executeProgram('chain', 'broadcast', signedTx, '--json');
    expect(+broadcast.blockHeight).to.be.above(0);
    const txHash = buildTxHash(signedTx);

    const { blockHash, blockHeight, hash, signatures, tx, encodedTx, ...otherDetailsJson } =
      await executeProgram('inspect', txHash, '--json');
    const details = await executeProgram('inspect', txHash);

    expect(encodedTx).to.be.satisfy((t) => t.startsWith('tx_'));
    expect(otherDetailsJson).to.eql({});
    expect(blockHash).to.satisfy((s) => s.startsWith(Encoding.MicroBlockHash));
    expect(blockHeight).to.greaterThan(0);
    expect(hash).to.satisfy((s) => s.startsWith(Encoding.TxHash));
    expect(signatures[0]).to.satisfy((s) => s.startsWith(Encoding.Signature));

    const [commonDetails, specificDetails] = details.split('\nTransaction type');
    const spacing = commonDetails.match(/Transaction hash(\s+)/)[1];
    expectToMatchLines(commonDetails, [
      `Transaction hash${spacing}${hash}`,
      `Block hash      ${spacing}${blockHash}`,
      `Block height    ${spacing}${blockHeight} (about now)`,
      `Signatures      ${spacing}["${signatures}"]`,
    ]);

    return [tx, `Transaction type${specificDetails}`];
  }

  it('builds spend tx and sends', async () => {
    const amount = 100;
    nonce += 1;
    const { tx } = await executeTx('spend', aeSdk.address, aeSdk.address, amount, nonce, '--json');

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      amount: '100',
      fee: detailsJson.fee,
      nonce,
      payload: 'ba_Xfbg4g==',
      recipientId: aeSdk.address,
      senderId: aeSdk.address,
      type: 'SpendTx',
      version: 1,
    });
    expectToMatchLines(details, [
      'Transaction type   SpendTx (ver. 1)',
      `Sender address     ${aeSdk.address}`,
      `Recipient address  ${aeSdk.address}`,
      'Amount             0.0000000000000001ae',
      'Payload            ba_Xfbg4g==',
      /Fee                0.000016\d+ae/,
      `Nonce              ${nonce}`,
    ]);
  });

  it('builds name preclaim tx and sends', async () => {
    nonce += 1;
    const { tx, salt: nameSalt } = await executeTx(
      'name-preclaim',
      aeSdk.address,
      name,
      nonce,
      '--json',
    );
    salt = nameSalt;

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.commitmentId).to.satisfy((s) => s.startsWith(Encoding.Commitment));
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      accountId: aeSdk.address,
      commitmentId: detailsJson.commitmentId,
      fee: detailsJson.fee,
      nonce,
      type: 'NamePreclaimTx',
      version: 1,
    });
    expectToMatchLines(details, [
      'Transaction type  NamePreclaimTx (ver. 1)',
      `Account address   ${aeSdk.address}`,
      `Commitment        ${detailsJson.commitmentId}`,
      /Fee               0.000016\d+ae/,
      `Nonce             ${nonce}`,
    ]);
  });

  it('builds name claim tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx('name-claim', aeSdk.address, salt, name, nonce, '--json');

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.nameSalt).to.be.a('number');
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      accountId: aeSdk.address,
      fee: detailsJson.fee,
      name,
      nameFee: '159700000000000000',
      nameSalt: detailsJson.nameSalt,
      nonce,
      type: 'NameClaimTx',
      version: 2,
    });
    expectToMatchLines(details, [
      'Transaction type  NameClaimTx (ver. 2)',
      `Account address   ${aeSdk.address}`,
      `Name              ${name}`,
      'Name fee          0.1597ae',
      `Name salt         ${salt}`,
      /Fee               0.000016\d+ae/,
      `Nonce             ${nonce}`,
    ]);

    nameId = (await aeSdk.api.getNameEntryByName(name)).id;
  });

  it('builds name update tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(
      'name-update',
      aeSdk.address,
      nameId,
      nonce,
      aeSdk.address,
      '--json',
    );

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      clientTtl: 3600,
      fee: detailsJson.fee,
      nameId,
      nameTtl: 180000,
      nonce,
      pointers: [
        { id: aeSdk.address, key: 'account_pubkey', encoded_key: 'ba_YWNjb3VudF9wdWJrZXn8jckR' },
      ],
      type: 'NameUpdateTx',
      version: 1,
      accountId: aeSdk.address,
    });
    expectToMatchLines(details, [
      'Transaction type        NameUpdateTx (ver. 1)',
      `Account address         ${aeSdk.address}`,
      `Name ID                 ${nameId}`,
      'Name TTL                180000 (in 1 year)',
      `Pointer account_pubkey  ${aeSdk.address}`,
      'Client TTL              3600 (1 hour)',
      /Fee                     0.000017\d+ae/,
      `Nonce                   ${nonce}`,
    ]);
  });

  it('builds name transfer tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(
      'name-transfer',
      aeSdk.address,
      aeSdk.address,
      nameId,
      nonce,
      '--json',
    );

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      fee: detailsJson.fee,
      nameId,
      nonce,
      recipientId: aeSdk.address,
      type: 'NameTransferTx',
      version: 1,
      accountId: aeSdk.address,
    });
    expectToMatchLines(details, [
      'Transaction type   NameTransferTx (ver. 1)',
      `Account address    ${aeSdk.address}`,
      `Recipient address  ${aeSdk.address}`,
      `Name ID            ${nameId}`,
      /Fee                0.000017\d+ae/,
      `Nonce              ${nonce}`,
    ]);
  });

  it('builds name revoke tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx('name-revoke', aeSdk.address, nameId, nonce, '--json');

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      fee: detailsJson.fee,
      nameId,
      nonce,
      type: 'NameRevokeTx',
      version: 1,
      accountId: aeSdk.address,
    });
    expectToMatchLines(details, [
      'Transaction type  NameRevokeTx (ver. 1)',
      `Account address   ${aeSdk.address}`,
      `Name ID           ${nameId}`,
      /Fee               0.000016\d+ae/,
      `Nonce             ${nonce}`,
    ]);
  });

  let contract;
  it('builds contract create tx and sends', async () => {
    nonce += 1;
    contract = await Contract.initialize({
      ...aeSdk.getContext(),
      sourceCode: testContract,
    });
    const bytecode = await contract.$compile();
    const callData = contract._calldata.encode(contract._name, 'init', []);
    const { tx, contractId: cId } = await executeTx(
      'contract-deploy',
      aeSdk.address,
      bytecode,
      callData,
      nonce,
      '--json',
    );
    contractId = cId;

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      abiVersion: '3',
      vmVersion: '8',
      amount: '0',
      callData,
      code: bytecode,
      deposit: '0',
      fee: detailsJson.fee,
      gas: 5921420,
      gasPrice: '1000000000',
      nonce,
      type: 'ContractCreateTx',
      version: 1,
      ownerId: aeSdk.address,
    });
    expectToMatchLines(details, [
      'Transaction type  ContractCreateTx (ver. 1)',
      `Owner address     ${aeSdk.address}`,
      'Gas               5921420 (0.00592142ae)',
      'Gas price         0.000000001ae',
      `Bytecode          ${bytecode}`,
      `Call data         ${callData}`,
      'VM version        8 (Fate3)',
      'ABI version       3 (Fate)',
      'Amount            0ae',
      /Fee               0.000078\d+ae/,
      `Nonce             ${nonce}`,
    ]);
  });

  it('builds contract call tx and sends', async () => {
    nonce += 1;
    const callData = contract._calldata.encode(contract._name, 'test', ['1', '2']);
    const { tx } = await executeTx(
      'contract-call',
      aeSdk.address,
      contractId,
      callData,
      nonce,
      '--json',
      '--amount',
      '0.00000042ae',
    );

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      abiVersion: '3',
      amount: '420000000000',
      callData,
      callerId: aeSdk.address,
      contractId,
      fee: detailsJson.fee,
      gas: 5817860,
      gasPrice: '1000000000',
      nonce,
      type: 'ContractCallTx',
      version: 1,
    });
    expectToMatchLines(details, [
      'Transaction type  ContractCallTx (ver. 1)',
      `Caller address    ${aeSdk.address}`,
      `Contract address  ${contractId}`,
      'Gas               5817860 (0.00581786ae)',
      'Gas price         0.000000001ae',
      `Call data         ${callData}`,
      'ABI version       3 (Fate)',
      'Amount            0.00000042ae',
      /Fee               0.000182\d+ae/,
      `Nonce             ${nonce}`,
    ]);
  });

  it('builds oracle register tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(
      'oracle-register',
      aeSdk.address,
      '{city: "str"}',
      '{tmp:""num}',
      nonce,
      '--json',
    );

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      abiVersion: '0',
      accountId: aeSdk.address,
      fee: detailsJson.fee,
      nonce,
      oracleTtl: { type: 'delta', value: '500' },
      queryFee: '0',
      queryFormat: '{city: "str"}',
      responseFormat: '{tmp:""num}',
      type: 'OracleRegisterTx',
      version: 1,
    });
    expectToMatchLines(details, [
      'Transaction type  OracleRegisterTx (ver. 1)',
      `Account address   ${aeSdk.address}`,
      /Oracle TTL        \d+ \(in 1 day\)/,
      'ABI version       0 (NoAbi)',
      'Query fee         0ae',
      'Query format      {city: "str"}',
      'Response format   {tmp:""num}',
      /Fee               0.000016\d+ae/,
      `Nonce             ${nonce}`,
    ]);
  });

  it('builds oracle extend tx and sends', async () => {
    const oracleCurrentTtl = await aeSdk.api.getOracleByPubkey(oracleId);
    nonce += 1;
    const { tx } = await executeTx('oracle-extend', oracleId, 100, nonce, '--json');

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      fee: detailsJson.fee,
      nonce,
      oracleId,
      oracleTtl: { type: 'delta', value: '100' },
      type: 'OracleExtendTx',
      version: 1,
    });
    expectToMatchLines(details, [
      'Transaction type  OracleExtendTx (ver. 1)',
      `Oracle ID         ${oracleId}`,
      /Oracle TTL        \d+ \(in 4 hours\)/,
      /Fee               0.000015\d+ae/,
      `Nonce             ${nonce}`,
    ]);

    const oracleTtl = await aeSdk.api.getOracleByPubkey(oracleId);
    const isExtended = +oracleTtl.ttl === +oracleCurrentTtl.ttl + 100;
    isExtended.should.be.equal(true);
  });

  it('builds oracle post query tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(
      'oracle-post-query',
      aeSdk.address,
      oracleId,
      '{city: "Berlin"}',
      nonce,
      '--json',
    );

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      fee: detailsJson.fee,
      nonce,
      oracleId,
      query: '{city: "Berlin"}',
      queryFee: '0',
      queryTtl: { type: 'delta', value: '10' },
      responseTtl: { type: 'delta', value: '10' },
      senderId: aeSdk.address,
      type: 'OracleQueryTx',
      version: 1,
    });
    expectToMatchLines(details, [
      'Transaction type  OracleQueryTx (ver. 1)',
      `Sender address    ${aeSdk.address}`,
      `Oracle ID         ${oracleId}`,
      'Query             {city: "Berlin"}',
      'Query fee         0ae',
      /Query TTL         \d+ \(in 27 minutes\)/,
      /Response TTL      \d+ \(in 27 minutes\)/,
      /Fee               0.000017\d+ae/,
      `Nonce             ${nonce}`,
    ]);

    const { oracleQueries: queries } = await aeSdk.api.getOracleQueriesByPubkey(oracleId);
    queryId = queries[0].id;
    const hasQuery = !!queries.length;
    hasQuery.should.be.equal(true);
  });

  it('builds oracle respond tx and sends', async () => {
    const response = '{tmp: 10}';
    nonce += 1;
    const { tx } = await executeTx('oracle-respond', oracleId, queryId, response, nonce, '--json');

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      fee: detailsJson.fee,
      nonce,
      oracleId,
      queryId,
      response: '{tmp: 10}',
      responseTtl: { type: 'delta', value: '10' },
      type: 'OracleRespondTx',
      version: 1,
    });
    expectToMatchLines(details, [
      'Transaction type  OracleRespondTx (ver. 1)',
      `Oracle ID         ${oracleId}`,
      `Query ID          ${queryId}`,
      'Response          {tmp: 10}',
      /Response TTL      \d+ \(in 27 minutes\)/,
      /Fee               0.000016\d+ae/,
      `Nonce             ${nonce}`,
    ]);

    const { oracleQueries: queries } = await aeSdk.api.getOracleQueriesByPubkey(oracleId);
    const responseQuery = decode(queries[0].response).toString();
    const hasQuery = !!queries.length;
    hasQuery.should.be.equal(true);
    response.should.be.equal(responseQuery);
  });
});
