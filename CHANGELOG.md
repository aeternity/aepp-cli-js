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
