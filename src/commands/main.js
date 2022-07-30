// # æternity CLI `root` file
//
// This script initialize all `cli` commands
/*
 * ISC License (ISC)
 * Copyright (c) 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */
// We'll use `commander` for parsing options
import { Command } from 'commander';
import { NODE_URL, COMPILER_URL } from '../utils/constant';

const program = new Command();

// Array of child command's
const EXECUTABLE_CMD = [
  { name: 'chain', desc: 'Interact with the blockchain' },
  { name: 'inspect', desc: 'Get information on transactions, blocks,...' },
  { name: 'account', desc: 'Handle wallet operations' },
  { name: 'contract', desc: 'Compile contracts' },
  { name: 'name', desc: 'AENS system' },
  { name: 'tx', desc: 'Transaction builder' },
  { name: 'oracle', desc: 'Interact with oracles' },
  { name: 'crypto', desc: 'Crypto helpers' },
];
// You get get CLI version by exec `aecli version`
program.version(process.env.npm_package_version);

// ## Initialize `config` command
program
  .command('config')
  .description('Print the sdk default configuration')
  .action(() => {
    // TODO: show these values https://github.com/aeternity/aepp-cli-js/issues/174
    console.log('NODE_URL', NODE_URL);
    console.log('COMPILER_URL', COMPILER_URL);
  });

// ## Initialize `child` command's
EXECUTABLE_CMD.forEach(({ name, desc }) => program.command(name, desc));

export default program;
