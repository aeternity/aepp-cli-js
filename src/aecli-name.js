#!/usr/bin/env node
import program from './commands/name.js';
import { runProgram } from './utils/CliError.js';

await runProgram(program);
