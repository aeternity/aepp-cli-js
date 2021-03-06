





  

```js
#!/usr/bin/env node

```







# æternity CLI `name` file

This script initialize all `name` commands


  

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
const { AENS } = require('./commands')


```







## Initialize `options`


  

```js
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



```







## Initialize `claim` command

You can use this command to `claim` AENS name. Name must end on `.test`.

Example: `aecli name claim ./myWalletKeyFile --password testpass  testname.test`

This command send `pre-claim` transaction, wait until one block was mined, after that sent `claim` and `update` transaction's

You can use `--nameTtl` and `--ttl` to pre-set transaction and name `time to leave`


  

```js
program
  .command('full-claim <wallet_path> <name>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--nameFee [nameFee]', 'Wait until transaction will be mined', utils.constant.NAME_FEE)
  .option('--nameTtl [nameTtl]', 'Validity of name.', utils.constant.NAME_TTL)
  .option('--clientTtl [clientTtl]', 'Client ttl.', utils.constant.CLIENT_TTL)
  .description('Claim a domain name')
  .action(async (walletPath, name, ...arguments) => await AENS.fullClaim(walletPath, name, utils.cli.getCmdFromArguments(arguments)))



```







## Initialize `pre-claim` command

You can use this command to `pre-claim` AENS name

Example: `aecli name pre-claim ./myWalletKeyFile --password testpass  testname.aet`

This command build and send `pre-claim` transaction.
And wait until it will be mined. You can force waiting by using `--waitMined false` option. Default: true

You can use `--ttl` to pre-set transaction `time to leave`


  

```js
program
  .command('pre-claim <wallet_path> <name>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .description('Pre-Claim a domain name')
  .action(async (walletPath, name, ...arguments) => await AENS.preClaim(walletPath, name, utils.cli.getCmdFromArguments(arguments)))



```







## Initialize `claim` command

You can use this command to `claim` AENS name. Name must end on `.test`.

Example: `aecli name claim ./myWalletKeyFile --password testpass  testname.test`

This command send `pre-claim` transaction, wait until one block was mined, after that sent `claim` and `update` transaction's

You can use `--nameTtl` and `--ttl` to pre-set transaction and name `time to leave`


  

```js
program
  .command('claim <wallet_path> <name> <salt>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--nameFee [nameFee]', 'Wait until transaction will be mined', utils.constant.NAME_FEE)
  .description('Claim a domain name')
  .action(async (walletPath, name, salt, ...arguments) => await AENS.claim(walletPath, name, salt, utils.cli.getCmdFromArguments(arguments)))



```







## Initialize `claim` command

You can use this command to `claim` AENS name. Name must end on `.test`.

Example: `aecli name claim ./myWalletKeyFile --password testpass  testname.test`

This command send `pre-claim` transaction, wait until one block was mined, after that sent `claim` and `update` transaction's

You can use `--nameTtl` and `--ttl` to pre-set transaction and name `time to leave`


  

```js
program
  .command('bid <wallet_path> <name> <nameFee>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .description('Bid on name')
  .action(async (walletPath, name, nameFee, ...arguments) => await AENS.nameBid(walletPath, name, nameFee, utils.cli.getCmdFromArguments(arguments)))



```







## Initialize `claim` command

You can use this command to `update` pointer of AENS name.

Example: `aecli name update ./myWalletKeyFile --password testpass testname.test ak_qwe23dffasfgdesag323`


  

```js
program
  .command('update <wallet_path> <name> <address>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .option('--nameTtl [nameTtl]', 'Validity of name.', utils.constant.NAME_TTL)
  .option('--clientTtl [clientTtl]', 'Client ttl.', utils.constant.CLIENT_TTL)
  .description('Update a name pointer')
  .action(async (walletPath, name, address, ...arguments) => await AENS.updateName(walletPath, name, address, utils.cli.getCmdFromArguments(arguments)))



```







## Initialize `revoke` command

You can use this command to `destroy` AENS name.

Example: `aecli name revoke ./myWalletKeyFile --password testpass testname.test`


  

```js
program
  .command('revoke  <wallet_path> <name>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .description('Revoke a domain name')
  .action(async (walletPath, name, ...arguments) => await AENS.revokeName(walletPath, name, utils.cli.getCmdFromArguments(arguments)))


```







## Initialize `transfer` command

You can use this command to `transfer` AENS name to another account.

Example: `aecli name transfer ./myWalletKeyFile --password testpass testname.test ak_qqwemjgflewgkj349gjdslksd`


  

```js
program
  .command('transfer <wallet_path> <name> <address>')
  .option('-M, --no-waitMined', 'Do not wait until transaction will be mined')
  .description('Transfer a name to another account')
  .action(async (walletPath, name, address, ...arguments) => await AENS.transferName(walletPath, name, address, utils.cli.getCmdFromArguments(arguments)))


```







## Initialize `lookup` command

You can use this command to `update` pointer of AENS name.

Example: `aecli lookup name.test`


  

```js
program
  .command('lookup <name>')
  .description('Look up name')
  .action(async (name, ...arguments) => await AENS.lookUp(name, utils.cli.getCmdFromArguments(arguments)))


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




