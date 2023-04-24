#!/usr/bin/env node
import program from './commands/crypto';
import { runProgram } from './utils/CliError';

await runProgram(program);
