import program from '../src/commands/main.js';
import { prepareOptions } from '../src/utils/default-option-description.js';

export const url = 'http://localhost:3013';
export const compilerUrl = 'http://localhost:3080';

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
export default async function executeProgram(...args) {
  if (isProgramExecuting) throw new Error('Another program is already running');
  isProgramExecuting = true;
  let result = '';
  prepareOptions(program);
  program
    .configureOutput({
      writeOut: (str) => {
        result += str;
      },
    })
    .exitOverride();

  const { log, warn, group, groupEnd } = console;
  let padding = 0;
  console.group = () => {
    padding += 1;
  };
  console.groupEnd = () => {
    padding -= 1;
  };
  console.log = (...data) => {
    if (result) result += '\n';
    result += ' '.repeat(padding * 4) + data.join(' ');
  };
  console.warn = (...data) => {
    if (/Cost of .+ execution ≈ .+ae/.test(data[0])) return;
    warn(...data);
  };
  const options = getProgramOptions(program);
  try {
    const allArgs = [
      ...args.map((arg) => arg.toString()),
      ...(['config', 'select-node', 'select-compiler'].includes(args[0]) ||
      args.includes('--url') ||
      (args[0] === 'account' &&
        ['save', 'create', 'address', 'sign-message', 'verify-message'].includes(args[1])) ||
      (args[0] === 'contract' &&
        ['compile', 'encode-calldata', 'decode-call-result'].includes(args[1])) ||
      (args[0] === 'tx' && args[1] !== 'verify')
        ? []
        : ['--url', url]),
      ...(['compile', 'deploy', 'call', 'encode-calldata', 'decode-call-result'].includes(
        args[1],
      ) && !args.includes('--compilerUrl')
        ? ['--compilerUrl', compilerUrl]
        : []),
    ];
    await program.parseAsync(allArgs, { from: 'user' });
  } finally {
    Object.assign(console, {
      log,
      warn,
      group,
      groupEnd,
    });
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
