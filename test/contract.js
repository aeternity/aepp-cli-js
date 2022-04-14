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
import { TxBuilderHelper } from '@aeternity/aepp-sdk';
import { executeProgram, getSdk, WALLET_NAME } from './index';
import contractProgramFactory from '../src/commands/contract';

const executeContract = (args) => executeProgram(contractProgramFactory, args);

const testContractSource = `
@compiler >= 6
@compiler < 7

contract Identity =
  record state = { z: int }
  entrypoint init(_z: int) = { z = _z }
  entrypoint test(x : int, y: int) = x + y + state.z
`;

describe('CLI Contract Module', () => {
  const contractSourceFile = 'testContract';
  const contractAciFile = 'testContractAci';
  let deployDescriptorFile;
  let sdk;
  let contractBytecode;
  let contractAddress;

  before(async () => {
    fs.writeFileSync(contractSourceFile, testContractSource);
    sdk = await getSdk();
    fs.writeFileSync(contractAciFile, JSON.stringify(
      await sdk.compilerApi.generateACI({ code: testContractSource }),
    ));
  });

  after(() => {
    sdk.removeWallet();
    if (fs.existsSync(deployDescriptorFile)) fs.unlinkSync(deployDescriptorFile);
    if (fs.existsSync(contractSourceFile)) fs.unlinkSync(contractSourceFile);
    if (fs.existsSync(contractAciFile)) fs.unlinkSync(contractAciFile);
  });

  it('compiles contract', async () => {
    const { bytecode } = await executeContract(['compile', contractSourceFile, '--json']);
    contractBytecode = bytecode;
    expect(bytecode).to.satisfy((b) => b.startsWith('cb_'));
  });

  describe('Deploy', () => {
    it('deploys contract', async () => {
      const { address, transaction, descrPath } = await executeContract([
        'deploy',
        WALLET_NAME, '--password', 'test',
        '--contractSource', contractSourceFile,
        '[3]',
        '--json',
      ]);
      deployDescriptorFile = descrPath;
      const [name, pref, add] = deployDescriptorFile.split('.');
      contractAddress = address;
      address.should.be.a('string');
      transaction.should.be.a('string');
      name.should.satisfy((n) => n.endsWith(contractSourceFile));
      pref.should.be.equal('deploy');
      add.should.be.equal(address.split('_')[1]);
    }).timeout(4000);

    it('deploys contract with custom descrPath', async () => {
      const descrPath = './testDescriptor.json';
      await executeContract([
        'deploy',
        WALLET_NAME, '--password', 'test',
        '--contractSource', contractSourceFile,
        '--descrPath', descrPath,
        '[3]',
        '--json',
      ]);
      expect(fs.existsSync(descrPath)).to.be.equal(true);
      const descriptor = JSON.parse(fs.readFileSync(descrPath, 'utf-8'));
      expect(descriptor.address).to.satisfy((b) => b.startsWith('ct_'));
      expect(descriptor.bytecode).to.satisfy((b) => b.startsWith('cb_'));
      expect(descriptor.source).to.satisfy((b) => b.includes('contract Identity'));
      fs.unlinkSync(descrPath);
    }).timeout(4000);

    it('deploys contract by bytecode', async () => {
      const contractBytecodeFile = './bytecode.bin';
      fs.writeFileSync(contractBytecodeFile, TxBuilderHelper.decode(contractBytecode));
      const { descrPath } = await executeContract([
        'deploy',
        WALLET_NAME, '--password', 'test',
        '--contractAci', contractAciFile,
        '--contractBytecode', contractBytecodeFile,
        '[3]',
        '--json',
      ]);
      fs.unlinkSync(descrPath);
      fs.unlinkSync(contractBytecodeFile);
    });
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
      callResponse.decodedResult.should.be.equal('6');
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
      callResponse.decodedResult.should.equal('6');
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
      callResponse.decodedResult.should.equal('6');
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
      callResponse.decodedResult.should.equal('6');
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
