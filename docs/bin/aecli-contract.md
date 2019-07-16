





  

```js
#!/usr/bin/env node

```







# æternity CLI `contract` file

This script initialize all `contract` command's


  

```js
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

```







We'll use `commander` for parsing options
Also we need `esm` package to handle `ES imports`


  

```js
const program = require('commander')

require = require('esm')(module/*, options*/) //use to handle es6 import/export
const utils = require('./utils/index')
const { Contract } = require('./commands')


```







## Initialize `options`


  

```js
program
  .option('-u --url [hostname]', 'Node to connect to', utils.constant.EPOCH_URL)
  .option('--internalUrl [internal]', 'Node to connect to(internal)', utils.constant.EPOCH_INTERNAL_URL)
  .option('--compilerUrl [compilerUrl]', 'Compiler URL', utils.constant.COMPILER_URL)
  .option('-f --force', 'Ignore node version compatibility check')
  .option('--json', 'Print result in json format')


```







## Initialize `compile` command

You can use this command to compile your `contract` to `bytecode`

Example: `aecli contract compile ./mycontract.contract`


  

```js
program
  .command('compile <file>')
  .description('Compile a contract')
  .action(async (file, ...arguments) => await Contract.compile(file, utils.cli.getCmdFromArguments(arguments)))



```







## Initialize `encode callData` command

You can use this command to prepare `callData`

Example: `aecli contract encodeData ./mycontract.contract testFn 1 2`


  

```js
program
  .command('encodeData <source> <fn> [args...]')
  .description('Encode contract call data')
  .action(async (source, fn, args, ...arguments) => await Contract.encodeData(source, fn, args, utils.cli.getCmdFromArguments(arguments)))



```







## Initialize `decode data` command

You can use this command to decode contract return data

Example: `aecli contract decodeData cb_asdasdasdasdasdas int`


  

```js
program
  .command('decodeData <data> <returnType>')
  .description('Decode contract data')
  .action(async (data, returnType, ...arguments) => await Contract.decodeData(data, returnType, utils.cli.getCmdFromArguments(arguments)))



```







## Initialize `decode call data` command

You can use this command to decode contract call data using source or bytecode

Example bytecode: `aecli contract decodeCallData cb_asdasdasd... --code cb_asdasdasdasd....`
Example source cdoe: `aecli contract decodeCallData cb_asdasdasd... --sourcePath ./contractSource --fn someFunction`


  

```js
program
  .command('decodeCallData <data>')
  .option('--sourcePath [sourcePath]', 'Path to contract source')
  .option('--code [code]', 'Compiler contract code')
  .option('--fn [fn]', 'Function name')
  .description('Decode contract call data')
  .action(async (data, ...arguments) => await Contract.decodeCallData(data, utils.cli.getCmdFromArguments(arguments)))



```







Handle unknown command's


  

```js
program.on('command:*', () => utils.errors.unknownCommandHandler(program)())


```







Parse arguments or show `help` if argument's is empty


  

```js
program.parse(process.argv)
if (program.args.length === 0) program.help()


```




