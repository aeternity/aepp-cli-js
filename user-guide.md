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

Alternatively, you can pass the private key in `[privkey]` argument to generate a corresponding wallet.

View the address (public key) of your wallet using [`aecli account address`](./reference.md#address) command. Also, it can be used to reveal your private key.


## The name group

With the aeternity naming system (AENS), you can assign and register a name to your account or oracle. This way, instead of a complex hash, you can use a name you choose.
These names have an expiration period, after which the name will no longer belong to anyone, so it can be claimed again.
For more information, see [Aeternity Naming System](https://github.com/aeternity/protocol/blob/master/AENS.md) docs.

The name group consists of the [following commands](./reference.md#name-group).

Use [`aecli name full-claim`](./reference.md#full-claim) to create and register a name for your account.

After that, you can use [`aecli name update`](./reference.md#update) command to set a name pointer. You can assign the name to another account via pointers, you will still have the right to do other operations with this name.

Don't forget to run [`aecli name extend`](./reference.md#extend) from time to time to don't lose access to your name. By default name TTL gets extended to one year, it can't be extended for a longer period.

You can [transfer](./reference.md#transfer) a name to another account or contract, just indicate another account's address. You will pass all rights regarding the name to another account.

At last, you can delete your name using [`aecli name revoke`](./reference.md#revoke).
In comparison with name expiration, the revoked name can't be claimed again by anybody.


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
Contract address ________________________ ct_5MbRKEb77pJVZrjVrQYHu2nzr2EKojuthotio1vZ2Q23dkYkV
Transaction hash ________________________ th_2oK2tdvhVCLzeMtqLb3EQLNT8dALWFXF4Y1t1EhicujMREWWWV
Deploy descriptor _______________________ /path/to/contract.aes.deploy.5MbRKEb77pJVZrjVrQYHu2nzr2EKojuthotio1vZ2Q23dkYkV.json
```
<!-- CONTRACT-DEPLOY-END -->

#### call
To execute a function of the contract, run [`aecli contract call`](./reference.md#call) command. `sum` is a function which is executed by this contract, `[1, 2]` are arguments of this function:
<!-- CONTRACT-CALL-BEGIN -->
```
$ aecli contract call --descrPath contract.aes.deploy.5MbRKEb77pJVZrjVrQYHu2nzr2EKojuthotio1vZ2Q23dkYkV.json sum '[1, 2]' ./wallet.json
Transaction hash ________________________ th_urgozuZRooNXrZxuvNDdT4BiApcGKsf6ZRpffargXcoZNHQ4C
Block hash ______________________________ mh_dnoULQWpiRtcrntd5yJPUxcu7YrTu18xZ1e9EC2b8prKdShME
Block height ____________________________ 4 (about now)
Signatures ______________________________ ["sg_Vn2cCsMk8RvBKyNTKTbq8V4vm6beuHxfYA7vLBNLnRF3x9hoydWWAtNkaiix8KhyEFSLmsmTy6jz9Lps2TQqVdmH6qmCG"]
Transaction type ________________________ ContractCallTx (ver. 1)
Caller address __________________________ ak_21A27UVVt3hDkBE5J7rhhqnH5YNb4Y1dqo4PnSybrH85pnWo7E
Contract address ________________________ ct_5MbRKEb77pJVZrjVrQYHu2nzr2EKojuthotio1vZ2Q23dkYkV
Gas _____________________________________ 31 (0.000000031ae)
Gas price _______________________________ 0.000000001ae
Call data _______________________________ cb_KxHrtMsKKwIE32Kmfg==
ABI version _____________________________ 3 (Fate)
Amount __________________________________ 0ae
Fee _____________________________________ 0.00018198ae
Nonce ___________________________________ 3
TTL _____________________________________ 7 (in 6 minutes)
----------------------Call info-----------------------
Gas used ________________________________ 25 (0.000000025ae)
Return value (encoded) __________________ cb_BvMDXHk=
Return value (decoded) __________________ 3
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
Account ID ______________________________ ak_22xzfNRfgYWJmsB1nFAGF3kmabuaGFTzWRobNdpturBgHF83Cx
Account balance _________________________ 52.1342501ae
Account nonce ___________________________ 3
No pending transactions
```
#### inspect transaction
```
$ aecli inspect th_iirV7mw49NfFY8NbBhbXGBLv9PPT3h1ou11oKtPsJVHGVpWVC
Transaction hash ________________________ th_iirV7mw49NfFY8NbBhbXGBLv9PPT3h1ou11oKtPsJVHGVpWVC
Block hash ______________________________ mh_2RojH44UtAjf8pRQekPp7o78CmCqMQJkRdxmfXvVmWg9M6ymcr
Block height ____________________________ 99005 (4 years ago)
Signatures ______________________________ ["sg_MjwB8zrhqGTqYWY2c5jLrikuCcwppnhNhjXg9TcdFbCkSvGhPL6Hf4iu81eoxWWJFSgRSFQ3h3qMv6vVNqYfo5NNBNDFK"]
Transaction type ________________________ NameClaimTx (ver. 2)
Account address _________________________ ak_2i74vkHbdciAdr7Bw3ogdTHsLykPf4ii1DQEGLh6RpySyhtA9H
Name ____________________________________ yanislav.test
Name salt _______________________________ 6632125367082877
Fee _____________________________________ 0.00001638ae
Nonce ___________________________________ 2
```
#### inspect block
```
$ aecli inspect mh_2DhgyD4np6n3JMsNWVXdtWZE2rAx74sgxL6nb2GsCKB1VnbLxN
<<--------------- MicroBlock --------------->>
Block hash ______________________________ mh_2DhgyD4np6n3JMsNWVXdtWZE2rAx74sgxL6nb2GsCKB1VnbLxN
Block height ____________________________ 762850
State hash ______________________________ bs_9vEQ2hkjJLFoqbmUq2YB3PyZN4TGV6Viv686wgX3i4t21PUK3
Nonce ___________________________________ N/A
Miner ___________________________________ N/A
Time ____________________________________ 17/04/2023, 05:54:40
Previous block hash _____________________ mh_2VaToyVbe8joVts9SjzdGJZqK7nk6w4MfvGC32Nfwp9KnTa7Z6
Previous key block hash _________________ kh_2gVG4vzZwWJfzMe5Ug2jwwDcgcpmjEd1umsWqKA9CkSPidCYuw
Version _________________________________ 5
Target __________________________________ N/A
Transactions ____________________________ 1
    <<--------------- Transaction --------------->>
    Transaction hash ________________________ th_2uc2RDDQnDV2BsyVLHA36GP3UZJNn16utV6uivWjLAQoTVBA3u
    Block hash ______________________________ mh_2DhgyD4np6n3JMsNWVXdtWZE2rAx74sgxL6nb2GsCKB1VnbLxN
    Block height ____________________________ 762850
    Signatures ______________________________ ["sg_4UUxNZhGLXWjGsfAMEddccjQ1wpZfwUkZ9qMczjRUNFGAWAS3fahHWqgwxLf79RQ3J3ZRnEaazz259dPzUjj5J3EHcNYj"]
    Transaction type ________________________ SpendTx (ver. 1)
    Sender address __________________________ ak_2swhLkgBPeeADxVTAVCJnZLY5NZtCFiM93JxsEaMuC59euuFRQ
    Recipient address _______________________ ak_22xzfNRfgYWJmsB1nFAGF3kmabuaGFTzWRobNdpturBgHF83Cx
    Amount __________________________________ 50ae
    Payload _________________________________ ba_Xfbg4g==
    Fee _____________________________________ 0.00001688ae
    Nonce ___________________________________ 1513
```
<!-- INSPECT-EXAMPLES-END -->

## Offline signing
One of `aecli` use cases is offline signing. It requires the below steps.
1. prepare a transaction using [transaction builder](./reference.md#tx-group) on any device;
1. optionally run [`aecli inspect`](./reference.md#inspect) to verify the generated transaction before signing on offline device;
1. sign the transaction by [`aecli account sign`](./reference.md#sign) on offline device;
1. broadcast signed transaction using [`aecli chain broadcast`](./reference.md#broadcast) on a device connected to the internet.
