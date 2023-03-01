/*
 * ISC License (ISC)
 * Copyright (c) 2022 aeternity developers
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

import { describe, it } from 'mocha';
import { expect } from 'chai';
import { executeProgram } from './index';
import mainProgram from '../src/commands/main';

describe('Other tests', () => {
  it('Config', async () => {
    expect(await executeProgram(mainProgram, ['config'])).to.equal(
      'Node https://testnet.aeternity.io network id ae_uat, version 6.8.1\n'
      + 'Compiler https://compiler.aepps.com version 6.1.0',
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
