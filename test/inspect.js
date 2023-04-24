import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import {
  AbiVersion, generateKeyPair, Tag, VmVersion,
} from '@aeternity/aepp-sdk';
import { executeProgram, getSdk } from './index';
import inspectProgram from '../src/commands/inspect';
import chainProgram from '../src/commands/chain';

const executeInspect = (args) => executeProgram(inspectProgram, args);
const executeChain = (args) => executeProgram(chainProgram, args);

describe('Inspect Module', () => {
  let sdk;

  before(async () => {
    sdk = await getSdk();
  });

  it('Inspect Account', async () => {
    const balance = await sdk.getBalance(sdk.address);
    const resJson = await executeInspect([sdk.address, '--json']);
    expect(resJson).to.eql({
      balance,
      hash: sdk.address,
      nonce: resJson.nonce,
      transactions: [],
    });
    const res = await executeInspect([sdk.address]);
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
    const resJson = await executeInspect([hash, '--json']);
    expect(resJson).to.eql({
      blockHash: resJson.blockHash,
      blockHeight: resJson.blockHeight,
      hash: resJson.hash,
      signatures: [resJson.signatures[0]],
      tx: {
        recipientId: recipient,
        senderId: sdk.address,
        amount,
        fee: '16700000000000',
        nonce: resJson.tx.nonce,
        payload: 'ba_Xfbg4g==',
        type: 'SpendTx',
        version: 1,
      },
    });
    const res = await executeInspect([hash]);
    expect(res).to.equal(`
Tx hash _________________________________ ${resJson.hash}
Block hash ______________________________ ${resJson.blockHash}
Block height ____________________________ ${resJson.blockHeight}
Signatures ______________________________ ["${resJson.signatures[0]}"]
Tx Type _________________________________ SpendTx
Sender account __________________________ ${sdk.address}
Recipient account _______________________ ${recipient}
Amount __________________________________ 420
Payload _________________________________ ba_Xfbg4g==
Fee _____________________________________ 16700000000000
Nonce ___________________________________ ${resJson.tx.nonce}
TTL _____________________________________ N/A
Version _________________________________ 1
    `.trim());
  });

  it('Inspect Transaction', async () => {
    const recipientId = (generateKeyPair()).publicKey;
    const amount = '420';
    const tx = await sdk.buildTx({
      tag: Tag.SpendTx, amount, recipientId, senderId: sdk.address,
    });
    const resJson = await executeInspect([tx, '--json']);
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
    const res = await executeInspect([tx]);
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
    const top = await executeChain(['top', '--json']);
    const resJson = await executeInspect([top.hash, '--json']);
    expect(resJson).to.eql({
      hash: top.hash,
      height: top.height,
      pofHash: 'no_fraud',
      prevHash: resJson.prevHash,
      prevKeyHash: resJson.prevKeyHash,
      signature: resJson.signature,
      stateHash: resJson.stateHash,
      time: resJson.time,
      transactions: resJson.transactions,
      txsHash: resJson.txsHash,
      version: 5,
    });
    const res = await executeInspect([top.hash]);
    expect(res.split('\nTransactions')[0]).to.equal(`
<<--------------- MicroBlock --------------->>
Block hash ______________________________ ${top.hash}
Block height ____________________________ ${top.height}
State hash ______________________________ ${resJson.stateHash}
Nonce ___________________________________ N/A
Miner ___________________________________ N/A
Time ____________________________________ ${new Date(resJson.time).toString()}
Previous block hash _____________________ ${resJson.prevHash}
Previous key block hash _________________ ${resJson.prevKeyHash}
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
    const resJson = await executeInspect([address, '--json']);
    expect(resJson).to.eql({
      abiVersion: AbiVersion.Fate.toString(),
      active: true,
      deposit: '0',
      id: address,
      ownerId: sdk.address,
      referrerIds: [],
      vmVersion: VmVersion.Fate2.toString(),
    });
    const res = await executeInspect([address]);
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
    const resJson = await executeInspect([id, '--json']);
    expect(resJson).to.eql({
      id,
      abiVersion: AbiVersion.NoAbi.toString(),
      queries: [],
      queryFee: '0',
      queryFormat: '<request format>',
      responseFormat: '<response format>',
      ttl: resJson.ttl,
    });
    const res = await executeInspect([id]);
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
    await expect(executeInspect(['asd', '--json'])).to.be.rejectedWith('Name should end with .chain');
  });

  const name = `nazdou${Math.random().toString().slice(2, 9)}.chain`;

  it('Inspect Unclaimed Name', async () => {
    const resJson = await executeInspect([name, '--json']);
    expect(resJson).to.eql({
      name,
      status: 'AVAILABLE',
    });
    const res = await executeInspect([name]);
    expect(res).to.equal(`
Status __________________________________ AVAILABLE
Name hash _______________________________ N/A
Pointers ________________________________ N/A
TTL _____________________________________ 0
    `.trim());
  });

  it('Inspect Claimed Name', async () => {
    await (await (await sdk.aensPreclaim(name)).claim()).update({
      myKey: sdk.address,
      account_pubkey: sdk.address,
      oracle_pubkey: sdk.address,
    });
    const resJson = await executeInspect([name, '--json']);
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
    const res = await executeInspect([name]);
    expect(res).to.equal(`
Status __________________________________ CLAIMED
Name hash _______________________________ ${resJson.id}
Pointer myKey ___________________________ ${sdk.address}
Pointer account_pubkey __________________ ${sdk.address}
Pointer oracle_pubkey ___________________ ${sdk.address}
TTL _____________________________________ ${resJson.ttl}
    `.trim());
  }).timeout(4000);
});
