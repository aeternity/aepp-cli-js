import { Command } from 'commander';
import inspect from '../actions/inspect.js';
import { nodeOption, jsonOption, forceOption } from '../arguments.js';
import {
  addExamples,
  exampleAddress1,
  exampleContract,
  exampleHeight,
  exampleName,
  exampleOracle,
  exampleTransaction,
} from '../utils/helpers.js';

const command = new Command('inspect')
  .arguments('<identifier>')
  .summary('get details of a node entity')
  .description(
    [
      'Prints details of:',
      ...[
        'account (ak_-prefixed string)',
        "name (string ending with '.chain')",
        'contract (ct_-prefixed string)',
        'oracle (ok_-prefixed string)',
        'keyblock or microblock (prefixed with kh_, mh_)',
        'keyblock by height (integer)',
        'transaction (by th_-string or tx_)',
      ].map((el, i, arr) => `  - ${el}${arr.length === i + 1 ? '.' : ','}`),
    ].join('\n'),
  )
  .addOption(nodeOption)
  .addOption(forceOption)
  .addOption(jsonOption)
  .action(inspect);

addExamples(command, [
  `${exampleAddress1}  # get account details`,
  `${exampleName}  # get details of AENS name`,
  `${exampleContract}  # get contract details`,
  `${exampleOracle}  # get contract details`,
  'kh_CF37tA4KiiZTFqbQ6JFCU7kDt6CBZucBrvineVUGC7svA9vK7  # get key block details by hash',
  'mh_k1K9gLLtdikJhCdKfBbhYGveQs7osSNwceEJZb1jD6AmraNdr  # get micro block details by hash',
  `${exampleHeight}  # get key block details by height`,
  'th_2nZshewM7FtKSsDEP4zXPsGCe9cdxaFTRrcNjJyE22ktjGidZR  # get transaction details by hash',
  `${exampleTransaction}  # get transaction details`,
]);

export default command;
