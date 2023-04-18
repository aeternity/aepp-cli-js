import { describe, it } from 'mocha';
import { expect } from 'chai';
import { generateKeyPair, unpackTx, Tag } from '@aeternity/aepp-sdk';
import { executeProgram } from './index';
import cryptoProgramFactory from '../src/commands/crypto';

const executeCrypto = (args) => executeProgram(cryptoProgramFactory, args);

describe('Crypto Module', () => {
  it('decodes address', async () => {
    const output = await executeCrypto([
      'decode', 'ak_MA8Qe8ac7e9EARYK7fQxEqFufRGrG1i6qFvHA21eXXMDcnmuc',
    ]);
    expect(output).to.include('2dc51099d9b3921f5578d5968c2b0b5a37d11a6cc514f13862f3a9af7f0ab05f');
  });

  it('signs transaction', async () => {
    const { secretKey } = generateKeyPair();
    const output = await executeCrypto([
      'sign',
      'tx_+F0MAaEB4TK48d23oE5jt/qWR5pUu8UlpTGn8bwM5JISGQMGf7ChAeEyuPHdt6BOY7f6lkeaVLvFJaUxp/G8DOSSEhkDBn+wiBvBbWdOyAAAhg9e1n8oAAABhHRlc3QLK3OW',
      secretKey.toString('hex'),
    ]);
    expect(unpackTx(output).tag).to.equal(Tag.SignedTx);
  });

  it('unpacks transaction', async () => {
    const output = await executeCrypto([
      'unpack', 'tx_+F0MAaEB4TK48d23oE5jt/qWR5pUu8UlpTGn8bwM5JISGQMGf7ChAeEyuPHdt6BOY7f6lkeaVLvFJaUxp/G8DOSSEhkDBn+wiBvBbWdOyAAAhg9e1n8oAAABhHRlc3QLK3OW',
    ]);
    expect(output).to.include('SpendTx');
    expect(output).to.include('"recipientId": "ak_2iBPH7HUz3cSDVEUWiHg76MZJ6tZooVNBmmxcgVK6VV8KAE688"');
    expect(output).to.include('"amount": "2000000000000000000"');
    expect(output).to.include('"payload": "ba_dGVzdJVNWkk="');
  });
});
