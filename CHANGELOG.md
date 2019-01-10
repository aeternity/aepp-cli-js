# Change Log
All notable changes to this project will be documented in this file. This change
log follows the conventions of [keepachangelog.com](http://keepachangelog.com/).

## [0.1.0-0.1.0]
### Added
- Init CLI repository

## [1.0.0]
### Added
- `tx` root command, which allow to build transaction's in offline-mode
- Add `broadcast` sub-command to `tx`
- Add 'sign' sub-command to `account`
### Changed
- Default node url changed to [sdk-mainnet.aepps.com](https://sdk-mainnet.aepps.com/v2/status)

## [1.0.1]
### Added
- Add contract inspect command
- Improve error printing
- Add --networkId flag to each command which build a tx
- Remove default fee for each command's (SDK calculate fee by itself)
- Add `AENS` transaction's build commands for offline mode to `tx` module
- Add `contract` transaction's build commands for offline mode to `tx` module
- Add `oracle` transaction's build commands for offline mode to `tx` module
