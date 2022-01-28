module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }]
  ],
  plugins: [
    ['module-resolver', {
      alias: {
        '@aeternity/aepp-sdk': (match) => match[1] ? match.input : './test/mocks/sdk.js'
      }
    }]
  ]
}
