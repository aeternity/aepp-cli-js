#!/usr/bin/env node
import program from './commands/chain.js';
import { runProgram } from './utils/CliError.js';

await runProgram(program);
