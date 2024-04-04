#!/usr/bin/env node
import program from './commands/oracle.js';
import { runProgram } from './utils/CliError.js';

await runProgram(program);
