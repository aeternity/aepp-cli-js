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

import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import {
  AeSdk, MemoryAccount, Node, generateKeyPair,
} from '@aeternity/aepp-sdk';
import accountProgram from '../src/commands/account';

chai.use(chaiAsPromised);
chai.should();

const url = process.env.TEST_URL || 'http://localhost:3013';
const compilerUrl = process.env.COMPILER_URL || 'http://localhost:3080';
const publicKey = process.env.PUBLIC_KEY || 'ak_2dATVcZ9KJU5a8hdsVtTv21pYiGWiPbmVcU1Pz72FFqpk9pSRR';
const secretKey = process.env.SECRET_KEY || 'bf66e1c256931870908a649572ed0257876bb84e3cdf71efb12f56c7335fad54d5cf08400e988222f26eb4b02c8f89077457467211a6e6d955edb70749c6a33b';
export const networkId = process.env.TEST_NETWORK_ID || 'ae_devnet';
const ignoreVersion = process.env.IGNORE_VERSION || false;
const keypair = generateKeyPair();
export const WALLET_NAME = 'test-artifacts/wallet.json';

const Sdk = async (params = {}) => {
  const sdk = new AeSdk({
    /* eslint-disable no-underscore-dangle */
    _expectedMineRate: process.env._EXPECTED_MINE_RATE,
    _microBlockCycle: process.env._MICRO_BLOCK_CYCLE,
    /* eslint-enable no-underscore-dangle */
    ignoreVersion,
    compilerUrl,
    nodes: [{ name: 'test', instance: new Node(url) }],
    ...params,
  });
  params.accounts ??= [new MemoryAccount({ keypair: { publicKey, secretKey } })];
  await Promise.all(params.accounts.map((acc, idx) => sdk.addAccount(acc, { select: idx === 0 })));
  return sdk;
};

const spendPromise = (async () => {
  const sdk = await Sdk();
  await sdk.awaitHeight(2);
  await sdk.spend(1e26, keypair.publicKey);
})();

function getProgramOptions(command) {
  return {
    /* eslint-disable no-underscore-dangle */
    optionValues: { ...command._optionValues },
    optionValueSources: { ...command._optionValueSources },
    /* eslint-enable no-underscore-dangle */
    commands: command.commands.map((c) => getProgramOptions(c)),
  };
}

function setProgramOptions(command, options) {
  /* eslint-disable no-underscore-dangle */
  command._optionValues = options.optionValues;
  command._optionValueSources = options.optionValueSources;
  /* eslint-enable no-underscore-dangle */
  command.commands.forEach((c, i) => setProgramOptions(c, options.commands[i]));
}

let isProgramExecuting = false;
export async function executeProgram(program, args) {
  if (isProgramExecuting) throw new Error('Another program is already running');
  isProgramExecuting = true;
  let result = '';
  program
    .configureOutput({ writeOut: (str) => { result += str; } })
    .exitOverride();

  const { log } = console;
  console.log = (...data) => {
    if (result) result += '\n';
    result += data.join(' ');
  };
  const options = getProgramOptions(program);
  try {
    const allArgs = [
      ...args.map((arg) => arg.toString()),
      ...[
        'config', 'decode', 'sign', 'unpack', 'select-node', 'select-compiler',
      ].includes(args[0]) ? [] : ['--url', url],
      ...args[0] === 'contract' ? ['--compilerUrl', compilerUrl] : [],
    ];
    if (allArgs.some((a) => !['string', 'number'].includes(typeof a))) {
      throw new Error(`Invalid arguments: [${allArgs.join(', ')}]`);
    }
    await program.parseAsync(allArgs, { from: 'user' });
  } finally {
    console.log = log;
    isProgramExecuting = false;
    setProgramOptions(program, options);
  }

  if (!args.includes('--json')) return result;
  try {
    return JSON.parse(result);
  } catch (error) {
    throw new Error(`Can't parse as JSON:\n${result}`);
  }
}

export async function getSdk() {
  await spendPromise;

  const sdk = await Sdk({
    accounts: [new MemoryAccount({ keypair })],
  });
  await executeProgram(accountProgram, ['save', WALLET_NAME, '--password', 'test', keypair.secretKey, '--overwrite']);
  return sdk;
}

export const parseBlock = (res) => Object.fromEntries(res
  .trim()
  .split('\n')
  .map((a) => a.trim())
  .filter((a) => !a.startsWith('<<--') && !a.startsWith('--'))
  .map((a) => a.split(/ [_]+ /))
  .map(([key, value]) => [
    key
      .toLowerCase()
      .split(' ')
      .map((el, i) => (i === 0 ? el : el[0].toUpperCase() + el.slice(1)))
      .join(''),
    value,
  ]));

export function randomName(length = 18) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const random = new Array(length).fill()
    .map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${random}.chain`;
}
