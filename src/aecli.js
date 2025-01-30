#!/usr/bin/env node
import { RestError } from '@azure/core-rest-pipeline';
import { NodeInvocationError, ContractError } from '@aeternity/aepp-sdk';
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
    error instanceof CliError ||
    error instanceof RestError ||
    error instanceof NodeInvocationError ||
    (error instanceof ContractError &&
      error.message.includes("ACI doesn't match called contract")) ||
    error.code === 'ENOENT'
  )
    program.error(error.message);
  else throw error;
}
