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
  .option('--privateKey', 'Print private key')
  .option('--forcePrompt', 'Force prompting')
  .summary('get wallet address and optionally private key')
  .action(Account.getAddress);
addWalletOptions(command, [
  './wallet.json  # show only public key',
  './wallet.json --privateKey  # show public key and private key',
]);

command = program
  .command('create <wallet_path>')
  .argument('[privkey]', 'Secret key as 64-bytes encoded as hex')
  .option('--overwrite', 'Overwrite if exist')
  .summary('create a wallet by a private key or generate a new one')
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
  './wallet.json 9ebd7beda0c79af72a42ece3821a56eff16359b6df376cf049aee995565f022f840c974b97164776454ba119d84edc4d6058a8dec92b6edc578ab2d30b4c4200',
]);

export default program;
