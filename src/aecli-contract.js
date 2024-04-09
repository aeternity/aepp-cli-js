#!/usr/bin/env node
import program from './commands/contract.js';
import { runProgram } from './utils/CliError.js';

await runProgram(program);
