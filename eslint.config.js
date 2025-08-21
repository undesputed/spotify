const { FlatCompat } = require('@eslint/eslintrc')
const path = require('path')

const compat = new FlatCompat({
  baseDirectory: path.resolve(__dirname),
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals'),
  {
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]

module.exports = eslintConfig
