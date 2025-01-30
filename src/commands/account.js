import { Command } from 'commander';
import * as Account from '../actions/account.js';
import {
  nodeOption,
  jsonOption,
  forceOption,
  passwordOption,
  networkIdOption,
} from '../arguments.js';
import { addExamples, exampleAddress1, exampleTransaction } from '../utils/helpers.js';

const program = new Command('account').summary('handle wallet operations');

const addCommonOptions = (cmd, examples) => {
  cmd.addOption(jsonOption);
  if (!cmd.description()) {
    const summary = cmd.summary();
    cmd.description(`${summary[0].toUpperCase()}${summary.slice(1)}.`);
  }
  addExamples(cmd, examples);
};

const addWalletOptions = (cmd, examples) => {
  cmd.addOption(passwordOption);
  addCommonOptions(cmd, examples);
};

let command = program
  .command('sign <wallet_path> <tx>')
  .addOption(nodeOption)
  .addOption(forceOption)
  .addOption(networkIdOption)
  .summary('sign a transaction using wallet')
  .description('Sign a transaction using wallet. Useful in offline signing scheme.')
  .action(Account.sign);
addWalletOptions(command, [`./wallet.json ${exampleTransaction}`]);

const exampleMessage = "'message to sign'";

command = program
  .command('sign-message <wallet_path> [data...]')
  .option(
    '--filePath [path]',
    'Specify the path to the file for signing (ignore "data" argument and use file instead)',
  )
  .summary('sign a personal message using wallet')
  .action(Account.signMessage);
addWalletOptions(command, [`./wallet.json ${exampleMessage}`]);

command = program
  .command('verify-message <address> <hexSignature> [data...]')
  .option(
    '--filePath [path]',
    'Specify the path to the file (ignore "data" argument and use file instead)',
  )
  .summary('check if message was signed by address')
  .action(Account.verifyMessage);
addCommonOptions(command, [
  `${exampleAddress1} f2f268f195d4747568f38f9efd36e72606dc356c0b8db9fdfae5f1f9c207dbc354c57c29397837d911516aef184b0ddbed7d16d77caf9ffb3f42fe2bcc15c30e ${exampleMessage}`,
]);

command = program
  .command('address <wallet_path>')
  .option('--secretKey', 'Print secret key')
  .option('--forcePrompt', 'Force prompting')
  .summary('get wallet address and optionally secret key')
  .action(Account.getAddress);
addWalletOptions(command, [
  './wallet.json  # show only public key',
  './wallet.json --secretKey  # show public key and secret key',
]);

command = program
  .command('create <wallet_path>')
  .argument('[secretKey]', 'secret key in `sk_` or hex encoding')
  .option('--overwrite', 'Overwrite if exist')
  .summary('create a wallet by a secret key or generate a new one')
  .description(
    [
      'Create a password-encrypted wallet by a secret key.',
      'Secret key can be provided in options, or cli will generate one.',
      'This command creates ethereum-like keyfile.',
    ].join(' '),
  )
  .action(Account.createWallet);
addWalletOptions(command, [
  './wallet.json',
  './wallet.json sk_2CuofqWZHrABCrM7GY95YSQn8PyFvKQadnvFnpwhjUnDCFAWmf',
]);

export default program;
