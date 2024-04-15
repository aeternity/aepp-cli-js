import { Command } from 'commander';
import * as Chain from '../actions/chain.js';
import { nodeOption, jsonOption, forceOption } from '../arguments.js';
import { addExamples, exampleHeight, exampleTransaction } from '../utils/helpers.js';

const program = new Command('chain').summary('make a request to the node');

const addCommonOptions = (cmd, examples) => {
  cmd.addOption(nodeOption).addOption(forceOption).addOption(jsonOption);
  if (!cmd.description()) {
    const summary = cmd.summary();
    cmd.description(`${summary[0].toUpperCase()}${summary.slice(1)}.`);
  }
  addExamples(cmd, examples);
};

let command = program.command('top')
  .summary('query the top key/micro block of the chain')
  .action(Chain.top);
addCommonOptions(command, ['']);

command = program.command('status')
  .summary('query node version, network id, and related details of the selected node')
  .action(Chain.status);
addCommonOptions(command, ['']);

command = program.command('ttl <absoluteTtl>')
  .summary('get relative TTL by absolute TTL')
  .action(Chain.ttl);
addCommonOptions(command, ['']);

command = program.command('play')
  .option('-L, --limit [playLimit]', 'amount of blocks to print', 10)
  .option('-P, --height [playToHeight]', 'print blocks till the height')
  .summary('prints blocks from top until condition')
  .action(Chain.play);
addCommonOptions(command, [
  '--limit 3  # print 3 blocks from top',
  `--height ${exampleHeight}  # print blocks from top until reach height`,
]);

command = program.command('broadcast <tx>')
  .option('-W, --no-waitMined', 'Don\'t wait until transaction gets mined')
  .option('--verify', 'Verify Transaction before broadcasting.')
  .summary('send signed transaction to the chain')
  .description('Send signed transaction to the chain. Useful in offline signing scheme.')
  .action(Chain.broadcast);
addCommonOptions(command, [exampleTransaction]);

export default program;
