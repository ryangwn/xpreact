const createBaseConfig = require('../../config/rollup/rollup.config.js')

const args = process.argv.slice(2)

module.exports = createBaseConfig(args)(
  'src/index.js',
  'dist'
)
