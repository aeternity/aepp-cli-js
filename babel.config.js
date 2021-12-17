module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 12 } }]
  ],
  plugins: [
    ['transform-inline-environment-variables', {
      include: ['npm_package_version']
    }]
  ]
}
