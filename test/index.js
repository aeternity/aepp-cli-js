import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { before, after } from 'mocha';
import mockFs from 'mock-fs';
import {
  AeSdk, MemoryAccount, Node, generateKeyPair, CompilerHttpNode,
} from '@aeternity/aepp-sdk';
import accountProgram from '../src/commands/account.js';
import { prepareOptions } from '../src/utils/default-option-description.js';

before(() => {
  mockFs({
    'test-artifacts': {},
    'test/contracts': mockFs.load('test/contracts'),
  });
});

after(() => {
  mockFs.restore();
});

chai.use(chaiAsPromised);
chai.should();

const url = 'http://localhost:3013';
const compilerUrl = 'http://localhost:3080';
const secretKey = '9ebd7beda0c79af72a42ece3821a56eff16359b6df376cf049aee995565f022f840c974b97164776454ba119d84edc4d6058a8dec92b6edc578ab2d30b4c4200';
export const networkId = 'ae_dev';
const keypair = generateKeyPair();
export const WALLET_NAME = 'test-artifacts/wallet.json';

const Sdk = (params = {}) => {
  params.accounts ??= [new MemoryAccount(secretKey)];
  return new AeSdk({
    /* eslint-disable no-underscore-dangle */
    _expectedMineRate: process.env._EXPECTED_MINE_RATE,
    _microBlockCycle: process.env._MICRO_BLOCK_CYCLE,
    /* eslint-enable no-underscore-dangle */
    onCompiler: new CompilerHttpNode(compilerUrl),
    nodes: [{ name: 'test', instance: new Node(url) }],
    ...params,
  });
};

const spendPromise = (async () => {
  const sdk = Sdk();
  await sdk.spend(1e28, keypair.publicKey);
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
  prepareOptions(program);
  program
    .configureOutput({ writeOut: (str) => { result += str; } })
    .exitOverride();

  const { log, warn } = console;
  console.log = (...data) => {
    if (result) result += '\n';
    result += data.join(' ');
  };
  console.warn = (...data) => {
    if (/Cost of .+ execution ≈ .+ae/.test(data[0])) return;
    warn(...data);
  };
  const options = getProgramOptions(program);
  try {
    const allArgs = [
      ...args.map((arg) => arg.toString()),
      ...['config', 'select-node', 'select-compiler'].includes(args[0])
      || (
        // eslint-disable-next-line no-underscore-dangle
        program._name === 'aecli account'
        && ['save', 'create', 'address', 'sign-message', 'verify-message'].includes(args[0])
      ) ? [] : ['--url', url],
      ...[
        'compile', 'deploy', 'call', 'encode-calldata', 'decode-call-result',
      ].includes(args[0]) && !args.includes('--compilerUrl') ? ['--compilerUrl', compilerUrl] : [],
    ];
    if (allArgs.some((a) => !['string', 'number'].includes(typeof a))) {
      throw new Error(`Invalid arguments: [${allArgs.join(', ')}]`);
    }
    await program.parseAsync(allArgs, { from: 'user' });
  } finally {
    console.log = log;
    console.warn = warn;
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
  const tempKeyPair = generateKeyPair();
  const sdk = Sdk({
    accounts: [new MemoryAccount(tempKeyPair.secretKey)],
  });
  await Promise.all([
    executeProgram(accountProgram, ['create', WALLET_NAME, '--password', 'test', tempKeyPair.secretKey, '--overwrite']),
    sdk.spend(1e26, tempKeyPair.publicKey, { onAccount: new MemoryAccount(keypair.secretKey) }),
  ]);
  return sdk;
}

export function randomName(length = 18) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const random = new Array(length).fill()
    .map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${random}.chain`;
}
