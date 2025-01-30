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
      ],
    ],
  },
  ignores: [(message) => /^Bumps \[.+]\(.+\) from .+ to .+\.$/m.test(message)],
};
