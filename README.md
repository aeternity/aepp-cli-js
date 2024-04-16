# aepp-cli-js
Command Line Interface for the æternity blockchain.

## Installation
You can install `aecli` using your preferred tool (`yarn` or `npm`). Here's an `npm` example
```
$ npm install --global @aeternity/aepp-cli
```

## Quick start
Let's ensure that CLI installed correctly by running `$ aecli`. It will show the available commands as below.

<!-- ROOT-HELP-BEGIN -->
```
$ aecli
Usage: aecli [options] [command]

Options:
  -V, --version                                 output the version number
  -h, --help                                    display help for command

Commands:
  account                                       handle wallet operations
  spend [options] <wallet> <receiver> <amount>  send coins to another account or contract
  name                                          manage AENS names
  contract                                      contract interactions
  oracle                                        interact with oracles
  chain                                         make a request to the node
  inspect [options] <identifier>                get details of a node entity
  tx                                            generate transactions to sign and submit manually
  config [options]                              print the current sdk configuration
  select-node [nodeUrl]                         specify node to use in other commands
  select-compiler [compilerUrl]                 specify compiler to use in other commands
  help [command]                                display help for command
```
<!-- ROOT-HELP-END -->

> To read documentation of other commands and sub-commands, you can append `--help`. For example, type `aecli account --help` to get a list of commands available in `account` module.

The next step is to create a wallet to use in other commands:

<!-- WALLET-CREATE-BEGIN -->
```
$ aecli account create ./wallet.json
Address _________________________________ ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E
Path ____________________________________ /path/to/wallet.json
```
<!-- WALLET-CREATE-END -->

You need to send some coins to the created wallet.

> On testnet you can do that using [faucet]. Switch to testnet using `$ aecli select-node`.

[faucet]: https://faucet.aepps.com/

Run `$ aecli inspect <wallet address>` to ensure that it got coins.
<!-- INSPECT-BEGIN -->
```
$ aecli inspect ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E
Account ID ______________________________ ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E
Account balance _________________________ 10000ae
Account nonce ___________________________ 0
No pending transactions
```
<!-- INSPECT-END -->

At the last step, we will send our coins to another account:
<!-- SPEND-BEGIN -->
```
$ aecli spend ./wallet.json ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT 42ae
Transaction mined
Transaction hash ________________________ th_2muLsbZeFaVJ3tePTnLqobPhxBzwFsm1zUv8sjgMX4LKuevX2T
Block hash ______________________________ mh_dnoULQWpiRtcrntd5yJPUxcu7YrTu18xZ1e9EC2b8prKdShME
Block height ____________________________ 2 (about now)
Signatures ______________________________ ["sg_SG5uW5KEGiy5iG1cCkKq4VEdpyvewcW4NjVf4vj2ZoCiap5iB7UQoknWpyWsD4FkziBuGPE88zwXemq3ZvPrdzNtXtKuD"]
Transaction type ________________________ SpendTx (ver. 1)
Sender address __________________________ ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E
Recipient address _______________________ ak_AgV756Vfo99juwzNVgnjP1gXX1op1QN3NXTxvkPnHJPUDE8NT
Amount __________________________________ 42ae
Payload _________________________________ ba_Xfbg4g==
Fee _____________________________________ 0.00001684ae
Nonce ___________________________________ 1
TTL _____________________________________ 4 (about now)
```
<!-- SPEND-END -->

Find out more in the [user guide](./user-guide.md).

## Resources

- [User guide](./user-guide.md)
- [Changelog](./CHANGELOG.md)
- [Contributor guide](./contributor-guide.md)

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
    - [`top`](./reference.md#top) — query the top key/micro block of the chain
    - [`status`](./reference.md#status) — query node version, network id, and related details of the selected node
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
