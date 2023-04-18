/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */

import {
  generateKeyPair, decode, encode, Encoding, buildTxHash,
} from '@aeternity/aepp-sdk';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import {
  executeProgram, randomName, getSdk, networkId,
} from './index';
import txProgram from '../src/commands/tx';
import accountProgram from '../src/commands/account';
import chainProgram from '../src/commands/chain';
import inspectProgram from '../src/commands/inspect';

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
    await executeProgram(accountProgram, ['save', WALLET_NAME, '--password', 'test', TX_KEYS.secretKey, '--overwrite']);
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
      networkId: 'ae_devnet',
      signedTx: responseJson.signedTx,
    });

    const response = await executeProgram(accountProgram, args);
    expect(response).to.equal(`
Signing account address _________________ ${TX_KEYS.publicKey}
Network ID ______________________________ ae_devnet
Unsigned ________________________________ ${tx}
Signed __________________________________ ${responseJson.signedTx}
    `.trim());
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
      blockHash, blockHeight, hash, signatures, tx, ...otherDetailsJson
    } = await executeProgram(inspectProgram, [txHash, '--json']);
    const details = await executeProgram(inspectProgram, [txHash]);

    expect(otherDetailsJson).to.eql({});
    expect(blockHash).to.satisfy((s) => s.startsWith(Encoding.MicroBlockHash));
    expect(blockHeight).to.greaterThan(0);
    expect(hash).to.satisfy((s) => s.startsWith(Encoding.TxHash));
    expect(signatures[0]).to.satisfy((s) => s.startsWith(Encoding.Signature));

    const [commonDetails, specificDetails] = details.split('\nTx Type');
    expect(commonDetails).to.equal(`
Tx hash _________________________________ ${hash}
Block hash ______________________________ ${blockHash}
Block height ____________________________ ${blockHeight}
Signatures ______________________________ ["${signatures}"]
    `.trim());

    return [tx, `Tx Type${specificDetails}`];
  }

  it('builds spend tx and sends', async () => {
    const amount = 100;
    nonce += 1;
    const { tx } = await executeTx(['spend', TX_KEYS.publicKey, TX_KEYS.publicKey, amount, nonce, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson).to.eql({
      amount: '100',
      fee: '16660000000000',
      nonce,
      payload: 'ba_Xfbg4g==',
      recipientId: TX_KEYS.publicKey,
      senderId: TX_KEYS.publicKey,
      type: 'SpendTx',
      version: 1,
    });
    expect(details).to.equal(`
Tx Type _________________________________ SpendTx
Sender account __________________________ ${TX_KEYS.publicKey}
Recipient account _______________________ ${TX_KEYS.publicKey}
Amount __________________________________ 100
Payload _________________________________ ba_Xfbg4g==
Fee _____________________________________ 16660000000000
Nonce ___________________________________ ${nonce}
TTL _____________________________________ N/A
Version _________________________________ 1
    `.trim());
  });

  it('builds name preclaim tx and sends', async () => {
    nonce += 1;
    const { tx, salt: nameSalt } = await executeTx(['name-preclaim', TX_KEYS.publicKey, name, nonce, '--json']);
    salt = nameSalt;

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.commitmentId).to.satisfy((s) => s.startsWith(Encoding.Commitment));
    expect(detailsJson).to.eql({
      accountId: TX_KEYS.publicKey,
      commitmentId: detailsJson.commitmentId,
      fee: '16620000000000',
      nonce,
      type: 'NamePreclaimTx',
      version: 1,
    });
    expect(details).to.equal(`
Tx Type _________________________________ NamePreclaimTx
Account _________________________________ ${TX_KEYS.publicKey}
Commitment ______________________________ ${detailsJson.commitmentId}
Salt ____________________________________ N/A
Fee _____________________________________ 16620000000000
Nonce ___________________________________ ${nonce}
TTL _____________________________________ N/A
Version _________________________________ 1
    `.trim());
  });

  it('builds name claim tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(['name-claim', TX_KEYS.publicKey, salt, name, nonce, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson.nameSalt).to.be.a('number');
    expect(detailsJson).to.eql({
      accountId: TX_KEYS.publicKey,
      fee: '16780000000000',
      name,
      nameFee: '159700000000000000',
      nameSalt: detailsJson.nameSalt,
      nonce,
      type: 'NameClaimTx',
      version: 2,
    });
    expect(details).to.equal(`
Tx Type _________________________________ NameClaimTx
Account _________________________________ ${TX_KEYS.publicKey}
Name ____________________________________ ${name}
Name Fee ________________________________ 159700000000000000
Name Salt _______________________________ ${salt}
Fee _____________________________________ 16780000000000
Nonce ___________________________________ ${nonce}
TTL _____________________________________ N/A
Version _________________________________ 2
    `.trim());

    nameId = (await sdk.aensQuery(name)).id;
  }).timeout(10000);

  it('builds name update tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(['name-update', TX_KEYS.publicKey, nameId, nonce, TX_KEYS.publicKey, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson).to.eql({
      clientTtl: 84600,
      fee: '17800000000000',
      nameId,
      nameTtl: 180000,
      nonce,
      pointers: [{ id: TX_KEYS.publicKey, key: 'account_pubkey' }],
      type: 'NameUpdateTx',
      version: 1,
      accountId: TX_KEYS.publicKey,
    });
    expect(details).to.equal(`
Tx Type _________________________________ NameUpdateTx
Account _________________________________ ${TX_KEYS.publicKey}
Client TTL ______________________________ 84600
Name ID _________________________________ ${nameId}
Name TTL ________________________________ 180000
Pointer account_pubkey __________________ ${TX_KEYS.publicKey}
Fee _____________________________________ 17800000000000
Nonce ___________________________________ ${nonce}
TTL _____________________________________ N/A
Version _________________________________ 1
    `.trim());
  });

  it('builds name transfer tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(['name-transfer', TX_KEYS.publicKey, TX_KEYS.publicKey, nameId, nonce, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson).to.eql({
      fee: '17300000000000',
      nameId,
      nonce,
      recipientId: TX_KEYS.publicKey,
      type: 'NameTransferTx',
      version: 1,
      accountId: TX_KEYS.publicKey,
    });
    expect(details).to.equal(`
Tx Type _________________________________ NameTransferTx
Account _________________________________ ${TX_KEYS.publicKey}
Recipient _______________________________ ${TX_KEYS.publicKey}
Name ID _________________________________ ${nameId}
Fee _____________________________________ 17300000000000
Nonce ___________________________________ ${nonce}
TTL _____________________________________ N/A
Version _________________________________ 1
    `.trim());
  });

  it('builds name revoke tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(['name-revoke', TX_KEYS.publicKey, nameId, nonce, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson).to.eql({
      fee: '16620000000000',
      nameId,
      nonce,
      type: 'NameRevokeTx',
      version: 1,
      accountId: TX_KEYS.publicKey,
    });
    expect(details).to.equal(`
Tx Type _________________________________ NameRevokeTx
Account _________________________________ ${TX_KEYS.publicKey}
Name ID _________________________________ ${nameId}
Fee _____________________________________ 16620000000000
Nonce ___________________________________ ${nonce}
TTL _____________________________________ N/A
Version _________________________________ 1
    `.trim());
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
    expect(detailsJson).to.eql({
      abiVersion: '3',
      vmVersion: '7',
      amount: '0',
      callData,
      code: bytecode,
      deposit: '0',
      fee: '78580000000000',
      gas: 5921420,
      gasPrice: '1000000000',
      nonce,
      type: 'ContractCreateTx',
      version: 1,
      ownerId: TX_KEYS.publicKey,
    });
    expect(details).to.equal(`
Tx Type _________________________________ ContractCreateTx
Owner ___________________________________ ${TX_KEYS.publicKey}
Amount __________________________________ 0
Deposit _________________________________ 0
Gas _____________________________________ 5921420
Gas Price _______________________________ 1000000000
Bytecode ________________________________ ${bytecode}
Call data _______________________________ ${callData}
Fee _____________________________________ 78580000000000
Nonce ___________________________________ ${nonce}
TTL _____________________________________ N/A
Version _________________________________ 1
VM Version ______________________________ 7
ABI Version _____________________________ 3
    `.trim());
  }).timeout(8000);

  it('builds contract call tx and sends', async () => {
    nonce += 1;
    // eslint-disable-next-line no-underscore-dangle
    const callData = contract._calldata.encode(contract._name, 'test', ['1', '2']);
    const { tx } = await executeTx(['contract-call', TX_KEYS.publicKey, contractId, callData, nonce, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson).to.eql({
      abiVersion: '3',
      amount: '0',
      callData,
      callerId: TX_KEYS.publicKey,
      contractId,
      fee: '182040000000000',
      gas: 5817960,
      gasPrice: '1000000000',
      nonce,
      type: 'ContractCallTx',
      version: 1,
    });
    expect(details).to.equal(`
Tx Type _________________________________ ContractCallTx
Caller Account __________________________ ${TX_KEYS.publicKey}
Contract Hash ___________________________ ${contractId}
Amount __________________________________ 0
Gas _____________________________________ 5817960
Gas Price _______________________________ 1000000000
Call data _______________________________ ${callData}
Fee _____________________________________ 182040000000000
Nonce ___________________________________ ${nonce}
TTL _____________________________________ N/A
Version _________________________________ 1
ABI Version _____________________________ 3
    `.trim());
  }).timeout(4000);

  it('builds oracle register tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(['oracle-register', TX_KEYS.publicKey, '{city: "str"}', '{tmp:""num}', nonce, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson).to.eql({
      abiVersion: '0',
      accountId: TX_KEYS.publicKey,
      fee: '16672000000000',
      nonce,
      oracleTtl: { type: 'delta', value: '500' },
      queryFee: '0',
      queryFormat: '{city: "str"}',
      responseFormat: '{tmp:""num}',
      type: 'OracleRegisterTx',
      version: 1,
    });
    expect(details).to.equal(`
Tx Type _________________________________ OracleRegisterTx
Account _________________________________ ${TX_KEYS.publicKey}
Oracle ID _______________________________ ${oracleId}
Fee _____________________________________ 16672000000000
Query Fee _______________________________ 0
Oracle Ttl ______________________________ {"type":"delta","value":"500"}
Query Format ____________________________ {city: "str"}
Response Format _________________________ {tmp:""num}
Nonce ___________________________________ ${nonce}
TTL _____________________________________ N/A
    `.trim());
  });

  it('builds oracle extend tx and sends', async () => {
    const oracleCurrentTtl = await sdk.api.getOracleByPubkey(oracleId);
    nonce += 1;
    const { tx } = await executeTx(['oracle-extend', TX_KEYS.publicKey, oracleId, 100, nonce, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson).to.eql({
      fee: '15979000000000',
      nonce,
      oracleId,
      oracleTtl: { type: 'delta', value: '100' },
      type: 'OracleExtendTx',
      version: 1,
    });
    expect(details).to.equal(`
Tx Type _________________________________ OracleExtendTx
Oracle ID _______________________________ ${oracleId}
Fee _____________________________________ 15979000000000
Oracle Ttl ______________________________ {"type":"delta","value":"100"}
Nonce ___________________________________ ${nonce}
TTL _____________________________________ N/A
    `.trim());

    const oracleTtl = await sdk.api.getOracleByPubkey(oracleId);
    const isExtended = +oracleTtl.ttl === +oracleCurrentTtl.ttl + 100;
    isExtended.should.be.equal(true);
  });

  it('builds oracle post query tx and sends', async () => {
    nonce += 1;
    const { tx } = await executeTx(['oracle-post-query', TX_KEYS.publicKey, oracleId, '{city: "Berlin"}', nonce, '--json']);

    const [detailsJson, details] = await signAndPostAndInspect(tx);
    expect(detailsJson).to.eql({
      fee: '17062000000000',
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
    expect(details).to.equal(`
Tx Type _________________________________ OracleQueryTx
Account _________________________________ ${TX_KEYS.publicKey}
Oracle ID _______________________________ ${oracleId}
Query ID ________________________________ N/A
Query ___________________________________ {city: "Berlin"}
Fee _____________________________________ 17062000000000
Query Fee _______________________________ 0
Query Ttl _______________________________ {"type":"delta","value":"10"}
Response Ttl ____________________________ {"type":"delta","value":"10"}
Nonce ___________________________________ ${nonce}
TTL _____________________________________ N/A
    `.trim());

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
    expect(detailsJson).to.eql({
      fee: '16842000000000',
      nonce,
      oracleId,
      queryId,
      response: '{tmp: 10}',
      responseTtl: { type: 'delta', value: '10' },
      type: 'OracleRespondTx',
      version: 1,
    });
    expect(details).to.equal(`
Tx Type _________________________________ OracleRespondTx
Oracle ID _______________________________ ${oracleId}
Query ___________________________________ ${queryId}
Fee _____________________________________ 16842000000000
Response ________________________________ {tmp: 10}
Response Ttl ____________________________ {"type":"delta","value":"10"}
Nonce ___________________________________ ${nonce}
TTL _____________________________________ N/A
    `.trim());

    const { oracleQueries: queries } = await sdk.api.getOracleQueriesByPubkey(oracleId);
    const responseQuery = decode(queries[0].response).toString();
    const hasQuery = !!queries.length;
    hasQuery.should.be.equal(true);
    response.should.be.equal(responseQuery);
  });
});
