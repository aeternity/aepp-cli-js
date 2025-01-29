import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { Contract, Encoding, MemoryAccount } from '@aeternity/aepp-sdk';
import { getSdk, executeProgram, WALLET_NAME } from './index.js';
import { toBeAbove0, toBeEncoded, expectToMatchLines, toMatch } from './utils.js';

const executeSpend = executeProgram.bind(null, 'spend', WALLET_NAME, '--password', 'test');

describe('Spend', () => {
  let aeSdk;

  before(async () => {
    aeSdk = await getSdk();
  });

  it('spends', async () => {
    const amount = 100;
    const { address } = MemoryAccount.generate();
    const resJson = await executeSpend(address, amount, '--json');
    const receiverBalance = await aeSdk.getBalance(address);
    expect(+receiverBalance).to.be.equal(amount);

    expect(resJson.tx.fee).to.be.a('string');
    expect(resJson).to.eql({
      blockHash: toBeEncoded(resJson.blockHash, Encoding.MicroBlockHash),
      blockHeight: toBeAbove0(resJson.blockHeight),
      encodedTx: toBeEncoded(resJson.encodedTx, Encoding.Transaction),
      hash: toBeEncoded(resJson.hash, Encoding.TxHash),
      rawTx: toBeEncoded(resJson.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(resJson.signatures[0], Encoding.Signature)],
      tx: {
        amount: '100',
        fee: toMatch(resJson.tx.fee, /1\d{13}/),
        nonce: 1,
        payload: 'ba_Xfbg4g==',
        recipientId: address,
        senderId: aeSdk.address,
        ttl: toBeAbove0(resJson.tx.ttl),
        type: 'SpendTx',
        version: 1,
      },
    });

    const res = await executeSpend(address, amount);
    expectToMatchLines(res, [
      'Transaction mined',
      /Transaction hash   th_\w+/,
      /Block hash         mh_\w+/,
      /Block height       \d+ \(about now\)/,
      /Signatures         \["sg_\w+"\]/,
      'Transaction type   SpendTx (ver. 1)',
      `Sender address     ${aeSdk.address}`,
      `Recipient address  ${address}`,
      'Amount             0.0000000000000001ae',
      'Payload            ba_Xfbg4g==',
      /Fee                0.000016\d+ae/,
      'Nonce              2',
      /TTL                \d+ \(in [56] minutes\)/,
    ]);
  });

  it('spends in ae', async () => {
    const { address } = MemoryAccount.generate();
    const {
      tx: { fee },
    } = await executeSpend('--json', address, '1ae', '--fee', '0.02ae');
    expect(await aeSdk.getBalance(address)).to.be.equal('1000000000000000000');
    expect(fee).to.be.equal('20000000000000000');
  });

  it('spends percent of balance', async () => {
    const { address } = MemoryAccount.generate();
    const balanceBefore = await aeSdk.getBalance(aeSdk.address);
    await executeSpend(address, '42%');
    expect(+(await aeSdk.getBalance(address))).to.be.equal(balanceBefore * 0.42);
  });

  it('spends to contract', async () => {
    const contract = await Contract.initialize({
      ...aeSdk.getContext(),
      sourceCode:
        'payable contract Main =\n' +
        '  record state = { key: int }\n' +
        '  entrypoint init() = { key = 0 }\n',
    });
    const { address } = await contract.$deploy([]);
    await executeSpend(address, 100);
    expect(await aeSdk.getBalance(address)).to.be.equal('100');
  });
});
