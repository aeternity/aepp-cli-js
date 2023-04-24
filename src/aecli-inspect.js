#!/usr/bin/env node
import program from './commands/inspect';
import { runProgram } from './utils/CliError';

await runProgram(program);
