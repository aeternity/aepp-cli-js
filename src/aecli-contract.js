#!/usr/bin/env node
import program from './commands/contract';
import { runProgram } from './utils/CliError';

await runProgram(program);
