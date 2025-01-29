import fs from 'fs-extra';
import { after, before, describe, it } from 'mocha';
import { expect } from 'chai';
import { decode, Encoding, Tag } from '@aeternity/aepp-sdk';
import { executeProgram, getSdk, WALLET_NAME } from './index.js';
import CliError from '../src/utils/CliError.js';
import { expectToMatchLines, toBeAbove0, toBeEncoded, toMatch } from './utils.js';

const executeContract = executeProgram.bind(null, 'contract');

describe('Contract Module', () => {
  const contractSourceFile = 'test/contracts/contract.aes';
  const contractAciFile = 'test-artifacts/contract-aci.json';
  let deployDescriptorFile;
  let aeSdk;
  let contractBytecode;
  let contractAddress;

  before(async () => {
    aeSdk = await getSdk();
    await fs.outputJson(contractAciFile, (await aeSdk.compilerApi.compile(contractSourceFile)).aci);
  });

  after(async () => {
    await fs.remove(deployDescriptorFile);
  });

  it('compiles contract', async () => {
    const res = await executeContract('compile', contractSourceFile);
    expectToMatchLines(res, [/Contract bytecode: cb_[+/=\w]+/]);
  });

  it('compiles contract as json', async () => {
    const res = await executeContract('compile', contractSourceFile, '--json');
    contractBytecode = res.bytecode;
    expect(res).to.eql({
      bytecode: toBeEncoded(res.bytecode, Encoding.Bytecode),
    });
  });

  it('compiles contract using cli compiler', async () => {
    const res = await executeContract(
      'compile',
      contractSourceFile,
      '--json',
      '--compilerUrl',
      'cli8',
    );
    expect(res).to.eql({ bytecode: contractBytecode });
  });

  describe('Deploy', () => {
    it('deploys contract', async () => {
      const res = await executeContract(
        'deploy',
        WALLET_NAME,
        '--password',
        'test',
        '--contractSource',
        contractSourceFile,
        '[3]',
      );
      expectToMatchLines(res, [
        'Contract was successfully deployed',
        /Contract address   ct_\w+/,
        /Transaction hash   th_\w+/,
        /Deploy descriptor  .+\/contract.aes.deploy\.\w+\.json/,
      ]);
    });

    it('deploys contract as json', async () => {
      const res = await executeContract(
        'deploy',
        WALLET_NAME,
        '--password',
        'test',
        '--contractSource',
        contractSourceFile,
        '[3]',
        '--json',
      );
      deployDescriptorFile = res.descrPath;
      contractAddress = res.address;
      // TODO: remove duplicate data in output
      expect(res).to.eql({
        tx: {
          tag: Tag.SignedTx,
          version: 1,
          signatures: [
            {
              type: 'Buffer',
              data: res.tx.signatures[0].data,
            },
          ],
          encodedTx: {
            tag: Tag.ContractCreateTx,
            version: 1,
            ownerId: aeSdk.address,
            nonce: toBeAbove0(res.tx.encodedTx.nonce),
            code: contractBytecode,
            ctVersion: {
              abiVersion: 3,
              vmVersion: 8,
            },
            fee: toMatch(res.tx.encodedTx.fee, /8\d{13}/),
            ttl: toBeAbove0(res.tx.encodedTx.ttl),
            deposit: '0',
            amount: '0',
            gasLimit: 76,
            gasPrice: '1000000000',
            callData: 'cb_KxFE1kQfGwYpzHZy',
          },
        },
        txData: {
          tx: {
            amount: '0',
            fee: toMatch(res.tx.encodedTx.fee, /8\d{13}/),
            ttl: toBeAbove0(res.txData.tx.ttl),
            nonce: toBeAbove0(res.tx.encodedTx.nonce),
            abiVersion: '3',
            ownerId: aeSdk.address,
            code: contractBytecode,
            vmVersion: '8',
            deposit: '0',
            gas: 76,
            gasPrice: '1000000000',
            callData: 'cb_KxFE1kQfGwYpzHZy',
            version: 1,
            type: 'ContractCreateTx',
          },
          blockHeight: toBeAbove0(res.txData.blockHeight),
          blockHash: toBeEncoded(res.txData.blockHash, Encoding.MicroBlockHash),
          hash: toBeEncoded(res.txData.hash, Encoding.TxHash),
          encodedTx: toBeEncoded(res.txData.encodedTx, Encoding.Transaction),
          signatures: [toBeEncoded(res.txData.signatures[0], Encoding.Signature)],
          rawTx: toBeEncoded(res.txData.encodedTx, Encoding.Transaction),
        },
        rawTx: toBeEncoded(res.txData.encodedTx, Encoding.Transaction),
        decodedEvents: [],
        result: {
          callerId: aeSdk.address,
          callerNonce: toBeAbove0(+res.tx.encodedTx.nonce).toString(),
          height: toBeAbove0(res.result.height),
          contractId: toBeEncoded(res.address, Encoding.ContractId),
          gasPrice: '1000000000',
          gasUsed: 61,
          log: [],
          returnValue: 'cb_Xfbg4g==',
          returnType: 'ok',
        },
        owner: aeSdk.address,
        transaction: toBeEncoded(res.transaction, Encoding.TxHash),
        address: toBeEncoded(res.address, Encoding.ContractId),
        descrPath: deployDescriptorFile,
      });
      const [name, add] = deployDescriptorFile.split('.deploy.');
      expect(name).to.satisfy((n) => n.endsWith(contractSourceFile));
      expect(add).to.equal(`${res.address.split('_')[1]}.json`);
    });

    it('deploys contract with custom descrPath', async () => {
      const descrPath = './not-existing/testDescriptor.json';
      const { address } = await executeContract(
        'deploy',
        WALLET_NAME,
        '--password',
        'test',
        '--contractSource',
        contractSourceFile,
        '--descrPath',
        descrPath,
        '[3]',
        '--json',
      );
      expect(await fs.exists(descrPath)).to.equal(true);
      const descriptor = await fs.readJson(descrPath);
      expect(descriptor).to.eql({
        version: 1,
        address,
        bytecode:
          'cb_+NRGA6CmFq9nCCwTbFoTpKtDko1jYl6CdmFWd0+re1zVAPUVJMC4p7hj/kTWRB8ANwEHNwAaBoIAAQM//pKLIDYANwIHBwcMAoIMAQICAxHQ4oJSDAEABAMR0OKCUv7Q4oJSAjcCBwcHFBQAAgD+6YyQGwA3AGcHBwEDLwICBAYI/viMoQQENwAHAQMAuD0vBRFE1kQfEWluaXQRkosgNhF0ZXN0EdDiglIxLlRlc3RMaWIuc3VtEemMkBsZZ2V0TWFwEfiMoQQNcGF5gi8AhTguMC4wALYsKqQ=',
        aci: [
          {
            namespace: { name: 'TestLib', typedefs: [] },
          },
          {
            contract: {
              functions: [
                {
                  arguments: [{ name: '_z', type: 'int' }],
                  name: 'init',
                  payable: false,
                  returns: 'Identity.state',
                  stateful: false,
                },
                {
                  arguments: [
                    { name: 'x', type: 'int' },
                    { name: 'y', type: 'int' },
                  ],
                  name: 'test',
                  payable: false,
                  returns: 'int',
                  stateful: false,
                },
                {
                  arguments: [],
                  name: 'getMap',
                  payable: false,
                  returns: { map: ['int', 'int'] },
                  stateful: false,
                },
                {
                  arguments: [],
                  name: 'pay',
                  payable: true,
                  returns: 'int',
                  stateful: false,
                },
              ],
              kind: 'contract_main',
              name: 'Identity',
              payable: false,
              state: { record: [{ name: 'z', type: 'int' }] },
              typedefs: [],
            },
          },
        ],
      });
      await fs.remove(descrPath);
    });

    it('deploys contract by bytecode', async () => {
      const contractBytecodeFile = 'test-artifacts/bytecode.bin';
      await fs.outputFile(contractBytecodeFile, decode(contractBytecode));
      const res = await executeContract(
        'deploy',
        WALLET_NAME,
        '--password',
        'test',
        '--contractAci',
        contractAciFile,
        '--contractBytecode',
        contractBytecodeFile,
        '[3]',
      );
      expectToMatchLines(res, [
        'Contract was successfully deployed',
        /Contract address   ct_\w+/,
        /Transaction hash   th_\w+/,
        /Deploy descriptor  .+\/bytecode.bin.deploy\.\w+\.json/,
      ]);
    });

    it('throws error if arguments invalid', async () => {
      const expectedError = process.version.startsWith('v18.')
        ? 'Unexpected end of JSON input'
        : "Can't parse contract arguments: Expected ',' or ']' after array element in JSON at position 2";
      await expect(
        executeContract(
          'deploy',
          WALLET_NAME,
          '--password',
          'test',
          '--contractSource',
          contractSourceFile,
          '[3',
        ),
      ).to.be.rejectedWith(CliError, expectedError);
    });

    it('deploys contract with coins', async () => {
      const { address } = await executeContract(
        'deploy',
        WALLET_NAME,
        '--password',
        'test',
        '--contractSource',
        contractSourceFile,
        '[3]',
        '--json',
        '--amount',
        '1',
      );
      expect(await aeSdk.getBalance(address)).to.equal('1');
    });
  });

  describe('Call', () => {
    it('calls contract', async () => {
      const res = await executeContract(
        'call',
        '--descrPath',
        deployDescriptorFile,
        'test',
        '[1, 2]',
        WALLET_NAME,
        '--password',
        'test',
      );
      expectToMatchLines(res, [
        /Transaction hash  th_\w+/,
        /Block hash        mh_\w+/,
        /Block height      \d+ \(about now\)/,
        /Signatures        \["sg_\w+"\]/,
        'Transaction type  ContractCallTx (ver. 1)',
        `Caller address    ${aeSdk.address}`,
        `Contract address  ${contractAddress}`,
        'Gas               2625 (0.000002625ae)',
        'Gas price         0.000000001ae',
        'Call data         cb_KxGSiyA2KwIEFfUrtQ==',
        'ABI version       3 (Fate)',
        'Amount            0ae',
        /Fee               0\.00018\d+ae/,
        /Nonce             \d+/,
        /TTL               \d+ \(in [56] minutes\)/,
        '----------------------Call info-----------------------',
        'Gas used                2100 (0.0000021ae)',
        'Return value (encoded)  cb_DA6sWJo=',
        'Return value (decoded)  6',
      ]);
    });

    it('calls contract as json', async () => {
      const res = await executeContract(
        'call',
        '--json',
        '--descrPath',
        deployDescriptorFile,
        'test',
        '[1, 2]',
        WALLET_NAME,
        '--password',
        'test',
      );
      // TODO: remove duplicate data in output
      expect(res).to.eql({
        hash: toBeEncoded(res.hash, Encoding.TxHash),
        tx: {
          tag: Tag.SignedTx,
          version: 1,
          signatures: [
            {
              type: 'Buffer',
              data: res.tx.signatures[0].data,
            },
          ],
          encodedTx: {
            tag: Tag.ContractCallTx,
            version: 1,
            callerId: aeSdk.address,
            nonce: toBeAbove0(res.tx.encodedTx.nonce),
            contractId: contractAddress,
            abiVersion: 3,
            fee: toMatch(res.tx.encodedTx.fee, /18\d{13}/),
            ttl: toBeAbove0(res.tx.encodedTx.ttl),
            amount: '0',
            gasLimit: 2625,
            gasPrice: '1000000000',
            callData: 'cb_KxGSiyA2KwIEFfUrtQ==',
          },
        },
        txData: {
          tx: {
            amount: '0',
            fee: toMatch(res.tx.encodedTx.fee, /18\d{13}/),
            ttl: toBeAbove0(res.tx.encodedTx.ttl),
            nonce: toBeAbove0(res.tx.encodedTx.nonce),
            abiVersion: '3',
            gas: 2625,
            gasPrice: '1000000000',
            callData: 'cb_KxGSiyA2KwIEFfUrtQ==',
            callerId: aeSdk.address,
            contractId: contractAddress,
            version: 1,
            type: 'ContractCallTx',
          },
          blockHeight: toBeAbove0(res.txData.blockHeight),
          blockHash: toBeEncoded(res.txData.blockHash, Encoding.MicroBlockHash),
          hash: toBeEncoded(res.txData.hash, Encoding.TxHash),
          encodedTx: toBeEncoded(res.txData.encodedTx, Encoding.Transaction),
          signatures: [toBeEncoded(res.txData.signatures[0], Encoding.Signature)],
          rawTx: toBeEncoded(res.txData.encodedTx, Encoding.Transaction),
        },
        rawTx: toBeEncoded(res.txData.encodedTx, Encoding.Transaction),
        decodedResult: '6',
        decodedEvents: [],
        result: {
          callerId: aeSdk.address,
          callerNonce: toBeAbove0(res.tx.encodedTx.nonce).toString(),
          height: toBeAbove0(res.txData.blockHeight),
          contractId: contractAddress,
          gasPrice: '1000000000',
          gasUsed: 2100,
          log: [],
          returnValue: 'cb_DA6sWJo=',
          returnType: 'ok',
        },
      });
    });

    it("overrides descriptor's address using --contractAddress", async () => {
      await expect(
        executeContract(
          'call',
          '--contractAddress',
          'ct_test',
          '--descrPath',
          deployDescriptorFile,
          'test',
          '[1, 2]',
          WALLET_NAME,
          '--password',
          'test',
        ),
      ).to.be.rejectedWith('Invalid name or address: ct_test');
    });

    it('throws error if descriptor file not exists', async () => {
      await expect(
        executeContract(
          'call',
          '--descrPath',
          `${deployDescriptorFile}test`,
          'test',
          '[1, 2]',
          WALLET_NAME,
          '--password',
          'test',
        ),
      ).to.be.rejectedWith('no such file or directory');
    });

    it('throws error when calls contract without wallet', async () => {
      await expect(
        executeContract('call', '--descrPath', deployDescriptorFile, 'test', '[1, 2]'),
      ).to.be.rejectedWith(CliError, 'wallet_path is required for on-chain calls');
    });

    // TODO: enable after fixing "Cannot read properties of undefined (reading 'tx')"
    it.skip('calls contract static', async () => {
      const res = await executeContract(
        'call',
        '--descrPath',
        deployDescriptorFile,
        'test',
        '[1, 2]',
        '--callStatic',
        WALLET_NAME,
      );
      expectToMatchLines(res, []);
    });

    it('calls contract static as json', async () => {
      const res = await executeContract(
        'call',
        '--json',
        '--descrPath',
        deployDescriptorFile,
        'test',
        '[1, 2]',
        '--callStatic',
        WALLET_NAME,
      );
      expect(res).to.eql({
        type: 'contract_call',
        decodedResult: '6',
        decodedEvents: [],
        tx: {
          tag: Tag.ContractCallTx,
          version: 1,
          callerId: aeSdk.address,
          nonce: toBeAbove0(res.tx.nonce),
          contractId: contractAddress,
          abiVersion: 3,
          fee: toMatch(res.tx.fee, /18\d{13}/),
          ttl: 0,
          amount: '0',
          gasLimit: 5817960,
          gasPrice: '1000000000',
          callData: 'cb_KxGSiyA2KwIEFfUrtQ==',
        },
        result: {
          callerId: aeSdk.address,
          callerNonce: toBeAbove0(res.tx.nonce).toString(),
          height: toBeAbove0(res.result.height),
          contractId: contractAddress,
          gasPrice: '1000000000',
          gasUsed: 2100,
          log: [],
          returnValue: 'cb_DA6sWJo=',
          returnType: 'ok',
        },
        rawTx: toBeEncoded(res.rawTx, Encoding.Transaction),
        hash: toBeEncoded(res.hash, Encoding.TxHash),
      });
    });

    it('calls contract static with dry run account', async () => {
      const callResponse = await executeContract(
        'call',
        '--json',
        '--descrPath',
        deployDescriptorFile,
        'test',
        '[1, 2]',
        '--callStatic',
      );
      expect(callResponse.result.returnValue).to.satisfies((s) =>
        s.startsWith(Encoding.ContractBytearray),
      );
      expect(callResponse.tx.callerId).to.equal('ak_11111111111111111111111111111111273Yts');
      expect(callResponse.result.callerId).to.equal('ak_11111111111111111111111111111111273Yts');
      expect(callResponse.decodedResult).to.equal('6');
    });

    it('returns Maps correctly', async () => {
      const callResponse = await executeContract(
        'call',
        '--json',
        '--descrPath',
        deployDescriptorFile,
        'getMap',
        '--callStatic',
      );
      expect(callResponse.decodedResult).to.eql([
        ['1', '2'],
        ['3', '4'],
      ]);
    });

    it('calls contract by contract source and address', async () => {
      const callResponse = await executeContract(
        'call',
        '--json',
        '--contractAddress',
        contractAddress,
        '--contractSource',
        contractSourceFile,
        'test',
        '[1, 2]',
        WALLET_NAME,
        '--password',
        'test',
      );
      expect(callResponse.decodedResult).to.equal('6');
    });

    it('calls contract by contract ACI and address', async () => {
      const callResponse = await executeContract(
        'call',
        '--json',
        '--contractAddress',
        contractAddress,
        '--contractAci',
        contractAciFile,
        'test',
        '[1, 2]',
        WALLET_NAME,
        '--password',
        'test',
      );
      expect(callResponse.decodedResult).to.equal('6');
    });

    it('calls contract with coins', async () => {
      await executeContract(
        'call',
        '--descrPath',
        deployDescriptorFile,
        'pay',
        '[]',
        WALLET_NAME,
        '--password',
        'test',
        '--amount',
        '0.000000001ae',
      );
      expect(await aeSdk.getBalance(contractAddress)).to.equal('1000000000');
    });
  });

  describe('Calldata', () => {
    it('encodes calldata', async () => {
      const res = await executeContract(
        'encode-calldata',
        'test',
        '[1, 2]',
        '--contractSource',
        contractSourceFile,
      );
      expectToMatchLines(res, ['Contract encoded calldata: cb_KxGSiyA2KwIEFfUrtQ==']);
    });

    it('encodes calldata as json', async () => {
      const res = await executeContract(
        'encode-calldata',
        'test',
        '[1, 2]',
        '--contractSource',
        contractSourceFile,
        '--json',
      );
      expect(res).to.eql({ calldata: 'cb_KxGSiyA2KwIEFfUrtQ==' });
    });

    it('encodes calldata by aci', async () => {
      const res = await executeContract(
        'encode-calldata',
        'test',
        '[1, 2]',
        '--contractAci',
        contractAciFile,
        '--json',
      );
      expect(res).to.eql({ calldata: 'cb_KxGSiyA2KwIEFfUrtQ==' });
    });

    it('encodes calldata by deploy descriptor', async () => {
      const res = await executeContract(
        'encode-calldata',
        'test',
        '[1, 2]',
        '--descrPath',
        deployDescriptorFile,
        '--json',
      );
      expect(res).to.eql({ calldata: 'cb_KxGSiyA2KwIEFfUrtQ==' });
    });

    it('decodes call result', async () => {
      const res = await executeContract(
        'decode-call-result',
        'test',
        'cb_BvMDXHk=',
        '--contractSource',
        contractSourceFile,
      );
      expectToMatchLines(res, ['Contract decoded call result:', '3']);
    });

    it('decodes call result as json', async () => {
      const res = await executeContract(
        'decode-call-result',
        'test',
        'cb_BvMDXHk=',
        '--contractSource',
        contractSourceFile,
        '--json',
      );
      expect(res).to.eql({ decoded: '3' });
    });
  });
});
