import { describe, it } from 'mocha';
import { expect } from 'chai';
import { generateKeyPair, unpackTx, Tag } from '@aeternity/aepp-sdk';
import { executeProgram } from './index';
import cryptoProgramFactory from '../src/commands/crypto';

const executeCrypto = (args) => executeProgram(cryptoProgramFactory, args);

describe('Crypto Module', () => {
  it('signs transaction', async () => {
    const { secretKey } = generateKeyPair();
    const output = await executeCrypto([
      'sign',
      'tx_+F0MAaEB4TK48d23oE5jt/qWR5pUu8UlpTGn8bwM5JISGQMGf7ChAeEyuPHdt6BOY7f6lkeaVLvFJaUxp/G8DOSSEhkDBn+wiBvBbWdOyAAAhg9e1n8oAAABhHRlc3QLK3OW',
      secretKey.toString('hex'),
    ]);
    expect(unpackTx(output).tag).to.equal(Tag.SignedTx);
  });
});
