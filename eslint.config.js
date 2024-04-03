const antfu = require('@antfu/eslint-config').default

module.exports = antfu({
  ignores: ['/dist', '/node_modules', '/packages/**/dist', '/packages/**/node_modules'],
  rules: {
    'import/first': 'off',
    'import/order': 'off',
    'symbol-description': 'off',
    'no-console': 'warn',
    'prefer-const': 'off',
    'max-statements-per-line': ['error', { max: 2 }],
  },
})
