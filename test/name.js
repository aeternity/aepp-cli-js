import { generateKeyPair, MemoryAccount } from '@aeternity/aepp-sdk';
import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { executeProgram, getSdk, WALLET_NAME } from './index.js';
import { randomName } from './utils.js';

const executeName = executeProgram.bind(null, 'name');
const executeInspect = executeProgram.bind(null, 'inspect');
const executeSpend = executeProgram.bind(null, 'spend');

describe('AENS Module', () => {
  const { publicKey } = generateKeyPair();
  const name = randomName(12);
  const name2 = randomName(13);
  let aeSdk;
  let salt;

  before(async () => {
    aeSdk = await getSdk();
  });

  it('Full claim', async () => {
    const updateTx = await executeName(
      'full-claim',
      WALLET_NAME,
      '--password',
      'test',
      randomName(13),
      '--json',
    );

    updateTx.blockHeight.should.be.gt(0);
    const pointer = updateTx.pointers.find(({ id }) => id === aeSdk.address);
    expect(pointer).to.be.eql({
      id: aeSdk.address,
      key: 'account_pubkey',
      encoded_key: 'ba_YWNjb3VudF9wdWJrZXn8jckR',
    });
  }).timeout(10000);

  it('Full claim with options', async () => {
    const updateTx = await executeName(
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

    updateTx.blockHeight.should.be.gt(0);
    updateTx.tx.nameTtl.should.be.equal(50);
    updateTx.tx.clientTtl.should.be.equal(50);
    const pointer = updateTx.pointers.find(({ id }) => id === aeSdk.address);
    expect(pointer).to.be.eql({
      id: aeSdk.address,
      key: 'account_pubkey',
      encoded_key: 'ba_YWNjb3VudF9wdWJrZXn8jckR',
    });
  }).timeout(10000);

  it('Pre Claim Name', async () => {
    const preClaim = await executeName(
      'pre-claim',
      WALLET_NAME,
      '--password',
      'test',
      name2,
      '--json',
    );
    const nameResult = await executeInspect(name2, '--json');
    salt = preClaim.salt;

    preClaim.blockHeight.should.be.gt(0);
    preClaim.salt.should.be.a('number');
    preClaim.commitmentId.should.contain('cm');
    nameResult.id.should.satisfy((id) => id.startsWith('nm_'));
    nameResult.status.should.equal('AVAILABLE');
  }).timeout(4000);

  it('Claim Name', async () => {
    const claim = await executeName(
      'claim',
      WALLET_NAME,
      '--password',
      'test',
      name2,
      salt,
      '--json',
    );
    const nameResult = await executeInspect(name2, '--json');

    claim.blockHeight.should.be.gt(0);
    claim.pointers.length.should.be.equal(0);
    nameResult.status.should.equal('CLAIMED');
  }).timeout(10000);

  it('Update Name', async () => {
    const updateTx = await executeName(
      'update',
      WALLET_NAME,
      name2,
      publicKey,
      '--password',
      'test',
      '--json',
    );
    const nameResult = await executeInspect(name2, '--json');

    updateTx.blockHeight.should.be.gt(0);
    const isUpdatedNode = !!nameResult.pointers.find(({ id }) => id === publicKey);
    isUpdatedNode.should.be.equal(true);
    nameResult.status.should.equal('CLAIMED');
  });

  it('extend name ttl', async () => {
    const height = await aeSdk.getHeight();
    const extendTx = await executeName(
      'extend',
      WALLET_NAME,
      name2,
      50,
      '--password',
      'test',
      '--json',
    );
    expect(extendTx.blockHeight - height).within(0, 3);
    const nameResult = await executeInspect(name2, '--json');
    expect(nameResult.ttl - extendTx.blockHeight).to.be.equal(50);
    expect(nameResult.status).to.equal('CLAIMED');
  });

  it('extend name with max ttl', async () => {
    const extendTx = await executeName(
      'extend',
      WALLET_NAME,
      name2,
      '--password',
      'test',
      '--json',
    );
    const nameResult = await executeInspect(name2, '--json');
    expect(nameResult.ttl - extendTx.blockHeight).to.be.equal(180000);
  });

  it('Fail spend by name on invalid input', async () => {
    const amount = 100000009;
    await executeSpend(
      WALLET_NAME,
      '--password',
      'test',
      'sdasdaasdas',
      amount,
      '--json',
    ).should.be.rejectedWith('Invalid name or address');
  });

  it('Spend by name', async () => {
    const amount = 100000009;
    const {
      tx: { recipientId },
    } = await executeSpend(WALLET_NAME, '--password', 'test', name2, amount, '--json');

    const nameObject = await aeSdk.aensQuery(name2);
    recipientId.should.be.equal(nameObject.id);
    const balance = await aeSdk.getBalance(publicKey);
    balance.should.be.equal(`${amount}`);
  });

  it('Transfer name', async () => {
    const keypair = generateKeyPair();

    const transferTx = await executeName(
      'transfer',
      WALLET_NAME,
      name2,
      keypair.publicKey,
      '--password',
      'test',
      '--json',
    );

    transferTx.blockHeight.should.be.gt(0);
    await aeSdk.spend(1, keypair.publicKey, { denomination: 'ae' });
    const claim2 = await aeSdk.aensQuery(name2);
    const transferBack = await claim2.transfer(aeSdk.address, {
      onAccount: new MemoryAccount(keypair.secretKey),
    });
    transferBack.blockHeight.should.be.gt(0);
  });

  it('Revoke Name', async () => {
    const revoke = await executeName('revoke', WALLET_NAME, '--password', 'test', name2, '--json');

    const nameResult = await executeInspect(name2, '--json');

    revoke.blockHeight.should.be.gt(0);
    nameResult.status.should.equal('REVOKED');
  });

  it("can't claim revoked name", async () => {
    await executeName(
      'pre-claim',
      WALLET_NAME,
      '--password',
      'test',
      name2,
      '--json',
    ).should.be.rejectedWith('AENS name is REVOKED and cannot be preclaimed');
  });

  describe('Name Auction', () => {
    const nameFee = '3665700000000000000';

    it('Open auction', async () => {
      const onAccount = MemoryAccount.generate();
      await aeSdk.spend(5e18, onAccount.address);
      const preclaim = await aeSdk.aensPreclaim(name, { onAccount });
      const claim = await preclaim.claim({ onAccount });
      claim.blockHeight.should.be.gt(0);
    }).timeout(10000);

    it('Make bid', async () => {
      const bid = await executeName(
        'bid',
        WALLET_NAME,
        '--password',
        'test',
        name,
        nameFee,
        '--json',
      );

      bid.tx.nameSalt.should.be.equal(0);
      bid.tx.nameFee.should.be.equal(nameFee);
    });

    it('Fail on open again', async () => {
      await executeName(
        'pre-claim',
        WALLET_NAME,
        '--password',
        'test',
        name,
        '--json',
      ).should.be.rejectedWith('AENS name is AUCTION and cannot be preclaimed');
    });
  });
});
