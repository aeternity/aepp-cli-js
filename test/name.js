import { generateKeyPair, MemoryAccount } from '@aeternity/aepp-sdk';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import {
  executeProgram, randomName, getSdk, WALLET_NAME,
} from './index.js';
import nameProgram from '../src/commands/name.js';
import inspectProgram from '../src/commands/inspect.js';
import accountProgram from '../src/commands/account.js';

const executeName = (args) => executeProgram(nameProgram, args);
const executeInspect = (args) => executeProgram(inspectProgram, args);
const executeAccount = (args) => executeProgram(accountProgram, args);

describe('AENS Module', () => {
  const { publicKey } = generateKeyPair();
  const name = randomName(12);
  const name2 = randomName(13);
  let sdk;
  let salt;

  before(async () => {
    sdk = await getSdk();
  });

  it('Full claim', async () => {
    const updateTx = await executeName([
      'full-claim',
      WALLET_NAME,
      '--password',
      'test',
      randomName(13),
      '--json',
    ]);

    updateTx.blockHeight.should.be.gt(0);
    const pointer = updateTx.pointers.find(({ id }) => id === sdk.address);
    expect(pointer).to.be.eql({ id: sdk.address, key: 'account_pubkey' });
  }).timeout(10000);

  it('Full claim with options', async () => {
    const updateTx = await executeName([
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
    ]);

    updateTx.blockHeight.should.be.gt(0);
    updateTx.tx.nameTtl.should.be.equal(50);
    updateTx.tx.clientTtl.should.be.equal(50);
    const pointer = updateTx.pointers.find(({ id }) => id === sdk.address);
    expect(pointer).to.be.eql({ id: sdk.address, key: 'account_pubkey' });
  }).timeout(10000);

  it('Pre Claim Name', async () => {
    const preClaim = await executeName([
      'pre-claim',
      WALLET_NAME,
      '--password',
      'test',
      name2,
      '--json',
    ]);
    const nameResult = await executeInspect([name2, '--json']);
    salt = preClaim.salt;

    preClaim.blockHeight.should.be.gt(0);
    preClaim.salt.should.be.a('number');
    preClaim.commitmentId.should.contain('cm');
    nameResult.name.should.be.equal(name2);
    nameResult.status.should.equal('AVAILABLE');
  }).timeout(4000);

  it('Claim Name', async () => {
    const claim = await executeName([
      'claim',
      WALLET_NAME,
      '--password',
      'test',
      name2,
      salt,
      '--json',
    ]);
    const nameResult = await executeInspect([name2, '--json']);

    claim.blockHeight.should.be.gt(0);
    claim.pointers.length.should.be.equal(0);
    nameResult.status.should.equal('CLAIMED');
  }).timeout(10000);

  it('Update Name', async () => {
    const updateTx = await executeName([
      'update',
      WALLET_NAME,
      name2,
      publicKey,
      '--password',
      'test',
      '--json',
    ]);
    const nameResult = await executeInspect([name2, '--json']);

    updateTx.blockHeight.should.be.gt(0);
    const isUpdatedNode = !!nameResult.pointers.find(
      ({ id }) => id === publicKey,
    );
    isUpdatedNode.should.be.equal(true);
    nameResult.status.should.equal('CLAIMED');
  });

  it('extend name ttl', async () => {
    const height = await sdk.getHeight();
    const extendTx = await executeName([
      'extend',
      WALLET_NAME,
      name2,
      50,
      '--password',
      'test',
      '--json',
    ]);

    const nameResult = await executeInspect([name2, '--json']);
    const isExtended = nameResult.ttl - 50 >= height;
    isExtended.should.be.equal(true);
    extendTx.blockHeight.should.be.gt(0);
    nameResult.status.should.equal('CLAIMED');
  });

  it('Fail spend by name on invalid input', async () => {
    const amount = 100000009;
    await executeAccount([
      'spend',
      WALLET_NAME,
      '--password',
      'test',
      'sdasdaasdas',
      amount,
      '--json',
    ]).should.be.rejectedWith('Invalid name or address');
  });

  it('Spend by name', async () => {
    const amount = 100000009;
    const { tx: { recipientId } } = await executeAccount([
      'spend',
      WALLET_NAME,
      '--password',
      'test',
      name2,
      amount,
      '--json',
    ]);

    const nameObject = await sdk.aensQuery(name2);
    recipientId.should.be.equal(nameObject.id);
    const balance = await sdk.getBalance(publicKey);
    balance.should.be.equal(`${amount}`);
  });

  it('Transfer name', async () => {
    const keypair = generateKeyPair();

    const transferTx = await executeName([
      'transfer',
      WALLET_NAME,
      name2,
      keypair.publicKey,
      '--password',
      'test',
      '--json',
    ]);

    transferTx.blockHeight.should.be.gt(0);
    await sdk.spend(1, keypair.publicKey, { denomination: 'ae' });
    const claim2 = await sdk.aensQuery(name2);
    const transferBack = await claim2
      .transfer(sdk.address, { onAccount: new MemoryAccount(keypair.secretKey) });
    transferBack.blockHeight.should.be.gt(0);
  });

  it('Revoke Name', async () => {
    const revoke = await executeName([
      'revoke',
      WALLET_NAME,
      '--password',
      'test',
      name2,
      '--json',
    ]);

    const nameResult = await executeInspect([name2, '--json']);

    revoke.blockHeight.should.be.gt(0);
    nameResult.status.should.equal('AVAILABLE');
  });

  describe('Name Auction', () => {
    const nameFee = '3665700000000000000';

    it('Open auction', async () => {
      const onAccount = MemoryAccount.generate();
      await sdk.spend('30000000000000000000000', onAccount.address);
      const preclaim = await sdk.aensPreclaim(name, { onAccount });
      const claim = await preclaim.claim({ onAccount });
      claim.blockHeight.should.be.gt(0);
    }).timeout(10000);

    it('Make bid', async () => {
      const bid = await executeName([
        'bid',
        WALLET_NAME,
        '--password',
        'test',
        name,
        nameFee,
        '--json',
      ]);

      bid.tx.nameSalt.should.be.equal(0);
      bid.tx.nameFee.should.be.equal(nameFee);
    });

    it('Fail on open again', async () => {
      const preClaim = await executeName([
        'pre-claim',
        WALLET_NAME,
        '--password',
        'test',
        name,
        '--json',
      ]);
      await executeName([
        'claim',
        WALLET_NAME,
        '--password',
        'test',
        name,
        preClaim.salt,
        '--json',
      ]).should.be.rejectedWith('error: Transaction not found');
    }).timeout(15000);
  });
});
