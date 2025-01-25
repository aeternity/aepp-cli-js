import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import {
  AbiVersion,
  produceNameId,
  Tag,
  VmVersion,
  Contract,
  MemoryAccount,
  Encoding,
} from '@aeternity/aepp-sdk';
import { executeProgram, getSdk } from './index.js';
import { toBeAbove0, toBeEncoded, expectToMatchLines, toMatch } from './utils.js';

const executeInspect = executeProgram.bind(null, 'inspect');
const executeChain = executeProgram.bind(null, 'chain');

describe('Inspect Module', () => {
  let aeSdk;

  before(async () => {
    aeSdk = await getSdk();
  });

  it('Inspect Account', async () => {
    const balance = await aeSdk.getBalance(aeSdk.address);
    const resJson = await executeInspect(aeSdk.address, '--json');
    expect(resJson).to.eql({
      balance,
      hash: aeSdk.address,
      nonce: resJson.nonce,
      transactions: [],
    });
    const res = await executeInspect(aeSdk.address);
    expectToMatchLines(res, [
      `Account ID       ${aeSdk.address}`,
      `Account balance  50ae`,
      `Account nonce    ${resJson.nonce}`,
      `No pending transactions`,
    ]);
  });

  it('Inspect Transaction Hash', async () => {
    const recipient = MemoryAccount.generate().address;
    const amount = '420';
    const { hash } = await aeSdk.spend(amount, recipient);
    const resJson = await executeInspect(hash, '--json');
    expect(resJson).to.eql({
      blockHash: toBeEncoded(resJson.blockHash, Encoding.MicroBlockHash),
      blockHeight: toBeAbove0(resJson.blockHeight),
      encodedTx: toBeEncoded(resJson.encodedTx, Encoding.Transaction),
      hash: toBeEncoded(resJson.hash, Encoding.TxHash),
      signatures: [toBeEncoded(resJson.signatures[0], Encoding.Signature)],
      tx: {
        recipientId: recipient,
        senderId: aeSdk.address,
        amount,
        fee: toMatch(resJson.tx.fee, /1\d{13}/),
        nonce: toBeAbove0(resJson.tx.nonce),
        payload: 'ba_Xfbg4g==',
        ttl: toBeAbove0(resJson.tx.ttl),
        type: 'SpendTx',
        version: 1,
      },
    });
    const res = await executeInspect(hash);
    expectToMatchLines(res, [
      `Transaction hash   ${resJson.hash}`,
      `Block hash         ${resJson.blockHash}`,
      `Block height       ${resJson.blockHeight} (about now)`,
      `Signatures         ["${resJson.signatures[0]}"]`,
      'Transaction type   SpendTx (ver. 1)',
      `Sender address     ${aeSdk.address}`,
      `Recipient address  ${recipient}`,
      'Amount             0.00000000000000042ae',
      'Payload            ba_Xfbg4g==',
      /Fee                0.000016\d+ae/,
      `Nonce              ${resJson.tx.nonce}`,
      /TTL                \d+ \(in [56] minutes\)/,
    ]);
  });

  it('Inspect Transaction', async () => {
    const recipientId = MemoryAccount.generate().address;
    const amount = '420';
    const tx = await aeSdk.buildTx({
      tag: Tag.SpendTx,
      amount,
      recipientId,
      senderId: aeSdk.address,
    });
    const resJson = await executeInspect(tx, '--json');
    expect(resJson).to.eql({
      amount,
      fee: '16700000000000',
      nonce: resJson.nonce,
      payload: 'ba_Xfbg4g==',
      recipientId,
      senderId: aeSdk.address,
      tag: Tag.SpendTx,
      ttl: 0,
      version: 1,
    });
    const res = await executeInspect(tx);
    expectToMatchLines(res, [
      `Tx Type      SpendTx`,
      `tag          12`,
      `version      1`,
      `senderId     ${aeSdk.address}`,
      `recipientId  ${recipientId}`,
      `amount       420`,
      `fee          16700000000000`,
      `ttl          0`,
      `nonce        ${resJson.nonce}`,
      `payload      ba_Xfbg4g==`,
    ]);
  });

  it('Inspect Block', async () => {
    const { prevKeyHash } = await executeChain('top', '--json');

    const keyJson = await executeInspect(prevKeyHash, '--json');
    expect(keyJson).to.eql({
      beneficiary: keyJson.beneficiary,
      flags: 'ba_wAAAAKv2ZV4=',
      hash: keyJson.hash,
      height: keyJson.height,
      info: 'cb_AAAC2rLD9E0=',
      miner: keyJson.miner,
      prevHash: keyJson.prevHash,
      prevKeyHash: keyJson.prevKeyHash,
      stateHash: keyJson.stateHash,
      target: keyJson.target,
      time: keyJson.time,
      version: 6,
    });
    const key = await executeInspect(prevKeyHash);
    expectToMatchLines(key.split('\nTransactions')[0], [
      `<<--------------- KeyBlock --------------->>`,
      `Block hash               ${keyJson.hash}`,
      `Block height             ${keyJson.height}`,
      `State hash               ${keyJson.stateHash}`,
      `Nonce                    N/A`,
      `Miner                    ${keyJson.miner}`,
      `Time                     ${new Date(keyJson.time).toString()}`,
      `Previous block hash      ${keyJson.prevHash}`,
      `Previous key block hash  ${keyJson.prevKeyHash}`,
      `Version                  6`,
      `Target                   ${keyJson.target}`,
    ]);

    let microHash = keyJson.prevHash;
    while (microHash.startsWith('kh_')) {
      microHash = (await executeInspect(microHash, '--json')).prevHash;
    }
    const microJson = await executeInspect(microHash, '--json');
    expect(microJson).to.eql({
      flags: 'ba_AAAAAIy5ASU=',
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
      version: 6,
    });
    const micro = await executeInspect(microHash);
    expectToMatchLines(micro.split('\nTransactions')[0], [
      `<<--------------- MicroBlock --------------->>`,
      `Block hash               ${microJson.hash}`,
      `Block height             ${microJson.height}`,
      `State hash               ${microJson.stateHash}`,
      `Nonce                    N/A`,
      `Miner                    N/A`,
      `Time                     ${new Date(microJson.time).toString()}`,
      `Previous block hash      ${microJson.prevHash}`,
      `Previous key block hash  ${microJson.prevKeyHash}`,
      `Version                  6`,
      `Target                   N/A`,
    ]);
  });

  it('Inspect Contract', async () => {
    const contract = await Contract.initialize({
      ...aeSdk.getContext(),
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
      ownerId: aeSdk.address,
      referrerIds: [],
      vmVersion: VmVersion.Fate3.toString(),
    });
    const res = await executeInspect(address);
    expectToMatchLines(res, [
      `id           ${address}`,
      `ownerId      ${aeSdk.address}`,
      `vmVersion    8`,
      `abiVersion   3`,
      `active       true`,
      `referrerIds  []`,
      `deposit      0`,
    ]);
  });

  it('Inspect non existing Oracle', async () => {
    const fakeOracleId = MemoryAccount.generate().address.replace('ak_', 'ok_');
    await executeInspect(fakeOracleId, '--json').should.be.rejectedWith('error: Oracle not found');
  });

  it('Inspect Oracle', async () => {
    const { id: oracleId } = await aeSdk.registerOracle('<request format>', '<response format>');
    const { id: queryId } = await aeSdk.postQueryToOracle(oracleId, 'Hello?');
    const resJson = await executeInspect(oracleId, '--json');
    expect(resJson).to.eql({
      id: oracleId,
      abiVersion: AbiVersion.NoAbi.toString(),
      queries: [
        {
          fee: '0',
          id: queryId,
          oracleId,
          query: 'ov_SGVsbG8/0oNcUw==',
          response: 'or_Xfbg4g==',
          responseTtl: {
            type: 'delta',
            value: '10',
          },
          senderId: aeSdk.address,
          senderNonce: '4',
          ttl: resJson.queries[0].ttl,
        },
      ],
      queryFee: '0',
      queryFormat: '<request format>',
      responseFormat: '<response format>',
      ttl: resJson.ttl,
    });
    const res = await executeInspect(oracleId);
    // TODO: "no response" message instead of empty string in "Response decoded"
    expectToMatchLines(res, [
      `Oracle ID               ${oracleId}`,
      `Oracle Query Fee        0`,
      `Oracle Query Format     <request format>`,
      `Oracle Response Format  <response format>`,
      `Ttl                     ${resJson.ttl}`,
      ``,
      `--------------------------------- QUERIES ------------------------------------`,
      `Oracle ID         ${oracleId}`,
      `Query ID          ${queryId}`,
      `Fee               0`,
      `Query             ov_SGVsbG8/0oNcUw==`,
      `Query decoded     Hello?`,
      `Response          or_Xfbg4g==`,
      `Response decoded  `,
      `Response Ttl      {"type":"delta","value":"10"}`,
      `Sender Id         ${aeSdk.address}`,
      `Sender Nonce      4`,
      `Ttl               ${resJson.queries[0].ttl}`,
      `------------------------------------------------------------------------------`,
    ]);
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
    expectToMatchLines(res, [`Status     AVAILABLE`, `Name hash  ${produceNameId(name)}`]);
  });

  it('Inspect Claimed Name', async () => {
    await (
      await (await aeSdk.aensPreclaim(name)).claim()
    ).update({
      myKey: aeSdk.address,
      account_pubkey: aeSdk.address,
      oracle_pubkey: aeSdk.address,
    });
    const resJson = await executeInspect(name, '--json');
    expect(resJson).to.eql({
      id: resJson.id,
      owner: aeSdk.address,
      pointers: [
        { id: aeSdk.address, key: 'myKey', encoded_key: 'ba_bXlLZXltwTZ7' },
        { id: aeSdk.address, key: 'account_pubkey', encoded_key: 'ba_YWNjb3VudF9wdWJrZXn8jckR' },
        { id: aeSdk.address, key: 'oracle_pubkey', encoded_key: 'ba_b3JhY2xlX3B1YmtleV2vKNs=' },
      ],
      status: 'CLAIMED',
      ttl: resJson.ttl,
    });
    const res = await executeInspect(name);
    expectToMatchLines(res, [
      'Status                  CLAIMED',
      `Name hash               ${resJson.id}`,
      `Owner                   ${aeSdk.address}`,
      `Pointer myKey           ${aeSdk.address}`,
      `Pointer account_pubkey  ${aeSdk.address}`,
      `Pointer oracle_pubkey   ${aeSdk.address}`,
      /TTL                     \d+ \(in 1 year\)/,
    ]);
  }).timeout(6000);

  it('Inspect Running Auction Name', async () => {
    const auctionName = `a${Math.random().toString().slice(2, 9)}.chain`;
    await (await aeSdk.aensPreclaim(auctionName)).claim();
    const resJson = await executeInspect(auctionName, '--json');
    const endsAt = +resJson.startedAt + 960;
    expect(resJson).to.eql({
      endsAt: String(endsAt),
      highestBid: '19641800000000000000',
      highestBidder: aeSdk.address,
      id: resJson.id,
      startedAt: resJson.startedAt,
      status: 'AUCTION',
    });
    const res = await executeInspect(auctionName);
    expectToMatchLines(res, [
      `Status             AUCTION`,
      `Name hash          ${resJson.id}`,
      `Highest bidder     ${aeSdk.address}`,
      `Highest bid        19.6418ae`,
      `Ends at height     ${endsAt} (in 1 day)`,
      `Started at height  ${resJson.startedAt} (about now)`,
    ]);
  }).timeout(4000);
});
