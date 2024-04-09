import { describe, it } from 'mocha';
import { expect } from 'chai';
import { executeProgram } from './index.js';
import mainProgram from '../src/commands/main.js';

describe('Other tests', () => {
  it('Config', async () => {
    expect(await executeProgram(mainProgram, ['config'])).to.equal(
      'Node https://mainnet.aeternity.io network id ae_mainnet, version 6.13.0, protocol 5 (Iris)\n'
      + 'Compiler https://v7.compiler.aepps.com version 7.4.0',
    );
  }).timeout(4000);

  it('selects node', async () => {
    expect(await executeProgram(mainProgram, ['select-node', 'http://example.com/node']))
      .to.equal('');
  });

  it('fails if invalid url', async () => {
    await expect(executeProgram(mainProgram, ['select-node', 'example.com/node']))
      .to.be.rejectedWith('Invalid URL');
  });

  it('selects compiler', async () => {
    expect(await executeProgram(mainProgram, ['select-compiler', 'http://example.com/node']))
      .to.equal('');
  });
});
