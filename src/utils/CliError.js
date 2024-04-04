import { InvalidPasswordError } from '@aeternity/aepp-sdk';
import { setCommandOptions } from './config.js';

export default class CliError extends Error {
  constructor(message) {
    super(message);
    this.name = 'CliError';
  }
}

export async function runProgram(program) {
  try {
    await setCommandOptions(program);
    await program.parseAsync();
  } catch (error) {
    if (
      error instanceof CliError
      || error instanceof InvalidPasswordError
      || error.code === 'ENOENT'
    ) {
      program.error(error.message);
      return;
    }
    throw error;
  }
}
