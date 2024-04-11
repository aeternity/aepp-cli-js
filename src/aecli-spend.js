#!/usr/bin/env node
import program from './commands/spend.js';
import { runProgram } from './utils/CliError.js';

await runProgram(program);
