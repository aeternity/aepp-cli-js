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

import fs from 'fs-extra';
import {
  after, before, describe, it,
} from 'mocha';
import { expect } from 'chai';
import { decode } from '@aeternity/aepp-sdk';
import { executeProgram, getSdk, WALLET_NAME } from './index';
import contractProgram from '../src/commands/contract';
import CliError from '../src/utils/CliError';

const executeContract = (args) => executeProgram(contractProgram, args);

const testLibSource = `
namespace TestLib =
  function sum(x: int, y: int) : int = x + y
`;

const testContractSource = `
@compiler >= 7
@compiler < 8

include "testLib.aes"

contract Identity =
  record state = { z: int }
  entrypoint init(_z: int) = { z = _z }
  entrypoint test(x : int, y: int) = TestLib.sum(x, TestLib.sum(y, state.z))
  entrypoint getMap(): map(int, int) = {[1] = 2, [3] = 4}
`;

describe('Contract Module', function contractTests() {
  this.timeout(4000);
  const contractSourceFile = 'test-artifacts/contract.aes';
  const contractAciFile = 'test-artifacts/contract-aci.json';
  let deployDescriptorFile;
  let sdk;
  let contractBytecode;
  let contractAddress;

  before(async () => {
    await fs.outputFile(contractSourceFile, testContractSource);
    await fs.outputFile('test-artifacts/testLib.aes', testLibSource);
    sdk = await getSdk();
    await fs.outputJson(
      contractAciFile,
      (await sdk.compilerApi.compileBySourceCode(
        testContractSource,
        { 'testLib.aes': testLibSource },
      )).aci,
    );
  });

  after(async () => {
    await fs.remove(deployDescriptorFile);
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
      const [name, add] = deployDescriptorFile.split('.deploy.');
      contractAddress = address;
      address.should.be.a('string');
      transaction.should.be.a('string');
      name.should.satisfy((n) => n.endsWith(contractSourceFile));
      add.should.be.equal(`${address.split('_')[1]}.json`);
    }).timeout(8000);

    it('deploys contract with custom descrPath', async () => {
      const descrPath = './not-existing/testDescriptor.json';
      const { address } = await executeContract([
        'deploy',
        WALLET_NAME, '--password', 'test',
        '--contractSource', contractSourceFile,
        '--descrPath', descrPath,
        '[3]',
        '--json',
      ]);
      expect(await fs.exists(descrPath)).to.be.equal(true);
      const descriptor = await fs.readJson(descrPath);
      expect(descriptor).to.eql({
        version: 1,
        address,
        bytecode: 'cb_+L5GA6BBf3GW9I6fo4TZBejjzPtb4sVLycthaPcbJPMW921AUcC4kbhX/kTWRB8ANwEHNwAaBoIAAQM//pKLIDYANwIHBwcMAoIMAQICAxHQ4oJSDAEABAMR0OKCUv7Q4oJSAjcCBwcHFBQAAgD+6YyQGwA3AGcHBwEDLwICBAYItC8EEUTWRB8RaW5pdBGSiyA2EXRlc3QR0OKCUjEuVGVzdExpYi5zdW0R6YyQGxlnZXRNYXCCLwCFNy4xLjAAKmhsfQ==',
        aci: [{
          namespace: { name: 'TestLib', typedefs: [] },
        }, {
          contract: {
            functions: [{
              arguments: [{ name: '_z', type: 'int' }],
              name: 'init',
              payable: false,
              returns: 'Identity.state',
              stateful: false,
            }, {
              arguments: [{ name: 'x', type: 'int' }, { name: 'y', type: 'int' }],
              name: 'test',
              payable: false,
              returns: 'int',
              stateful: false,
            }, {
              arguments: [],
              name: 'getMap',
              payable: false,
              returns: { map: ['int', 'int'] },
              stateful: false,
            }],
            kind: 'contract_main',
            name: 'Identity',
            payable: false,
            state: { record: [{ name: 'z', type: 'int' }] },
            typedefs: [],
          },
        }],
      });
      await fs.remove(descrPath);
    });

    it('deploys contract by bytecode', async () => {
      const contractBytecodeFile = 'test-artifacts/bytecode.bin';
      await fs.outputFile(contractBytecodeFile, decode(contractBytecode));
      await executeContract([
        'deploy',
        WALLET_NAME, '--password', 'test',
        '--contractAci', contractAciFile,
        '--contractBytecode', contractBytecodeFile,
        '[3]',
        '--json',
      ]);
    });

    it('throws error if arguments invalid', async () => {
      await expect(executeContract([
        'deploy',
        WALLET_NAME, '--password', 'test',
        '--contractSource', contractSourceFile,
        '[3',
        '--json',
      ])).to.be.rejectedWith(CliError, 'Can\'t parse contract arguments: Unexpected end of JSON input');
    });
  });

  describe('Call', () => {
    it('calls contract', async () => {
      const callResponse = await executeContract([
        'call',
        '--json',
        '--descrPath', deployDescriptorFile,
        'test', '[1, 2]',
        WALLET_NAME, '--password', 'test',
      ]);
      callResponse.result.returnValue.should.contain('cb_');
      callResponse.decodedResult.should.be.equal('6');
    });

    it('overrides descriptor\'s address using --contractAddress', async () => {
      await expect(executeContract([
        'call',
        '--json',
        '--contractAddress', 'ct_test',
        '--descrPath', deployDescriptorFile,
        'test', '[1, 2]',
        WALLET_NAME, '--password', 'test',
      ])).to.be.rejectedWith('Invalid name or address: ct_test');
    });

    it('throws error if descriptor file not exists', async () => {
      await expect(executeContract([
        'call',
        '--json',
        '--descrPath', `${deployDescriptorFile}test`,
        'test', '[1, 2]',
        WALLET_NAME, '--password', 'test',
      ])).to.be.rejectedWith('ENOENT: no such file or directory, open');
    });

    it('throws error when calls contract without wallet', async () => {
      await expect(executeContract([
        'call',
        '--json',
        '--descrPath', deployDescriptorFile,
        'test', '[1, 2]',
      ])).to.be.rejectedWith(CliError, 'wallet_path is required for on-chain calls');
    });

    it('calls contract static', async () => {
      const callResponse = await executeContract([
        'call',
        '--json',
        '--descrPath', deployDescriptorFile,
        'test', '[1, 2]',
        '--callStatic',
        WALLET_NAME, '--password', 'test',
      ]);
      callResponse.result.returnValue.should.contain('cb_');
      callResponse.decodedResult.should.equal('6');
    });

    it('calls contract static with dry run account', async () => {
      const callResponse = await executeContract([
        'call',
        '--json',
        '--descrPath', deployDescriptorFile,
        'test', '[1, 2]',
        '--callStatic',
      ]);
      callResponse.result.returnValue.should.contain('cb_');
      expect(callResponse.result.callerId).to.equal('ak_11111111111111111111111111111111273Yts');
      callResponse.decodedResult.should.equal('6');
    });

    it('returns Maps correctly', async () => {
      const callResponse = await executeContract([
        'call',
        '--json',
        '--descrPath', deployDescriptorFile,
        'getMap',
        '--callStatic',
      ]);
      expect(callResponse.decodedResult).to.be.eql([['1', '2'], ['3', '4']]);
    });

    it('calls contract by contract source and address', async () => {
      const callResponse = await executeContract([
        'call',
        '--json',
        '--contractAddress', contractAddress,
        '--contractSource', contractSourceFile,
        'test', '[1, 2]',
        WALLET_NAME, '--password', 'test',
      ]);
      callResponse.decodedResult.should.equal('6');
    });

    it('calls contract by contract ACI and address', async () => {
      const callResponse = await executeContract([
        'call',
        '--json',
        '--contractAddress', contractAddress,
        '--contractAci', contractAciFile,
        'test', '[1, 2]',
        WALLET_NAME, '--password', 'test',
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
