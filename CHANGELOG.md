# 2.1.0 (2019-05-20)


### Bug Fixes

* **README:** Adjust readme ([#69](https://github.com/aeternity/aepp-cli-js/issues/69)) ([b1cdb2e](https://github.com/aeternity/aepp-cli-js/commit/b1cdb2e))


### Features

* **Commitizen:** Configurte commitizen ([#53](https://github.com/aeternity/aepp-cli-js/issues/53)) ([e7f2d0a](https://github.com/aeternity/aepp-cli-js/commit/e7f2d0a))
* **Fortuna:** Add Fortune(3.0.0) compatibility


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
