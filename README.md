[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![npm](https://img.shields.io/npm/v/@aeternity/aepp-cli.svg)](https://www.npmjs.com/package/@aeternity/aepp-cli)
[![npm](https://img.shields.io/npm/l/@aeternity/aepp-cli.svg)](https://www.npmjs.com/package/@aeternity/aepp-cli)

# aepp-cli-js
Command Line Interface for the æternity blockchain.

## Disclaimer

This project is a work-in-progress and things might break. We aim to make our
pre-releases as stable as possible. Neverless it should not be taken as
production-ready. To catch up with even more edgy state of development please
check out the [develop branch].

[develop branch]: https://github.com/aeternity/aecli-js/tree/develop


## Installation
You can install this `CLI` using your preferred tool (`yarn` or `npm`). Here's an `npm` example
```
npm install --global @aeternity/aepp-cli
```

---
### Local symlink to aecli
Run `npm link` for linking `aecli` name to `aecli/bin/aecli.mjs`

1. Clone or copy the `aepp-cli-js` git repository into any place you like
2. Enter the folder and run `npm link`
3. Enter a new `bash` session and try `aecli` command to see if everything is okay.
4. If you have any issue, open an `issue` in github

__If you have problems linking, try also `npm install` and then `npm link`__

## Usage Documentation

You can install, use and work on this `CLI` tool, by following these instructions:

1. Clone this repository
2. With your terminal: enter in folder when the repo has been cloned
3. Run `bin/aecli.mjs` to see the (following) available commands or run `npm link` and use `aecli` command

```
Usage: aecli [options] [command]

Options:
  -V, --version                  output the version number
  -h, --help                     display help for command

Commands:
  chain                          Interact with the blockchain
  inspect                        Get information on transactions, blocks,...
  account                        Handle wallet operations
  contract                       Contract interactions
  name                           AENS system
  tx                             Transaction builder
  oracle                         Interact with oracles
  config [options]               Print the current sdk configuration
  select-node [nodeUrl]          Specify node to use in other commands
  select-compiler [compilerUrl]  Specify compiler to use in other commands
  help [command]                 display help for command
```

4. To read documentation of other commands and sub-commands, you can append `--help`. For example, type `bin/aecli.mjs account --help` to get a list of `account`'s available sub-commands.

## Commands reference

<!-- REFERENCE-TOC-BEGIN -->
- `account`
    - [`sign`](./reference.md#sign) — sign a transaction using wallet
    - [`sign-message`](./reference.md#sign-message) — sign a personal message using wallet
    - [`verify-message`](./reference.md#verify-message) — check if message was signed by address
    - [`address`](./reference.md#address) — get wallet address and optionally private key
    - [`create`](./reference.md#create) — create a wallet by a private key or generate a new one
- [`spend`](./reference.md#spend) — send coins to another account or contract
- `name`
    - [`full-claim`](./reference.md#full-claim) — claim an AENS name in a single command
    - [`pre-claim`](./reference.md#pre-claim) — pre-claim an AENS name
    - [`claim`](./reference.md#claim) — claim an AENS name (requires pre-claim)
    - [`bid`](./reference.md#bid) — bid on name in auction
    - [`update`](./reference.md#update) — update a name pointer
    - [`extend`](./reference.md#extend) — extend name TTL
    - [`revoke`](./reference.md#revoke) — revoke an AENS name
    - [`transfer`](./reference.md#transfer) — transfer a name to another account
- `contract`
    - [`compile`](./reference.md#compile) — compile a contract to get bytecode
    - [`encode-calldata`](./reference.md#encode-calldata) — encode calldata for contract call
    - [`decode-call-result`](./reference.md#decode-call-result) — decode contract call result
    - [`call`](./reference.md#call) — execute a function of the contract
    - [`deploy`](./reference.md#deploy) — deploy a contract on the chain
- `oracle`
    - [`get`](./reference.md#get) — print oracle details
    - [`create`](./reference.md#create-1) — register current account as oracle
    - [`extend`](./reference.md#extend-1) — extend oracle's time to leave
    - [`create-query`](./reference.md#create-query) — create an oracle query
    - [`respond-query`](./reference.md#respond-query) — respond to an oracle query
- `chain`
    - [`top`](./reference.md#top) — get top key block or micro block of chain
    - [`status`](./reference.md#status) — get node version, network id, and related details
    - [`ttl`](./reference.md#ttl) — get relative TTL by absolute TTL
    - [`play`](./reference.md#play) — prints blocks from top until condition
    - [`broadcast`](./reference.md#broadcast) — send signed transaction to the chain
- [`inspect`](./reference.md#inspect) — get details of a node entity
- `tx`
    - [`spend`](./reference.md#spend-1) — build spend transaction
    - [`name-preclaim`](./reference.md#name-preclaim) — build name preclaim transaction
    - [`name-claim`](./reference.md#name-claim) — build name claim transaction
    - [`name-update`](./reference.md#name-update) — build name update transaction
    - [`name-transfer`](./reference.md#name-transfer) — build name transfer transaction
    - [`name-revoke`](./reference.md#name-revoke) — build name revoke transaction
    - [`contract-deploy`](./reference.md#contract-deploy) — build contract deploy transaction
    - [`contract-call`](./reference.md#contract-call) — build contract call transaction
    - [`oracle-register`](./reference.md#oracle-register) — build oracle register transaction
    - [`oracle-extend`](./reference.md#oracle-extend) — build oracle extend transaction
    - [`oracle-post-query`](./reference.md#oracle-post-query) — build oracle post query transaction
    - [`oracle-respond`](./reference.md#oracle-respond) — build oracle respond transaction
    - [`verify`](./reference.md#verify) — verify transaction using node
- [`config`](./reference.md#config) — print the current sdk configuration
- [`select-node`](./reference.md#select-node) — specify node to use in other commands
- [`select-compiler`](./reference.md#select-compiler) — specify compiler to use in other commands
<!-- REFERENCE-TOC-END -->

## [Change Log]

[Change Log]: CHANGELOG.md

## License

ISC License (ISC)
Copyright © 2024 aeternity developers

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.

