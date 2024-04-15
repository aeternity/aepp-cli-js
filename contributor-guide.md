# Contributor guide

## Install `aecli` from git repository

1. Clone the [aepp-cli-js] git repository into any place you like
1. With your terminal: enter in folder when the repo has been cloned
1. Run `npm link` for linking `aecli` executable to `src/aecli.js`
1. Start a new terminal session and try `aecli` command to see if everything is okay.
1. If you have any issue, open an [issue] in github

If you have problems linking, try also `npm install` and then `npm link`.
Instead of using `npm link` you can also execute `./src/aecli.js` directly.

[aepp-cli-js]: git@github.com:aeternity/aepp-cli-js.git
[issue]: https://github.com/aeternity/aepp-cli-js/issues/new
