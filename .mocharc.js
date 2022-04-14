require('@babel/register')({
  configFile: './babel.tests.config.js'
})

module.exports = {
  require: ['@babel/register']
}
