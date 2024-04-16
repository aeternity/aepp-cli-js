export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-enum': [
      2,
      'always',
      [
        'account',
        'aens',
        'chain',
        'contract',
        'deps',
        'deps-dev',
        'oracle',
        'release',
        'tx-builder',
        'inspect',
        // TODO: remove 2 after releasing 6.0.0
        'crypto',
        'name',
      ],
    ],
  },
  ignores: [(message) => /^Bumps \[.+]\(.+\) from .+ to .+\.$/m.test(message)],
};
