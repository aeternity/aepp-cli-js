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

import { Command } from 'commander';
import fs from 'fs';
import {
  Crypto, TxBuilderHelper, TxBuilder, SCHEMA,
} from '@aeternity/aepp-sdk';

const program = new Command().name('aecli crypto');

program
  .command('decode <base58address>')
  .description('Decodes base58 address to hex')
  // ## Address decoder
  // This helper function decodes address(base58) to hex
  .action((address) => {
    const decoded = TxBuilderHelper.decode(address, 'ak').toString('hex');
    console.log(`Decoded address (hex): ${decoded}`);
  });

program
  .command('sign <tx> [privkey]')
  .option('-p, --password [password]', 'password of the private key')
  .option('-f, --file [file]', 'private key file')
  .option('--networkId [networkId]', 'Network id', 'ae_mainnet')
  // ## Transaction Signing
  //
  // This function shows how to use a compliant private key to sign an æternity
  // transaction and turn it into an RLP-encoded tuple ready for mining
  .action((tx, privKey, { networkId, password, file }) => {
    const binaryKey = (() => {
      if (file) return fs.readFileSync(file);
      if (privKey) return Buffer.from(privKey, 'hex');
      throw new Error('Must provide either [privkey] or [file]');
    })();
    const decryptedKey = password ? Crypto.decryptKey(password, binaryKey) : binaryKey;
    const encodedTx = TxBuilderHelper.decode(tx, 'tx');
    const signature = Crypto.sign(Buffer.concat([Buffer.from(networkId), encodedTx]), decryptedKey);
    console.log(TxBuilder.buildTx({ encodedTx, signatures: [signature] }, SCHEMA.TX_TYPE.signed).tx);
  });

program
  .command('unpack <tx>')
  // ## Transaction Deserialization
  // This helper function deserialized the transaction `tx` and prints the result.
  .action((tx) => {
    const unpackedTx = TxBuilder.unpackTx(tx);
    delete unpackedTx.rlpEncoded;
    delete unpackedTx.binary;
    console.log(JSON.stringify(unpackedTx, undefined, 2));
  });

export default program;
