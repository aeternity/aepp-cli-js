#!/usr/bin/env node
import program from './commands/inspect.js';
import { runProgram } from './utils/CliError.js';

await runProgram(program);
