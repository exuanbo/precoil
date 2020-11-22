const { mergeObj } = require('standard-engine-ts')

module.exports = mergeObj(require('ts-standardx/.eslintrc.js'), {
  ignorePatterns: ['dist'],
  rules: {
    '@typescript-eslint/consistent-type-assertions': [
      'error',
      {
        assertionStyle: 'as',
        objectLiteralTypeAssertions: 'allow-as-parameter'
      }
    ]
  },
  settings: {
    react: {
      version: 'detect'
    }
  }
})
