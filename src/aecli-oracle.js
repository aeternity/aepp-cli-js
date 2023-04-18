#!/usr/bin/env node
import program from './commands/oracle';
import { runProgram } from './utils/CliError';

await runProgram(program);
