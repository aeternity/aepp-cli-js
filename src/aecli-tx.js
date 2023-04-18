#!/usr/bin/env node
import program from './commands/tx';
import { runProgram } from './utils/CliError';

await runProgram(program);
