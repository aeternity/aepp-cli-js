#!/usr/bin/env node
import program from './commands/tx.js';
import { runProgram } from './utils/CliError.js';

await runProgram(program);
