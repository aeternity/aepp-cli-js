#!/usr/bin/env node
import { RestError } from '@azure/core-rest-pipeline';
import { InvalidPasswordError, NodeInvocationError } from '@aeternity/aepp-sdk';
import { setCommandOptions } from './utils/config.js';
import { prepareOptions } from './utils/default-option-description.js';
import CliError from './utils/CliError.js';
import program from './commands/main.js';

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
  ) program.error(error.message);
  else throw error;
}
