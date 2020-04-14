#!/usr/bin/env node
// # æternity CLI `name` file
//
// This script initialize all `name` commands
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
//
// Also we need `esm` package to handle `ES imports`
const program = require('commander')

require = require('esm')(module/*, options*/) //use to handle es6 import/export
const utils = require('./utils/index')
const { Oracle } = require('./commands')

// ## Initialize `options`
program
  .option('-u, --url [hostname]', 'Node to connect to', utils.constant.NODE_URL)
  .option('-U, --internalUrl [internal]', 'Node to connect to(internal)', utils.constant.NODE_INTERNAL_URL)
  .option('--ttl [ttl]', 'Override the ttl that the transaction is going to be sent with', utils.constant.TX_TTL)
  .option('--fee [fee]', 'Override the fee that the transaction is going to be sent with')
  .option('--nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .option('-P, --password [password]', 'Wallet Password')
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .option('-f --force', 'Ignore node version compatibility check')
  .option('--json', 'Print result in json format', utils.constant.OUTPUT_JSON)

// Handle unknown command's
program.on('command:*', () => utils.errors.unknownCommandHandler(program)())

// Parse arguments or show `help` if argument's is empty
program.parse(process.argv)
if (program.args.length === 0) program.help()
