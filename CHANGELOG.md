# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [5.0.0](https://github.com/aeternity/aepp-cli-js/compare/v4.1.0...v5.0.0) (2023-04-08)


### ⚠ BREAKING CHANGES

#### The format of contract descriptor file changed

Contract descriptors needs to be regenerated.
#### **contract:** `contract call` accepts `wallet_path` as the last argument

For example, replace
```
$ aecli contract call ./wallet.json foo '[1, 2]'
```
with
```
$ aecli contract call foo '[1, 2]' ./wallet.json
```
#### `account spend` doesn't accept `denomination` parameter

### Features

* accept amount suffixed with `ae` instead of `denomination` option ([70ceb67](https://github.com/aeternity/aepp-cli-js/commit/70ceb67223e2b6a8554822198bc150b1706dcd43))
* add `select-node`, `select-compiler` commands ([87b2ede](https://github.com/aeternity/aepp-cli-js/commit/87b2edee61fcf8317a2e8339b7192ec1a6398b5e))
* add update-notifier to ask user to switch to the latest version ([2516446](https://github.com/aeternity/aepp-cli-js/commit/25164460eab8e11706fc8a71e6566de7651fb5ce))
* aesophia_cli support ([a74fc2b](https://github.com/aeternity/aepp-cli-js/commit/a74fc2b45928ea208ce9e9bfeefca23c8d3a4474))
* **contract:** includes support ([818f375](https://github.com/aeternity/aepp-cli-js/commit/818f37561c8f9ebff336e3cfef4ae5749e1cf286))
* get urls from AECLI_NODE_URL, AECLI_COMPILER_URL env variables ([78a9953](https://github.com/aeternity/aepp-cli-js/commit/78a9953878b15b0d8e3ae7094147fcf1db4b78ef))
* specify and check contract descriptor file version ([ea17f80](https://github.com/aeternity/aepp-cli-js/commit/ea17f80fba43477ec0972acf7a42a9c43b868e62))


### Bug Fixes

* **account:** show network id in sign call output ([836f421](https://github.com/aeternity/aepp-cli-js/commit/836f4215c9bd05fa832f66be6e1fdeccc7bd7d96))
* **contract:** allow to static calls without wallet ([7bf7bb6](https://github.com/aeternity/aepp-cli-js/commit/7bf7bb65a1dddbcaee48bb318b973f30acf26755))
* **contract:** stringify maps as arrays ([b80e3b4](https://github.com/aeternity/aepp-cli-js/commit/b80e3b408eb1ced6ebfa56235eaebc6105caf27a))
* don't show stack trace when entered an invalid password to wallet ([8d24bec](https://github.com/aeternity/aepp-cli-js/commit/8d24beca28d7f8c918c09c912c67a16aa66e9482))
* **tx:** remove missed `deposit` field in contract call tx ([a1aa7c7](https://github.com/aeternity/aepp-cli-js/commit/a1aa7c7b89aa4a59b9e2595226f0c1d82deb748f))
* **tx:** show bytecode and call data instead of missed payload ([75f5eee](https://github.com/aeternity/aepp-cli-js/commit/75f5eeed9004346b5e903836d42ac6e8fa902678))
* **tx:** show name of transaction type ([18ee736](https://github.com/aeternity/aepp-cli-js/commit/18ee73652a137d138cedc441566f15fb5b0ec5d9))
* **chain:** calculation of relative ttl ([651ba1a](https://github.com/aeternity/aepp-cli-js/commit/651ba1a5d8642763c7643114c7f37f7bde7e0b26))
* **chain:** height calculation, improve markup, remove confusing timeout ([4f5329d](https://github.com/aeternity/aepp-cli-js/commit/4f5329d83f954814c2b544f7219115ed3c8e4424))
* **chain:** padding of top output ([ca661d7](https://github.com/aeternity/aepp-cli-js/commit/ca661d7a34611a76effda47c589d45ff9f7fbb04))
* **chain:** show correctly consensus protocol version ([a5fa358](https://github.com/aeternity/aepp-cli-js/commit/a5fa3588a23b8b8f66201cd9ebb41d947f43edf4))
* don't override files by default ([d09eabe](https://github.com/aeternity/aepp-cli-js/commit/d09eabe97c36461bc6aaa95ba383248983a0e3ef))
* **inspect:** encoded tx, plain contract output, oracle queries in json ([dae4df9](https://github.com/aeternity/aepp-cli-js/commit/dae4df97fd3de1f69cfd96a470aafabe9b209b73))
* **oracle:** decoding of oracle query ([fa2764b](https://github.com/aeternity/aepp-cli-js/commit/fa2764b6cc5aa933239c46f2e0f36735b96ccbc4))
* **oracle:** providing oracleTtl, queryTtl, responseTtl ([a0cc66c](https://github.com/aeternity/aepp-cli-js/commit/a0cc66c45c44d0d63e1218e0d6fa26f4dafd3513))
* show name pointers line by line ([9dbcf41](https://github.com/aeternity/aepp-cli-js/commit/9dbcf419c6ad617362437f28643bffd105621d87))

## [4.1.0](https://github.com/aeternity/aepp-cli-js/compare/v4.0.0...v4.1.0) (2022-07-28)


### Features

* don't print stack traces for cli errors ([e62be74](https://github.com/aeternity/aepp-cli-js/commit/e62be74a103672f005bc89781a047c57fb02b5e7))


### Bug Fixes

* commands in crypto module ([6d6da0c](https://github.com/aeternity/aepp-cli-js/commit/6d6da0cdacd195f012de801e3ce2673a67cdebdd))
* **contract:** always store aci in descriptor, override descr by options ([278a6ff](https://github.com/aeternity/aepp-cli-js/commit/278a6ff55268a8814cf7bd97ef2dd686850ff75b))
* **contract:** clear error when can't parse call arguments ([34ae285](https://github.com/aeternity/aepp-cli-js/commit/34ae28502e97fb4a64419d014790ce2cef99d1ef))
* **contract:** create file descriptor at not existing path ([485117e](https://github.com/aeternity/aepp-cli-js/commit/485117ee118ecf8ba2af3680df1c72b02f12347d))
* **contract:** fall if descriptor file specified but not exists ([37b490f](https://github.com/aeternity/aepp-cli-js/commit/37b490fc4491ebfb9c91106cc0211c690b1b2ec4))
* remove broken `crypto decrypt` command ([03c645c](https://github.com/aeternity/aepp-cli-js/commit/03c645cbc30e0088a034135d3b26edcc9aa08f55))
* remove broken `crypto genkey` command ([32e5b0f](https://github.com/aeternity/aepp-cli-js/commit/32e5b0f368286d3a3ab5fa88a8e7d19664b7c554))

## [4.0.0](https://github.com/aeternity/aepp-cli-js/compare/v3.0.0...v4.0.0) (2022-04-07)


### ⚠ BREAKING CHANGES

* **contract deploy:** accept args and bytecode, custom descrPath

Run `aecli contract deploy --help` to get the latest documentation.

* **contract call:** accept arguments as JSON-encoded array

Affected commands: `contract deploy`, `contract call`.

* **contract:** decode call result, make args flexible

Removed commands: `contract encodeData`, `contract decodeCallData`.
Added commands: `contract encode-calldata`, `contract decode-call-result`.

### Features

* **contract deploy:** accept args and bytecode, custom descrPath ([cb25bb7](https://github.com/aeternity/aepp-cli-js/commit/cb25bb7d6ac2c0afd92a20df2ff5292d2b5f9c69))


### Bug Fixes

* **account transfer:** remove unimplemented excludeFee option ([cddbbe9](https://github.com/aeternity/aepp-cli-js/commit/cddbbe9f6a063142ac9cb6ed58fd088b18d2aea4))
* **account transfer:** remove unused denomination option ([4c4d215](https://github.com/aeternity/aepp-cli-js/commit/4c4d21532106f9927f46e58cea9f2afb09190e83))
* **contract call:** accept arguments as JSON-encoded array ([201a7e0](https://github.com/aeternity/aepp-cli-js/commit/201a7e042d81686eabfbf14e53bcb82b7f9f01c0))
* **name full-claim:** key of created pointer ([7c278f1](https://github.com/aeternity/aepp-cli-js/commit/7c278f1bfd9724f1a2f8e235fe2ad013c587a9bb))
* config command ([27a1169](https://github.com/aeternity/aepp-cli-js/commit/27a11697d649e7042bae683cb9a438f63950d9d1))
* usage show correct command name ([223f05d](https://github.com/aeternity/aepp-cli-js/commit/223f05d819da749894c5de7b640ff37e8cee92bf))
* **contract:** decode call result, make args flexible ([b0a5cdc](https://github.com/aeternity/aepp-cli-js/commit/b0a5cdc7da289e64121bb17a48ff2e9b55ae8d84))

# [3.0.0](https://github.com/aeternity/aepp-cli-js/compare/2.6.0...3.0.0) (2021-06-10)


### Bug Fixes

* **docker:** enable dry-run endpoints ([3afa3f5](https://github.com/aeternity/aepp-cli-js/commit/3afa3f52f724579019f2997139c19bc7fd69ea48))
* **test:** aens suite ([0fe69eb](https://github.com/aeternity/aepp-cli-js/commit/0fe69eb64f84d51fab40f3fb0a619f80e7ed4218))
* **test:** contract suite ([334f4dd](https://github.com/aeternity/aepp-cli-js/commit/334f4dd2f6145f3216b7e2674fa2524150cd039f))
* **test:** oracle suite lint ([960bb4a](https://github.com/aeternity/aepp-cli-js/commit/960bb4a5c7d1ca45286d711aab3109667f6c2497))
* **test:** tx suite ([64993ba](https://github.com/aeternity/aepp-cli-js/commit/64993ba6cbb21f5db773e793edf41719bb1e9f90))
* exit code of get address command ([fddd2b0](https://github.com/aeternity/aepp-cli-js/commit/fddd2b070c1aafd0d985392ade95dc7f42b15771))
* remove compiler decodeData commend that depends on unsupported api ([e198ea2](https://github.com/aeternity/aepp-cli-js/commit/e198ea229093cfcd9c4ebc49b5cd09a86a41f748))
* typo in gasPrice ([347e733](https://github.com/aeternity/aepp-cli-js/commit/347e733e00317f40708ffbbf5e897e959d10837f))

### Features

* **ci:** add github actions workflow ([3e0589e](https://github.com/aeternity/aepp-cli-js/commit/3e0589e34385fcb6f1d5b045904b0c60bb62ca3f))
* **env:** bump node and compiler version ([b5103e4](https://github.com/aeternity/aepp-cli-js/commit/b5103e4d01b6b6abadd66b24e9c694b5cc20225c))
* **oracle:** implement Oracle Test's ([26e8820](https://github.com/aeternity/aepp-cli-js/commit/26e882018a5e7dd8e2aa4240432600d12204827a))
* **oracle:** Implement Oracle Test's ([23296dd](https://github.com/aeternity/aepp-cli-js/commit/23296dd9193699eecc2d1b83e75e26ccb5371b04))
* **oracle:** Implement Oracle Test's ([854ce61](https://github.com/aeternity/aepp-cli-js/commit/854ce61e288c76045011f4f714587c79d728c750))


# [2.7.0](https://github.com/aeternity/aepp-cli-js/compare/2.6.0...2.7.0) (2020-06-10)


### Bug Fixes

* **AENS:** Change tld from `aet` to `chain` ([#115](https://github.com/aeternity/aepp-cli-js/issues/115)) ([8279579](https://github.com/aeternity/aepp-cli-js/commit/8279579))
* **Contract:** Fix compiler test's ([b748003](https://github.com/aeternity/aepp-cli-js/commit/b748003))
* **tests:** Regenerate lock files to fix build on CI ([#128](https://github.com/aeternity/aepp-cli-js/issues/128)) ([23168ae](https://github.com/aeternity/aepp-cli-js/commit/23168ae))
* Fix test for AENS ([fae6ce8](https://github.com/aeternity/aepp-cli-js/commit/fae6ce8))


### Features

* **Account:** Add `verify-message` command to `account` module ([f26de1e](https://github.com/aeternity/aepp-cli-js/commit/f26de1e))
* **Account:** Add message sign command ([d05e611](https://github.com/aeternity/aepp-cli-js/commit/d05e611))
* **Account:** Adjust printing and json serialization for `sign-message` result ([7399377](https://github.com/aeternity/aepp-cli-js/commit/7399377))
* **Account:** Spend by name. Extend `account spend` command with ability to put recipient address or name ([#117](https://github.com/aeternity/aepp-cli-js/issues/117)) ([043d1a2](https://github.com/aeternity/aepp-cli-js/commit/043d1a2))
* **AENS:** Add bid, transfer, revoke and fullClaim commands ([a5eb23a](https://github.com/aeternity/aepp-cli-js/commit/a5eb23a))
* **AENS:** Add test for auction ([9f4f6b2](https://github.com/aeternity/aepp-cli-js/commit/9f4f6b2))
* **AENS:** extend name ttl command ([63c99ae](https://github.com/aeternity/aepp-cli-js/commit/63c99ae))
* **AENS:** Fix `transfer` command. Add more test for transfer AENS names ([547af5a](https://github.com/aeternity/aepp-cli-js/commit/547af5a))
* **AENS:** Fix BC for all of AENS commands. ([77d2d3c](https://github.com/aeternity/aepp-cli-js/commit/77d2d3c))
* **AENS:** Implement name update command ([b65c5e6](https://github.com/aeternity/aepp-cli-js/commit/b65c5e6))
* **CLI:** Refactor constant(Use constant from sdk). Refactor error handling in AENS module. Add `pre-claim` command. Refactor claim command ([7038629](https://github.com/aeternity/aepp-cli-js/commit/7038629))
* **Contract:** Add test for calling contract using cointract descriptor file or source code and address ([3f77138](https://github.com/aeternity/aepp-cli-js/commit/3f77138))
* **Contract:** contract `call` command ([ae723d5](https://github.com/aeternity/aepp-cli-js/commit/ae723d5))
* **Contract:** Contract high level commands ([#116](https://github.com/aeternity/aepp-cli-js/issues/116)) ([8848a7b](https://github.com/aeternity/aepp-cli-js/commit/8848a7b))
* **Contract:** Enable test's for contract ([ed48a83](https://github.com/aeternity/aepp-cli-js/commit/ed48a83))
* **Oracle:** Oracle commands ([#134](https://github.com/aeternity/aepp-cli-js/issues/134)) ([05b079a](https://github.com/aeternity/aepp-cli-js/commit/05b079a))
* **Tests:** Fix Breaking Changes and adjust tests ([#126](https://github.com/aeternity/aepp-cli-js/issues/126)) ([60b7910](https://github.com/aeternity/aepp-cli-js/commit/60b7910))



# [2.6.0](https://github.com/aeternity/aepp-cli-js/compare/2.5.0...2.6.0) (2019-10-07)


### Features

* **Lima:** Add support for lima ([#105](https://github.com/aeternity/aepp-cli-js/issues/105)) ([f7b061a](https://github.com/aeternity/aepp-cli-js/commit/f7b061a))
* **Compiler:** Add `backend` option to compiler(Can be `fate` or `aevm`. `fate` by default)
* **AENS:** Add `nameFee` option to `claim` command


# 2.5.0 (2019-08-28)


### Features

* **Node** Node 5.0.0-rc1 compatibility




# 2.4.0 (2019-08-21)

### Features

* **ACCOUNT:** Add command for generating and printing bulk of Key Pairs ([#95](https://github.com/aeternity/aepp-cli-js/issues/95)) ([1cb3e5b](https://github.com/aeternity/aepp-cli-js/commit/1cb3e5b))



# 2.3.0 (2019-08-05)


### Bug Fixes

* **Account:** Fix --json for account commands. Add proper error code to AENS commands. ([#90](https://github.com/aeternity/aepp-cli-js/issues/90)) ([7de13eb](https://github.com/aeternity/aepp-cli-js/commit/7de13eb))
* **CLI:** Fix exit codes around the CLI ([#84](https://github.com/aeternity/aepp-cli-js/issues/84)) ([c775e1d](https://github.com/aeternity/aepp-cli-js/commit/c775e1d))


### Features

* **sdk:** Update sdk version to 4.3.0 ([#92](https://github.com/aeternity/aepp-cli-js/issues/92)) ([454385d](https://github.com/aeternity/aepp-cli-js/commit/454385d))



# 2.2.0 (2019-07-16)


### Features

* **Node:** Compatibility for node 4.0.0
* **Inspect** Ability to unpack transaction using `inspect` command

### Bug Fixes

* **CLI:** Fix exit codes around the CLI ([#84](https://github.com/aeternity/aepp-cli-js/issues/84)) ([c775e1d](https://github.com/aeternity/aepp-cli-js/commit/c775e1d))



# 2.1.0 (2019-05-20)


### Bug Fixes

* **README:** Adjust readme ([#69](https://github.com/aeternity/aepp-cli-js/issues/69)) ([b1cdb2e](https://github.com/aeternity/aepp-cli-js/commit/b1cdb2e))


### Features

* **Fortuna:** Add Fortune(3.0.0) compatibility
* **Account:** Feature/allow to spend percentage of balance (#68)

# [2.0.0](https://github.com/aeternity/aepp-cli-js/compare/1.0.1...2.0.0) (2019-04-26)


### Features

* **Commitizen:** Configurte commitizen ([#53](https://github.com/aeternity/aepp-cli-js/issues/53)) ([e7f2d0a](https://github.com/aeternity/aepp-cli-js/commit/e7f2d0a))


* **CI:** Configure Jenkins pipeline


* **Account:** Add option to get `balance` on specific `heigh/hash`


* **CLI:** Make compatible with [spec](https://hackmd.aepps.com/EwEwhgbMAMDMDGBaCAjArEgLLYAzRYIA7CItJgIzCUAcOY0IQA==)


* **Contract:** Implement standalone `compiler` commands


* **DOCS** add command for auto generating `CHANGELOG`


### BREAKING CHANGES

* Remove contract `call` and `deploy` commands. Remove aens `claim`, `revoke` and
`update` commands.



# 1.0.1 (2019-01-10)


### Features

* **Contract:** Add contract inspect command


* **CLI** Improve error printing


* **TX:** Add --networkId flag to each command which build a tx


* **CLI:** Remove default fee for each command's (SDK calculate fee by itself)


* **AENS:** Add `AENS` transaction's build commands for offline mode to `tx` module


* **Contract:** Add `contract` transaction's build commands for offline mode to `tx` module


* **Oracle:** Add `oracle` transaction's build commands for offline mode to `tx` module


* **TX:** `tx` root command, which allow to build transaction's in offline-mode


* **TX:** Add `broadcast` sub-command to `tx`


* **Account:** Add 'sign' sub-command to `account`


### BREAKING CHANGES

- Default node url changed to [sdk-mainnet.aepps.com](https://sdk-mainnet.aepps.com/v2/status)
