#!/usr/bin/env node
import program from './commands/main';
import { runProgram } from './utils/CliError';

await runProgram(program);
