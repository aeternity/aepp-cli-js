module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
  ],
  plugins: [
    ['transform-inline-environment-variables', {
      include: ['npm_package_version'],
    }],
    ['module-resolver', {
      alias: {
        '@aeternity/aepp-sdk': (match) => (match[1] ? match.input : './test/mocks/sdk.js'),
      },
    }],
  ],
};
