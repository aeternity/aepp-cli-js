import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { generateKeyPair } from '@aeternity/aepp-sdk';
import {
  getSdk, executeProgram, WALLET_NAME, expectToMatchLines,
} from './index.js';

const executeSpend = executeProgram.bind(null, 'spend', WALLET_NAME, '--password', 'test');

describe('Spend', () => {
  let sdk;

  before(async () => {
    sdk = await getSdk();
  });

  it('spends', async () => {
    const amount = 100;
    const { publicKey } = generateKeyPair();
    const resJson = await executeSpend(publicKey, amount, '--json');
    const receiverBalance = await sdk.getBalance(publicKey);
    expect(+receiverBalance).to.be.equal(amount);

    expect(resJson.tx.fee).to.be.a('string');
    expect(resJson).to.eql({
      blockHash: resJson.blockHash,
      blockHeight: resJson.blockHeight,
      encodedTx: resJson.encodedTx,
      hash: resJson.hash,
      rawTx: resJson.rawTx,
      signatures: [resJson.signatures[0]],
      tx: {
        amount: '100',
        fee: resJson.tx.fee,
        nonce: 1,
        payload: 'ba_Xfbg4g==',
        recipientId: resJson.tx.recipientId,
        senderId: resJson.tx.senderId,
        ttl: resJson.tx.ttl,
        type: 'SpendTx',
        version: 1,
      },
    });

    const res = await executeSpend(publicKey, amount);
    expectToMatchLines(res, [
      'Transaction mined',
      /Transaction hash ________________________ th_\w+/,
      /Block hash ______________________________ \w+/,
      /Block height ____________________________ \d+/,
      /Signatures ______________________________ .+/,
      'Transaction type ________________________ SpendTx (ver. 1)',
      `Sender address __________________________ ${resJson.tx.senderId}`,
      `Recipient address _______________________ ${resJson.tx.recipientId}`,
      'Amount __________________________________ 0.0000000000000001ae',
      'Payload _________________________________ ba_Xfbg4g==',
      /Fee _____________________________________ 0.000016\d+ae/,
      'Nonce ___________________________________ 2',
      /TTL _____________________________________ \d+/,
    ]);
  });

  it('spends in ae', async () => {
    const receiverKeys = generateKeyPair();
    const { tx: { fee } } = await executeSpend('--json', receiverKeys.publicKey, '1ae', '--fee', '0.02ae');
    expect(await sdk.getBalance(receiverKeys.publicKey)).to.be.equal('1000000000000000000');
    expect(fee).to.be.equal('20000000000000000');
  });

  it('spends percent of balance', async () => {
    const { publicKey } = generateKeyPair();
    const balanceBefore = await sdk.getBalance(sdk.address);
    await executeSpend(publicKey, '42%');
    expect(+await sdk.getBalance(publicKey)).to.be.equal(balanceBefore * 0.42);
  });

  it('spends to contract', async () => {
    const contract = await sdk.initializeContract({
      sourceCode: ''
        + 'payable contract Main =\n'
        + '  record state = { key: int }\n'
        + '  entrypoint init() = { key = 0 }\n',
    });
    const { address } = await contract.$deploy([]);
    await executeSpend(address, 100);
    expect(await sdk.getBalance(address)).to.be.equal('100');
  });
});
