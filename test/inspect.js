import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import {
  AbiVersion, generateKeyPair, produceNameId, Tag, VmVersion,
} from '@aeternity/aepp-sdk';
import { executeProgram, expectToMatchLines, getSdk } from './index.js';

const executeInspect = executeProgram.bind(null, 'inspect');
const executeChain = executeProgram.bind(null, 'chain');

describe('Inspect Module', () => {
  let sdk;

  before(async () => {
    sdk = await getSdk();
  });

  it('Inspect Account', async () => {
    const balance = await sdk.getBalance(sdk.address);
    const resJson = await executeInspect(sdk.address, '--json');
    expect(resJson).to.eql({
      balance,
      hash: sdk.address,
      nonce: resJson.nonce,
      transactions: [],
    });
    const res = await executeInspect(sdk.address);
    expect(res).to.equal(`
Account ID ______________________________ ${sdk.address}
Account balance _________________________ ${balance}
Account nonce ___________________________ ${resJson.nonce}
Pending transactions:
    `.trim());
  });

  it('Inspect Transaction Hash', async () => {
    const recipient = (generateKeyPair()).publicKey;
    const amount = '420';
    const { hash } = await sdk.spend(amount, recipient);
    const resJson = await executeInspect(hash, '--json');
    expect(resJson.tx.fee).to.be.a('string');
    expect(resJson).to.eql({
      blockHash: resJson.blockHash,
      blockHeight: resJson.blockHeight,
      encodedTx: resJson.encodedTx,
      hash: resJson.hash,
      signatures: [resJson.signatures[0]],
      tx: {
        recipientId: recipient,
        senderId: sdk.address,
        amount,
        fee: resJson.tx.fee,
        nonce: resJson.tx.nonce,
        payload: 'ba_Xfbg4g==',
        ttl: resJson.tx.ttl,
        type: 'SpendTx',
        version: 1,
      },
    });
    const res = await executeInspect(hash);
    expectToMatchLines(res, [
      `Transaction hash ________________________ ${resJson.hash}`,
      `Block hash ______________________________ ${resJson.blockHash}`,
      `Block height ____________________________ ${resJson.blockHeight} (about now)`,
      `Signatures ______________________________ ["${resJson.signatures[0]}"]`,
      'Transaction type ________________________ SpendTx',
      `Sender address __________________________ ${sdk.address}`,
      `Recipient address _______________________ ${recipient}`,
      'Amount __________________________________ 0.00000000000000042ae',
      'Payload _________________________________ ba_Xfbg4g==',
      /Fee _____________________________________ 0.000016\d+ae/,
      `Nonce ___________________________________ ${resJson.tx.nonce}`,
      /TTL _____________________________________ \d+ \(in [56] minutes\)/,
      'Version _________________________________ 1',
    ]);
  });

  it('Inspect Transaction', async () => {
    const recipientId = (generateKeyPair()).publicKey;
    const amount = '420';
    const tx = await sdk.buildTx({
      tag: Tag.SpendTx, amount, recipientId, senderId: sdk.address,
    });
    const resJson = await executeInspect(tx, '--json');
    expect(resJson).to.eql({
      amount,
      fee: '16700000000000',
      nonce: resJson.nonce,
      payload: 'ba_Xfbg4g==',
      recipientId,
      senderId: sdk.address,
      tag: Tag.SpendTx,
      ttl: 0,
      version: 1,
    });
    const res = await executeInspect(tx);
    expect(res).to.equal(`
Tx Type _________________________________ SpendTx
tag _____________________________________ 12
version _________________________________ 1
senderId ________________________________ ${sdk.address}
recipientId _____________________________ ${recipientId}
amount __________________________________ 420
fee _____________________________________ 16700000000000
ttl _____________________________________ 0
nonce ___________________________________ ${resJson.nonce}
payload _________________________________ ba_Xfbg4g==
    `.trim());
  });

  it('Inspect Block', async () => {
    const { prevKeyHash } = await executeChain('top', '--json');

    const keyJson = await executeInspect(prevKeyHash, '--json');
    expect(keyJson).to.eql({
      beneficiary: keyJson.beneficiary,
      hash: keyJson.hash,
      height: keyJson.height,
      info: keyJson.info,
      miner: keyJson.miner,
      prevHash: keyJson.prevHash,
      prevKeyHash: keyJson.prevKeyHash,
      stateHash: keyJson.stateHash,
      target: keyJson.target,
      time: keyJson.time,
      version: 5,
    });
    const key = await executeInspect(prevKeyHash);
    expect(key.split('\nTransactions')[0]).to.equal(`
<<--------------- KeyBlock --------------->>
Block hash ______________________________ ${keyJson.hash}
Block height ____________________________ ${keyJson.height}
State hash ______________________________ ${keyJson.stateHash}
Nonce ___________________________________ N/A
Miner ___________________________________ ${keyJson.miner}
Time ____________________________________ ${new Date(keyJson.time).toString()}
Previous block hash _____________________ ${keyJson.prevHash}
Previous key block hash _________________ ${keyJson.prevKeyHash}
Version _________________________________ 5
Target __________________________________ ${keyJson.target}
    `.trim());

    let microHash = keyJson.prevHash;
    while (microHash.startsWith('kh_')) {
      // eslint-disable-next-line no-await-in-loop
      microHash = (await executeInspect(microHash, '--json')).prevHash;
    }
    const microJson = await executeInspect(microHash, '--json');
    expect(microJson).to.eql({
      hash: microJson.hash,
      height: microJson.height,
      pofHash: 'no_fraud',
      prevHash: microJson.prevHash,
      prevKeyHash: microJson.prevKeyHash,
      signature: microJson.signature,
      stateHash: microJson.stateHash,
      time: microJson.time,
      transactions: microJson.transactions,
      txsHash: microJson.txsHash,
      version: 5,
    });
    const micro = await executeInspect(microHash);
    expect(micro.split('\nTransactions')[0]).to.equal(`
<<--------------- MicroBlock --------------->>
Block hash ______________________________ ${microJson.hash}
Block height ____________________________ ${microJson.height}
State hash ______________________________ ${microJson.stateHash}
Nonce ___________________________________ N/A
Miner ___________________________________ N/A
Time ____________________________________ ${new Date(microJson.time).toString()}
Previous block hash _____________________ ${microJson.prevHash}
Previous key block hash _________________ ${microJson.prevKeyHash}
Version _________________________________ 5
Target __________________________________ N/A
    `.trim());
  });

  it('Inspect Contract', async () => {
    const contract = await sdk.initializeContract({
      sourceCode: `
contract Identity =
  entrypoint foo() = "test"
      `,
    });
    const { address } = await contract.$deploy([]);
    const resJson = await executeInspect(address, '--json');
    expect(resJson).to.eql({
      abiVersion: AbiVersion.Fate.toString(),
      active: true,
      deposit: '0',
      id: address,
      ownerId: sdk.address,
      referrerIds: [],
      vmVersion: VmVersion.Fate2.toString(),
    });
    const res = await executeInspect(address);
    expect(res).to.equal(`
id ______________________________________ ${address}
ownerId _________________________________ ${sdk.address}
vmVersion _______________________________ 7
abiVersion ______________________________ 3
active __________________________________ true
referrerIds _____________________________ []
deposit _________________________________ 0
    `.trim());
  });

  it('Inspect Oracle', async () => {
    const { id } = await sdk.registerOracle('<request format>', '<response format>');
    const resJson = await executeInspect(id, '--json');
    expect(resJson).to.eql({
      id,
      abiVersion: AbiVersion.NoAbi.toString(),
      queries: [],
      queryFee: '0',
      queryFormat: '<request format>',
      responseFormat: '<response format>',
      ttl: resJson.ttl,
    });
    const res = await executeInspect(id);
    expect(res).to.equal(`
Oracle ID _______________________________ ${id}
Oracle Query Fee ________________________ 0
Oracle Query Format _____________________ <request format>
Oracle Response Format __________________ <response format>
Ttl _____________________________________ ${resJson.ttl}

--------------------------------- QUERIES ------------------------------------
    `.trim());
  });

  it('Inspect Invalid Name', async () => {
    await expect(executeInspect('asd', '--json')).to.be.rejectedWith('Name should end with .chain');
  });

  const name = `nazdou${Math.random().toString().slice(2, 9)}.chain`;

  it('Inspect Unclaimed Name', async () => {
    const resJson = await executeInspect(name, '--json');
    expect(resJson).to.eql({
      id: produceNameId(name),
      status: 'AVAILABLE',
    });
    const res = await executeInspect(name);
    expect(res).to.equal(`
Status __________________________________ AVAILABLE
Name hash _______________________________ ${produceNameId(name)}
    `.trim());
  });

  it('Inspect Claimed Name', async () => {
    await (await (await sdk.aensPreclaim(name)).claim()).update({
      myKey: sdk.address,
      account_pubkey: sdk.address,
      oracle_pubkey: sdk.address,
    });
    const resJson = await executeInspect(name, '--json');
    expect(resJson).to.eql({
      id: resJson.id,
      owner: sdk.address,
      pointers: [
        { id: sdk.address, key: 'myKey' },
        { id: sdk.address, key: 'account_pubkey' },
        { id: sdk.address, key: 'oracle_pubkey' },
      ],
      status: 'CLAIMED',
      ttl: resJson.ttl,
    });
    const res = await executeInspect(name);
    expectToMatchLines(res, [
      'Status __________________________________ CLAIMED',
      `Name hash _______________________________ ${resJson.id}`,
      `Owner ___________________________________ ${sdk.address}`,
      `Pointer myKey ___________________________ ${sdk.address}`,
      `Pointer account_pubkey __________________ ${sdk.address}`,
      `Pointer oracle_pubkey ___________________ ${sdk.address}`,
      /TTL _____________________________________ \d+ \(in 1 year\)/,
    ]);
  }).timeout(6000);

  it('Inspect Running Auction Name', async () => {
    const auctionName = `a${Math.random().toString().slice(2, 9)}.chain`;
    await (await sdk.aensPreclaim(auctionName)).claim();
    const resJson = await executeInspect(auctionName, '--json');
    const endsAt = +resJson.startedAt + 14880;
    expect(resJson).to.eql({
      endsAt: String(endsAt),
      highestBid: '19641800000000000000',
      highestBidder: sdk.address,
      id: resJson.id,
      startedAt: resJson.startedAt,
      status: 'AUCTION',
    });
    const res = await executeInspect(auctionName);
    expect(res).to.equal(`
Status __________________________________ AUCTION
Name hash _______________________________ ${resJson.id}
Highest bidder __________________________ ${sdk.address}
Highest bid _____________________________ 19.6418ae
Ends at height __________________________ ${endsAt} (in 1 month)
Started at height _______________________ ${resJson.startedAt} (about now)
    `.trim());
  }).timeout(4000);
});
