import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { generateKeyPair } from '@aeternity/aepp-sdk';
import { getSdk, executeProgram, WALLET_NAME } from './index.js';
import spendProgram from '../src/commands/spend.js';

const executeSpend = (args) => (
  executeProgram(spendProgram, [WALLET_NAME, '--password', 'test', ...args])
);

describe('Spend', () => {
  let sdk;

  before(async () => {
    sdk = await getSdk();
  });

  it('spends', async () => {
    const amount = 100;
    const { publicKey } = generateKeyPair();
    const resJson = await executeSpend([publicKey, amount, '--json']);
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

    const res = await executeSpend([publicKey, amount]);
    const lineEndings = res.split('\n').map((l) => l.split(' ').at(-1));
    expect(res).to.be.equal(`
Transaction mined
Tx hash _________________________________ ${lineEndings[1]}
Block hash ______________________________ ${lineEndings[2]}
Block height ____________________________ ${lineEndings[3]}
Signatures ______________________________ ${lineEndings[4]}
Tx Type _________________________________ SpendTx
Sender account __________________________ ${resJson.tx.senderId}
Recipient account _______________________ ${resJson.tx.recipientId}
Amount __________________________________ 100
Payload _________________________________ ba_Xfbg4g==
Fee _____________________________________ ${resJson.tx.fee}
Nonce ___________________________________ 2
TTL _____________________________________ ${lineEndings[12]}
Version _________________________________ 1
    `.trim());
  });

  it('spends in ae', async () => {
    const receiverKeys = generateKeyPair();
    const { tx: { fee } } = await executeSpend([
      '--json', receiverKeys.publicKey, '1ae', '--fee', '0.02ae',
    ]);
    expect(await sdk.getBalance(receiverKeys.publicKey)).to.be.equal('1000000000000000000');
    expect(fee).to.be.equal('20000000000000000');
  });

  it('spends percent of balance', async () => {
    const { publicKey } = generateKeyPair();
    const balanceBefore = await sdk.getBalance(sdk.address);
    await executeSpend([publicKey, '42%']);
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
    await executeSpend([address, 100]);
    expect(await sdk.getBalance(address)).to.be.equal('100');
  });
});
