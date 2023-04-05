// # æternity CLI `root` file
//
// This script initialize all `cli` commands
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
// We'll use `commander` for parsing options
import { Command } from 'commander';
import prompts from 'prompts';
import { Node, CompilerCli, CompilerHttpNode } from '@aeternity/aepp-sdk';
import { compilerOption, nodeOption } from '../arguments';
import { addToConfig } from '../utils/config';
import CliError from '../utils/CliError';

const program = new Command();

// Array of child command's
const EXECUTABLE_CMD = [
  { name: 'chain', desc: 'Interact with the blockchain' },
  { name: 'inspect', desc: 'Get information on transactions, blocks,...' },
  { name: 'account', desc: 'Handle wallet operations' },
  { name: 'contract', desc: 'Contract interactions' },
  { name: 'name', desc: 'AENS system' },
  { name: 'tx', desc: 'Transaction builder' },
  { name: 'oracle', desc: 'Interact with oracles' },
  { name: 'crypto', desc: 'Crypto helpers' },
];
// You get get CLI version by exec `aecli version`
program.version(process.env.npm_package_version);

// TODO: switch to usual import after dropping CJS in tests
import('update-notifier').then(({ default: updateNotifier }) => {
  updateNotifier({
    pkg: { name: process.env.npm_package_name, version: process.env.npm_package_version },
  }).notify();
});

// ## Initialize `child` command's
EXECUTABLE_CMD.forEach(({ name, desc }) => program.command(name, desc));

async function getNodeDescription(url) {
  // TODO: remove after fixing https://github.com/aeternity/aepp-sdk-js/issues/1673
  const omitUncaughtExceptions = () => {};
  process.on('uncaughtException', omitUncaughtExceptions);
  const nodeInfo = await (new Node(url)).getNodeInfo().catch(() => {});
  process.off('uncaughtException', omitUncaughtExceptions);
  return nodeInfo
    ? `network id ${nodeInfo.nodeNetworkId}, version ${nodeInfo.version}`
    : 'can\'t get node info';
}

async function getCompilerDescription(url) {
  const compiler = url === 'cli' ? new CompilerCli() : new CompilerHttpNode(url);
  const version = await compiler.version().catch(() => {});
  return version ? `version ${version}` : 'can\'t get compiler version';
}

program
  .command('config')
  .description('Print the current sdk configuration')
  .addOption(nodeOption)
  .addOption(compilerOption)
  .action(async ({ url, compilerUrl }) => {
    console.log('Node', url, await getNodeDescription(url));
    console.log('Compiler', compilerUrl, await getCompilerDescription(compilerUrl));
  });

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

program
  .command('select-node')
  .argument('[nodeUrl]', 'Node URL')
  .description('Specify node to use in other commands')
  .action(async (url) => {
    const nodes = [
      { name: 'Mainnet', url: 'https://mainnet.aeternity.io/' },
      { name: 'Testnet', url: 'https://testnet.aeternity.io/' },
    ];
    await addToConfig({ url: await askUrl('node', nodes, getNodeDescription, url) });
  });

program
  .command('select-compiler')
  .argument('[compilerUrl]', 'Compiler URL')
  .description('Specify compiler to use in other commands')
  .action(async (url) => {
    const compilers = [
      { name: 'Stable v7', url: 'https://v7.compiler.aepps.com/' },
      { name: 'Integrated compiler (requires Erlang installed)', url: 'cli' },
      { name: 'Latest', url: 'https://latest.compiler.aeternity.io/' },
    ];
    await addToConfig({
      compilerUrl: await askUrl('compiler', compilers, getCompilerDescription, url),
    });
  });

export default program;
