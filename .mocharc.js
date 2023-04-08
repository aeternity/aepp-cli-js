process.env._EXPECTED_MINE_RATE = 1000
process.env._MICRO_BLOCK_CYCLE = 300

require('@babel/register')({
  configFile: './babel.tests.config.js'
})

module.exports = {
  require: ['@babel/register']
}
