#!/usr/bin/env node
import program from './commands/main.js';
import { runProgram } from './utils/CliError.js';

await runProgram(program);
