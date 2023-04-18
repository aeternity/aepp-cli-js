import { Command } from 'commander';
import fs from 'fs-extra';
import { MemoryAccount } from '@aeternity/aepp-sdk';
import CliError from '../utils/CliError';
import { decryptKey } from '../utils/encrypt-key';
import { networkIdOption, passwordOption } from '../arguments';

const program = new Command().name('aecli crypto');

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

export default program;
