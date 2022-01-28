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
  -V, --version  output the version number
  -h, --help     output usage information

Commands:
  chain          Interact with the blockchain
  inspect        Get information on transactions, blocks,...
  account        Handle wallet operations
  contract       Compile contracts
  name           AENS system
  crypto         Crypto helpers
  help [cmd]     display help for [cmd]
```

4. To read documentation of other commands and sub-commands, you can append `--help`. For example, type `bin/aecli.mjs account --help` to get a list of `account`'s available sub-commands.

## [Change Log]

[Change Log]: CHANGELOG.md

## License

ISC License (ISC)
Copyright © 2018 aeternity developers

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

