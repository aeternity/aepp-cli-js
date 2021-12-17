The æternity command line interface

## Summary
Each æternity's SDKs feature a command-line interface which you can use to invoke the blockchain's features. All CLIs have the same name and syntax, which are described here. However, not all of them have a full feature set. An entry in [square brackets] indicates which SDKs support a feature, using the following codes:
- G go
- J javascript
- P python

So [GP] indicates that a feature is only available in Go and Python.


# Table of Contents
1. [Overview](#overview)
2. [General usage](#general-usage)
3. [The chain group](#the-chain-group)
4. [The inspect group](#the-inspect-group)
5. [Account commands](#account-commands)
6. [The name group](#the-name-group)
7. [The contracts group](#the-contracts-group)

## Overview

The command-line interface is invoked using the command `aecli`. Depending on where it's installed on your system, you may have to give a path when you invoke it.


## General usage


If you invoke `aecli` with no arguments, it shows basic usage:
```
$ ./aecli
The command line client for the Aeternity blockchain

Usage:
  aecli [command]

Available Commands:
  chain       Query the state of the chain
  config      Print the configuration of the client
  help        Help concerning any command
  inspect     Inspect an object of the blockchain
  name        A brief description of your command
  account     Handle wallet operations
  contract    Compile contracts
  crypto      Crypto helpers


Flags:
  -c, --config string   config file to load (defaults to $HOME/.aeternity/config.yaml
      --debug           enable debug
  -h, --help            help for aecli
      --json            print output in json format
      --version         version for aecli
  -u, --epoch-url,      show URL of epoch

Use "aecli [command] --help" for more information about a command.
```

The general groupings of commands are:
- `chain` commands do not require a public or private key and give information about the state of the chain. None of the chain commands changes the state of the chain at all.
- `config` displays the client's configuration file and can write the configuration to disk.
- `help` does what one would expect and is described here no further.
- `inspect` allows you to look at the objects on the blockchain.
- `name` allows interaction with the naming system.
- `account` commands cover a set of functions which operate with a key pair, from transferring tokens to registering names and invoking smart contracts.
- `oracle` allows you to interact with the oracles.
- `contract` allows compiling the smart contracts.


## The chain group

```
$ ./aecli chain
Query the state of the chain

Usage:
  aecli chain [command]

Available Commands:
  play        Query the blocks of the chain one after the other
  top         Query the top block of the chain
  version     Get the status and version of the node running the chain
  mempool     Get memory pool of chain (transactions, that are not mined yet)
```
These commands display basic information about the blockchain and require little explanation. `Play` moves backward through the blockchain displaying blocks and transactions.

## The inspect group
The inspect command allows you to see inside various æternity types. Because each æternity type starts with two letters identifying what sort of thing it is, you can throw anything you like at inspect, and it will bravely try to do the right thing.

#### inspect public key
```
$ ./aecli inspect ak_XeSuxD8wZ1eDWYu71pWVMJTDopUKrSxZAuiQtNT6bgmNWe9D3
Balance___________________________________________ 9999497
ID________________________________________________ ak_XeSuxD8wZ1eDWYu71pWVMJTDopUKrSxZAuiQtNT6bgmNWe9D3
Nonce_____________________________________________ 3
```
#### inspect transaction
```
$ ./aecli inspect th_2kgDHbvFjZn4nRLrxrimzyjdJzdEnMtFnD56r5K5UXHMaMbPkd
BlockHash_________________________________________ mh_2MTsaWUdadr1YRKC5FE7qMHXvtzCZixQyHFV8zsPUCQvwJr2fP
BlockHeight_______________________________________ 151
Hash______________________________________________ th_2kgDHbvFjZn4nRLrxrimzyjdJzdEnMtFnD56r5K5UXHMaMbPkd
 versionField_____________________________________ 1
  Amount__________________________________________ 20000
  Fee_____________________________________________ 1
  Nonce___________________________________________ 1
  Payload_________________________________________ test transaction
  RecipientID_____________________________________ ak_2uLM25PWdhrTQfuxgJiM8E5sZREzUoB5iFnukHCz1uAZYBMqwo
  SenderID________________________________________ ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi
```
#### inspect block
```
$ ./aecli inspect mh_2mj6dTVLdRJd2ysvpeMCanMnE816PUjUHZt4N2JBxCbVHb3LnZ
Hash______________________________________________ mh_2mj6dTVLdRJd2ysvpeMCanMnE816PUjUHZt4N2JBxCbVHb3LnZ
Height____________________________________________ 682
PrevHash__________________________________________ kh_Uo54QZNbXAP52BftwHoLVjrfEPmYVn8186D6CfqicXz25gtbE
PrevKeyHash_______________________________________ kh_Uo54QZNbXAP52BftwHoLVjrfEPmYVn8186D6CfqicXz25gtbE
Signature_________________________________________ sg_FctQnGxxCzNUf5vkAfhVVeVAQ8DbBiknQW5Wh6DpSz77ku9tgL23GpaDk6V5yij4Fw1jozNwzJJPYbzMroLkaHJU2rYE3
StateHash_________________________________________ bs_phbFtw7EhFKEP63mtMYd9wSR818VQJqyTqsbLefWJT68ecbR1
Time______________________________________________ 2018-09-20T13:34:51+02:00
TxsHash___________________________________________ bx_GnJ5zjiwAatgQjmQF9gPkFjxKiX7uwvc6z1YGrECSv6QmazeH
Version___________________________________________ 23
  BlockHash_______________________________________ mh_2mj6dTVLdRJd2ysvpeMCanMnE816PUjUHZt4N2JBxCbVHb3LnZ
  BlockHeight_____________________________________ 682
  Hash____________________________________________ th_UvCG8Xo7EvsdA1D21ngLmxnJ1oDYv5qEKKNAg2pDXdYs5mJvW
   versionField___________________________________ 1
    Amount________________________________________ 10000000
    Fee___________________________________________ 1
    Nonce_________________________________________ 61
    Payload_______________________________________ hello Naz!
    RecipientID___________________________________ ak_XeSuxD8wZ1eDWYu71pWVMJTDopUKrSxZAuiQtNT6bgmNWe9D3
    SenderID______________________________________ ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi
    TTL___________________________________________ 1182
```
## Account commands
The account (wallet) commands are those which create and report on key pairs, and all of the operations which payments require. To perform transactions within aeternity, you need to have at least two wallets with some coins on their accounts. Using the Account commands, you can create a wallet (with a password or without it), add some coins to it, send coins, and view the wallet’s address (public key).

#### create

Use this command to create a new wallet.
```
$ aecli account create test --password test
 ```
You can specify a password for accessing your wallet or just press Enter if you do not want to set a password.
The wallet is created in the specified directory.
```
Wallet saved
Wallet address________________ ak_2GN72gRFHYmJd1DD2g2sLADr5ZXa13DPYNtuFajhsZT2y3FiWu
Wallet path___________________ /home/nduchak/Project/aepp-sdk-js/bin/test

```
Wallet address is your public key. Wallet path is the directory where the wallet is created.

#### address

View the address (public key) of your wallet using the following command:
```
$ aecli account address test
```
You will get the following:
```
Your address is: ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi
 ```
#### save

Using this command, you can pass the private key to generate a wallet with a key pair.

```
$ aecli account save test <your_private_key>
 ```
You will get the following:
```
Wallet saved
Wallet address________________ ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi
Wallet path___________________ /Users/spushkar/Desktop/aepp-sdk-js-develop/bin/test
 ```
#### balance

This command is used to check the balance of your wallet.
```
$ aecli account balance test
```
You will get the account balance:
```
Your balance is: 998547
 ```
#### spend

Using this command, you can send coins to another wallet. Just indicate another account's address and an amount which should be sent.
```
$ aecli account spend test --password test ak$94TQqDjzwKQYPcCdEAfxcGb3mHq2s9Rm4dybMbDWwiVRwg8RK 10
```
As an option, you can set _--ttl_ parameter, which limits the lifespan of this transaction.


## The name group

With the aeternity naming system (AENS), you can assign and register a name to your account or oracle. This way, instead of a complex hash, you can use a name you choose.
These names have an expiration period, after which they can be transferred to another account.
For more information, see [The Æternity Naming System (AENS)](https://dev.aepps.com/aepp-sdk-docs/AENS-Python.html) and [Aeternity Naming System](https://github.com/aeternity/protocol/blob/master/AENS.md) docs.

The name group consists of the following commands and options:
```
$ ./aecli.mjs name
```
  Usage: aecli-name [options] [command]

  Options:

    -H, --host [hostname]             Node to connect to (default: https://localhost:3013)
    -U, --internalUrl [internal]      Node to connect to(internal)
    -P, --password [password]                Wallet Password
    -N, --nameTtl [nameTtl]                  Name life Ttl (default: 500)
    -T, --ttl [ttl]                          Life Ttl (default: 50000)
    --json [json]                            Print result in json format
    -h, --help                               output usage information

  Commands:

    claim <wallet_path> <name>               Claim a domain name
    revoke <wallet_path> <name>              Revoke a domain name
    transfer <wallet_path> <name> <address>  Transfer a name to another account
    update <wallet_path> <name> <address>    Update a name pointer

#### claim

Create and register a name for your account (public key):
```
$ aecli name claim test --password test testname.test
```

#### revoke

You can delete your name using the following command:
```
$ aecli name revoke test --password test testname.test
```

#### transfer

You can transfer a name to another account or contract, just indicate another account's address. You will pass all rights regarding the name to another account:
```
$ aecli name transfer test --password test testname.test ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi
```

#### update

Use this command to update a name. For example, you can assign it to another account, but still you will have rights to do other operations with this name:
```
$ aecli name update test --password test testname.test ak_2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi
```

## The contracts group

A smart contract is a computer protocol intended to digitally facilitate, verify, or enforce the negotiation or performance of a contract. Smart contracts allow the performance of credible transactions without third parties. These transactions are trackable and irreversible. Smart contracts aim to provide security that is superior to traditional contract law and to reduce other transaction costs associated with contracting.

The contracts group consists of the following commands and options:
```
$ ./aecli.mjs  contract
```
  Usage: aecli-contract [options] [command]

  Options:

    -H, --host [hostname]             Node to connect to (default: https://localhost:3013)
    -U, --internalUrl [internal]      Node to connect to(internal)
    -T, --ttl [ttl]                   Validity of the transaction in number of blocks (default forever) (default: 50000)
    -f --force                        Ignore epoch version compatibility check
    --json [json]                     Print result in json format
    -h, --help                        output usage information

  Commands:

    compile <file>                                     Compile a contract
    call [options] <wallet_path> <desc_path>[args...]  Execute a function of the contract
    deploy [options] <wallet_path> <contract_path>     Deploy a contract on the chain

The `deploy` command has its options:


    -P, --password [password]    Wallet Password
    -I, --init [state]           Deploying contract arguments for constructor function
    -G --gas [gas]               Amount of gas to deploy the contract

The `call` command also has its option:

    -P, --password [password]    Wallet Password

#### compile

To compile a contract, run the following command adding a file which should be compiled. The file should be stored in `aepp-sdk-js-develop/bin`:
```
$ aecli contract compile file1
```

#### deploy

To deploy a contract, run the following command adding the contract name:
```
$ aecli contract deploy test --password test testContract
```
You will get the following:
```
Contract was successfully deployed
Contract address________________ ct_2HpbSPdiA2csizgKxt8VUE5z2uRvvrE3MPM9VuLNkc5g6wKKHS
Transaction hash________________ th_2sfW2c8GxJvZK3xzPagjziX9gVYFcJnywcL8vn8wWM5HCWnykE
Deploy descriptor_______________ testContract.deploy.2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi.json
```
#### call

To execute a function of the contract, run the following command. Json file is stored in `aepp-sdk-js-develop/bin`. `Main` is a function which is executed by this contract, `int 1 2` are numerical values :

```
$ aecli contract call test --password test testContract.deploy.2a1j2Mk9YSmC1gioUq4PWRm3bsv887MbuRVwyv4KaUGoR1eiKi.json main int 1 2
```
You will get the following, where return value is a result of contract execution - it is a sum of values 1 and 2:
```
Contract address_________ ct_2HpbSPdiA2csizgKxt8VUE5z2uRvvrE3MPM9VuLNkc5g6wKKHS
Gas price________________ 1
Gas used_________________ 555
Return value (encoded)___ 0x0000000000000000000000000000000000000000000000000000000000000003
Return value (decoded)___ 3
Return remote type_______ word
```
