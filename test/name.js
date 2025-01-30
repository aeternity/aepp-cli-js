import { Encoding, MemoryAccount, Name } from '@aeternity/aepp-sdk';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { executeProgram, getSdk, WALLET_NAME } from './index.js';
import { expectToMatchLines, randomName, toBeAbove0, toBeEncoded, toMatch } from './utils.js';

const executeName = executeProgram.bind(null, 'name');
const executeSpend = executeProgram.bind(null, 'spend');

describe('AENS Module', () => {
  const { address } = MemoryAccount.generate();
  let aeSdk;

  before(async () => {
    aeSdk = await getSdk();
  });

  it('full claims', async () => {
    const res = await executeName('full-claim', WALLET_NAME, '--password', 'test', randomName(13));

    expectToMatchLines(res, [
      /Transaction hash        th_\w+/,
      /Block hash              mh_\w+/,
      /Block height            \d+ \(about now\)/,
      /Signatures              \["sg_\w+"\]/,
      'Transaction type        NameUpdateTx (ver. 1)',
      `Account address         ${aeSdk.address}`,
      /Name ID                 nm_\w+/,
      `Name TTL                180000 (1 year)`,
      `Pointer account_pubkey  ${aeSdk.address}`,
      `Client TTL              3600 (1 hour)`,
      /Fee                     0.000017\d+ae/,
      /Nonce                   \d+/,
      /TTL                     \d+ \(in [56] minutes\)/,
    ]);
  });

  it('full claims with options as json', async () => {
    const res = await executeName(
      'full-claim',
      WALLET_NAME,
      '--password',
      'test',
      randomName(13),
      '--json',
      '--nameTtl',
      50,
      '--nameFee',
      '3865700000000000000',
      '--clientTtl',
      50,
    );

    expect(res).to.be.eql({
      tx: {
        fee: toMatch(res.tx.fee, /17\d{12}/),
        ttl: toBeAbove0(res.tx.ttl),
        nonce: toBeAbove0(res.tx.nonce),
        accountId: aeSdk.address,
        nameId: toBeEncoded(res.tx.nameId, Encoding.NameId),
        nameTtl: 50,
        pointers: [
          {
            key: 'account_pubkey',
            id: aeSdk.address,
            encodedKey: 'ba_YWNjb3VudF9wdWJrZXn8jckR',
          },
        ],
        clientTtl: 50,
        version: 1,
        type: 'NameUpdateTx',
      },
      blockHeight: toBeAbove0(res.blockHeight),
      blockHash: toBeEncoded(res.blockHash, Encoding.MicroBlockHash),
      hash: toBeEncoded(res.hash, Encoding.TxHash),
      encodedTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(res.signatures[0], Encoding.Signature)],
      rawTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
      id: toBeEncoded(res.tx.nameId, Encoding.NameId),
      owner: aeSdk.address,
      ttl: res.blockHeight + res.tx.nameTtl,
      pointers: [
        {
          key: 'account_pubkey',
          id: aeSdk.address,
          encodedKey: 'ba_YWNjb3VudF9wdWJrZXn8jckR',
        },
      ],
    });
  });

  const name1 = randomName(13);
  let salt1;
  it('preclaims', async () => {
    const res = await executeName('pre-claim', WALLET_NAME, '--password', 'test', name1);

    expectToMatchLines(res, [
      /Transaction hash  th_\w+/,
      /Block hash        mh_\w+/,
      /Block height      \d+ \(about now\)/,
      /Signatures        \["sg_\w+"\]/,
      'Transaction type  NamePreclaimTx (ver. 1)',
      `Account address   ${aeSdk.address}`,
      /Name salt         \d+/,
      /Commitment        cm_\w+/,
      /Fee               0.000016\d+ae/,
      /Nonce             \d+/,
      /TTL               \d+ \(in [56] minutes\)/,
    ]);
    salt1 = res.match(/Name salt\s+(\d+)/)[1];
  });

  const name2 = randomName(13);
  let salt2;
  it('preclaims as json', async () => {
    const res = await executeName('pre-claim', WALLET_NAME, '--password', 'test', name2, '--json');

    expect(res).to.be.eql({
      blockHash: toBeEncoded(res.blockHash, Encoding.MicroBlockHash),
      blockHeight: toBeAbove0(res.blockHeight),
      hash: toBeEncoded(res.hash, Encoding.TxHash),
      encodedTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(res.signatures[0], Encoding.Signature)],
      tx: {
        fee: toMatch(res.tx.fee, /16\d{12}/),
        ttl: toBeAbove0(res.tx.ttl),
        nonce: toBeAbove0(res.tx.nonce),
        accountId: aeSdk.address,
        commitmentId: toBeEncoded(res.tx.commitmentId, Encoding.CommitmentId),
        version: 1,
        type: 'NamePreclaimTx',
      },
      rawTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
      salt: toBeAbove0(res.salt),
    });
    salt2 = res.salt;
  });

  it('claims', async () => {
    const res = await executeName('claim', WALLET_NAME, '--password', 'test', name1, salt1);

    expectToMatchLines(res, [
      /Transaction hash  th_\w+/,
      /Block hash        mh_\w+/,
      /Block height      \d+ \(about now\)/,
      /Signatures        \["sg_\w+"\]/,
      'Transaction type  NameClaimTx (ver. 2)',
      `Account address   ${aeSdk.address}`,
      `Name              ${name1}`,
      'Name fee          1.7711ae',
      `Name salt         ${salt1}`,
      'Pointers          N/A',
      /Fee               0.000016\d+ae/,
      /Nonce             \d+/,
      /TTL               \d+ \(in [56] minutes\)/,
    ]);
  });

  it('claims as json', async () => {
    const res = await executeName(
      'claim',
      WALLET_NAME,
      '--password',
      'test',
      name2,
      salt2,
      '--json',
    );

    expect(res).to.be.eql({
      blockHash: toBeEncoded(res.blockHash, Encoding.MicroBlockHash),
      blockHeight: toBeAbove0(res.blockHeight),
      hash: toBeEncoded(res.hash, Encoding.TxHash),
      encodedTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(res.signatures[0], Encoding.Signature)],
      tx: {
        fee: toMatch(res.tx.fee, /16\d{12}/),
        ttl: toBeAbove0(res.tx.ttl),
        nonce: toBeAbove0(res.tx.nonce),
        accountId: aeSdk.address,
        name: name2,
        nameSalt: salt2,
        nameFee: '1771100000000000000',
        version: 2,
        type: 'NameClaimTx',
      },
      rawTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
      id: toBeEncoded(res.id, Encoding.NameId),
      owner: aeSdk.address,
      ttl: res.blockHeight + 180000,
      pointers: [],
    });
  });

  it('updates', async () => {
    const res = await executeName('update', WALLET_NAME, name1, address, '--password', 'test');

    expectToMatchLines(res, [
      /Transaction hash        th_\w+/,
      /Block hash              mh_\w+/,
      /Block height            \d+ \(about now\)/,
      /Signatures              \["sg_\w+"\]/,
      'Transaction type        NameUpdateTx (ver. 1)',
      `Account address         ${aeSdk.address}`,
      /Name ID                 nm_\w+/,
      'Name TTL                180000 (1 year)',
      `Pointer account_pubkey  ${address}`,
      'Client TTL              3600 (1 hour)',
      /Fee                     0.000017\d+ae/,
      /Nonce                   \d+/,
      /TTL                     \d+ \(in [56] minutes\)/,
    ]);
  });

  it('updates as json', async () => {
    const res = await executeName(
      'update',
      WALLET_NAME,
      name2,
      address,
      '--password',
      'test',
      '--json',
    );

    expect(res).to.be.eql({
      blockHash: toBeEncoded(res.blockHash, Encoding.MicroBlockHash),
      blockHeight: toBeAbove0(res.blockHeight),
      hash: toBeEncoded(res.hash, Encoding.TxHash),
      encodedTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(res.signatures[0], Encoding.Signature)],
      tx: {
        fee: toMatch(res.tx.fee, /17\d{12}/),
        ttl: toBeAbove0(res.tx.ttl),
        nonce: toBeAbove0(res.tx.nonce),
        accountId: aeSdk.address,
        nameId: toBeEncoded(res.tx.nameId, Encoding.NameId),
        nameTtl: 180000,
        pointers: [
          {
            key: 'account_pubkey',
            id: address,
            encodedKey: 'ba_YWNjb3VudF9wdWJrZXn8jckR',
          },
        ],
        clientTtl: 3600,
        version: 1,
        type: 'NameUpdateTx',
      },
      rawTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
    });
  });

  it('extends', async () => {
    const res = await executeName('extend', WALLET_NAME, name1, 50, '--password', 'test');

    expectToMatchLines(res, [
      /Transaction hash        th_\w+/,
      /Block hash              mh_\w+/,
      /Block height            \d+ \(about now\)/,
      /Signatures              \["sg_\w+"\]/,
      'Transaction type        NameUpdateTx (ver. 1)',
      `Account address         ${aeSdk.address}`,
      /Name ID                 nm_\w+/,
      'Name TTL                50 (2 hours)',
      `Pointer account_pubkey  ${address}`,
      'Client TTL              3600 (1 hour)',
      /Fee                     0.000017\d+ae/,
      /Nonce                   \d+/,
      /TTL                     \d+ \(in [56] minutes\)/,
    ]);
  });

  it('extends as json', async () => {
    const res = await executeName('extend', WALLET_NAME, name2, 50, '--password', 'test', '--json');

    expect(res).to.be.eql({
      blockHash: toBeEncoded(res.blockHash, Encoding.MicroBlockHash),
      blockHeight: toBeAbove0(res.blockHeight),
      hash: toBeEncoded(res.hash, Encoding.TxHash),
      encodedTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(res.signatures[0], Encoding.Signature)],
      tx: {
        fee: toMatch(res.tx.fee, /17\d{12}/),
        ttl: toBeAbove0(res.tx.ttl),
        nonce: toBeAbove0(res.tx.nonce),
        accountId: aeSdk.address,
        nameId: toBeEncoded(res.tx.nameId, Encoding.NameId),
        nameTtl: 50,
        pointers: [
          {
            key: 'account_pubkey',
            id: address,
            encodedKey: 'ba_YWNjb3VudF9wdWJrZXn8jckR',
          },
        ],
        clientTtl: 3600,
        version: 1,
        type: 'NameUpdateTx',
      },
      rawTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
    });
  });

  it('extends with max ttl as json', async () => {
    const res = await executeName('extend', WALLET_NAME, name2, '--password', 'test', '--json');

    expect(res).to.be.eql({
      blockHash: toBeEncoded(res.blockHash, Encoding.MicroBlockHash),
      blockHeight: toBeAbove0(res.blockHeight),
      hash: toBeEncoded(res.hash, Encoding.TxHash),
      encodedTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(res.signatures[0], Encoding.Signature)],
      tx: {
        fee: toMatch(res.tx.fee, /17\d{12}/),
        ttl: toBeAbove0(res.tx.ttl),
        nonce: toBeAbove0(res.tx.nonce),
        accountId: aeSdk.address,
        nameId: toBeEncoded(res.tx.nameId, Encoding.NameId),
        nameTtl: 180000,
        pointers: [
          {
            key: 'account_pubkey',
            id: address,
            encodedKey: 'ba_YWNjb3VudF9wdWJrZXn8jckR',
          },
        ],
        clientTtl: 3600,
        version: 1,
        type: 'NameUpdateTx',
      },
      rawTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
    });
  });

  it('fails spend by name on invalid input', async () => {
    const amount = 100000009;
    await expect(
      executeSpend(WALLET_NAME, '--password', 'test', 'sdasdaasdas', amount, '--json'),
    ).to.be.rejectedWith('Invalid name or address');
  });

  it('spends by name', async () => {
    const amount = 100000009;
    const res = await executeSpend(WALLET_NAME, '--password', 'test', name2, amount, '--json');

    expect(res).to.be.eql({
      blockHash: toBeEncoded(res.blockHash, Encoding.MicroBlockHash),
      blockHeight: toBeAbove0(res.blockHeight),
      hash: toBeEncoded(res.hash, Encoding.TxHash),
      encodedTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(res.signatures[0], Encoding.Signature)],
      tx: {
        recipientId: toBeEncoded(res.tx.recipientId, Encoding.Name),
        fee: toMatch(res.tx.fee, /16\d{12}/),
        ttl: toBeAbove0(res.tx.ttl),
        nonce: toBeAbove0(res.tx.nonce),
        amount: amount.toString(),
        senderId: aeSdk.address,
        version: 1,
        type: 'SpendTx',
        payload: 'ba_Xfbg4g==',
      },
      rawTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
    });
  });

  it('transfers', async () => {
    const recipient = MemoryAccount.generate();
    const res = await executeName(
      'transfer',
      WALLET_NAME,
      name1,
      recipient.address,
      '--password',
      'test',
    );

    expectToMatchLines(res, [
      /Transaction hash   th_\w+/,
      /Block hash         mh_\w+/,
      /Block height       \d+ \(about now\)/,
      /Signatures         \["sg_\w+"\]/,
      'Transaction type   NameTransferTx (ver. 1)',
      `Account address    ${aeSdk.address}`,
      `Recipient address  ${recipient.address}`,
      /Name ID            nm_\w+/,
      /Fee                0.000017\d+ae/,
      /Nonce              \d+/,
      /TTL                \d+ \(in [56] minutes\)/,
    ]);

    await aeSdk.spend(1e16, recipient.address);
    const name = new Name(name1, { ...aeSdk.getContext(), onAccount: recipient });
    await name.transfer(aeSdk.address);
  });

  it('transfers as json', async () => {
    const recipient = MemoryAccount.generate();
    const res = await executeName(
      'transfer',
      WALLET_NAME,
      name2,
      recipient.address,
      '--password',
      'test',
      '--json',
    );

    expect(res).to.be.eql({
      blockHash: toBeEncoded(res.blockHash, Encoding.MicroBlockHash),
      blockHeight: toBeAbove0(res.blockHeight),
      hash: toBeEncoded(res.hash, Encoding.TxHash),
      encodedTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(res.signatures[0], Encoding.Signature)],
      tx: {
        fee: toMatch(res.tx.fee, /17\d{12}/),
        ttl: toBeAbove0(res.tx.ttl),
        nonce: toBeAbove0(res.tx.nonce),
        accountId: aeSdk.address,
        nameId: toBeEncoded(res.tx.nameId, Encoding.NameId),
        recipientId: recipient.address,
        version: 1,
        type: 'NameTransferTx',
      },
      rawTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
    });

    await aeSdk.spend(1e16, recipient.address);
    const name = new Name(name2, { ...aeSdk.getContext(), onAccount: recipient });
    await name.transfer(aeSdk.address);
  });

  it('revokes', async () => {
    const res = await executeName('revoke', WALLET_NAME, '--password', 'test', name1);
    expectToMatchLines(res, [
      /Transaction hash  th_\w+/,
      /Block hash        mh_\w+/,
      /Block height      \d+ \(about now\)/,
      /Signatures        \["sg_\w+"\]/,
      'Transaction type  NameRevokeTx (ver. 1)',
      `Account address   ${aeSdk.address}`,
      /Name ID           nm_\w+/,
      /Fee               0.000016\d+ae/,
      /Nonce             \d+/,
      /TTL               \d+ \(in [56] minutes\)/,
    ]);
  });

  it('revokes as json', async () => {
    const res = await executeName('revoke', WALLET_NAME, '--password', 'test', name2, '--json');
    expect(res).to.be.eql({
      blockHash: toBeEncoded(res.blockHash, Encoding.MicroBlockHash),
      blockHeight: toBeAbove0(res.blockHeight),
      hash: toBeEncoded(res.hash, Encoding.TxHash),
      encodedTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
      signatures: [toBeEncoded(res.signatures[0], Encoding.Signature)],
      tx: {
        fee: toMatch(res.tx.fee, /16\d{12}/),
        ttl: toBeAbove0(res.tx.ttl),
        nonce: toBeAbove0(res.tx.nonce),
        accountId: aeSdk.address,
        nameId: toBeEncoded(res.tx.nameId, Encoding.NameId),
        version: 1,
        type: 'NameRevokeTx',
      },
      rawTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
    });
  });

  it('fails to claim revoked name', async () => {
    await expect(
      executeName('pre-claim', WALLET_NAME, '--password', 'test', name2),
    ).to.be.rejectedWith('AENS name is REVOKED and cannot be preclaimed');
  });

  describe('Name Auction', () => {
    const name = randomName(12);

    it('starts auction', async () => {
      const res = await executeName('full-claim', WALLET_NAME, '--password', 'test', name);

      expectToMatchLines(res, [
        /Transaction hash  th_\w+/,
        /Block hash        mh_\w+/,
        /Block height      \d+ \(about now\)/,
        /Signatures        \["sg_\w+"\]/,
        'Transaction type  NameClaimTx (ver. 2)',
        `Account address   ${aeSdk.address}`,
        `Name              ${name}`,
        'Name fee          2.8657ae',
        /Name salt         \d+/,
        /Fee               0.000016\d+ae/,
        /Nonce             \d+/,
        /TTL               \d+ \(in [56] minutes\)/,
      ]);
    });

    const bid1 = '3665700000000000000';
    it('bids', async () => {
      const res = await executeName('bid', WALLET_NAME, '--password', 'test', name, bid1);

      expectToMatchLines(res, [
        /Transaction hash  th_\w+/,
        /Block hash        mh_\w+/,
        /Block height      \d+ \(about now\)/,
        /Signatures        \["sg_\w+"\]/,
        'Transaction type  NameClaimTx (ver. 2)',
        `Account address   ${aeSdk.address}`,
        `Name              ${name}`,
        'Name fee          3.6657ae',
        'Name salt         0',
        /Fee               0.000016\d+ae/,
        /Nonce             \d+/,
        /TTL               \d+ \(in [56] minutes\)/,
      ]);
    });

    it('bids as json', async () => {
      const bid2 = (bid1 * 1.06).toString();
      const res = await executeName('bid', WALLET_NAME, '--password', 'test', name, bid2, '--json');

      expect(res).to.be.eql({
        blockHash: toBeEncoded(res.blockHash, Encoding.MicroBlockHash),
        blockHeight: toBeAbove0(res.blockHeight),
        hash: toBeEncoded(res.hash, Encoding.TxHash),
        encodedTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
        signatures: [toBeEncoded(res.signatures[0], Encoding.Signature)],
        tx: {
          fee: toMatch(res.tx.fee, /16\d{12}/),
          ttl: toBeAbove0(res.tx.ttl),
          nonce: toBeAbove0(res.tx.nonce),
          accountId: aeSdk.address,
          name,
          nameFee: bid2,
          nameSalt: 0,
          version: 2,
          type: 'NameClaimTx',
        },
        rawTx: toBeEncoded(res.encodedTx, Encoding.Transaction),
      });
    });

    it('fails to open again', async () => {
      await expect(
        executeName('pre-claim', WALLET_NAME, '--password', 'test', name),
      ).to.be.rejectedWith('AENS name is AUCTION and cannot be preclaimed');
    });
  });
});
