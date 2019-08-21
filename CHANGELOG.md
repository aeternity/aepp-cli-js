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
