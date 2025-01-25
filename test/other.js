import { describe, it } from 'mocha';
import { expect } from 'chai';
import { executeProgram } from './index.js';

describe('Other tests', () => {
  it('Config', async () => {
    expect(await executeProgram('config')).to.equal(
      'Node https://mainnet.aeternity.io network id ae_mainnet, version 7.1.0, protocol 6 (Ceres)\n' +
        'Compiler https://v7.compiler.aepps.com version 7.4.0',
    );
  });

  it('selects node', async () => {
    expect(await executeProgram('select-node', 'http://example.com/node')).to.equal('');
  });

  it('fails if invalid url', async () => {
    await expect(executeProgram('select-node', 'example.com/node')).to.be.rejectedWith(
      'Invalid URL',
    );
  });

  it('selects compiler', async () => {
    expect(await executeProgram('select-compiler', 'http://example.com/node')).to.equal('');
  });
});
