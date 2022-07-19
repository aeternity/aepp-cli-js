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

import { generateKeyPair, decode } from '@aeternity/aepp-sdk';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import {
  executeProgram, parseBlock, randomName, getSdk, networkId,
} from './index';
import txProgram from '../src/commands/tx';
import accountProgram from '../src/commands/account';
import chainProgram from '../src/commands/chain';

const executeTx = (args) => executeProgram(txProgram, args);

const WALLET_NAME = 'test-artifacts/tx-wallet.json';
const testContract = `
@compiler >= 6

contract Identity =
  entrypoint test(x : int, y: int) = x + y
`;

describe('Transaction Module', () => {
  const TX_KEYS = generateKeyPair();
  const oracleId = `ok_${TX_KEYS.publicKey.slice(3)}`;
  let sdk;
  let salt;
  let queryId;
  let contractId;
  const name = randomName();
  let nonce = 1;
  let nameId;

  before(async () => {
    sdk = await getSdk();
    await sdk.spend(1e24, TX_KEYS.publicKey);
    await executeProgram(accountProgram, ['save', WALLET_NAME, '--password', 'test', TX_KEYS.secretKey, '--overwrite']);
  });

  async function signAndPost(tx) {
    const { signedTx } = await executeProgram(
      accountProgram,
      ['sign', WALLET_NAME, tx, '--password', 'test', '--json', '--networkId', networkId],
    );
    const { blockHeight } = parseBlock(await executeProgram(chainProgram, ['broadcast', signedTx]));
    expect(+blockHeight).to.be.above(0);
    nonce += 1;
  }

  it('Build spend tx offline and send on-chain', async () => {
    const amount = 100;
    const { tx } = await executeTx(['spend', TX_KEYS.publicKey, TX_KEYS.publicKey, amount, nonce, '--json']);
    await signAndPost(tx);
  });

  it('Build preclaim tx offline and send on-chain', async () => {
    const { tx, salt: nameSalt } = await executeTx(['name-preclaim', TX_KEYS.publicKey, name, nonce, '--json']);
    salt = nameSalt;
    await signAndPost(tx);
  });

  it('Build claim tx offline and send on-chain', async () => {
    const { tx } = await executeTx(['name-claim', TX_KEYS.publicKey, salt, name, nonce, '--json']);
    await signAndPost(tx);
    nameId = (await sdk.aensQuery(name)).id;
  }).timeout(10000);

  it('Build update tx offline and send on-chain', async () => {
    const { tx } = await executeTx(['name-update', TX_KEYS.publicKey, nameId, nonce, TX_KEYS.publicKey, '--json']);
    await signAndPost(tx);
  });

  it('Build transfer tx offline and send on-chain', async () => {
    const { tx } = await executeTx(['name-transfer', TX_KEYS.publicKey, TX_KEYS.publicKey, nameId, nonce, '--json']);
    await signAndPost(tx);
  });

  it('Build revoke tx offline and send on-chain', async () => {
    const { tx } = await executeTx(['name-revoke', TX_KEYS.publicKey, nameId, nonce, '--json']);
    await signAndPost(tx);
  });

  let contract;
  it('Build contract create tx offline and send on-chain', async () => {
    contract = await sdk.getContractInstance({ source: testContract });
    const { tx, contractId: cId } = await executeTx([
      'contract-deploy',
      TX_KEYS.publicKey,
      await contract.compile(),
      // eslint-disable-next-line no-underscore-dangle
      contract.calldata.encode(contract._name, 'init', []),
      nonce,
      '--json',
    ]);
    contractId = cId;
    await signAndPost(tx);
  });

  it('Build contract call tx offline and send on-chain', async () => {
    // eslint-disable-next-line no-underscore-dangle
    const callData = contract.calldata.encode(contract._name, 'test', ['1', '2']);
    const { tx } = await executeTx(['contract-call', TX_KEYS.publicKey, contractId, callData, nonce, '--json']);
    await signAndPost(tx);
  });

  it('Build oracle register tx offline and send on-chain', async () => {
    const { tx } = await executeTx(['oracle-register', TX_KEYS.publicKey, '{city: "str"}', '{tmp:""num}', nonce, '--json']);
    await signAndPost(tx);
  });

  it('Build oracle extend  tx offline and send on-chain', async () => {
    const oracleCurrentTtl = await sdk.api.getOracleByPubkey(oracleId);
    const { tx } = await executeTx(['oracle-extend', TX_KEYS.publicKey, oracleId, 100, nonce, '--json']);
    await signAndPost(tx);
    const oracleTtl = await sdk.api.getOracleByPubkey(oracleId);
    const isExtended = +oracleTtl.ttl === +oracleCurrentTtl.ttl + 100;
    isExtended.should.be.equal(true);
  });

  it('Build oracle post query tx offline and send on-chain', async () => {
    const { tx } = await executeTx(['oracle-post-query', TX_KEYS.publicKey, oracleId, '{city: "Berlin"}', nonce, '--json']);
    await signAndPost(tx);
    const { oracleQueries: queries } = await sdk.api.getOracleQueriesByPubkey(oracleId);
    queryId = queries[0].id;
    const hasQuery = !!queries.length;
    hasQuery.should.be.equal(true);
  });

  it('Build oracle respond tx offline and send on-chain', async () => {
    const response = '{tmp: 10}';
    const { tx } = await executeTx(['oracle-respond', TX_KEYS.publicKey, oracleId, queryId, response, nonce, '--json']);
    await signAndPost(tx);
    const { oracleQueries: queries } = await sdk.api.getOracleQueriesByPubkey(oracleId);
    const responseQuery = decode(queries[0].response).toString();
    const hasQuery = !!queries.length;
    hasQuery.should.be.equal(true);
    response.should.be.equal(responseQuery);
  });
});
