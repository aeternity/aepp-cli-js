import fs from 'fs-extra';
import program from '../../src/commands/main.js';
import { exampleAddress1, exampleAddress2 } from '../../src/utils/helpers.js';
import { replaceInTemplate, executeProgram, wallet, pass } from './utils.js';

function getRootHelp(): string {
  let output = '';
  program
    .configureOutput({
      writeOut: (str) => {
        output += str;
      },
    })
    .exitOverride();
  program.outputHelp();
  return ['```', '$ aecli', output.trimEnd(), '```'].join('\n');
}

async function getWalletCreateOutput(): Promise<string> {
  const output = await executeProgram(
    'account',
    'create',
    wallet,
    '9ebd7beda0c79af72a42ece3821a56eff16359b6df376cf049aee995565f022f840c974b97164776454ba119d84edc4d6058a8dec92b6edc578ab2d30b4c4200',
    ...pass,
    '--overwrite',
  );
  return [
    '```',
    `$ aecli account create ${wallet}`,
    output.replace(/([\w/-]+)wallet\.json/, '/path/to/wallet.json'),
    '```',
  ].join('\n');
}

async function getInspectOutput(): Promise<string> {
  const output = await executeProgram('inspect', exampleAddress1);
  return ['```', `$ aecli inspect ${exampleAddress1}`, output, '```'].join('\n');
}

async function getSpendOutput(): Promise<string> {
  const output = await executeProgram('spend', wallet, exampleAddress2, '42ae', ...pass);
  return ['```', `$ aecli spend ${wallet} ${exampleAddress2} 42ae`, output, '```'].join('\n');
}

let readme = await fs.readFile('./README.md', 'utf-8');
readme = replaceInTemplate(readme, 'ROOT-HELP', getRootHelp());
readme = replaceInTemplate(readme, 'WALLET-CREATE', await getWalletCreateOutput());
readme = replaceInTemplate(readme, 'INSPECT', await getInspectOutput());
readme = replaceInTemplate(readme, 'SPEND', await getSpendOutput());
await fs.writeFile('./README.md', readme);
