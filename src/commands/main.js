import { Command } from 'commander';
import prompts from 'prompts';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { resolve } from 'path';
import updateNotifier from 'update-notifier';
import { Node, ConsensusProtocolVersion } from '@aeternity/aepp-sdk';
import accountCmd from './account.js';
import spendCmd from './spend.js';
import nameCmd from './name.js';
import contractCmd from './contract.js';
import oracleCmd from './oracle.js';
import chainCmd from './chain.js';
import inspectCmd from './inspect.js';
import txCmd from './tx.js';
import { compilerOption, nodeOption } from '../arguments.js';
import { getCompilerByUrl } from '../utils/cli.js';
import { addToConfig } from '../utils/config.js';
import CliError from '../utils/CliError.js';

const program = new Command('aecli');

[
  accountCmd, spendCmd, nameCmd, contractCmd, oracleCmd, chainCmd, inspectCmd, txCmd,
].forEach((cmd) => program.addCommand(cmd));

(() => {
  const { name, version } = fs.readJSONSync(
    resolve(fileURLToPath(import.meta.url), '../../../package.json'),
  );

  program.version(version);

  updateNotifier({ pkg: { name, version } }).notify();
})();

async function getNodeDescription(url) {
  const nodeInfo = await new Node(url).getNodeInfo().catch(() => {});
  return nodeInfo
    ? [
      `network id ${nodeInfo.nodeNetworkId}`,
      `version ${nodeInfo.version}`,
      `protocol ${nodeInfo.consensusProtocolVersion} (${ConsensusProtocolVersion[nodeInfo.consensusProtocolVersion]})`,
    ].join(', ')
    : 'can\'t get node info';
}

async function getCompilerDescription(url) {
  const compiler = getCompilerByUrl(url);
  const version = await compiler.version().catch(() => {});
  return version ? `version ${version}` : 'can\'t get compiler version';
}

const addCommonOptions = (cmd) => {
  const summary = cmd.summary();
  cmd.description(`${summary[0].toUpperCase()}${summary.slice(1)}.`);
};

let command = program.command('config')
  .summary('print the current sdk configuration')
  .addOption(nodeOption)
  .addOption(compilerOption)
  .action(async ({ url, compilerUrl }) => {
    console.log('Node', url, await getNodeDescription(url));
    console.log('Compiler', compilerUrl, await getCompilerDescription(compilerUrl));
  });
addCommonOptions(command);

async function askUrl(entity, choices, getDescription, _url) {
  let url = _url;
  if (url == null) {
    const getChoices = async (withDescriptions) => [
      ...await Promise.all(choices.map(async (choice) => ({
        title: choice.name,
        value: choice.url,
        description: withDescriptions ? await getDescription(choice.url) : 'version loading...',
      }))),
      {
        title: 'Enter URL',
        value: 'custom-url',
      },
    ];

    let loadingDescription = false;
    url = (await prompts({
      type: 'select',
      name: 'url',
      message: `Select a ${entity} to use in other commands`,
      choices: await getChoices(false),
      async onRender() {
        if (loadingDescription) return;
        loadingDescription = true;
        this.choices = await getChoices(true);
        this.render();
      },
    })).url;

    if (url === 'custom-url') {
      url = (await prompts({
        type: 'text',
        name: 'url',
        message: `Enter a ${entity} url to use in other commands`,
      })).url;
    }

    if (url == null) process.exit(0);
  }
  if (choices.map((c) => c.url).includes(url)) return url;
  try {
    return (new URL(url)).toString();
  } catch (error) {
    throw new CliError(error.message);
  }
}

command = program.command('select-node')
  .argument('[nodeUrl]', 'Node URL')
  .summary('specify node to use in other commands')
  .action(async (url) => {
    const nodes = [
      { name: 'Mainnet', url: 'https://mainnet.aeternity.io/' },
      { name: 'Testnet', url: 'https://testnet.aeternity.io/' },
      { name: 'Next', url: 'https://next.aeternity.io/' },
    ];
    await addToConfig({ url: await askUrl('node', nodes, getNodeDescription, url) });
  });
addCommonOptions(command);

command = program.command('select-compiler')
  .argument('[compilerUrl]', 'Compiler URL')
  .summary('specify compiler to use in other commands')
  .action(async (url) => {
    const compilers = [
      { name: 'Stable v7', url: 'https://v7.compiler.aepps.com/' },
      { name: 'Integrated compiler, FATE 2 (requires Erlang)', url: 'cli' },
      { name: 'Integrated compiler, FATE 3 (requires Erlang)', url: 'cli8' },
    ];
    await addToConfig({
      compilerUrl: await askUrl('compiler', compilers, getCompilerDescription, url),
    });
  });
addCommonOptions(command);

export default program;
