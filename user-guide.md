# User guide

This guide assumes that you have `aecli` [installed](./README.md#installation) and you checked the [Quick start]('./README.md#quick-start').

# Table of Contents

- [Account commands](#account-commands)
- [The name group](#the-name-group)
- [The contracts group](#the-contracts-group)
- [The chain group](#the-chain-group)
- [Inspect command examples](#inspect-command-examples)
- [Offline signing](#offline-signing)

## Account commands

The account (wallet) [commands](./reference.md#account-group) are those which create and report on key pairs, and sign transactions, messages. To [perform transactions](./reference.md#spend) within aeternity, you need to have at least two wallets with some coins on their accounts.

Use [`aecli account create`](./reference.md#create) to create a new wallet.
You can specify a password for accessing your wallet or just press Enter if you do not want to set a password. The wallet is created at the specified path.

Alternatively, you can pass the secret key in `[secretKey]` argument to generate a corresponding wallet.

View the address (public key) of your wallet using [`aecli account address`](./reference.md#address) command. Also, it can be used to reveal your secret key.

## The name group

With the aeternity naming system (AENS), you can assign and register a name to your account or oracle. This way, instead of a complex hash, you can use a name you choose.
These names have an expiration period, after which the name will no longer belong to anyone, so it can be claimed again.
For more information, see [Aeternity Naming System](https://github.com/aeternity/protocol/blob/master/AENS.md) docs.

The name group consists of the [following commands](./reference.md#name-group).

Use [`aecli name full-claim`](./reference.md#full-claim) to create and register a name for your account.

After that, you can use [`aecli name update`](./reference.md#update) command to set a name pointer. You can assign the name to another account via pointers, you will still have the right to do other operations with this name.

Don't forget to run [`aecli name extend`](./reference.md#extend) from time to time to don't lose access to your name. By default name TTL gets extended to one year, it can't be extended for a longer period.

You can [transfer](./reference.md#transfer) a name to another account or contract, just indicate another account's address. You will pass all rights regarding the name to another account.

At last, you can revoke your name using [`aecli name revoke`](./reference.md#revoke).
The revoked name can be claimed again after a fixed timeout of 2016 blocks (~ 4 days).

## The contracts group

A smart contract is a computer protocol intended to digitally facilitate, verify, or enforce the negotiation or performance of a contract. Smart contracts allow the performance of credible transactions without third parties. These transactions are trackable and irreversible. Smart contracts aim to provide security that is superior to traditional contract law and to reduce other transaction costs associated with contracting.

The contracts group consists of the [following commands](./reference.md#contract-group).

#### deploy

Here is an example contract that we will deploy

<!-- CONTRACT-BEGIN -->

```
contract Example =
  entrypoint sum(a: int, b: int) = a + b
```

<!-- CONTRACT-END -->

To deploy a contract, run [`aecli contract deploy`](./reference.md#deploy) adding a file that should be compiled.

<!-- CONTRACT-DEPLOY-BEGIN -->

```
$ aecli contract deploy --contractSource ./contract.aes ./wallet.json
Contract was successfully deployed
Contract address   ct_5MbRKEb77pJVZrjVrQYHu2nzr2EKojuthotio1vZ2Q23dkYkV
Transaction hash   th_5M77avjrPKezyBrUfkn19C79MnVh9SSoX4Euz4nY75kn9Fxto
Deploy descriptor  /path/to/contract.aes.deploy.5MbRKEb77pJVZrjVrQYHu2nzr2EKojuthotio1vZ2Q23dkYkV.json
```

<!-- CONTRACT-DEPLOY-END -->

#### call

To execute a function of the contract, run [`aecli contract call`](./reference.md#call) command. `sum` is a function which is executed by this contract, `[1, 2]` are arguments of this function:

<!-- CONTRACT-CALL-BEGIN -->

```
$ aecli contract call --descrPath contract.aes.deploy.5MbRKEb77pJVZrjVrQYHu2nzr2EKojuthotio1vZ2Q23dkYkV.json sum '[1, 2]' ./wallet.json
Transaction hash  th_urgozuZRooNXrZxuvNDdT4BiApcGKsf6ZRpffargXcoZNHQ4C
Block hash        mh_dnoULQWpiRtcrntd5yJPUxcu7YrTu18xZ1e9EC2b8prKdShME
Block height      4 (about now)
Signatures        ["sg_Vn2cCsMk8RvBKyNTKTbq8V4vm6beuHxfYA7vLBNLnRF3x9hoydWWAtNkaiix8KhyEFSLmsmTy6jz9Lps2TQqVdmH6qmCG"]
Transaction type  ContractCallTx (ver. 1)
Caller address    ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E
Contract address  ct_5MbRKEb77pJVZrjVrQYHu2nzr2EKojuthotio1vZ2Q23dkYkV
Gas               31 (0.000000031ae)
Gas price         0.000000001ae
Call data         cb_KxHrtMsKKwIE32Kmfg==
ABI version       3 (Fate)
Amount            0ae
Fee               0.00018198ae
Nonce             3
TTL               7 (in 6 minutes)
----------------------Call info-----------------------
Gas used                25 (0.000000025ae)
Return value (encoded)  cb_BvMDXHk=
Return value (decoded)  3
```

<!-- CONTRACT-CALL-END -->

In the above, the "Return value (decoded)" is a result of contract execution — it is a sum of values 1 and 2.

## The chain group

[These commands](./reference.md#chain-group) display basic information about the blockchain and require little explanation. [`play`](./reference.md#play) moves backward through the blockchain displaying blocks and transactions.

## Inspect command examples

The [`inspect`](./reference.md#inspect) command allows you to see inside various æternity types. Because each æternity type starts with two letters identifying what sort of thing it is, you can throw anything you like at inspect, and it will bravely try to do the right thing.

<!-- INSPECT-EXAMPLES-BEGIN -->

#### inspect account by address

```
$ aecli inspect ak_22xzfNRfgYWJmsB1nFAGF3kmabuaGFTzWRobNdpturBgHF83Cx
Account ID       ak_22xzfNRfgYWJmsB1nFAGF3kmabuaGFTzWRobNdpturBgHF83Cx
Account balance  52.1342501ae
Account nonce    3
No pending transactions
```

#### inspect transaction

```
$ aecli inspect th_iirV7mw49NfFY8NbBhbXGBLv9PPT3h1ou11oKtPsJVHGVpWVC
Transaction hash  th_iirV7mw49NfFY8NbBhbXGBLv9PPT3h1ou11oKtPsJVHGVpWVC
Block hash        mh_2RojH44UtAjf8pRQekPp7o78CmCqMQJkRdxmfXvVmWg9M6ymcr
Block height      99005 (5 years ago)
Signatures        ["sg_MjwB8zrhqGTqYWY2c5jLrikuCcwppnhNhjXg9TcdFbCkSvGhPL6Hf4iu81eoxWWJFSgRSFQ3h3qMv6vVNqYfo5NNBNDFK"]
Transaction type  NameClaimTx (ver. 2)
Account address   ak_2i74vkHbdciAdr7Bw3ogdTHsLykPf4ii1DQEGLh6RpySyhtA9H
Name              yanislav.test
Name salt         6632125367082877
Fee               0.00001638ae
Nonce             2
```

#### inspect block

```
$ aecli inspect mh_2DhgyD4np6n3JMsNWVXdtWZE2rAx74sgxL6nb2GsCKB1VnbLxN
<<--------------- MicroBlock --------------->>
Block hash               mh_2DhgyD4np6n3JMsNWVXdtWZE2rAx74sgxL6nb2GsCKB1VnbLxN
Block height             762850
State hash               bs_9vEQ2hkjJLFoqbmUq2YB3PyZN4TGV6Viv686wgX3i4t21PUK3
Nonce                    N/A
Miner                    N/A
Time                     17/04/2023, 05:54:40
Previous block hash      mh_2VaToyVbe8joVts9SjzdGJZqK7nk6w4MfvGC32Nfwp9KnTa7Z6
Previous key block hash  kh_2gVG4vzZwWJfzMe5Ug2jwwDcgcpmjEd1umsWqKA9CkSPidCYuw
Version                  5
Target                   N/A
Transactions             1
    <<--------------- Transaction --------------->>
    Transaction hash   th_2uc2RDDQnDV2BsyVLHA36GP3UZJNn16utV6uivWjLAQoTVBA3u
    Block hash         mh_2DhgyD4np6n3JMsNWVXdtWZE2rAx74sgxL6nb2GsCKB1VnbLxN
    Block height       762850
    Signatures         ["sg_4UUxNZhGLXWjGsfAMEddccjQ1wpZfwUkZ9qMczjRUNFGAWAS3fahHWqgwxLf79RQ3J3ZRnEaazz259dPzUjj5J3EHcNYj"]
    Transaction type   SpendTx (ver. 1)
    Sender address     ak_2swhLkgBPeeADxVTAVCJnZLY5NZtCFiM93JxsEaMuC59euuFRQ
    Recipient address  ak_22xzfNRfgYWJmsB1nFAGF3kmabuaGFTzWRobNdpturBgHF83Cx
    Amount             50ae
    Payload            ba_Xfbg4g==
    Fee                0.00001688ae
    Nonce              1513
```

<!-- INSPECT-EXAMPLES-END -->

## Offline signing

One of `aecli` use cases is offline signing. It requires the below steps.

1. prepare a transaction using [transaction builder](./reference.md#tx-group) on any device;
1. optionally run [`aecli inspect`](./reference.md#inspect) to verify the generated transaction before signing on offline device;
1. sign the transaction by [`aecli account sign`](./reference.md#sign) on offline device;
1. broadcast signed transaction using [`aecli chain broadcast`](./reference.md#broadcast) on a device connected to the internet.
