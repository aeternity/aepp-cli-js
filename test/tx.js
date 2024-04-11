import {
  generateKeyPair, decode, encode, Encoding, buildTxHash,
} from '@aeternity/aepp-sdk';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import {
  executeProgram, randomName, getSdk, networkId, expectToMatchLines,
} from './index.js';
import txProgram from '../src/commands/tx.js';
import accountProgram from '../src/commands/account.js';
import chainProgram from '../src/commands/chain.js';
import inspectProgram from '../src/commands/inspect.js';

const executeTx = (args) => executeProgram(txProgram, args);

const WALLET_NAME = 'test-artifacts/tx-wallet.json';
const testContract = `
@compiler >= 6

contract Identity =
  entrypoint test(x : int, y: int) = x + y
`;

describe('Transaction Module', () => {
  const TX_KEYS = generateKeyPair();
  const oracleId = encode(decode(TX_KEYS.publicKey, Encoding.AccountAddress), Encoding.OracleAddress);
  let sdk;
  let salt;
  let queryId;
  let contractId;
  const name = randomName();
  let nonce = 0;
  let nameId;

  before(async () => {
    sdk = await getSdk();
    await sdk.spend(1e24, TX_KEYS.publicKey);
    await executeProgram(accountProgram, ['create', WALLET_NAME, '--password', 'test', TX_KEYS.secretKey]);
  });

  it('builds tx', async () => {
    const amount = 100;

    const args = ['spend', TX_KEYS.publicKey, TX_KEYS.publicKey, amount, nonce];
    const responseJson = await executeTx([...args, '--json']);
    expect(responseJson.tx).to.satisfy((s) => s.startsWith(Encoding.Transaction));
    expect(responseJson).to.eql({
      tx: responseJson.tx,
      txObject: {
        version: 1,
        amount: '100',
        fee: '16660000000000',
        nonce,
        payload: 'ba_Xfbg4g==',
        recipientId: TX_KEYS.publicKey,
        senderId: TX_KEYS.publicKey,
        tag: 12,
        ttl: 0,
      },
    });

    const response = await executeTx(args);
    expect(response).to.equal(`
Transaction type ________________________ SpendTx
Summary
    TAG _________________________________ 12
    VERSION _____________________________ 1
    SENDERID ____________________________ ${TX_KEYS.publicKey}
    RECIPIENTID _________________________ ${TX_KEYS.publicKey}
    AMOUNT ______________________________ ${amount}
    FEE _________________________________ 16660000000000
    TTL _________________________________ 0
    NONCE _______________________________ ${nonce}
    PAYLOAD _____________________________ ba_Xfbg4g==
Output
    Encoded _____________________________ ${responseJson.tx}
This is an unsigned transaction. Use \`account sign\` and \`tx broadcast\` to submit the transaction to the network, or verify that it will be accepted with \`tx verify\`.
    `.trim());
  });

  it('signs tx', async () => {
    const { tx } = await executeTx(['spend', TX_KEYS.publicKey, TX_KEYS.publicKey, 100, nonce, '--json']);

    const args = ['sign', WALLET_NAME, tx, '--password', 'test', '--networkId', networkId];
    const responseJson = await executeProgram(accountProgram, [...args, '--json']);
    expect(responseJson.signedTx).to.satisfy((s) => s.startsWith(Encoding.Transaction));
    expect(responseJson).to.eql({
      address: TX_KEYS.publicKey,
      networkId: 'ae_dev',
      signedTx: responseJson.signedTx,
    });

    const response = await executeProgram(accountProgram, args);
    expectToMatchLines(response, [
      `Signing account address _________________ ${TX_KEYS.publicKey}`,
      'Network ID ______________________________ ae_dev',
      `Unsigned ________________________________ ${tx}`,
      `Signed __________________________________ ${responseJson.signedTx}`,
    ]);
  });

  async function signAndPostAndInspect(txEncoded) {
    const { signedTx } = await executeProgram(
      accountProgram,
      ['sign', WALLET_NAME, txEncoded, '--password', 'test', '--json', '--networkId', networkId],
    );
    const broadcast = await executeProgram(chainProgram, ['broadcast', signedTx, '--json']);
    expect(+broadcast.blockHeight).to.be.above(0);
    const txHash = buildTxHash(signedTx);

    const {
      blockHash, blockHeight, hash, signatures, tx, encodedTx, ...otherDetailsJson
    } = await executeProgram(inspectProgram, [txHash, '--json']);
    const details = await executeProgram(inspectProgram, [txHash]);

    expect(encodedTx).to.be.satisfy((t) => t.startsWith('tx_'));
    expect(otherDetailsJson).to.eql({});
    expect(blockHash).to.satisfy((s) => s.startsWith(Encoding.MicroBlockHash));
    expect(blockHeight).to.greaterThan(0);
    expect(hash).to.satisfy((s) => s.startsWith(Encoding.TxHash));
    expect(signatures[0]).to.satisfy((s) => s.startsWith(Encoding.Signature));

    const [commonDetails, specificDetails] = details.split('\nTransaction type');
    expectToMatchLines(commonDetails, [
      `Transaction hash ________________________ ${hash}`,
      `Block hash ______________________________ ${blockHash}`,
      `Block height ____________________________ ${blockHeight} (about now)`,
      `Signatures ______________________________ ["${signatures}"]`,
    ]);

    return [tx, `Transaction type${specificDetails}`];
  }

  it('builds spend tx and sends', async () => {
    const amount = 100;
    nonce += 1;
    const { tx } = await executeTx(['spend', TX_KEYS.publicKey, TX_KEYS.publicKey, amount, nonce, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      amount: '100',
      fee: detailsJson.fee,
      nonce,
      payload: 'ba_Xfbg4g==',
      recipientId: TX_KEYS.publicKey,
      senderId: TX_KEYS.publicKey,
      type: 'SpendTx',
      version: 1,
    });
    expectToMatchLines(details, [
      'Transaction type ________________________ SpendTx',
      `Sender address __________________________ ${TX_KEYS.publicKey}`,
      `Recipient address _______________________ ${TX_KEYS.publicKey}`,
      'Amount __________________________________ 0.0000000000000001ae',
      'Payload _________________________________ ba_Xfbg4g==',
      /Fee _____________________________________ 0.000016\d+ae/,
      `Nonce ___________________________________ ${nonce}`,
      'Version _________________________________ 1',
    ]);
  });

  it('builds name preclaim tx and sends', async () => {
    nonce += 1;
    const { tx, salt: nameSalt } = await executeTx(['name-preclaim', TX_KEYS.publicKey, name, nonce, '--json']);
    salt = nameSalt;

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.commitmentId).to.satisfy((s) => s.startsWith(Encoding.Commitment));
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      accountId: TX_KEYS.publicKey,
      commitmentId: detailsJson.commitmentId,
      fee: detailsJson.fee,
      nonce,
      type: 'NamePreclaimTx',
      version: 1,
    });
    expectToMatchLines(details, [
      'Transaction type ________________________ NamePreclaimTx',
      `Account address _________________________ ${TX_KEYS.publicKey}`,
      `Commitment ______________________________ ${detailsJson.commitmentId}`,
      /Fee _____________________________________ 0.000016\d+ae/,
      `Nonce ___________________________________ ${nonce}`,
      'Version _________________________________ 1',
    ]);
  });

  it('builds name claim tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(['name-claim', TX_KEYS.publicKey, salt, name, nonce, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.nameSalt).to.be.a('number');
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      accountId: TX_KEYS.publicKey,
      fee: detailsJson.fee,
      name,
      nameFee: '159700000000000000',
      nameSalt: detailsJson.nameSalt,
      nonce,
      type: 'NameClaimTx',
      version: 2,
    });
    expectToMatchLines(details, [
      'Transaction type ________________________ NameClaimTx',
      `Account address _________________________ ${TX_KEYS.publicKey}`,
      `Name ____________________________________ ${name}`,
      'Name fee ________________________________ 0.1597ae',
      `Name salt _______________________________ ${salt}`,
      /Fee _____________________________________ 0.000016\d+ae/,
      `Nonce ___________________________________ ${nonce}`,
      'Version _________________________________ 2',
    ]);

    nameId = (await sdk.aensQuery(name)).id;
  }).timeout(10000);

  it('builds name update tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(['name-update', TX_KEYS.publicKey, nameId, nonce, TX_KEYS.publicKey, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      clientTtl: 3600,
      fee: detailsJson.fee,
      nameId,
      nameTtl: 180000,
      nonce,
      pointers: [{ id: TX_KEYS.publicKey, key: 'account_pubkey' }],
      type: 'NameUpdateTx',
      version: 1,
      accountId: TX_KEYS.publicKey,
    });
    expectToMatchLines(details, [
      'Transaction type ________________________ NameUpdateTx',
      `Account address _________________________ ${TX_KEYS.publicKey}`,
      'Client TTL ______________________________ 3600 (1 hour)',
      `Name ID _________________________________ ${nameId}`,
      'Name TTL ________________________________ 180000 (in 1 year)',
      `Pointer account_pubkey __________________ ${TX_KEYS.publicKey}`,
      /Fee _____________________________________ 0.000017\d+ae/,
      `Nonce ___________________________________ ${nonce}`,
      'Version _________________________________ 1',
    ]);
  });

  it('builds name transfer tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(['name-transfer', TX_KEYS.publicKey, TX_KEYS.publicKey, nameId, nonce, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      fee: detailsJson.fee,
      nameId,
      nonce,
      recipientId: TX_KEYS.publicKey,
      type: 'NameTransferTx',
      version: 1,
      accountId: TX_KEYS.publicKey,
    });
    expectToMatchLines(details, [
      'Transaction type ________________________ NameTransferTx',
      `Account address _________________________ ${TX_KEYS.publicKey}`,
      `Recipient address _______________________ ${TX_KEYS.publicKey}`,
      `Name ID _________________________________ ${nameId}`,
      /Fee _____________________________________ 0.000017\d+ae/,
      `Nonce ___________________________________ ${nonce}`,
      'Version _________________________________ 1',
    ]);
  });

  it('builds name revoke tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(['name-revoke', TX_KEYS.publicKey, nameId, nonce, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      fee: detailsJson.fee,
      nameId,
      nonce,
      type: 'NameRevokeTx',
      version: 1,
      accountId: TX_KEYS.publicKey,
    });
    expectToMatchLines(details, [
      'Transaction type ________________________ NameRevokeTx',
      `Account address _________________________ ${TX_KEYS.publicKey}`,
      `Name ID _________________________________ ${nameId}`,
      /Fee _____________________________________ 0.000016\d+ae/,
      `Nonce ___________________________________ ${nonce}`,
      'Version _________________________________ 1',
    ]);
  });

  let contract;
  it('builds contract create tx and sends', async () => {
    nonce += 1;
    contract = await sdk.initializeContract({ sourceCode: testContract });
    const bytecode = await contract.$compile();
    // eslint-disable-next-line no-underscore-dangle
    const callData = contract._calldata.encode(contract._name, 'init', []);
    const { tx, contractId: cId } = await executeTx([
      'contract-deploy',
      TX_KEYS.publicKey,
      bytecode,
      callData,
      nonce,
      '--json',
    ]);
    contractId = cId;

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      abiVersion: '3',
      vmVersion: '7',
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
      ownerId: TX_KEYS.publicKey,
    });
    expectToMatchLines(details, [
      'Transaction type ________________________ ContractCreateTx',
      `Owner address ___________________________ ${TX_KEYS.publicKey}`,
      'Amount __________________________________ 0ae',
      'Deposit _________________________________ 0ae',
      'Gas _____________________________________ 5921420',
      'Gas price _______________________________ 0.000000001ae',
      `Bytecode ________________________________ ${bytecode}`,
      `Call data _______________________________ ${callData}`,
      /Fee _____________________________________ 0.000078\d+ae/,
      `Nonce ___________________________________ ${nonce}`,
      'Version _________________________________ 1',
      'VM version ______________________________ 7 (Fate2)',
      'ABI version _____________________________ 3 (Fate)',
    ]);
  }).timeout(8000);

  it('builds contract call tx and sends', async () => {
    nonce += 1;
    // eslint-disable-next-line no-underscore-dangle
    const callData = contract._calldata.encode(contract._name, 'test', ['1', '2']);
    const { tx } = await executeTx(['contract-call', TX_KEYS.publicKey, contractId, callData, nonce, '--json', '--amount', '0.00000042ae']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      abiVersion: '3',
      amount: '420000000000',
      callData,
      callerId: TX_KEYS.publicKey,
      contractId,
      fee: detailsJson.fee,
      gas: 5817860,
      gasPrice: '1000000000',
      nonce,
      type: 'ContractCallTx',
      version: 1,
    });
    expectToMatchLines(details, [
      'Transaction type ________________________ ContractCallTx',
      `Caller address __________________________ ${TX_KEYS.publicKey}`,
      `Contract address ________________________ ${contractId}`,
      'Amount __________________________________ 0.00000042ae',
      'Gas _____________________________________ 5817860',
      'Gas price _______________________________ 0.000000001ae',
      `Call data _______________________________ ${callData}`,
      /Fee _____________________________________ 0.000182\d+ae/,
      `Nonce ___________________________________ ${nonce}`,
      'Version _________________________________ 1',
      'ABI version _____________________________ 3 (Fate)',
    ]);
  }).timeout(4000);

  it('builds oracle register tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(['oracle-register', TX_KEYS.publicKey, '{city: "str"}', '{tmp:""num}', nonce, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.fee).to.be.a('string');
    expect(detailsJson).to.eql({
      abiVersion: '0',
      accountId: TX_KEYS.publicKey,
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
      'Transaction type ________________________ OracleRegisterTx',
      `Account address _________________________ ${TX_KEYS.publicKey}`,
      /Fee _____________________________________ 0.000016\d+ae/,
      'Query fee _______________________________ 0ae',
      /Oracle TTL ______________________________ \d+ \(in 1 day\)/,
      'Query format ____________________________ {city: "str"}',
      'Response format _________________________ {tmp:""num}',
      `Nonce ___________________________________ ${nonce}`,
      'Version _________________________________ 1',
      'ABI version _____________________________ 0 (NoAbi)',
    ]);
  });

  it('builds oracle extend tx and sends', async () => {
    const oracleCurrentTtl = await sdk.api.getOracleByPubkey(oracleId);
    nonce += 1;
    const { tx } = await executeTx(['oracle-extend', TX_KEYS.publicKey, oracleId, 100, nonce, '--json']);

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
      'Transaction type ________________________ OracleExtendTx',
      `Oracle ID _______________________________ ${oracleId}`,
      /Fee _____________________________________ 0.000015\d+ae/,
      /Oracle TTL ______________________________ \d+ \(in 4 hours\)/,
      `Nonce ___________________________________ ${nonce}`,
      'Version _________________________________ 1',
    ]);

    const oracleTtl = await sdk.api.getOracleByPubkey(oracleId);
    const isExtended = +oracleTtl.ttl === +oracleCurrentTtl.ttl + 100;
    isExtended.should.be.equal(true);
  });

  it('builds oracle post query tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(['oracle-post-query', TX_KEYS.publicKey, oracleId, '{city: "Berlin"}', nonce, '--json']);

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
      senderId: TX_KEYS.publicKey,
      type: 'OracleQueryTx',
      version: 1,
    });
    expectToMatchLines(details, [
      'Transaction type ________________________ OracleQueryTx',
      `Sender address __________________________ ${TX_KEYS.publicKey}`,
      `Oracle ID _______________________________ ${oracleId}`,
      'Query ___________________________________ {city: "Berlin"}',
      /Fee _____________________________________ 0.000017\d+ae/,
      'Query fee _______________________________ 0ae',
      /Query TTL _______________________________ \d+ \(in 27 minutes\)/,
      /Response TTL ____________________________ \d+ \(in 27 minutes\)/,
      `Nonce ___________________________________ ${nonce}`,
      'Version _________________________________ 1',
    ]);

    const { oracleQueries: queries } = await sdk.api.getOracleQueriesByPubkey(oracleId);
    queryId = queries[0].id;
    const hasQuery = !!queries.length;
    hasQuery.should.be.equal(true);
  });

  it('builds oracle respond tx and sends', async () => {
    const response = '{tmp: 10}';
    nonce += 1;
    const { tx } = await executeTx(['oracle-respond', TX_KEYS.publicKey, oracleId, queryId, response, nonce, '--json']);

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
      'Transaction type ________________________ OracleRespondTx',
      `Oracle ID _______________________________ ${oracleId}`,
      `Query ___________________________________ ${queryId}`,
      /Fee _____________________________________ 0.000016\d+ae/,
      'Response ________________________________ {tmp: 10}',
      /Response TTL ____________________________ \d+ \(in 27 minutes\)/,
      `Nonce ___________________________________ ${nonce}`,
      'Version _________________________________ 1',
    ]);

    const { oracleQueries: queries } = await sdk.api.getOracleQueriesByPubkey(oracleId);
    const responseQuery = decode(queries[0].response).toString();
    const hasQuery = !!queries.length;
    hasQuery.should.be.equal(true);
    response.should.be.equal(responseQuery);
  });
});
