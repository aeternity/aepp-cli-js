import { Command } from 'commander';
import fs from 'fs-extra';
import { unpackTx, Tag, MemoryAccount } from '@aeternity/aepp-sdk';
import { print } from '../utils/print';
import CliError from '../utils/CliError';
import { decode } from '../utils/helpers';
import { decryptKey } from '../utils/encrypt-key';
import { networkIdOption, passwordOption } from '../arguments';

const program = new Command().name('aecli crypto');

program
  .command('decode <base58address>')
  .description('Decodes base58 address to hex')
  // ## Address decoder
  // This helper function decodes address(base58) to hex
  .action((address) => {
    const decoded = decode(address, 'ak').toString('hex');
    console.log(`Decoded address (hex): ${decoded}`);
  });

program
  .command('sign <tx> [privkey]')
  .addOption(passwordOption)
  .option('-f, --file [file]', 'private key file')
  .addOption(networkIdOption.default('ae_mainnet'))
  // ## Transaction Signing
  //
  // This function shows how to use a compliant private key to sign an æternity
  // transaction and turn it into an RLP-encoded tuple ready for mining
  .action(async (tx, privKey, { networkId, password, file }) => {
    const binaryKey = await (() => {
      if (file) return fs.readFile(file);
      if (privKey) return Buffer.from(privKey, 'hex');
      throw new CliError('Must provide either [privkey] or [file]');
    })();
    const decryptedKey = password ? decryptKey(password, binaryKey) : binaryKey;
    const account = new MemoryAccount(decryptedKey);
    console.log(await account.signTransaction(tx, { networkId }));
  });

program
  .command('unpack <tx>')
  // ## Transaction Deserialization
  // This helper function deserialized the transaction `tx` and prints the result.
  .action((tx) => {
    const unpackedTx = unpackTx(tx);
    unpackedTx.txType = Tag[unpackedTx.tag];
    print(unpackedTx);
  });

export default program;
