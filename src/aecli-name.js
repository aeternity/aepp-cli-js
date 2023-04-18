#!/usr/bin/env node
import program from './commands/name';
import { runProgram } from './utils/CliError';

await runProgram(program);
