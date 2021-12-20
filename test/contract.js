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
import { executeProgram, getSdk, WALLET_NAME } from './index';
import contractProgramFactory from '../src/commands/contract';

const executeContract = (args) => executeProgram(contractProgramFactory, args);

const testContractSource = `
@compiler >= 6

contract Identity =
  entrypoint test(x : int, y: int) = x + y
`;

describe('CLI Contract Module', () => {
  const contractSourceFile = 'testContract';
  const contractAciFile = 'testContractAci';
  let deployDescriptorFile;
  let sdk;
  let contractAddress;

  before(async () => {
    fs.writeFileSync(contractSourceFile, testContractSource);
    sdk = await getSdk();
    fs.writeFileSync(contractAciFile, JSON.stringify(await sdk.contractGetACI(testContractSource)));
  });

  after(() => {
    sdk.removeWallet();
    if (fs.existsSync(deployDescriptorFile)) fs.unlinkSync(deployDescriptorFile);
    if (fs.existsSync(contractSourceFile)) fs.unlinkSync(contractSourceFile);
    if (fs.existsSync(contractAciFile)) fs.unlinkSync(contractAciFile);
  });

  it('compiles contract', async () => {
    const { bytecode } = await executeContract(['compile', contractSourceFile, '--json']);
    expect(bytecode).to.satisfy((b) => b.startsWith('cb_'));
  });

  it('Deploy Contract', async () => {
    const { calldata } = await executeContract(['encode-calldata', '--contractSource', contractSourceFile, 'init', '--json']);
    const res = await executeContract(['deploy', WALLET_NAME, '--password', 'test', contractSourceFile, calldata, '--json']);
    const { result: { contractId }, transaction, descPath } = res;
    deployDescriptorFile = descPath;
    const [name, pref, add] = deployDescriptorFile.split('.');
    contractAddress = contractId;
    contractId.should.be.a('string');
    transaction.should.be.a('string');
    name.should.be.equal(contractSourceFile);
    pref.should.be.equal('deploy');
    add.should.be.equal((await sdk.address()).split('_')[1]);
  });

  describe('Call', () => {
    it('calls contract', async () => {
      const callResponse = await executeContract([
        'call',
        WALLET_NAME, '--password', 'test',
        '--json',
        '--descrPath', deployDescriptorFile,
        'test', '[1, 2]',
      ]);
      callResponse.result.returnValue.should.contain('cb_');
      callResponse.decodedResult.should.be.equal('3');
    });

    it('calls contract static', async () => {
      const callResponse = await executeContract([
        'call',
        WALLET_NAME, '--password', 'test',
        '--json',
        '--descrPath', deployDescriptorFile,
        'test', '[1, 2]',
        '--callStatic',
      ]);
      callResponse.result.returnValue.should.contain('cb_');
      callResponse.decodedResult.should.equal('3');
    });

    it('calls contract by contract source and address', async () => {
      const callResponse = await executeContract([
        'call',
        WALLET_NAME, '--password', 'test',
        '--json',
        '--contractAddress', contractAddress,
        '--contractSource', contractSourceFile,
        'test', '[1, 2]',
      ]);
      callResponse.decodedResult.should.equal('3');
    });

    it('calls contract by contract ACI and address', async () => {
      const callResponse = await executeContract([
        'call',
        WALLET_NAME, '--password', 'test',
        '--json',
        '--contractAddress', contractAddress,
        '--contractAci', contractAciFile,
        'test', '[1, 2]',
      ]);
      callResponse.decodedResult.should.equal('3');
    });
  });

  describe('Calldata', () => {
    it('encodes calldata', async () => {
      const { calldata } = await executeContract([
        'encode-calldata',
        'test', '[1, 2]',
        '--contractSource', contractSourceFile,
        '--json',
      ]);
      expect(calldata).to.be.equal('cb_KxGSiyA2KwIEFfUrtQ==');
    });

    it('encodes calldata by aci', async () => {
      const { calldata } = await executeContract([
        'encode-calldata',
        'test', '[1, 2]',
        '--contractAci', contractAciFile,
        '--json',
      ]);
      expect(calldata).to.be.equal('cb_KxGSiyA2KwIEFfUrtQ==');
    });

    it('encodes calldata by deploy descriptor', async () => {
      const { calldata } = await executeContract([
        'encode-calldata',
        'test', '[1, 2]',
        '--descrPath', deployDescriptorFile,
        '--json',
      ]);
      expect(calldata).to.be.equal('cb_KxGSiyA2KwIEFfUrtQ==');
    });

    it('decodes call result', async () => {
      const { decoded } = await executeContract([
        'decode-call-result',
        'test', 'cb_BvMDXHk=',
        '--contractSource', contractSourceFile,
        '--json',
      ]);
      decoded.should.be.equal('3');
    });
  });
});
