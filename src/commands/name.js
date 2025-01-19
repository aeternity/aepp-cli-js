import { Command } from 'commander';
import { NAME_TTL } from '@aeternity/aepp-sdk';
import * as AENS from '../actions/aens.js';
import {
  nodeOption,
  jsonOption,
  feeOption,
  forceOption,
  passwordOption,
  ttlOption,
  coinAmountParser,
  clientTtlOption,
  nameFeeOption,
} from '../arguments.js';
import { addExamples, exampleAddress1, exampleContract, exampleName } from '../utils/helpers.js';

const program = new Command('name').summary('manage AENS names');

const addCommonOptions = (cmd, example) => {
  cmd
    .addOption(nodeOption)
    .addOption(ttlOption(true))
    .addOption(feeOption)
    .option('--nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
    .addOption(passwordOption)
    .addOption(forceOption)
    .addOption(jsonOption);
  if (!cmd.description()) {
    const summary = cmd.summary();
    cmd.description(`${summary[0].toUpperCase()}${summary.slice(1)}.`);
  }
  addExamples(cmd, [example]);
};

const claimingGuide = [
  'A name in arguments should end with ".chain". Be careful, shorter names are more expensive.',
  'If the name is shorter than 13 characters (without ".chain") then it won\'t be claimed immediately',
  'but would start an auction instead.',
].join(' ');

let command = program
  .command('full-claim <wallet_path> <name>')
  .addOption(nameFeeOption)
  .option('--nameTtl [nameTtl]', 'Validity of name.', NAME_TTL)
  .addOption(clientTtlOption)
  .summary('claim an AENS name in a single command')
  .description(
    [
      'Claim an AENS name in a single command.',
      'This command signs and sends a pre-claim transaction and waits until one block gets mined.',
      'After that, it sends a claim transaction. At the end, the update transaction is',
      'submitted, making a name point to the current account.',
    ].join(' ') + `\n\n${claimingGuide}`,
  )
  .action(AENS.fullClaim);
addCommonOptions(command, `./wallet.json ${exampleName}`);

// TODO: consider keeping only full-claim
command = program
  .command('pre-claim <wallet_path> <name>')
  .summary('pre-claim an AENS name')
  .description(
    [
      'Pre-claim an AENS name. The name should be claimed after one key block since the pre-claim gets mined.',
      'This command sends a pre-claim transaction,',
      'and outputs a salt that needs to be provided to `aecli name claim`.',
    ].join(' ') + `\n\n${claimingGuide}`,
  )
  .action(AENS.preClaim);
addCommonOptions(command, `./wallet.json ${exampleName}`);

command = program
  .command('claim <wallet_path> <name> <salt>')
  .addOption(nameFeeOption)
  .summary('claim an AENS name (requires pre-claim)')
  .description(
    'Claim an AENS name, it requires a salt provided by `aecli name pre-claim`.' +
      `\n\n${claimingGuide}`,
  )
  .action(AENS.claim);
addCommonOptions(command, `./wallet.json ${exampleName} 12327389123`);

command = program
  .command('bid <wallet_path> <name>')
  .argument('<nameFee>', 'Amount of coins to pay for name', coinAmountParser)
  .summary('bid on name in auction')
  .action(AENS.nameBid);
addCommonOptions(command, `./wallet.json ${exampleName} 4.2ae`);

command = program
  .command('update <wallet_path> <name> [addresses...]')
  .option('--extendPointers', 'Extend pointers', false)
  .option('--nameTtl [nameTtl]', 'A number of blocks until name expires', NAME_TTL)
  .addOption(clientTtlOption)
  .summary('update a name pointer')
  .action(AENS.updateName);
addCommonOptions(command, `./wallet.json ${exampleName} ${exampleContract}`);

command = program
  .command('extend <wallet_path> <name>')
  .argument('[nameTtl]', 'A number of blocks until name expires', NAME_TTL)
  .addOption(clientTtlOption)
  .summary('extend name TTL')
  .action(AENS.extendName);
addCommonOptions(command, `./wallet.json ${exampleName} 180000`);

command = program
  .command('revoke <wallet_path> <name>')
  .summary('revoke an AENS name')
  .description(
    [
      'Revoke an AENS name. After that nobody will be able to claim it again.',
      'This action is irreversible!',
    ].join(' '),
  )
  .action(AENS.revokeName);
addCommonOptions(command, `./wallet.json ${exampleName}`);

command = program
  .command('transfer <wallet_path> <name> <address>')
  .summary('transfer a name to another account')
  .action(AENS.transferName);
addCommonOptions(command, `./wallet.json ${exampleName} ${exampleAddress1}`);

export default program;
