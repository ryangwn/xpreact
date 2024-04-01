const path = require('path')
const process = require('process')
const babelPlugin = require('@rollup/plugin-babel')
const { default: esbuild, minify } = require('rollup-plugin-esbuild')
const copy = require('rollup-plugin-copy')
const alias = require('@rollup/plugin-alias')
const resolve = require('@rollup/plugin-node-resolve')
const createBabelConfig = require(path.join(process.cwd(), 'babel.config.js'))

const prod = process.env.NODE_ENV === 'production'

const extensions = ['.js', '.ts']
const { root } = path.parse(process.cwd())

function external(id) {
  return !id.startsWith('.') && !id.startsWith(root)
}

function getBabelOptions(targets) {
  return {
    ...createBabelConfig({ env: (env) => env === 'build' }, targets),
    extensions,
    comments: false,
    babelHelpers: 'bundled',
  }
}

function getEsbuild() {
  return esbuild({
    minify: prod,
    target: 'es2018',
    supported: { 'import-meta': true },
  })
}

function createESMConfig(input, output) {
  return {
    input,
    output: { file: output, format: 'esm' },
    external,
    plugins: [
      resolve({ extensions }),
      getEsbuild(),
    ]
  }
}

function createCommonJSConfig(input, output) {
  return {
    input,
    output: { file: output, format: 'cjs' },
    external,
    plugins: [
      resolve({ extensions }),
      babelPlugin(getBabelOptions({ ie: 11 })),
      minify(),
    ]
  }
}

function createUMDConfig() {

}

module.exports = function (args) {
  return function (input, output) {
    return [
      createESMConfig(input, `${output}/es/index.js`),
      createCommonJSConfig(input, `${output}/index.js`)
    ]
  }
}
