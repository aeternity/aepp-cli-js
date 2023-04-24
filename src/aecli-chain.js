#!/usr/bin/env node
import program from './commands/chain';
import { runProgram } from './utils/CliError';

await runProgram(program);
