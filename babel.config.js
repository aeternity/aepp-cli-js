module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: false,
      targets: { node: 18 },
    }],
  ],
  plugins: [
    ['transform-inline-environment-variables', {
      include: ['npm_package_name', 'npm_package_version'],
    }],
    ['add-import-extension', { extension: 'mjs' }],
  ],
};
