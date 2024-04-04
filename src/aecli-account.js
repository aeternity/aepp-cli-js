#!/usr/bin/env node
import program from './commands/account.js';
import { runProgram } from './utils/CliError.js';

await runProgram(program);
