#!/usr/bin/env node
import program from './commands/account';
import { runProgram } from './utils/CliError';

await runProgram(program);
