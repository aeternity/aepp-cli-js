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
import { Crypto } from '@aeternity/aepp-sdk';

// ## Transaction Deserialization
//
// This helper function deserialized the transaction `tx` and prints the result.
function unpackTx(tx) {
  const deserializedTx = Crypto.deserialize(Crypto.decodeTx(tx));
  console.log(JSON.stringify(deserializedTx, undefined, 2));
}

// ## Address decoder
//
// This helper function decodes address(base58) to hex
function decodeAddress(address) {
  const decoded = Crypto.decodeBase58Check(address.split('_')[1]).toString('hex');
  console.log(`Decoded address (hex): ${decoded}`);
}

const program = new Command().name('aecli crypto');

// ## Transaction Signing
//
// This function shows how to use a compliant private key to sign an æternity
// transaction and turn it into an RLP-encoded tuple ready for mining
function signTx(tx, privKey) {
  if (!tx.match(/^tx_.+/)) {
    throw Error('Not a valid transaction');
  }

  const binaryKey = (() => {
    if (program.file) {
      return fs.readFileSync(program.file);
    } if (privKey) {
      return Buffer.from(privKey, 'hex');
    }
    throw Error('Must provide either [privkey] or [file]');
  })();

  const decryptedKey = program.password ? Crypto.decryptKey(program.password, binaryKey) : binaryKey;

  // Split the base58Check part of the transaction
  const base58CheckTx = tx.split('_')[1];
  // ... and sign the binary create_contract transaction
  const binaryTx = Crypto.decodeBase58Check(base58CheckTx);

  const signature = Crypto.sign(Buffer.concat([Buffer.from(Crypto.NETWORK_ID), binaryTx]), decryptedKey);

  // the signed tx deserializer expects a 4-tuple:
  // <tag, version, signatures_array, binary_tx>
  const unpackedSignedTx = [
    Buffer.from([11]),
    Buffer.from([1]),
    [Buffer.from(signature)],
    binaryTx,
  ];

  console.log(Crypto.encodeTx(unpackedSignedTx));
}

program
  .command('decode <base58address>')
  .description('Decodes base58 address to hex')
  .action(decodeAddress);

program
  .command('sign <tx> [privkey]')
  .option('-p, --password [password]', 'password of the private key')
  .option('-f, --file [file]', 'private key file')
  .action(signTx);

program
  .command('unpack <tx>')
  .action(unpackTx);

export default program;
