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

import fs from 'fs';
import {
  after, before, describe, it,
} from 'mocha';
import { expect } from 'chai';
import { Crypto } from '@aeternity/aepp-sdk';
import { executeProgram, parseBlock, getSdk } from './index';
import inspectProgram from '../src/commands/inspect';
import chainProgram from '../src/commands/chain';

const executeInspect = (args) => executeProgram(inspectProgram, args);
const executeChain = (args) => executeProgram(chainProgram, args);

const contractDescriptor = {
  descPath: 'testc.deploy.MA8Qe8ac7e9EARYK7fQxEqFufRGrG1i6qFvHA21eXXMDcnmuc.json',
  source: 'contract Identity =\\n  type state = ()\\n  function mainx(x : int, y: int) = x + y\\n',
  bytecode: '0x36600060203762000062620000366020518080805180516004146200008157505b5080518051600514620000df57505b5060011951005b805903906000518059600081529081818162000058915b805081590391505090565b8352505060005250f35b8059039060008052f35b5990565b508082620001369180820191505090565b602001517f696e69740000000000000000000000000000000000000000000000000000000014620000b25762000020565b5050829150620000c16200006c565b596000815290818181620000d5916200004d565b835250505b905090565b602001517f6d61696e780000000000000000000000000000000000000000000000000000001462000110576200002f565b602001518051906020015159506000516200007090805180826200018191600091505090565b5960008152908181816200014b918091505090565b83525050915050620000da565b825180599081525060208401602084038393509350935050600082136200015857809250505090565b915050806000525959905090509056',
  abi: 'sophia',
  owner: 'ak_MA8Qe8ac7e9EARYK7fQxEqFufRGrG1i6qFvHA21eXXMDcnmuc',
  transaction: 'th_2rEEFjGiz5ijQFkEH4Q657Z7wJVa7rx7fiv34BTL47nF4JFNnV',
  address: 'ct_214YXa24QLoqWMSpsf5t6rACUyffxDthPDfHzP2G31c5HSmLV9',
  createdAt: '2018-09-04T11:32:17.207Z',
};

describe('CLI Inspect Module', () => {
  let sdk;

  before(async () => {
    sdk = await getSdk();
  });

  after(() => sdk.removeWallet());

  it('Inspect Account', async () => {
    const address = await sdk.address();
    const balance = await sdk.balance(address);
    const { balance: cliBalance } = await executeInspect([address, '--json']);
    const isEqual = `${balance}` === `${cliBalance}`;
    isEqual.should.equal(true);
  });

  it('Inspect Transaction', async () => {
    const recipient = (Crypto.generateKeyPair()).publicKey;
    const amount = 420;
    const { hash } = await sdk.spend(amount, recipient);

    const res = await executeInspect([hash, '--json']);
    res.tx.recipientId.should.equal(recipient);
    res.tx.senderId.should.be.equal(await sdk.address());
    res.tx.amount.should.equal(amount);
  });

  it('Inspect Block', async () => {
    const top = await executeChain(['top', '--json']);
    const inspectRes = await executeInspect([top.hash, '--json']);
    top.hash.should.equal(inspectRes.hash);
  });

  it('Inspect Height', async () => {
    const top = await executeChain(['top', '--json']);
    const inspectRes = await executeInspect([top.hash, '--json']);
    top.hash.should.equal(inspectRes.hash);
  });

  it.skip('Inspect Deploy', async () => {
    const fileName = 'test.deploy.json';
    fs.writeFileSync(fileName, JSON.stringify(contractDescriptor));
    const descriptor = parseBlock(await executeInspect(['deploy', fileName]));
    fs.unlinkSync(fileName);
    descriptor.source.should.equal(contractDescriptor.source);
    descriptor.bytecode.should.equal(contractDescriptor.bytecode);
    descriptor.address.should.equal(contractDescriptor.address);
    descriptor.transaction.should.equal(contractDescriptor.transaction);
    descriptor.createdAt.should.equal(contractDescriptor.createdAt);
    descriptor.owner.should.equal(contractDescriptor.owner);
    // CLI try to get transaction which doest exist
    descriptor.apiError.should.equal('Transaction not found');
  });

  it('Inspect Name', async () => {
    await expect(executeInspect(['asd', '--json'])).to.be.rejectedWith('Name should end with .chain');
    const validName = await executeInspect(['nazdou2222222.chain', '--json']);
    validName.status.should.be.equal('AVAILABLE');
  });
});
