





  

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
  .option('-u --url [hostname]', 'Node to connect to', utils.constant.NODE_URL)
  .option('--internalUrl [internal]', 'Node to connect to(internal)', utils.constant.NODE_INTERNAL_URL)
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
  .option('--backend [backend]', 'Compiler backend("fate" | "aevm")', utils.constant.COMPILER_BACKEND)
  .description('Compile a contract')
  .action(async (file, ...arguments) => await Contract.compile(file, utils.cli.getCmdFromArguments(arguments)))



```







## Initialize `encode callData` command

You can use this command to prepare `callData`

Example: `aecli contract encodeData ./mycontract.contract testFn 1 2`


  

```js
program
  .command('encodeData <source> <fn> [args...]')
  .option('--backend [backend]', 'Compiler backend("fate" | "aevm")', utils.constant.COMPILER_BACKEND)
  .description('Encode contract call data')
  .action(async (source, fn, args, ...arguments) => await Contract.encodeData(source, fn, args, utils.cli.getCmdFromArguments(arguments)))



```







## Initialize `decode data` command

You can use this command to decode contract return data

Example: `aecli contract decodeData cb_asdasdasdasdasdas int`


  

```js
program
  .command('decodeData <data> <returnType>')
  .option('--backend [backend]', 'Compiler backend("fate" | "aevm")', utils.constant.COMPILER_BACKEND)
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
  .option('--backend [backend]', 'Compiler backend("fate" | "aevm")', utils.constant.COMPILER_BACKEND)
  .description('Decode contract call data')
  .action(async (data, ...arguments) => await Contract.decodeCallData(data, utils.cli.getCmdFromArguments(arguments)))



```







// ## Initialize `call` command
//
// You can use this command to execute a function's of contract
//
// Example:
//    `aecli contract call ./myWalletFile --password testpass sumFunc int 1 2 --descrPath ./contractDescriptorFile.json ` --> Using descriptor file
//    `aecli contract call ./myWalletFile --password testpass sumFunc int 1 2 --contractAddress ct_1dsf35423fdsg345g4wsdf35ty54234235 ` --> Using contract address
//
// Also you have ability to make `static` call using `--callStatic` flag
// Example:
//    `aecli contract call ./myWalletFile --password testpass sumFunc int 1 2 --descrPath ./contractDescriptorFile.json --callStatic` --> Static call using descriptor
//    `aecli contract call ./myWalletFile --password testpass sumFunc int 1 2 --contractAddress ct_1dsf35423fdsg345g4wsdf35ty54234235 --callStatic` --> Static call using contract address
// You can preset gas, nonce and ttl for that call. If not set use default.
// Example: `aecli contract call ./myWalletFile --password tstpass sumFunc int 1 2 --descrPath ./contractDescriptorFile.json  --gas 2222222 --nonce 4 --ttl 1243`
program
  .command('call <wallet_path> <fn> <return_type> [args...]')
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .option('-P, --password [password]', 'Wallet Password')
  .option('-G --gas [gas]', 'Amount of gas to call the contract', utils.constant.GAS)
  .option('-d --descrPath [descrPath]', 'Path to contract descriptor file')
  .option('-s --callStatic', 'Call static', false)
  .option('-t --topHash', 'Hash of block to make call')
  .option('--contractAddress [contractAddress]', 'Contract address to call')
  .option('--contractSource [contractSource]', 'Contract source code')
  .description('Execute a function of the contract')
  .action(async (walletPath, fn, returnType, args, ...arguments) => await Contract.call(walletPath, fn, returnType, args, utils.cli.getCmdFromArguments(arguments)))


## Initialize `deploy` command

You can use this command to deploy contract on the chain

Example: `aecli contract deploy ./myWalletFile --password testpass ./contractSourceCodeFile 1 2` -> "1 2" -> Init state params

You can preset gas and initState for deploy

Example: `aecli contract deploy ./myWalletFile --password tstpass ./contractSourceCodeFile --gas 2222222`


  

```js
program
  .command('deploy <wallet_path> <contract_path> [init...]')
  .option('--networkId [networkId]', 'Network id (default: ae_mainnet)')
  .option('-W, --no-waitMined', 'Force waiting until transaction will be mined')
  .option('-P, --password [password]', 'Wallet Password')
  .option('-G --gas [gas]', 'Amount of gas to deploy the contract', utils.constant.GAS)
  .option('-G --gasPrice [gas]', 'Amount of gas to deploy the contract', utils.constant.GAS_PRICE)
  .option('--backend [backend]', 'Compiler backend("fate" | "aevm")', utils.constant.COMPILER_BACKEND)
  .option('-F, --fee [fee]', 'Spend transaction fee.')
  .option('-T, --ttl [ttl]', 'Validity of the spend transaction in number of blocks (default forever)', utils.constant.TX_TTL)
  .option('-N, --nonce [nonce]', 'Override the nonce that the transaction is going to be sent with')
  .description('Deploy a contract on the chain')
  .action(async (walletPath, path, init, ...arguments) => await Contract.deploy(walletPath, path, init, utils.cli.getCmdFromArguments(arguments)))



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




