import { describe, it } from 'mocha';
import { expect } from 'chai';
import { executeProgram } from './index';
import mainProgram from '../src/commands/main';

describe('Other tests', () => {
  it('Config', async () => {
    expect(await executeProgram(mainProgram, ['config'])).to.equal(
      'Node https://testnet.aeternity.io network id ae_uat, version 6.8.1\n'
      + 'Compiler https://v7.compiler.aepps.com version 7.1.0',
    );
  });

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
