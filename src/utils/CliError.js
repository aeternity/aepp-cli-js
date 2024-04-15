import { RestError } from '@azure/core-rest-pipeline';
import { InvalidPasswordError, NodeInvocationError } from '@aeternity/aepp-sdk';
import { setCommandOptions } from './config.js';
import { prepareOptions } from './default-option-description.js';

export default class CliError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CliError';
  }
}

export async function runProgram(program) {
  try {
    prepareOptions(program);
    await setCommandOptions(program);
    await program.parseAsync();
  } catch (error) {
    if (
      error instanceof CliError
      || error instanceof RestError
      || error instanceof InvalidPasswordError
      || error instanceof NodeInvocationError
      || error.code === 'ENOENT'
    ) {
      program.error(error.message);
      return;
    }
    throw error;
  }
}
