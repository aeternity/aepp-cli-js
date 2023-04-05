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

import { before, describe, it } from 'mocha';
import { expect } from 'chai';
import { generateKeyPair } from '@aeternity/aepp-sdk';
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
    const { balance: cliBalance } = await executeInspect([sdk.address, '--json']);
    const isEqual = `${balance}` === `${cliBalance}`;
    isEqual.should.equal(true);
  });

  it('Inspect Transaction', async () => {
    const recipient = (generateKeyPair()).publicKey;
    const amount = '420';
    const { hash } = await sdk.spend(amount, recipient);

    const res = await executeInspect([hash, '--json']);
    res.tx.recipientId.should.equal(recipient);
    res.tx.senderId.should.be.equal(sdk.address);
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

  it('Inspect Name', async () => {
    await expect(executeInspect(['asd', '--json'])).to.be.rejectedWith('Name should end with .chain');
    const validName = await executeInspect(['nazdou2222222.chain', '--json']);
    validName.status.should.be.equal('AVAILABLE');
  });
});
