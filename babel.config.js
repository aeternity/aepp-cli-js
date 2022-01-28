module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      targets: { node: 12 }
    }]
  ],
  plugins: [
    ['transform-inline-environment-variables', {
      include: ['npm_package_version']
    }],
    ['add-import-extension', { extension: 'mjs' }],
    ['module-resolver', {
      alias: {
        '@aeternity/aepp-sdk': '@aeternity/aepp-sdk/es/index.mjs'
      }
    }]
  ]
}
