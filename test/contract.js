import fs from 'fs-extra';
import {
  after, before, describe, it,
} from 'mocha';
import { expect } from 'chai';
import { decode } from '@aeternity/aepp-sdk';
import { executeProgram, getSdk, WALLET_NAME } from './index.js';
import contractProgram from '../src/commands/contract.js';
import CliError from '../src/utils/CliError.js';

const executeContract = (args) => executeProgram(contractProgram, args);

describe('Contract Module', function contractTests() {
  this.timeout(4000);
  const contractSourceFile = 'test/contracts/contract.aes';
  const contractAciFile = 'test-artifacts/contract-aci.json';
  let deployDescriptorFile;
  let sdk;
  let contractBytecode;
  let contractAddress;

  before(async () => {
    sdk = await getSdk();
    await fs.outputJson(
      contractAciFile,
      (await sdk.compilerApi.compile(contractSourceFile)).aci,
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

  it('compiles contract using cli compiler', async () => {
    const { bytecode } = await executeContract([
      'compile', contractSourceFile, '--json', '--compilerUrl', 'cli',
    ]);
    expect(bytecode).to.equal(contractBytecode);
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
        bytecode: 'cb_+NRGA6CmFq9nCCwTbFoTpKtDko1jYl6CdmFWd0+re1zVAPUVJMC4p7hj/kTWRB8ANwEHNwAaBoIAAQM//pKLIDYANwIHBwcMAoIMAQICAxHQ4oJSDAEABAMR0OKCUv7Q4oJSAjcCBwcHFBQAAgD+6YyQGwA3AGcHBwEDLwICBAYI/viMoQQENwAHAQMAuD0vBRFE1kQfEWluaXQRkosgNhF0ZXN0EdDiglIxLlRlc3RMaWIuc3VtEemMkBsZZ2V0TWFwEfiMoQQNcGF5gi8AhTcuNC4xAK21f/c=',
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
            }, {
              arguments: [],
              name: 'pay',
              payable: true,
              returns: 'int',
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
      const expectedError = process.version.startsWith('v18.')
        ? 'Unexpected end of JSON input'
        : 'Can\'t parse contract arguments: Expected \',\' or \']\' after array element in JSON at position 2';
      await expect(executeContract([
        'deploy',
        WALLET_NAME, '--password', 'test',
        '--contractSource', contractSourceFile,
        '[3',
        '--json',
      ])).to.be.rejectedWith(CliError, expectedError);
    });

    it('deploys contract with coins', async () => {
      const { address } = await executeContract([
        'deploy',
        WALLET_NAME, '--password', 'test',
        '--contractSource', contractSourceFile,
        '[3]',
        '--json',
        '--amount', '1',
      ]);
      expect(await sdk.getBalance(address)).to.be.equal('1');
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
      ])).to.be.rejectedWith('no such file or directory');
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

    it('calls contract with coins', async () => {
      await executeContract([
        'call',
        '--json',
        '--descrPath', deployDescriptorFile,
        'pay', '[]',
        WALLET_NAME, '--password', 'test',
        '--amount', '0.000000001ae',
      ]);
      expect(await sdk.getBalance(contractAddress)).to.be.equal('1000000000');
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
